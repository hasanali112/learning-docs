<script setup>
const inferFlow = {
  title: 'একটা API call এর ভেতরে',
  nodes: [
    { id: 'req', label: 'Request', sub: 'তোমার কোড' },
    { id: 'tok', label: 'Tokenize' },
    { id: 'prefill', label: 'Prefill', sub: 'input পড়া' },
    { id: 'decode', label: 'Decode', sub: 'token লেখা' },
    { id: 'res', label: 'Response' },
  ],
  steps: [
    {
      node: 'req',
      title: '১. Request পাঠানো',
      text: 'তোমার কোড provider এর server এ message তালিকা পাঠায়। এখান থেকে সময় গোনা শুরু।',
      code: 'model.invoke([system, user: "লাল শাড়ি ২টা দেন"])\n⏱ ০ ms',
    },
    {
      node: 'tok', edge: 0,
      title: '২. Token এ ভাঙা',
      text: 'Server এ লেখাগুলো token এ ভাঙা হয়। system prompt, পুরনো কথা, নতুন মেসেজ, সব মিলিয়ে input token।',
      code: 'input: ১,২০০ token',
    },
    {
      node: 'prefill', edge: 1,
      title: '৩. Prefill: পুরো input একবারে পড়া',
      text: 'GPU পুরো input একসাথে, সমান্তরালে (parallel) প্রক্রিয়া করে। Input যত লম্বা, এই ধাপে তত সময় লাগে। এই ধাপ শেষে প্রথম token তৈরি হয়।',
      code: '১,২০০ token একসাথে\n⏱ প্রথম token: ~৪০০ ms   ← Time To First Token (TTFT)',
    },
    {
      node: 'decode', edge: 2,
      title: '৪. Decode: একটা একটা করে লেখা',
      text: 'এরপর উত্তর লেখা হয় একটা token করে, প্রতিটা আগেরটার উপর নির্ভর করে। এটা সমান্তরালে করা যায় না, তাই লম্বা উত্তর মানে বেশি সময়।',
      code: '"জি" → "জি," → "জি, লাল" → ...\nগতি: ধরো প্রতি সেকেন্ডে ৫০ token',
    },
    {
      node: 'decode', edge: 2,
      title: '৫. Streaming',
      text: 'চাইলে প্রতিটা token তৈরি হওয়ার সাথে সাথে পাঠানো যায় (streaming)। মোট সময় একই, কিন্তু কাস্টমার অপেক্ষা করার বদলে লেখা আসতে দেখে, তাই দ্রুত মনে হয়।',
      code: 'streaming ছাড়া: ৩ সেকেন্ড ফাঁকা, তারপর পুরো উত্তর\nstreaming সহ:   ০.৪ সেকেন্ডে লেখা শুরু',
    },
    {
      node: 'res', edge: 3,
      title: '৬. Response আর হিসাব',
      text: 'উত্তর শেষ হলে সাথে আসে কত token গেল তার হিসাব। খরচ এই হিসাব থেকেই হয়।',
      code: 'input:  ১,২০০ token\noutput:   ১৫০ token\nমোট সময়: ~৩.৪ সেকেন্ড\n(সংখ্যাগুলো উদাহরণ, model ভেদে অনেক আলাদা)',
    },
  ],
}
</script>

# Inference

**Inference হলো train করা model দিয়ে আসলে কাজ করানো: input দেওয়া আর output পাওয়া। Model এর weight তখন স্থির থাকে, কিছু শেখে না। তুমি যতবার API call করো, প্রতিবার একটা inference হয়।**

## Training বনাম Inference

| | Training | Inference |
|---|---|---|
| কাজ | model কে শেখানো | শেখা model ব্যবহার করা |
| Weight | বদলায় | স্থির থাকে |
| কতবার | একবার (বা মাঝে মাঝে) | প্রতিটা request এ |
| কে করে | model বানানো কোম্পানি | আমরা, API দিয়ে |
| খরচ | একবারে বিশাল | প্রতি call এ অল্প, কিন্তু জমতে থাকে |
| উদাহরণ | ছাত্র পড়াশোনা করছে | ছাত্র পরীক্ষা দিচ্ছে |

## একটা call এর ভেতরে কী হয়

<FlowSteps v-bind="inferFlow" />

## যে সংখ্যাগুলো মাপতে হয়

| মাপ | মানে | কাস্টমারের কাছে কেমন লাগে |
|---|---|---|
| **TTFT** (Time To First Token) | প্রথম token আসতে কত সময় | উত্তর শুরু হতে কতক্ষণ অপেক্ষা |
| **Tokens per second** | প্রতি সেকেন্ডে কত token লেখা হয় | লেখা কত দ্রুত ভেসে ওঠে |
| **মোট latency** | পুরো উত্তর আসতে কত সময় | পুরো অপেক্ষা |
| **খরচ** | input আর output token এর দাম | মাস শেষে বিল |
| **Throughput** | একসাথে কতগুলো request সামলানো যায় | ভিড়ের সময় সবাই উত্তর পায় কিনা |

Messenger এ কাস্টমার কয়েক সেকেন্ডের বেশি অপেক্ষা করতে চায় না। তাই এই মাপগুলো আমাদের agent এর জন্য সরাসরি জরুরি।

## কী latency বাড়ায়

- **লম্বা input:** বিশাল system prompt, অনেক পুরনো কথা, বড় tool ফলাফল → prefill ধীর
- **লম্বা output:** বেশি কথা বললে → decode ধীর
- **বড় model:** সাধারণত বেশি বুদ্ধিমান, কিন্তু ধীর আর দামি
- **একাধিক call:** agent যদি tool ডাকে, প্রতিটা ধাপ আলাদা inference। ৩ ধাপ মানে মোটামুটি ৩ গুণ সময়

## Inference কোথায় চলে

| উপায় | মানে | সুবিধা | অসুবিধা |
|---|---|---|---|
| **API** (Claude, OpenAI, Gemini) | provider এর server এ | সহজ, শক্তিশালী model, server চালাতে হয় না | প্রতি token খরচ, data বাইরে যায় |
| **নিজের server এ** (vLLM, Ollama এর মতো tool) | নিজের GPU তে open model | data নিজের কাছে, বেশি ব্যবহারে সস্তা হতে পারে | GPU কেনা বা ভাড়া, চালানোর ঝামেলা |

শুরুতে আমরা API ব্যবহার করব। নিজে inference চালানোর কৌশল নিয়ে আলাদা নোট: [Inference Engineering](/ai-engineer/inference-engineering)।

## যা নিয়ে গোলমাল হয়

- **"Inference" মানে শুধু অনুমান না।** সাধারণ কথায় inference মানে অনুমান বা সিদ্ধান্ত, কিন্তু AI তে এর মানে model চালানো, input থেকে output বানানো।
- **Inference এ model শেখে না।** Prompt এ যা দাও তা ওই call এর জন্যই, weight বদলায় না।
- **Output token সাধারণত input token এর চেয়ে দামি আর ধীর।** কারণ output একটা একটা করে বানাতে হয়, আর input একসাথে পড়া যায়।

পরের নোট: [Vector DBs](/ai-engineer/vector-dbs)
