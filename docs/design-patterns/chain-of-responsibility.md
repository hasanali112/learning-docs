# Chain of Responsibility

**এক লাইনে:** একটা request কয়েকটা handler এর একটা সারির মধ্য দিয়ে যায়। প্রতিটা handler ঠিক করে: নিজে সামলাবে, পরের জনকে দেবে, নাকি এখানেই থামাবে।

ধরন: Behavioral

::: tip অফিসের উদাহরণ
ছুটির আবেদন আগে যায় team lead এর কাছে। এক দিনের ছুটি হলে সে নিজেই দেয়। বেশি হলে manager এর কাছে পাঠায়, আরো বেশি হলে HR এর কাছে। আবেদনকারী জানে না শেষ পর্যন্ত কে সিদ্ধান্ত দেবে।
:::

## সমস্যা

কাস্টমারের Messenger মেসেজ এলে কয়েক রকম উত্তর হতে পারে:

```python
def handle_message(msg):
    if is_spam(msg):
        return None
    if msg.text in FAQ:
        return FAQ[msg.text]
    if looks_like_order(msg):
        return create_order_from_chat(msg)
    if ai_can_answer(msg):
        return ai_reply(msg)
    return forward_to_seller(msg)
```

শুরুতে এটা ঠিক আছে। কিন্তু ধাপ বাড়তে থাকে, ক্রম বদলাতে হয় (AI কি FAQ এর আগে না পরে?), কোনো seller কোনো ধাপ বন্ধ রাখতে চায়। তখন এই function টা হাত দিতে ভয় লাগে।

## সমাধান

প্রতিটা ধাপ আলাদা handler। নিয়ম সহজ: **উত্তর দিতে পারলে উত্তর ফেরত দাও, না পারলে `None`, তাহলে পরের জন চেষ্টা করবে।**

```python
from typing import Callable, Optional

Handler = Callable[[Message], Optional[Reply]]

def spam_filter(msg: Message) -> Optional[Reply]:
    if is_spam(msg):
        return Reply.ignore()       # এখানেই থামে
    return None                     # পরের জনকে দাও

def faq(msg: Message) -> Optional[Reply]:
    answer = FAQ.get(msg.text.strip())
    return Reply.text(answer) if answer else None

def order_intent(msg: Message) -> Optional[Reply]:
    return create_order_from_chat(msg) if looks_like_order(msg) else None

def ai_answer(msg: Message) -> Optional[Reply]:
    return ai_reply(msg)            # না পারলে None

def human(msg: Message) -> Optional[Reply]:
    return forward_to_seller(msg)   # শেষ ভরসা, সবসময় কিছু ফেরত দেয়

def run_chain(msg: Message, chain: list[Handler]) -> Reply:
    for handler in chain:
        reply = handler(msg)
        if reply is not None:
            return reply
    raise RuntimeError("কেউ সামলায়নি")
```

এখন ক্রম বদলানো বা ধাপ বন্ধ করা শুধু তালিকা বদলানো:

```python
default_chain = [spam_filter, faq, order_intent, ai_answer, human]
no_ai_chain   = [spam_filter, faq, order_intent, human]   # যে seller AI চায় না
```

```txt
মেসেজ → spam_filter → faq → order_intent → ai_answer → human
           │ থামতে পারে  │       │              │          │
           ▼            ▼       ▼              ▼          ▼
                  যে প্রথম উত্তর দেয়, সেখানেই শেষ
```

## বাস্তবে কোথায় দেখবে

- **Web framework এর middleware:** FastAPI, Django, Express, সবখানে। প্রতিটা middleware request দেখে, চাইলে নিজেই উত্তর দিয়ে থামায় (যেমন login না থাকলে `401`), নাহলে পরের জনকে দেয়। বিস্তারিত: [FastAPI এর ভেতরের pattern](/design-patterns/fastapi-patterns)।
- **Exception handling:** error উপরের দিকে ওঠে, যে `except` প্রথম মেলে সে ধরে।
- **Logging handler:** Python এর `logging` এ log message logger থেকে parent logger এ যায়।

## কখন ব্যবহার করবে

- একটা request কয়েকভাবে সামলানো যায়, আর কে সামলাবে সেটা আগে জানা নেই
- ধাপগুলোর ক্রম বদলাতে বা কিছু ধাপ চালু-বন্ধ করতে চাও
- পাঠানো জনকে জানতে দিতে চাও না যে কে শেষে কাজটা করলো

## কখন না

- ধাপ মাত্র দুই-তিনটা আর কখনো বদলায় না। তখন সাধারণ `if` বেশি পরিষ্কার।
- **সবগুলো ধাপ সবসময় চলবে**, কেউ থামাবে না। সেটা chain of responsibility না, সেটা সাধারণ pipeline। একটা loop বা function এর সারিই যথেষ্ট।

## যা নিয়ে গোলমাল হয়

- **Chain বনাম [Decorator](/design-patterns/decorator):** দুটোতেই একজন আরেকজনকে মোড়ায় বা পরের জনকে ডাকে। পার্থক্য হলো decorator প্রায় সবসময় ভেতরের জনকে call করে আর শুধু আগে-পরে কিছু যোগ করে। chain এর handler চাইলে **থামিয়ে দিতে পারে**, পরের জন কখনো দেখেই না। middleware দুটো কাজই করতে পারে, তাই এটাকে দুটোরই উদাহরণ হিসেবে দেখানো হয়।
- **Chain বনাম pipeline:** chain এ সাধারণত একজনই সামলায়। pipeline এ সবাই পরপর নিজের অংশটা করে।
