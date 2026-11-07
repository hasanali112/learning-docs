<script setup>
const layerFlow = {
  title: 'একটা request এর পথে inference engineering',
  nodes: [
    { id: 'req', label: 'Request' },
    { id: 'cache', label: 'Cache', sub: 'আগে দেখা?' },
    { id: 'route', label: 'Router', sub: 'ছোট না বড় model' },
    { id: 'call', label: 'Model call', sub: 'retry, fallback' },
    { id: 'out', label: 'Stream + হিসাব' },
  ],
  steps: [
    {
      node: 'req',
      title: '১. কাস্টমারের মেসেজ এলো',
      text: 'প্রতিটা মেসেজ একটা inference। দিনে হাজার হাজার মেসেজ মানে হাজার হাজার call। প্রতিটায় কয়েক পয়সা আর কয়েকশো millisecond বাঁচানো মানে মাস শেষে অনেক বড় পার্থক্য।',
      code: '"lal saree ache?"',
    },
    {
      node: 'cache', edge: 0,
      title: '২. Cache: আগে কি এটা হয়েছে?',
      text: 'দুই রকম cache আছে। Prompt cache: প্রতিটা call এর শুরুর বড় অংশ (system prompt, উদাহরণ) একই থাকে, provider সেটা মনে রেখে পরের call এ কম দাম আর কম সময় নেয়। Response cache: হুবহু একই প্রশ্নের উত্তর আগে থেকে জমা থাকলে model call ই লাগে না।',
      code: 'system prompt (১,০০০ token): cache থেকে  ✓ সস্তা আর দ্রুত\nনতুন মেসেজ (২০ token):      নতুন করে পড়া',
    },
    {
      node: 'route', edge: 1,
      title: '৩. Router: কোন model দরকার?',
      text: 'সব কাজে সবচেয়ে বড় model লাগে না। সহজ কাজ (মেসেজটা order না প্রশ্ন?) ছোট, দ্রুত, সস্তা model এ। কঠিন কাজ (জটিল অভিযোগের উত্তর) বড় model এ।',
      code: 'মেসেজের ধরন বোঝা     → ছোট model\nফর্ম পূরণ              → মাঝারি model\nজটিল অভিযোগ          → বড় model',
    },
    {
      node: 'call', edge: 2,
      title: '৪. Call: ভুল হলে কী হবে',
      text: 'API মাঝে মাঝে fail করে: rate limit, server এর সমস্যা, timeout। তাই সময়সীমা (timeout), একটু অপেক্ষা করে আবার চেষ্টা (retry with backoff), আর একটা provider বন্ধ থাকলে আরেকটায় যাওয়া (fallback)।',
      code: 'provider A: timeout ✗\n→ ১ সেকেন্ড অপেক্ষা, আবার চেষ্টা ✗\n→ fallback: provider B ✓',
    },
    {
      node: 'out', edge: 3,
      title: '৫. Stream করে পাঠাও, খরচ লিখে রাখো',
      text: 'উত্তর লেখা হতে হতেই কাস্টমারকে পাঠানো হয় (streaming)। আর প্রতিটা call এর token, সময়, খরচ লিখে রাখা হয়, যাতে বোঝা যায় কোথায় টাকা যাচ্ছে।',
      code: 'seller_id=7  model=মাঝারি  input=1210  output=86\nTTFT=380ms  মোট=1.9s  cached=1000',
    },
  ],
}
</script>

# Inference Engineering

**Inference engineering হলো model চালানোর কাজটাকে দ্রুত, সস্তা আর নির্ভরযোগ্য করা।** Model কী উত্তর দেবে সেটা prompt এর বিষয়। কত দ্রুত, কত খরচে, আর কত নির্ভরযোগ্যভাবে দেবে, সেটা inference engineering এর বিষয়।

[Inference](/ai-engineer/inference) নোটে দেখেছি একটা call এর ভেতরে কী হয়। এখানে দেখবো হাজার হাজার call কে কীভাবে ভালোভাবে সামলাতে হয়।

<FlowSteps v-bind="layerFlow" />

## API ব্যবহার করলে যা আমাদের হাতে

আমরা নিজে model চালাব না, API ব্যবহার করব। তবুও অনেক কিছু আমাদের হাতে:

| কৌশল | কী লাভ | কীভাবে |
|---|---|---|
| **ঠিক model বাছা** | খরচ আর latency অনেক কম | প্রতিটা কাজে সবচেয়ে ছোট যে model যথেষ্ট ভালো করে |
| **Prompt caching** | একই শুরুর অংশে কম দাম আর দ্রুত | system prompt আর উদাহরণ সবসময় শুরুতে, অপরিবর্তিত রাখা; provider এর caching নিয়ম মানা |
| **Response cache** | হুবহু একই প্রশ্নে model call ই লাগে না | সাধারণ FAQ এর উত্তর জমা রাখা |
| **Streaming** | কাস্টমারের কাছে দ্রুত মনে হয় | `model.stream(...)` |
| **Output ছোট রাখা** | decode কম, তাই দ্রুত আর সস্তা | `max_tokens` সীমা, prompt এ "সংক্ষেপে" |
| **Input ছোট রাখা** | prefill দ্রুত, খরচ কম | [Context Window](/ai-engineer/context-window) এর কৌশল |
| **একসাথে কয়েকটা call** | মোট সময় কম | পরস্পর নির্ভরশীল না এমন call গুলো একসাথে (`batch`, async) |
| **Batch API** | জরুরি না এমন কাজ সস্তায় | রাতের রিপোর্ট, test set চালানো |
| **Timeout, retry, fallback** | API সমস্যায়ও কাজ চলে | নিচের কোড |

## LangChain এ নির্ভরযোগ্যতা

```python
primary = init_chat_model("anthropic:<model-name>", temperature=0, timeout=20, max_tokens=500)
backup = init_chat_model("openai:<model-name>", temperature=0, timeout=20, max_tokens=500)

model = (
    primary
    .with_retry(stop_after_attempt=2)   # একবার fail করলে আরেকবার চেষ্টা
    .with_fallbacks([backup])           # তবুও না হলে অন্য provider
)
```

Fallback এর আগে নিশ্চিত হও যে backup model ও তোমার test set এ ভালো করে। নাহলে কাজ চলবে ঠিকই, কিন্তু চুপচাপ খারাপ মানের উত্তর যাবে।

## Rate limit

Provider প্রতি মিনিটে কত request আর কত token নেবে, তার একটা সীমা দেয়। দোকানে হঠাৎ ভিড় হলে (যেমন boost চালানোর পর) এই সীমায় পৌঁছানো যায়। তখন:
- **queue:** মেসেজ লাইনে রেখে সীমার ভেতরে পাঠানো
- **ভাগ:** seller প্রতি সীমা, যাতে একজনের ভিড়ে বাকিদের agent আটকে না যায়
- **সহজ কাজ ছোট model এ:** বড় model এর সীমা জরুরি কাজের জন্য রাখা

## নিজে model চালালে (পরে জানার জন্য)

যদি কখনো নিজের server এ open model চালাও, তখন আরো কিছু কৌশল আসে। শুধু নামগুলো জেনে রাখো:

| শব্দ | এক লাইনে |
|---|---|
| **Quantization** | weight কম নির্ভুল সংখ্যায় রাখা (যেমন ১৬ bit থেকে ৪ bit), model ছোট আর দ্রুত হয়, মান অল্প কমে |
| **KV cache** | আগে পড়া token এর হিসাব জমা রেখে প্রতিটা নতুন token দ্রুত বানানো |
| **Continuous batching** | অনেক কাস্টমারের request একসাথে GPU তে চালানো (vLLM এর মতো tool এটা করে) |
| **Speculative decoding** | ছোট model আগে কয়েকটা token অনুমান করে, বড় model একসাথে যাচাই করে, ফলে দ্রুত |

## যা নিয়ে গোলমাল হয়

- **Prompt cache আর response cache আলাদা।** Prompt cache provider এর server এ প্রতিটা call এর শুরুর অংশ মনে রাখে, model তবুও নতুন উত্তর লেখে। Response cache আমাদের কাছে পুরো উত্তর জমা রাখে, model call ই হয় না।
- **সবচেয়ে বড় model মানেই সবচেয়ে ভালো product না।** ধীর উত্তরে কাস্টমার চলে যায়। মাপো, তারপর বাছো।
- **খরচ না মাপলে কমানো যায় না।** প্রথম দিন থেকেই প্রতিটা call এর token আর খরচ লিখে রাখো।

পরের নোট: [Context Engineering](/ai-engineer/context-engineering)
