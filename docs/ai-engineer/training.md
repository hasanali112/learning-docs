<script setup>
const learnFlow = {
  title: 'Model কীভাবে শেখে (pretraining)',
  nodes: [
    { id: 'data', label: 'বিশাল লেখা', sub: 'বই, ওয়েবসাইট, কোড' },
    { id: 'guess', label: 'অনুমান', sub: 'পরের token' },
    { id: 'check', label: 'মেলানো', sub: 'আসলটার সাথে' },
    { id: 'fix', label: 'Weight ঠিক করা', sub: 'ভুল কমানো' },
  ],
  steps: [
    {
      node: 'data',
      title: '১. একটা বাক্য নেওয়া হয়',
      text: 'Training data থেকে একটা বাক্য নেওয়া হলো। শেষ শব্দটা লুকিয়ে রাখা হয়, model কে অনুমান করতে হবে।',
      code: 'বাক্য:  "ঢাকা বাংলাদেশের ____"\nআসল উত্তর (লুকানো): "রাজধানী"',
    },
    {
      node: 'guess', edge: 0,
      title: '২. Model অনুমান করে',
      text: 'শুরুতে model এর ভেতরের সংখ্যাগুলো (weight) এলোমেলো, তাই অনুমানও প্রায় এলোমেলো।',
      code: 'model এর অনুমান:\n  "শহর"     → ২০%\n  "রাজধানী"  → ৫%\n  "নদী"     → ৪%\n  ...',
    },
    {
      node: 'check', edge: 1,
      title: '৩. আসল উত্তরের সাথে মেলানো',
      text: 'আসল উত্তর "রাজধানী" কে model মাত্র ৫% সম্ভাবনা দিয়েছিল। এই ভুলের পরিমাণটা হিসাব করা হয় (loss)।',
      code: 'আসল: "রাজধানী"\nmodel দিয়েছিল: ৫%\nভুল (loss): বেশি',
    },
    {
      node: 'fix', edge: 2,
      title: '৪. Weight একটু একটু বদলানো',
      text: 'ভুল কমাতে model এর কোটি কোটি weight একটু একটু করে বদলানো হয়, যাতে পরেরবার "রাজধানী" এর সম্ভাবনা বাড়ে। এই কৌশলের নাম gradient descent।',
      code: 'weight[1]:  0.4512 → 0.4518\nweight[2]: -0.1203 → -0.1199\n... (কোটি কোটি weight)',
    },
    {
      node: 'guess', edge: 1, reverse: true,
      title: '৫. আবার, কোটি কোটি বার',
      text: 'এই চক্র চলে কোটি কোটি বাক্যে, হাজার হাজার GPU তে, সপ্তাহ বা মাস ধরে। ধীরে ধীরে model ভাষার গঠন, তথ্য আর যুক্তির ধরন শিখে ফেলে।',
      code: 'কিছুদিন পর একই বাক্যে:\n  "রাজধানী"  → ৯২%  ✓',
    },
    {
      node: 'fix',
      title: '৬. ফল: base model',
      text: 'এই ধাপের শেষে পাওয়া যায় base model: খুব ভালো লেখা চালিয়ে যেতে পারে, কিন্তু প্রশ্নের উত্তর দেওয়া বা নির্দেশ মানা এখনো জানে না। এরপর আরেক ধাপের training লাগে।',
      code: 'base model কে: "লাল শাড়ি আছে?"\nউত্তর: "লাল শাড়ি আছে? নীল শাড়ি আছে? সবুজ..."  ← শুধু চালিয়ে যাচ্ছে',
    },
  ],
}

const stageFlow = {
  title: 'একটা chat model তৈরির ধাপ',
  nodes: [
    { id: 'pre', label: 'Pretraining', sub: 'ভাষা শেখা' },
    { id: 'base', label: 'Base model' },
    { id: 'sft', label: 'Instruction tuning', sub: 'নির্দেশ মানা' },
    { id: 'pref', label: 'Preference tuning', sub: 'ভালো উত্তর বাছা' },
    { id: 'chat', label: 'Chat model', sub: 'যেটা আমরা ব্যবহার করি' },
  ],
  steps: [
    {
      node: 'pre',
      title: '১. Pretraining',
      text: 'বিশাল পরিমাণ লেখা থেকে পরের token অনুমান করে ভাষা আর জ্ঞান শেখা। সবচেয়ে দামি ধাপ।',
    },
    {
      node: 'base', edge: 0,
      title: '২. Base model',
      text: 'লেখা চালিয়ে যেতে পারে, কিন্তু সহকারীর মতো আচরণ করে না।',
    },
    {
      node: 'sft', edge: 1,
      title: '৩. Instruction tuning',
      text: 'মানুষের লেখা হাজার হাজার "প্রশ্ন → ভালো উত্তর" এর উদাহরণ দিয়ে শেখানো হয়, যাতে model নির্দেশ মানতে আর উত্তর দিতে শেখে।',
      code: 'প্রশ্ন: "লাল শাড়ি আছে?"\nউত্তর: "জি, আমাদের কয়েকটা লাল শাড়ি আছে..."',
    },
    {
      node: 'pref', edge: 2,
      title: '৪. Preference tuning',
      text: 'একই প্রশ্নের কয়েকটা উত্তর থেকে মানুষ বা অন্য কোনো পদ্ধতি বলে দেয় কোনটা ভালো। Model শেখে বেশি সহায়ক, সৎ আর নিরাপদ উত্তর দিতে। RLHF এই ধাপের একটা পরিচিত পদ্ধতি।',
      code: 'উত্তর A: সংক্ষিপ্ত আর সঠিক   ✓ ভালো\nউত্তর B: লম্বা আর ভুল তথ্যসহ  ✗',
    },
    {
      node: 'chat', edge: 3,
      title: '৫. Chat model',
      text: 'এই model টাই API দিয়ে আমরা ব্যবহার করি। Training শেষ, weight এখন স্থির। এরপর থেকে প্রতিটা ব্যবহার হলো inference।',
    },
  ],
}
</script>

# Training

**Training হলো একটা model কে data দেখিয়ে শেখানো: model অনুমান করে, ভুল মাপা হয়, আর ভুল কমাতে model এর ভেতরের সংখ্যাগুলো (weight) একটু একটু বদলানো হয়। কোটি কোটি বার।**

## Weight কী

Model এর ভেতরে কোটি কোটি (বড় model এ শত শত কোটি) সংখ্যা থাকে, এদের বলে **weight** বা **parameter**। Model এর সব "জ্ঞান" এই সংখ্যাগুলোর মধ্যেই ছড়িয়ে আছে। কোনো একটা weight এ "ঢাকা বাংলাদেশের রাজধানী" লেখা থাকে না, পুরো জ্ঞান সব weight মিলিয়ে।

Training মানে এই weight গুলো ঠিক করা।

## Model কীভাবে শেখে

<FlowSteps v-bind="learnFlow" />

## Chat model তৈরির পুরো পথ

শুধু pretraining দিয়ে ChatGPT বা Claude এর মতো সহকারী হয় না। আরো কয়েকটা ধাপ লাগে:

<FlowSteps v-bind="stageFlow" />

## Training কত বড় কাজ

| | মোটামুটি পরিমাণ |
|---|---|
| Data | ইন্টারনেট, বই আর কোডের বিশাল অংশ |
| যন্ত্র | হাজার হাজার GPU |
| সময় | সপ্তাহ থেকে মাস |
| খরচ | অনেক বড় কোম্পানি ছাড়া সম্ভব না |

তাই **আমরা model train করব না।** আমরা তৈরি model ব্যবহার করব (inference), আর নিজেদের কাজের জন্য সেটাকে prompt, tool আর context দিয়ে চালাব।

## Knowledge cutoff

Training এ যে data ব্যবহার হয়েছে, তার পরের কোনো তথ্য model জানে না। এই তারিখকে বলে **knowledge cutoff**। তাই:
- আজকের দাম, স্টক, নতুন courier এর নিয়ম, এসব model জানে না
- তোমার দোকানের কিছুই জানে না, কারণ সেগুলো কখনো training data তে ছিল না

এই তথ্যগুলো আমাদের দিতে হয় prompt, tool বা [RAG](/ai-engineer/rag) দিয়ে।

## যা নিয়ে গোলমাল হয়

| শব্দ | মানে | weight বদলায়? | আমরা করব? |
|---|---|---|---|
| **Pretraining** | শূন্য থেকে বিশাল data দিয়ে শেখানো | হ্যাঁ, সব | না |
| **[Fine-tuning](/ai-engineer/fine-tuning)** | তৈরি model কে নিজের ছোট data দিয়ে আরেকটু শেখানো | হ্যাঁ, অল্প | এখন না, হয়তো পরে |
| **[Inference](/ai-engineer/inference)** | তৈরি model দিয়ে উত্তর বানানো | না | হ্যাঁ, প্রতিটা API call |
| **In-context learning** | prompt এ উদাহরণ দিয়ে শেখানো (few-shot) | না | হ্যাঁ |

::: warning কথোপকথনে model শেখে না
কাস্টমারের সাথে হাজারটা কথা বললেও model এর weight একটুও বদলায় না। Prompt এ উদাহরণ দিলে model সেই call এ ভালো করে, কিন্তু পরের call এ ভুলে যায়। এটা "শেখা" না, এটা প্রতিবার মনে করিয়ে দেওয়া।
:::

পরের নোট: [Inference](/ai-engineer/inference)
