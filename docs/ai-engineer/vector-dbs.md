<script setup>
const storeFlow = {
  title: 'Vector DB: রাখা আর খোঁজা',
  nodes: [
    { id: 'item', label: 'Product', sub: 'নাম আর বিবরণ' },
    { id: 'emb', label: 'Embedding model' },
    { id: 'db', label: 'Vector DB', sub: 'vector + metadata' },
    { id: 'search', label: 'কাছের খোঁজ', sub: 'top-k' },
    { id: 'res', label: 'ফলাফল' },
  ],
  steps: [
    {
      node: 'item',
      title: '১. রাখার পর্ব শুরু',
      text: 'Seller নতুন product তুললো। এর নাম আর বিবরণ মিলিয়ে একটা লেখা বানানো হয়।',
      code: 'id: 501\nseller_id: 7\nলেখা: "Red Katan Saree, বিয়ের জন্য ভারী কাজ, দাম ৪৫০০"',
    },
    {
      node: 'emb', edge: 0,
      title: '২. লেখা থেকে vector',
      text: 'Embedding model লেখাটাকে vector বানায়।',
      code: '[0.81, 0.62, 0.10, ...]  (শত শত সংখ্যা)',
    },
    {
      node: 'db', edge: 1,
      title: '৩. Vector আর metadata একসাথে রাখা',
      text: 'Vector DB তে vector এর সাথে বাকি তথ্যও (metadata) রাখা হয়: কোন seller এর, কোন product, দাম। পরে খোঁজার সময় এগুলো দিয়ে ছাঁকা যায়।',
      code: '{ id: 501, seller_id: 7, price: 4500,\n  embedding: [0.81, 0.62, 0.10, ...] }',
    },
    {
      node: 'emb', edge: 1, reverse: true,
      title: '৪. খোঁজার পর্ব: প্রশ্নও vector হয়',
      text: 'কাস্টমার লিখলো "biyer jonno lal kichu"। প্রশ্নটা একই embedding model দিয়ে vector হয়।',
      code: '"biyer jonno lal kichu" → [0.78, 0.60, 0.15, ...]',
    },
    {
      node: 'search', edge: 2,
      title: '৫. সবচেয়ে কাছের k টা খোঁজা',
      text: 'Vector DB লাখ লাখ vector এর মধ্যে থেকে প্রশ্নের সবচেয়ে কাছের কয়েকটা (top-k) দ্রুত বের করে। সাথে শর্ত: শুধু seller_id = 7 এর product।',
      code: 'WHERE seller_id = 7\nORDER BY দূরত্ব\nLIMIT 3',
    },
    {
      node: 'res', edge: 3,
      title: '৬. ফলাফল',
      text: 'সবচেয়ে মিলের product গুলো, দূরত্ব সহ, ফেরত আসে। এগুলো এখন agent কে দেওয়া যায়।',
      code: '১. Red Katan Saree       (দূরত্ব ০.০৮)\n২. লাল বেনারসি শাড়ি     (দূরত্ব ০.১১)\n৩. মেরুন সিল্ক শাড়ি     (দূরত্ব ০.২০)',
    },
  ],
}
</script>

# Vector DBs

**Vector database হলো এমন database, যেটা vector (embedding) জমা রাখে আর "এই vector এর সবচেয়ে কাছের vector কোনগুলো?" এই প্রশ্নের উত্তর খুব দ্রুত দিতে পারে।**

[Embeddings](/ai-engineer/embeddings) নোটে দেখেছি লেখাকে vector বানানো যায়। কিন্তু দোকানে হাজার হাজার product, প্রতিবার সবগুলোর সাথে তুলনা করা ধীর। Vector DB এই খোঁজাটা দ্রুত করে।

<FlowSteps v-bind="storeFlow" />

## সাধারণ database বনাম vector database

| | সাধারণ database | Vector database |
|---|---|---|
| প্রশ্ন | "নাম ঠিক এটা যার" | "অর্থে এর সবচেয়ে কাছের কোনগুলো" |
| মিল | হুবহু (`=`, `LIKE`) | কাছাকাছি (দূরত্ব) |
| ফল | মিলেছে বা মেলেনি | মিলের ক্রম অনুযায়ী সাজানো |
| উদাহরণ | `phone = '01711000000'` | "biyer jonno lal kichu" এর মতো product |

## এত দ্রুত কীভাবে

লাখ লাখ vector এর সাথে একটা একটা করে তুলনা করলে ধীর হবে। তাই vector DB একটা বিশেষ index বানায় (যেমন **HNSW**), যেটা অনেকটা শহরের রাস্তার মানচিত্রের মতো: সব বাড়িতে না ঢুকে কাছের এলাকায় সোজা পৌঁছে যাওয়া যায়।

এর একটা ছোট দাম আছে: খোঁজা হয় **প্রায়-সঠিক** (approximate)। মাঝে মাঝে সবচেয়ে কাছেরটা বাদ পড়ে দ্বিতীয়টা আসতে পারে। দোকানের product খোঁজার মতো কাজে এটা কোনো সমস্যা না।

## কোন vector database

| নাম | ধরন | কখন |
|---|---|---|
| **pgvector** | PostgreSQL এর extension | আগে থেকেই Postgres থাকলে। **আমাদের জন্য সবচেয়ে ভালো শুরু** |
| Qdrant, Weaviate, Milvus | আলাদা vector database | অনেক বেশি vector, বিশেষ সুবিধা লাগলে |
| Pinecone | cloud সেবা | নিজে কিছু চালাতে না চাইলে |
| Chroma | হালকা, local | পরীক্ষা আর prototype |

আমাদের প্রজেক্টে আগে থেকেই PostgreSQL আছে। pgvector দিলে product এর সাধারণ তথ্য আর তার vector **একই table এ** থাকে, আলাদা system চালাতে হয় না।

## pgvector এ কেমন দেখায়

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE products (
    id         bigserial PRIMARY KEY,
    seller_id  bigint NOT NULL,
    name       text NOT NULL,
    price      integer NOT NULL,
    embedding  vector(1536)          -- সংখ্যা কয়টা, embedding model অনুযায়ী
);

-- দ্রুত খোঁজার index
CREATE INDEX ON products USING hnsw (embedding vector_cosine_ops);

-- প্রশ্নের সবচেয়ে কাছের ৩টা product, শুধু এই seller এর
SELECT id, name, price, embedding <=> $1 AS distance
FROM products
WHERE seller_id = $2
ORDER BY embedding <=> $1
LIMIT 3;
```

`<=>` হলো pgvector এর cosine দূরত্ব মাপার চিহ্ন। দূরত্ব যত কম, মিল তত বেশি।

## যা নিয়ে গোলমাল হয়

- **Vector DB সাধারণ database এর বদলি না।** Order, দাম, স্টক, এসব হুবহু তথ্য সাধারণ query দিয়েই খুঁজবে। Vector খোঁজা শুধু অর্থ দিয়ে খোঁজার জন্য।
- **শুধু vector দিয়ে খুঁজলে হুবহু শব্দ হারাতে পারে।** কাস্টমার product কোড "SKU-501" লিখলে vector খোঁজায় সেটা নাও আসতে পারে। তাই অনেকে **hybrid search** করে: শব্দ মিলিয়ে খোঁজা আর অর্থ মিলিয়ে খোঁজা একসাথে।
- **Metadata দিয়ে ছাঁকা ভুলো না।** `seller_id` এর শর্ত না দিলে এক seller এর কাস্টমার আরেক seller এর product দেখবে।
- **Product বদলালে vector ও বদলাতে হয়।** নাম বা বিবরণ বদলালে আবার embed করতে হয়।

পরের নোট: [AI Agents](/ai-engineer/ai-agents)
