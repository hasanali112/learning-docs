# Architecture আর Design Pattern: পার্থক্য কী

**Software architecture হলো পুরো system এর বড় নকশা। Design pattern হলো কোডের ভেতরের একটা ছোট, বারবার আসা সমস্যার পরীক্ষিত সমাধান।**

দুটোই "কোড ভালোভাবে সাজানো" নিয়ে কথা বলে, তাই গুলিয়ে যায়। আসল পার্থক্য হলো তুমি কতটা দূর থেকে দেখছো, মানে zoom level।

## তিনটা zoom level

```txt
দূর থেকে  ▲   Software Architecture
           │   system কয়টা ভাগে, কোনটা কোথায় চলে, কীভাবে কথা বলে
           │   উদাহরণ: monolith, modular monolith, microservices
           │
           │   Architectural Pattern
           │   একটা app এর ভেতরে স্তর আর সীমানা কীভাবে টানা
           │   উদাহরণ: layered, hexagonal, MVC, event-driven
           │
           │   Design Pattern
           │   কয়েকটা class বা function কীভাবে একসাথে কাজ করে
কাছ থেকে  ▼   উদাহরণ: strategy, factory, observer, adapter
```

::: tip বাড়ির উদাহরণ
**Architecture** হলো বাড়ির নকশা: কয় তলা, কোন রুম কোথায়, পানি আর বিদ্যুতের লাইন কোন দিক দিয়ে যাবে। পরে বদলানো খুব কঠিন।
**Design pattern** হলো দরজার কবজা বা সিঁড়ির পরিচিত ডিজাইন। যেকোনো বাড়িতে বসানো যায়, আর একটা বদলালে পুরো বাড়ি ভাঙতে হয় না।
:::

## পাশাপাশি তুলনা

| | Software Architecture | Design Pattern |
|---|---|---|
| প্রশ্নটা কী | system টা কীভাবে ভাগ হবে? | এই নির্দিষ্ট সমস্যাটা কোডে কীভাবে সমাধান করব? |
| পরিধি | পুরো system, কয়েকটা service, database, deploy | কয়েকটা class বা function |
| কখন ঠিক হয় | প্রজেক্টের শুরুতে, অনেক ভেবে | কোড লেখার সময়, দরকার হলে |
| ভুল হলে খরচ | অনেক বেশি, মাসের পর মাস | কম, একটা file বা module refactor |
| কোথায় দেখা যায় | diagram, deploy, folder গঠন | class আর function এর সম্পর্ক |
| উদাহরণ | modular monolith, microservices | strategy, observer, factory |

## একই দোকান, তিন স্তরে

ধরো একটা F-commerce প্ল্যাটফর্ম বানাচ্ছো: order আসে, courier book হয়, bKash এ টাকা আসে।

| স্তর | সিদ্ধান্ত |
|---|---|
| Architecture | Rust এ একটা modular monolith, আলাদা একটা Python agent service, একটা PostgreSQL |
| Architectural pattern | প্রতিটা module hexagonal: courier আর bKash এর API adapter এর পেছনে থাকে; module গুলো event দিয়ে কথা বলে |
| Design pattern | কোন courier এ পাঠাবে সেটা **Strategy**, courier object বানানো **Factory**, order হলে সবাইকে জানানো **Observer** |

তিনটা স্তর একে অপরের বদলি না, একসাথে কাজ করে। ভালো architecture এর ভেতরেও খারাপ কোড থাকতে পারে, আবার খুব সুন্দর design pattern ব্যবহার করেও ভুল architecture বাঁচানো যায় না।

## যেগুলো নিয়ে সবচেয়ে বেশি গোলমাল হয়

::: warning Microservices কি design pattern?
না। Microservices হলো **architecture style**: system কে আলাদা আলাদা deploy হওয়া service এ ভাগ করা। এর সাথে GoF এর design pattern এর সম্পর্ক নেই। বিস্তারিত: [Monolith, Modular Monolith, Microservices](/architecture/monolith-microservices)।
:::

::: warning MVC কি design pattern?
সাধারণত MVC কে **architectural pattern** ধরা হয়, কারণ এটা পুরো UI app কে তিন স্তরে ভাগ করে (Model, View, Controller)। এটা GoF এর ২৩টা pattern এর তালিকায় নেই, যদিও MVC এর ভেতরে observer আর strategy ব্যবহার হয়। Django এর MTV (Model, Template, View) একই ধারণার আরেকটা নাম।
:::

::: warning Observer আর Pub/Sub কি একই?
না। Observer একটা **design pattern**, একই program এর ভেতরে কাজ করে। Pub/Sub একটা **messaging pattern**, মাঝখানে broker থাকে, আর সাধারণত আলাদা service এর মধ্যে চলে। বিস্তারিত: [Observer vs Pub/Sub](/design-patterns/observer-vs-pubsub)।
:::

::: warning Python এর `@decorator` কি Decorator pattern?
পুরোপুরি না। দুটোর উদ্দেশ্য কাছাকাছি (মূল জিনিস না বদলে নতুন আচরণ যোগ), কিন্তু Python এর `@` হলো ভাষার একটা সুবিধা, আর Decorator pattern হলো object জড়িয়ে ধরার একটা নকশা। বিস্তারিত: [Decorator](/design-patterns/decorator)।
:::

::: warning Repository আর Dependency Injection কোথায় পড়ে?
এগুলোও pattern, কিন্তু GoF বইয়ের ২৩টার মধ্যে নেই। এরা architecture আর design pattern এর মাঝামাঝি থাকে: কোডের স্তর আলাদা রাখতে সাহায্য করে। [Layered আর Hexagonal](/architecture/layered-hexagonal) পেজে এদের দেখা যাবে।
:::

::: warning Design pattern বেশি জানলেই কি ভালো architecture?
না। Pattern হলো যন্ত্র। দরকার ছাড়া pattern বসালে কোড শুধু জটিল হয়। ভালো architecture আসে ব্যবসা বোঝা থেকে: কোন অংশ একসাথে বদলায়, কোনটা আলাদা।
:::

## এই অংশে যা আছে

**Software Architecture**
- [Monolith, Modular Monolith, Microservices](/architecture/monolith-microservices): system কীভাবে ভাগ হবে
- [Layered আর Hexagonal](/architecture/layered-hexagonal): একটা app এর ভেতরের স্তর
- [Event-Driven Architecture](/architecture/event-driven): অংশগুলো event দিয়ে কথা বলা

**Design Patterns**
- [Design Patterns: শুরু](/design-patterns/overview): তিন ধরনের pattern আর কোনটা কখন
- তারপর প্রতিটা pattern আলাদা পেজে, শেষে [FastAPI এর ভেতরের pattern](/design-patterns/fastapi-patterns)
