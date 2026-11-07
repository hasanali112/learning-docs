# Design Patterns: শুরু

**Design pattern হলো সফটওয়্যারে বারবার আসা একটা সমস্যার পরীক্ষিত সমাধানের নকশা।** এটা কোনো library বা কপি করার মতো কোড না। এটা একটা ধারণা, যেটা নিজের ভাষা আর নিজের কোডে বসিয়ে নিতে হয়।

Architecture আর design pattern এর পার্থক্য নিয়ে গোলমাল থাকলে আগে এটা পড়ো: [Architecture আর Design Pattern](/architecture/architecture-vs-pattern)।

## কোথা থেকে এলো

১৯৯৪ সালে চারজন লেখক (Gamma, Helm, Johnson, Vlissides) একটা বই লেখেন: *Design Patterns: Elements of Reusable Object-Oriented Software*। লেখক চারজন, তাই এদের বলা হয় **Gang of Four (GoF)**। বইয়ে ২৩টা pattern আছে, আজও এগুলোই সবচেয়ে পরিচিত।

Pattern এর সবচেয়ে বড় লাভ হলো **একটা সাধারণ ভাষা**। "এখানে strategy বসাও" বললে পুরো দল এক কথায় বুঝে যায় কী করতে হবে।

## তিন ধরনের pattern

| ধরন | কোন প্রশ্নের উত্তর | এই সাইটে যেগুলো আছে |
|---|---|---|
| **Creational** (তৈরি) | object কীভাবে বানাবো? | [Singleton](/design-patterns/singleton), [Factory](/design-patterns/factory), [Builder](/design-patterns/builder) |
| **Structural** (গঠন) | object গুলো কীভাবে জোড়া লাগাবো? | [Adapter](/design-patterns/adapter), [Decorator](/design-patterns/decorator), [Facade](/design-patterns/facade) |
| **Behavioral** (আচরণ) | object গুলো কীভাবে একসাথে কাজ করবে, কে কী দায়িত্ব নেবে? | [Strategy](/design-patterns/strategy), [Observer](/design-patterns/observer), [Chain of Responsibility](/design-patterns/chain-of-responsibility) |

তারপর দুটো পেজ, যেগুলো সবচেয়ে বেশি গোলমাল দূর করে:
- [Observer vs Pub/Sub](/design-patterns/observer-vs-pubsub)
- [FastAPI এর ভেতরের pattern](/design-patterns/fastapi-patterns): যেগুলো তুমি না জেনেই প্রতিদিন ব্যবহার করছো

## এক নজরে: কোন সমস্যায় কোন pattern

| সমস্যা | Pattern |
|---|---|
| পুরো app এ একটাই object থাকুক (config, DB pool) | Singleton |
| কোন class এর object বানাবো সেটা পরে ঠিক হবে | Factory |
| অনেক optional অংশ দিয়ে ধাপে ধাপে জটিল object বানাতে হবে | Builder |
| বাইরের কোনো API এর আকার আমার কোডের সাথে মিলছে না | Adapter |
| মূল জিনিস না বদলে উপরে নতুন আচরণ যোগ করতে চাই | Decorator |
| জটিল কয়েকটা অংশকে একটা সহজ দরজার পেছনে লুকাতে চাই | Facade |
| একই কাজের কয়েকটা উপায়, runtime এ বেছে নিতে হবে | Strategy |
| কিছু ঘটলে অনেকজনকে জানাতে হবে | Observer |
| request কয়েকটা ধাপ পার হবে, যেকোনো ধাপ থামাতে পারে | Chain of Responsibility |

## Python এ pattern একটু আলাদা দেখায়

GoF বই লেখা হয়েছিল C++ আর Smalltalk মাথায় রেখে। Python এ অনেক কিছু ভাষাতেই আছে, তাই কিছু pattern অনেক ছোট হয়ে যায়:

- **function নিজেই object:** strategy বানাতে আলাদা class লাগে না, একটা function পাঠালেই হয়।
- **module নিজেই singleton:** একটা module একবারই load হয়।
- **`@decorator` syntax:** function এর চারপাশে আচরণ যোগ করা সহজ।
- **duck typing আর `Protocol`:** interface এর জন্য বড় class hierarchy লাগে না।

তাই এই সাইটে প্রতিটা pattern এর ক্লাসিক রূপ আর Python এর সহজ রূপ, দুটোই দেখানো হয়েছে।

## প্রতিটা pattern পেজে যা থাকবে

1. **এক লাইনে:** pattern টা কী
2. **সমস্যা:** pattern ছাড়া কোড কেমন দেখায়
3. **সমাধান:** pattern দিয়ে, Python এ
4. **কখন ব্যবহার করবে, কখন না**
5. **যা নিয়ে গোলমাল হয়**

উদাহরণগুলো একটা অনলাইন দোকানের: order, courier (Pathao, Steadfast, RedX), bKash, SMS।

::: warning Pattern এর পেছনে দৌড়ানো না
pattern শেখার পর সব জায়গায় বসাতে ইচ্ছা করে। নিয়মটা উল্টো: **আগে সমস্যা, তারপর pattern।** যে কোড সহজ `if` দিয়ে পরিষ্কার থাকে, সেখানে pattern বসালে কোড শুধু লম্বা আর জটিল হয়।
:::
