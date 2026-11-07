<script setup>
const tuneFlow = {
  title: 'Fine-tuning এর ধাপ',
  nodes: [
    { id: 'data', label: 'উদাহরণ জোগাড়', sub: 'input → সঠিক output' },
    { id: 'base', label: 'তৈরি model' },
    { id: 'train', label: 'আরেকটু training', sub: 'weight অল্প বদলায়' },
    { id: 'eval', label: 'পরীক্ষা', sub: 'আগের চেয়ে ভালো?' },
    { id: 'use', label: 'নতুন model', sub: 'ব্যবহার' },
  ],
  steps: [
    {
      node: 'data',
      title: '১. শত শত ভালো উদাহরণ',
      text: 'প্রথমে নিজের কাজের অনেকগুলো উদাহরণ লাগে: কী input এ কী output চাই। উদাহরণের মানই fine-tuning এর মান ঠিক করে। ভুল উদাহরণ দিলে model ভুলটাই শিখবে।',
      code: '{"input": "apu black ta 2 ta din", "output": {"product": "black", "qty": 2}}\n{"input": "দাম কত?",              "output": {"intent": "question"}}\n... (শত শত বা হাজার হাজার)',
    },
    {
      node: 'base', edge: 0,
      title: '২. একটা তৈরি model বেছে নেওয়া',
      text: 'শূন্য থেকে না, একটা আগে থেকে train করা model থেকে শুরু। ভাষা আর সাধারণ জ্ঞান তার আগেই জানা।',
    },
    {
      node: 'train', edge: 1,
      title: '৩. নিজের উদাহরণ দিয়ে আরেকটু training',
      text: 'Model তোমার উদাহরণগুলো দেখে weight অল্প অল্প বদলায়, যাতে তোমার কাজের ধরনে ভালো উত্তর দেয়। Pretraining এর তুলনায় এটা অনেক ছোট আর সস্তা, কিন্তু তবুও সময় আর টাকা লাগে।',
    },
    {
      node: 'eval', edge: 2,
      title: '৪. পরীক্ষা: আসলেই ভালো হলো?',
      text: 'Training এ ব্যবহার হয়নি এমন test set দিয়ে নতুন model আর পুরনো model (ভালো prompt সহ) পাশাপাশি মেলানো হয়। অনেক সময় দেখা যায় ভালো prompt দিয়েই প্রায় একই ফল আসছিল।',
      code: 'পুরনো model + ভালো prompt:  ৮৮% ঠিক\nfine-tuned model:          ৯৪% ঠিক',
    },
    {
      node: 'train', edge: 2, reverse: true,
      title: '৫. ভালো না হলে: data ঠিক করো',
      text: 'ফল খারাপ হলে সাধারণত সমস্যা data তে: উদাহরণ কম, একঘেয়ে, বা ভুল। data ঠিক করে আবার train।',
    },
    {
      node: 'use', edge: 3,
      title: '৬. নতুন model ব্যবহার',
      text: 'ভালো হলে নতুন model এর নাম দিয়ে আগের মতোই API call। মনে রাখো: base model আপডেট হলে বা কাজ বদলালে আবার fine-tune করতে হতে পারে।',
    },
  ],
}
</script>

# Fine-tuning

**Fine-tuning হলো আগে থেকে train করা একটা model কে নিজের উদাহরণ দিয়ে আরেকটু train করা, যাতে নির্দিষ্ট একটা কাজে বা নির্দিষ্ট একটা ধরনে সে ভালো করে। Model এর weight অল্প বদলায়।**

[Training](/ai-engineer/training) এর সাথে তুলনা করলে: pretraining হলো কাউকে স্কুল থেকে বিশ্ববিদ্যালয় পর্যন্ত পড়ানো। Fine-tuning হলো পাশ করা একজনকে তোমার দোকানের কাজের জন্য কয়েক সপ্তাহের প্রশিক্ষণ দেওয়া।

<FlowSteps v-bind="tuneFlow" />

## Fine-tuning কী দেয়, কী দেয় না

| দেয় | দেয় না |
|---|---|
| নির্দিষ্ট **ধরন** বা **স্বর**: যেমন দোকানের নিজস্ব ভাষায় উত্তর | নতুন **তথ্য** নির্ভরযোগ্যভাবে: দাম, স্টক, নীতি |
| একটা নির্দিষ্ট **format** সবসময় মানা | আজকের তথ্য: train করার পরের কিছু জানবে না |
| ছোট model কে একটা কাজে বড় model এর কাছাকাছি নেওয়া | hallucination পুরোপুরি দূর করা |
| prompt ছোট করা: যা শেখানো হয়ে গেছে, প্রতিবার বলতে হয় না | |

::: warning তথ্য দিতে fine-tuning না
দোকানের ৫০০টা product এর দাম দিয়ে fine-tune করলে model দামগুলো আধা-মনে রাখবে আর মাঝে মাঝে বানিয়ে বলবে। দাম বদলালে আবার train করতে হবে। **তথ্যের জন্য [RAG](/ai-engineer/rag) বা database tool, আচরণের জন্য fine-tuning।**
:::

## আগে সহজ উপায়গুলো চেষ্টা করো

Fine-tuning দামি আর ঝামেলার। তাই এই ক্রমে এগোও, আর পরেরটায় যাও শুধু তখনই যখন আগেরটায় কাজ হচ্ছে না:

```txt
১. ভালো prompt              সবচেয়ে সস্তা, সাথে সাথে বদলানো যায়
   ↓ যথেষ্ট না হলে
২. Few-shot উদাহরণ          prompt এ কয়েকটা উদাহরণ
   ↓ তথ্যের অভাব হলে
৩. RAG / tool               দরকারি তথ্য খুঁজে দেওয়া
   ↓ তবুও আচরণ ঠিক না হলে
৪. Fine-tuning              শেষ উপায়
```

আমাদের order ফর্ম পূরণের কাজে ১ আর ২ দিয়েই অনেক দূর যাওয়া যাবে। হাজার হাজার আসল মেসেজ জমার পর, আর খরচ কমাতে ছোট model ব্যবহার করতে চাইলে, তখন fine-tuning ভাবা যায়।

## কয়েকটা শব্দ

| শব্দ | মানে |
|---|---|
| **Full fine-tuning** | model এর সব weight বদলানো। শক্তিশালী, কিন্তু দামি |
| **LoRA / PEFT** | শুধু অল্প কিছু বাড়তি weight যোগ করে train করা। অনেক সস্তা আর দ্রুত, open model এ খুব প্রচলিত |
| **Training set** | যে উদাহরণ দিয়ে শেখানো হয় |
| **Validation / test set** | যে উদাহরণ শেখানোর সময় দেখানো হয় না, শুধু পরীক্ষার জন্য |
| **Overfitting** | model উদাহরণগুলো মুখস্থ করে ফেলেছে, নতুন input এ খারাপ করে |

## কোথায় করা যায়

- **Provider এর সেবা:** কিছু provider নিজেদের কিছু model fine-tune করার সুবিধা দেয়। কোন model এ পাওয়া যায়, সেটা provider আর সময় ভেদে বদলায়, তাই শুরুর আগে তাদের ডকুমেন্টেশন দেখো।
- **Open model নিজে:** Llama এর মতো open model নিজের GPU তে LoRA দিয়ে fine-tune করা যায়। নিয়ন্ত্রণ বেশি, ঝামেলাও বেশি।

## যা নিয়ে গোলমাল হয়

- **Fine-tuning আর few-shot এক না।** Few-shot এ উদাহরণ প্রতিবার prompt এ যায়, weight বদলায় না। Fine-tuning এ উদাহরণ একবার শেখানো হয়, weight বদলায়।
- **Fine-tuning আর RAG প্রতিযোগী না।** একসাথেও ব্যবহার করা যায়: fine-tune করা model কে RAG দিয়ে তথ্য দেওয়া।
- **"নিজের data দিয়ে model বানানো" প্রায় সবসময় fine-tuning বা RAG বোঝায়,** শূন্য থেকে training না।

পরের নোট: [Prompt Engineering](/ai-engineer/prompting)
