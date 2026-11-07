<script setup>
const embedFlow = {
  title: 'অর্থ দিয়ে product খোঁজা',
  nodes: [
    { id: 'text', label: 'লেখা', sub: 'product এর নাম' },
    { id: 'emb', label: 'Embedding model' },
    { id: 'vec', label: 'Vector', sub: 'সংখ্যার তালিকা' },
    { id: 'cmp', label: 'তুলনা', sub: 'কত কাছাকাছি' },
    { id: 'res', label: 'ফলাফল' },
  ],
  steps: [
    {
      node: 'text',
      title: '১. দোকানের product গুলো',
      text: 'দোকানে কয়েকটা product আছে। নামগুলো একেকজন একেকভাবে লিখেছে, কেউ Bangla তে, কেউ ইংরেজিতে।',
      code: '"Red Katan Saree"\n"লাল জামদানি শাড়ি"\n"কালো চামড়ার জুতা"\n"Blue Denim Jeans"',
    },
    {
      node: 'emb', edge: 0,
      title: '২. প্রতিটা নাম embedding model এ যায়',
      text: 'Embedding model একটা বিশেষ ধরনের model। এটা উত্তর লেখে না, শুধু লেখার "অর্থ" কে কিছু সংখ্যায় রূপান্তর করে।',
      code: 'embed("Red Katan Saree")\nembed("লাল জামদানি শাড়ি")\n...',
    },
    {
      node: 'vec', edge: 1,
      title: '৩. প্রতিটা লেখা একটা vector হয়',
      text: 'Vector হলো সংখ্যার একটা লম্বা তালিকা। আসল vector এ শত শত বা হাজার হাজার সংখ্যা থাকে, এখানে বোঝার জন্য মাত্র ৩টা দেখানো হলো। মিল আছে এমন অর্থের লেখার সংখ্যাগুলোও কাছাকাছি হয়।',
      code: '"Red Katan Saree"     → [0.81, 0.62, 0.10]\n"লাল জামদানি শাড়ি"   → [0.79, 0.58, 0.14]\n"কালো চামড়ার জুতা"   → [0.12, 0.05, 0.91]\n"Blue Denim Jeans"    → [0.20, 0.71, 0.55]',
    },
    {
      node: 'emb', edge: 1, reverse: true,
      title: '৪. কাস্টমারের প্রশ্নও vector হয়',
      text: 'কাস্টমার Banglish এ লিখলো। প্রশ্নটাও একই embedding model দিয়ে vector বানানো হয়। একই model হওয়া জরুরি, নাহলে তুলনা করা যায় না।',
      code: '"lal saree ache?"  → [0.80, 0.60, 0.12]',
    },
    {
      node: 'cmp', edge: 2,
      title: '৫. কোন vector সবচেয়ে কাছে',
      text: 'প্রশ্নের vector এর সাথে প্রতিটা product এর vector এর দূরত্ব মাপা হয়। সবচেয়ে কাছেরগুলোই সবচেয়ে মিলের। এই মাপার একটা সাধারণ উপায়ের নাম cosine similarity: ১ এর কাছে মানে খুব মিল।',
      code: 'Red Katan Saree     → 0.99  ✓\nলাল জামদানি শাড়ি   → 0.99  ✓\nBlue Denim Jeans    → 0.78\nকালো চামড়ার জুতা   → 0.27',
    },
    {
      node: 'res', edge: 3,
      title: '৬. অর্থ মিলিয়ে ফলাফল',
      text: 'কাস্টমার "lal saree" লিখেছে, product এর নামে এই শব্দ হুবহু নেই। তবু দুটো লাল শাড়িই পাওয়া গেল, কারণ খোঁজা হয়েছে অর্থ দিয়ে, অক্ষর মিলিয়ে না।',
      code: '১. Red Katan Saree\n২. লাল জামদানি শাড়ি',
    },
  ],
}
</script>

# Embeddings

**Embedding হলো একটা লেখার অর্থকে সংখ্যার একটা তালিকায় (vector) রূপান্তর করা, যাতে কম্পিউটার মাপতে পারে দুটো লেখার অর্থ কতটা কাছাকাছি।**

## সমস্যা: অক্ষর মিলিয়ে খোঁজা অর্থ বোঝে না

সাধারণ database এ `WHERE name LIKE '%saree%'` দিয়ে খুঁজলে:
- "লাল শাড়ি" পাবে না, কারণ ইংরেজি "saree" নেই
- "lal saree" লিখলে "Red Katan Saree" পাবে না, কারণ "lal" আর "Red" অক্ষরে মেলে না
- "বিয়েতে পরার মতো কিছু" লিখলে কিছুই পাবে না

কাস্টমার যা চাইছে আর product এর নাম, দুটোর **অর্থ** এক, কিন্তু **অক্ষর** আলাদা। Embedding এই ফাঁকটা পূরণ করে।

<FlowSteps v-bind="embedFlow" />

## একটা মানচিত্রের মতো ভাবো

প্রতিটা vector কে একটা মানচিত্রে একটা বিন্দু হিসেবে ভাবো। মিল আছে এমন অর্থের লেখাগুলো কাছাকাছি বসে:

```txt
        কাপড়
          ▲
          │   • Red Katan Saree
          │   • লাল জামদানি শাড়ি
          │   ★ "lal saree ache?"      ← প্রশ্নটা এখানে পড়েছে
          │
          │            • Blue Denim Jeans
          │
          │                          • কালো চামড়ার জুতা
          └────────────────────────────────────────▶ জুতা
```

আসল vector এ শুধু দুটো দিক না, শত শত দিক থাকে। আর প্রতিটা দিকের মানে মানুষের পক্ষে বোঝা যায় না। কিন্তু মূল ধারণা একই: **কাছাকাছি মানে অর্থে মিল।**

## কোডে কেমন দেখায়

```python
from langchain_openai import OpenAIEmbeddings   # একটা উদাহরণ provider

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector = embeddings.embed_query("lal saree ache?")
print(len(vector))   # কতগুলো সংখ্যা (model ভেদে আলাদা)

vectors = embeddings.embed_documents(["Red Katan Saree", "কালো চামড়ার জুতা"])
```

দুটো vector কতটা কাছে, সেটা মাপার সাধারণ উপায় **cosine similarity**:

```python
import math

def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))
```

বাস্তবে এই হিসাব নিজে লিখতে হয় না, vector database নিজেই করে। সেটা পরের নোটে।

::: warning Chat model আর embedding model আলাদা
উত্তর লেখার model (chat model) আর embedding model দুটো আলাদা জিনিস, আলাদা API। সব provider embedding model দেয় না। যেমন Anthropic (Claude) নিজে embedding model দেয় না, তখন অন্য provider বা open-source model ব্যবহার করতে হয়। তাই chat এর জন্য এক provider আর embedding এর জন্য আরেক provider হওয়া খুব স্বাভাবিক।
:::

## কোথায় কাজে লাগে

| কাজ | উদাহরণ |
|---|---|
| **অর্থ দিয়ে খোঁজা** (semantic search) | "বিয়েতে পরার মতো লাল কিছু" → লাল বেনারসি, লাল কাতান |
| **RAG** | প্রশ্নের সাথে মিলে এমন তথ্য খুঁজে LLM কে দেওয়া |
| **একই রকম জিনিস খোঁজা** | একই product দুইবার দুই নামে তোলা হয়েছে কিনা |
| **ভাগ করা** (classification) | কাস্টমারের মেসেজ "অভিযোগ", "order", নাকি "প্রশ্ন" |
| **সুপারিশ** | "এই শাড়ি যারা কিনেছে, তাদের পছন্দ হতে পারে..." |

## যা নিয়ে গোলমাল হয়

- **Embedding আর token এক না।** Token হলো লেখার টুকরো, embedding হলো পুরো লেখার অর্থের সংখ্যা-রূপ।
- **দুই model এর vector মেশানো যায় না।** একটা model দিয়ে বানানো product এর vector আর আরেক model দিয়ে বানানো প্রশ্নের vector তুলনা করলে ফল অর্থহীন। model বদলালে সব vector আবার বানাতে হয়।
- **Embedding সত্য-মিথ্যা বোঝে না।** "শাড়ির দাম ১০০০" আর "শাড়ির দাম ৫০০০" এর vector প্রায় একই হবে, কারণ বিষয় একই। এটা মিল খোঁজার যন্ত্র, তথ্য যাচাইয়ের না।
- **Bangla আর Banglish এর জন্য multilingual model লাগে।** শুধু ইংরেজির জন্য বানানো model এ Bangla লেখার vector ভালো হয় না। model বাছার আগে নিজের data দিয়ে পরীক্ষা করো।

পরের নোট: [Training](/ai-engineer/training)
