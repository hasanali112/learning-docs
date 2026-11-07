# Event-Driven Architecture

সিস্টেমের অংশগুলো একে অপরকে সরাসরি "এটা করো" না বলে, শুধু জানায় "এটা ঘটেছে"। যার দরকার, সে নিজে শুনে নিজের কাজ করে।

## সমস্যা: সরাসরি call

order হলে অনেকগুলো কাজ করতে হয়:

```python
def place_order(order):
    save(order)
    courier.book(order)        # courier module কে চিনতে হয়
    stock.reduce(order)        # stock module কে চিনতে হয়
    sms.send(order.phone)      # sms module কে চিনতে হয়
    analytics.track(order)     # analytics module কে চিনতে হয়
```

`order` module এখন চারটা module এর উপর নির্ভর করে। নতুন একটা কাজ যোগ করতে হলে (যেমন seller কে notification) আবার `place_order` বদলাতে হয়। sms পাঠাতে দেরি হলে পুরো order ও আটকে থাকে।

## সমাধান: event

```python
def place_order(order):
    save(order)
    publish(OrderCreated(order_id=order.id, phone=order.phone))
```

```txt
             OrderCreated
order ──────────────┬──────────→ courier   (parcel book করে)
                    ├──────────→ stock     (স্টক কমায়)
                    ├──────────→ sms       (কাস্টমারকে SMS)
                    └──────────→ analytics (হিসাবে যোগ করে)
```

`order` এখন কাউকে চেনে না। নতুন কাজ লাগলে শুধু নতুন একজন listener যোগ করো, `order` এর কোড বদলাতে হয় না।

## Command আর Event এর পার্থক্য

| | Command | Event |
|---|---|---|
| মানে | "এটা করো" | "এটা ঘটে গেছে" |
| নাম | আদেশ: `BookCourier` | অতীত কাল: `OrderCreated`, `PaymentReceived` |
| কে পায় | ঠিক একজন | শূন্য, এক বা অনেকজন |
| পাঠানো জন জানে কে করবে? | হ্যাঁ | না |

## Event কীভাবে পৌঁছায়

| উপায় | কোথায় | উদাহরণ |
|---|---|---|
| In-process | একই program এর ভেতরে | একটা সাধারণ Python event bus, [Observer pattern](/design-patterns/observer) |
| Database queue | একটা table এ event লেখা, worker পড়ে | PostgreSQL এর `FOR UPDATE SKIP LOCKED` |
| Message broker | আলাদা server, আলাদা service এর মধ্যে | Redis Streams, RabbitMQ, Kafka, NATS |

শুরুতে in-process বা database queue ই যথেষ্ট। Kafka এর মতো জিনিস তখনই, যখন সত্যিই অনেক বেশি event আর অনেক service।

## যা নতুন সমস্যা আনে

Event-driven কিছু সমস্যা সমাধান করে, আবার কিছু নতুন সমস্যাও আনে।

**১. Eventual consistency:** order save হয়ে গেছে, কিন্তু stock কমতে এক মুহূর্ত দেরি হতে পারে। সবকিছু একসাথে ঠিক থাকে না, কিছুক্ষণ পরে ঠিক হয়।

**২. একই event দুইবার আসতে পারে:** network এর গোলমালে broker আবার পাঠায়। তাই listener এমন হতে হবে যে একই event দুইবার এলেও ফল একই থাকে। এর নাম **idempotent**। যেমন: "এই order_id এর parcel আগে book হয়ে থাকলে আবার book করো না।"

**৩. event হারিয়ে যাওয়া:** order database এ save হলো, কিন্তু event পাঠানোর আগেই program crash করলো। তখন courier কখনো জানবে না।

::: tip Outbox pattern
সমাধান: event সরাসরি broker এ না পাঠিয়ে, order এর **একই database transaction** এ একটা `outbox` table এ লিখে রাখো। আলাদা একটা worker সেই table পড়ে event পাঠায়। order save হলে event ও নিশ্চিতভাবে save হয়, একটা ছাড়া আরেকটা হয় না।
:::

**৪. debug কঠিন:** কাজটা এখন কয়েক জায়গায় ছড়ানো। প্রতিটা event এ একটা `correlation_id` রাখলে পরে log জোড়া লাগানো সহজ হয়।

## কখন ব্যবহার করবে

- একটা ঘটনার পর অনেকগুলো আলাদা কাজ হয়, আর সেই তালিকা বাড়তে থাকে
- কিছু কাজ ধীর (SMS, বাইরের API, AI), যেগুলোর জন্য মূল কাজ আটকে রাখা উচিত না
- module গুলোকে একে অপরের থেকে আলাদা রাখতে চাও

## কখন না

- কাজটা একটাই, আর সাথে সাথে ফল লাগবে (যেমন login check)
- ধাপগুলো একটা নির্দিষ্ট ক্রমে আর একসাথে সফল হতে হবে, তখন সরাসরি call আর transaction সহজ
