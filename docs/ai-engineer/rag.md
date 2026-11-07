<script setup>
const indexFlow = {
  title: 'পর্ব ১: আগে থেকে সাজিয়ে রাখা (indexing)',
  nodes: [
    { id: 'doc', label: 'Document', sub: 'নীতি, FAQ, বিবরণ' },
    { id: 'chunk', label: 'টুকরো করা', sub: 'chunking' },
    { id: 'emb', label: 'Embed' },
    { id: 'db', label: 'Vector DB' },
  ],
  steps: [
    {
      node: 'doc',
      title: '১. Seller এর লেখা তথ্য',
      text: 'Seller এর return নীতি, ডেলিভারির নিয়ম, product এর বিস্তারিত বিবরণ। এগুলো কোনো LLM জানে না।',
      code: 'return নীতি (২ পাতা)\nডেলিভারির নিয়ম (১ পাতা)\n৫০০টা product এর বিবরণ',
    },
    {
      node: 'chunk', edge: 0,
      title: '২. ছোট ছোট টুকরো',
      text: 'লম্বা লেখা ছোট টুকরোয় (chunk) ভাগ করা হয়, যাতে প্রতিটা টুকরো একটা বিষয় নিয়ে থাকে। খোঁজার সময় পুরো ২ পাতা না, শুধু দরকারি অনুচ্ছেদটা আসবে।',
      code: 'chunk ১: "পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে return..."\nchunk ২: "ঢাকার ভেতরে ডেলিভারি চার্জ ৬০ টাকা..."\nchunk ৩: "ঢাকার বাইরে ১২০ টাকা, ৩-৫ দিন..."',
    },
    {
      node: 'emb', edge: 1,
      title: '৩. প্রতিটা টুকরো vector হয়',
      text: 'প্রতিটা chunk embedding model দিয়ে vector বানানো হয়।',
      code: 'chunk ১ → [0.12, 0.88, ...]\nchunk ২ → [0.75, 0.21, ...]',
    },
    {
      node: 'db', edge: 2,
      title: '৪. Vector DB তে জমা',
      text: 'Vector, মূল লেখা আর seller_id একসাথে জমা হয়। এই কাজ একবারই করা হয়, আর তথ্য বদলালে আবার।',
    },
  ],
}

const askFlow = {
  title: 'পর্ব ২: প্রশ্ন এলে (retrieve → augment → generate)',
  nodes: [
    { id: 'q', label: 'প্রশ্ন' },
    { id: 'ret', label: 'Retrieve', sub: 'খুঁজে আনা' },
    { id: 'aug', label: 'Augment', sub: 'prompt এ যোগ' },
    { id: 'gen', label: 'Generate', sub: 'LLM উত্তর' },
  ],
  steps: [
    {
      node: 'q',
      title: '১. কাস্টমারের প্রশ্ন',
      text: 'এই উত্তর seller এর নীতিতে আছে, LLM এর জানা নেই।',
      code: '"sylhet e delivery koto din lage? charge koto?"',
    },
    {
      node: 'ret', edge: 0,
      title: '২. Retrieve: সম্পর্কিত টুকরো খুঁজে আনা',
      text: 'প্রশ্নটা embed করে vector DB থেকে সবচেয়ে মিলের কয়েকটা chunk আনা হয়।',
      code: 'পাওয়া গেল:\n"ঢাকার বাইরে ১২০ টাকা, ৩-৫ দিন..."',
    },
    {
      node: 'aug', edge: 1,
      title: '৩. Augment: prompt এ বসানো',
      text: 'পাওয়া টুকরোগুলো prompt এ প্রসঙ্গ হিসেবে বসানো হয়, সাথে নির্দেশ: শুধু এই তথ্য থেকে উত্তর দাও।',
      code: 'নিচের তথ্য থেকে উত্তর দাও। তথ্যে না থাকলে বলো "জানা নেই"।\n<context>\nঢাকার বাইরে ১২০ টাকা, ৩-৫ দিন...\n</context>\nপ্রশ্ন: sylhet e delivery koto din lage? charge koto?',
    },
    {
      node: 'gen', edge: 2,
      title: '৪. Generate: তথ্যের উপর ভর করে উত্তর',
      text: 'LLM এখন নিজের স্মৃতি থেকে না, দেওয়া তথ্য থেকে উত্তর লেখে। তাই বানানো উত্তরের ঝুঁকি অনেক কম।',
      code: '"সিলেটে ডেলিভারি হতে ৩-৫ দিন লাগবে, চার্জ ১২০ টাকা।"',
    },
  ],
}
</script>

# RAG (Retrieval-Augmented Generation)

**RAG মানে LLM কে উত্তর লিখতে দেওয়ার আগে, প্রশ্নের সাথে সম্পর্কিত তথ্য খুঁজে এনে prompt এ দিয়ে দেওয়া। তাহলে LLM নিজের স্মৃতি থেকে না, দেওয়া তথ্য থেকে উত্তর লেখে।**

নামটাই তিনটা ধাপ বলে দেয়:
- **Retrieval:** দরকারি তথ্য খুঁজে আনা
- **Augmented:** সেটা prompt এ যোগ করা
- **Generation:** LLM দিয়ে উত্তর বানানো

## কেন লাগে

LLM তোমার দোকানের return নীতি, ডেলিভারির নিয়ম বা product এর বিস্তারিত জানে না ([Training](/ai-engineer/training) নোটের knowledge cutoff)। জিজ্ঞেস করলে হয় বলবে জানে না, নয়তো বানিয়ে বলবে।

সব তথ্য প্রতিবার prompt এ ঢুকিয়ে দেওয়া যায়, কিন্তু:
- তথ্য বেশি হলে [context window](/ai-engineer/context-window) এ ধরবে না
- প্রতিটা call এ সব পাঠালে খরচ অনেক
- অদরকারি তথ্য বেশি থাকলে LLM আসল জিনিসটা মিস করতে পারে

RAG শুধু **দরকারি অংশটুকু** খুঁজে দেয়।

## দুই পর্বে কাজ করে

<FlowSteps v-bind="indexFlow" />

<FlowSteps v-bind="askFlow" />

## RAG বনাম Tool: কখন কোনটা

দুটোই LLM কে বাইরের তথ্য দেয়, তাই গুলিয়ে যায়।

| | RAG | Tool দিয়ে database query |
|---|---|---|
| কোন ধরনের তথ্য | এলোমেলো লেখা: নীতি, FAQ, বিবরণ | গোছানো data: order, দাম, স্টক |
| খোঁজার উপায় | অর্থ মিলিয়ে (vector) | হুবহু (`WHERE phone = ...`) |
| উদাহরণ | "return এর নিয়ম কী?" | "01711 নম্বরের order কোথায়?" |

আমাদের Sales agent এ দুটোই লাগবে: order খোঁজা **tool** দিয়ে, দোকানের নীতি আর product এর বিবরণ নিয়ে প্রশ্ন **RAG** দিয়ে।

## RAG বনাম Fine-tuning

| | RAG | [Fine-tuning](/ai-engineer/fine-tuning) |
|---|---|---|
| কী দেয় | নতুন **তথ্য** | নতুন **আচরণ** বা ধরন |
| তথ্য বদলালে | শুধু document বদলাও, সাথে সাথে কাজ করে | আবার train করতে হয় |
| উৎস দেখানো | যায় (কোন অংশ থেকে উত্তর) | যায় না |
| খরচ | কম | বেশি |

**তথ্য দিতে চাইলে RAG, আচরণ বদলাতে চাইলে fine-tuning।** বেশিরভাগ ক্ষেত্রে RAG দিয়েই কাজ হয়।

## RAG কোথায় ভুল করে

| সমস্যা | কারণ | সমাধান |
|---|---|---|
| ভুল টুকরো আসে | chunk খুব বড় বা খুব ছোট, embedding model দুর্বল | chunk এর আকার পরীক্ষা, ভালো multilingual model |
| দরকারি টুকরো আসে না | প্রশ্নের শব্দ আর document এর শব্দ খুব আলাদা | hybrid search, প্রশ্ন নতুন করে লেখা |
| তথ্য না থাকলেও উত্তর বানায় | prompt এ নিষেধ নেই | "তথ্যে না থাকলে বলো জানা নেই" |
| অন্য seller এর তথ্য আসে | metadata দিয়ে ছাঁকা হয়নি | সবসময় `seller_id` এর শর্ত |

## যা নিয়ে গোলমাল হয়

- **RAG মানেই vector DB না।** "Retrieve" যেকোনোভাবে হতে পারে: vector খোঁজা, সাধারণ search, এমনকি API call। Vector DB সবচেয়ে প্রচলিত উপায়, একমাত্র না।
- **RAG LLM কে কিছু শেখায় না।** প্রতিটা প্রশ্নে নতুন করে তথ্য দেওয়া হয়, model এর weight বদলায় না।
- **RAG থাকলেও hallucination শূন্য না।** কমে, কিন্তু LLM তবুও দেওয়া তথ্য ভুল পড়তে পারে। জরুরি সংখ্যা (দাম) সবসময় database থেকে যাচাই করো।

পরের নোট: [Context Window](/ai-engineer/context-window)
