# Monolith, Modular Monolith, Microservices

এই তিনটা হলো **system কীভাবে ভাগ হবে**, সেই সিদ্ধান্ত। architecture এর সবচেয়ে বড় আর সবচেয়ে দামি সিদ্ধান্তগুলোর একটা।

## Monolith

পুরো app একটা কোডবেস, একটা program, একসাথে deploy হয়।

```txt
┌──────────── একটা app ────────────┐
│ order  payment  courier  report │   সব কোড একসাথে মেশানো
└────────────────┬────────────────┘
                 ▼
             একটা DB
```

**সুবিধা:** বানানো, চালানো, debug করা সবচেয়ে সহজ। একটা function আরেকটাকে সরাসরি call করে।

**সমস্যা:** সীমানা না থাকলে সময়ের সাথে সব কোড সব কোডকে ধরে ফেলে। order এর কোড payment এর table এ লেখে, report সরাসরি courier এর ভেতরে ঢোকে। একটা জায়গা বদলালে দশ জায়গায় ভাঙে। এই অবস্থাকে বলে **big ball of mud**।

::: tip মনে রাখো
Monolith নিজে খারাপ না। খারাপ হলো **সীমানাহীন** monolith।
:::

## Modular Monolith

এখনো একটা program, একসাথে deploy হয়। কিন্তু ভেতরে কঠিন সীমানা দেওয়া module আছে।

```txt
┌──────────────── একটা app ─────────────────┐
│ ┌───────┐  ┌─────────┐  ┌─────────┐       │
│ │ order │→ │ payment │  │ courier │       │   module গুলো শুধু
│ └───────┘  └─────────┘  └─────────┘       │   public API বা event দিয়ে
│      └──── OrderCreated event ────┘        │   কথা বলে
└──────────────────┬────────────────────────┘
                   ▼
     একটা DB, প্রতিটা module এর আলাদা schema
```

নিয়মগুলো:
1. প্রতিটা module এর একটা **public API** থাকে। বাকি কোড ভেতরের, অন্য module ধরতে পারে না।
2. কোনো module অন্য module এর **table এ সরাসরি হাত দেয় না**।
3. দরকার হলে module গুলো **event** দিয়ে কথা বলে: `order` বলে "order হয়েছে", `courier` সেটা শুনে নিজের কাজ করে।
4. সীমানা যেন ভাষার নিয়ম দিয়ে আটকানো যায়। Rust এ প্রতিটা module আলাদা crate, Python এ আলাদা package আর `import-linter` এর মতো tool।

**সুবিধা:** monolith এর সহজ জীবন, কিন্তু কোড গোছানো থাকে। পরে কোনো module আলাদা service বানাতে চাইলে সীমানা আগে থেকেই তৈরি।

## Microservices

প্রতিটা অংশ আলাদা program, আলাদা deploy, সাধারণত আলাদা database। একে অপরের সাথে network দিয়ে কথা বলে।

```txt
┌───────┐  HTTP  ┌─────────┐  queue  ┌─────────┐
│ order │ ─────→ │ payment │ ──────→ │ courier │
└───┬───┘        └────┬────┘         └────┬────┘
    ▼                 ▼                   ▼
  DB-1              DB-2                DB-3
```

**সুবিধা:** প্রতিটা দল নিজের service নিজের মতো deploy করতে পারে। যে অংশে load বেশি, শুধু সেটাকে বাড়ানো যায়।

**খরচ:** function call এর বদলে network call, যেটা ধীর আর মাঝে মাঝে fail করে। একটা কাজ কয়েকটা service জুড়ে হলে transaction রাখা কঠিন। debug করতে log আর trace কয়েক জায়গা থেকে জোড়া লাগাতে হয়। আলাদা আলাদা deploy, monitoring, version এর ঝামেলা।

## তুলনা

| | Monolith | Modular Monolith | Microservices |
|---|---|---|---|
| Deploy | একটা | একটা | অনেকগুলো |
| Database | একটা, সবাই সব ধরে | একটা, module প্রতি আলাদা schema | service প্রতি আলাদা |
| অংশগুলোর কথা | সরাসরি function call | public API বা event | network (HTTP, queue) |
| Debug | সহজ | সহজ | কঠিন |
| দলের আকার | ছোট | ছোট থেকে মাঝারি | বড়, কয়েকটা দল |
| চালানোর খরচ | কম | কম | বেশি |

## কোনটা কখন

- **নতুন প্রজেক্ট, ছোট দল:** modular monolith। প্রায় সব ক্ষেত্রে এটাই সঠিক শুরু।
- **খুব ছোট, সহজ app:** সাধারণ monolith ও চলে।
- **Microservices তখনই:** যখন সত্যিকারের কারণ আছে। যেমন আলাদা দল আলাদা গতিতে deploy করতে চায়, বা কোনো একটা অংশের load বাকিগুলোর চেয়ে অনেক বেশি।

স্বাভাবিক পথ হলো: modular monolith দিয়ে শুরু, তারপর যে module এর আলাদা হওয়ার সত্যিকারের দরকার হয়, শুধু সেটাকে বের করে আনা।

## সবচেয়ে বড় ফাঁদ: distributed monolith

::: danger Distributed monolith
নাম microservices, কিন্তু সব service একই database ধরে, একটা বদলালে সবগুলো একসাথে deploy করতে হয়, একটা বন্ধ হলে সব বন্ধ। এতে monolith এর সব সমস্যা থাকে, সাথে network এর সব সমস্যাও যোগ হয়। সীমানা ঠিক না করে service ভাঙলে এটাই হয়।
:::

এই কারণে আগে সীমানা ঠিক করা জরুরি (modular monolith), তারপর ভাঙা।
