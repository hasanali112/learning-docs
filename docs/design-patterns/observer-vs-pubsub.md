# Observer vs Pub/Sub

দুটোতেই একটা ঘটনা অনেকজনের কাছে যায়, তাই অনেকে এদের এক মনে করে। পার্থক্য হলো **মাঝখানে কেউ আছে কিনা।**

## এক নজরে

```txt
Observer: subject নিজেই সবাইকে চেনে আর সরাসরি call করে

    Order ──call──→ StockListener
      │
      └───call──→ SmsListener


Pub/Sub: মাঝখানে broker, কেউ কাউকে চেনে না

    Order ──publish──→ ┌────────────────┐ ──deliver──→ Stock service
    (publisher)        │ broker         │
                       │ topic: orders  │ ──deliver──→ SMS service
                       └────────────────┘              (subscriber)
```

## পাশাপাশি তুলনা

| | Observer | Pub/Sub |
|---|---|---|
| ধরন | Design pattern (GoF) | Messaging / architectural pattern |
| মাঝখানে কেউ আছে? | না, subject সরাসরি call করে | হ্যাঁ, broker |
| কে কাকে চেনে | subject এর কাছে observer দের তালিকা থাকে | publisher আর subscriber কেউ কাউকে চেনে না, শুধু topic চেনে |
| কোথায় চলে | সাধারণত একই program এর ভেতরে | সাধারণত আলাদা program বা service এর মধ্যে |
| সময় | সাধারণত synchronous: সবাই শেষ না হওয়া পর্যন্ত subject অপেক্ষা করে | সাধারণত asynchronous: publish করেই publisher নিজের কাজে ফেরে |
| subscriber বন্ধ থাকলে | ঘটনা হারায় | broker ভেদে জমা থাকে, পরে পায় |
| ধীর subscriber | subject কেও ধীর করে | publisher এর উপর প্রভাব নেই |
| উদাহরণ | Django signals, GUI event, ছোট in-memory event bus | Redis, RabbitMQ, Kafka, Google Pub/Sub, NATS |

## একই দোকান, দুইভাবে

**Observer:** order delivered হলে একই Python program এর ভেতরে `accounts.record_income()` আর `dashboard.refresh()` সাথে সাথে চলে। দ্রুত, সহজ, কোনো বাড়তি server লাগে না।

**Pub/Sub:** order delivered হলে Rust backend `order.delivered` topic এ একটা message publish করে। Python এর AI agent service আর আলাদা একটা SMS worker নিজেদের সময়মতো সেটা পায়। SMS worker ৫ মিনিট বন্ধ থাকলেও, চালু হয়ে জমে থাকা message গুলো পায় (যদি broker সেগুলো জমা রাখে)।

## কোনটা কখন

| অবস্থা | পছন্দ |
|---|---|
| একই program, কাজগুলো দ্রুত, হারালে বড় ক্ষতি নেই | Observer |
| আলাদা service বা আলাদা ভাষায় লেখা program | Pub/Sub |
| কাজ ধীর (SMS, AI, বাইরের API), মূল কাজ আটকে রাখা যাবে না | Pub/Sub বা queue |
| ঘটনা কোনোভাবেই হারানো চলবে না | জমা রাখে এমন broker (RabbitMQ, Kafka, Redis Streams) |

## যা নিয়ে আরো গোলমাল হয়

::: warning সব broker ঘটনা জমা রাখে না
**Redis Pub/Sub** এ subscriber সেই মুহূর্তে connected না থাকলে message চিরতরে হারায়। জমা রাখতে চাইলে **Redis Streams** লাগে। "Pub/Sub" নাম থাকলেই নিশ্চিত ডেলিভারি না, broker এর নিয়ম দেখে নিতে হয়।
:::

::: warning Queue আর Pub/Sub ও আলাদা
**Queue:** একটা message **একজন** worker পায়। কাজ ভাগ করে দিতে (যেমন ১০ জন worker মিলে parcel book করছে)।
**Pub/Sub:** একটা message **প্রত্যেক** subscriber পায়। সবাইকে জানাতে (stock, SMS, analytics সবাই একই ঘটনা চায়)।
অনেক broker দুটোই পারে, তাই নাম দেখে না, আচরণ দেখে ঠিক করো।
:::

**মাঝামাঝি একটা জিনিস:** একই program এর ভেতরে একটা event bus, যেখানে publisher আর subscriber একে অপরকে চেনে না, শুধু event এর নাম চেনে। [Observer](/design-patterns/observer) পেজের `EventBus` আসলে এরকম। এটা observer এর মতো synchronous আর memory তে, কিন্তু pub/sub এর মতো একে অপরকে না চেনা। তাই কেউ কেউ এটাকে "in-process pub/sub" বলে।

বড় ছবি: [Event-Driven Architecture](/architecture/event-driven)।
