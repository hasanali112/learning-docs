# Observer

**এক লাইনে:** একটা object (subject) এর কিছু ঘটলে, যারা আগে থেকে নাম লিখিয়ে রেখেছে (observer), তাদের সবাইকে সে নিজে জানিয়ে দেয়।

ধরন: Behavioral

::: tip YouTube এর উদাহরণ
তুমি একটা চ্যানেলে subscribe করে bell চাপলে, নতুন ভিডিও এলে চ্যানেল নিজেই তোমাকে জানায়। তোমাকে বারবার গিয়ে দেখতে হয় না। চ্যানেল হলো subject, তুমি observer।
:::

## সমস্যা

order এর অবস্থা বদলালে (যেমন "delivered") কয়েকজনের জানা দরকার: স্টক, হিসাব, কাস্টমারকে SMS, seller এর dashboard। সরাসরি call করলে order এর কোড সবাইকে চিনে ফেলে:

```python
def mark_delivered(order):
    order.status = "delivered"
    accounts.record_income(order)
    sms.send(order.phone, "পৌঁছে গেছে")
    dashboard.refresh(order.seller_id)
```

নতুন কেউ জানতে চাইলে আবার এই function বদলাতে হয়।

## সমাধান

subject শুধু একটা তালিকা রাখে, আর ঘটনা ঘটলে তালিকার সবাইকে call করে:

```python
from collections import defaultdict
from typing import Callable

class EventBus:
    def __init__(self):
        self._subs: dict[str, list[Callable]] = defaultdict(list)

    def subscribe(self, event: str, handler: Callable) -> None:
        self._subs[event].append(handler)

    def emit(self, event: str, **data) -> None:
        for handler in self._subs[event]:
            handler(**data)

bus = EventBus()
```

যার দরকার সে নিজে নাম লেখায়:

```python
bus.subscribe("order_delivered", lambda order: accounts.record_income(order))
bus.subscribe("order_delivered", lambda order: sms.send(order.phone, "পৌঁছে গেছে"))
```

order এর কোড এখন কাউকে চেনে না:

```python
def mark_delivered(order):
    order.status = "delivered"
    bus.emit("order_delivered", order=order)
```

## বাস্তবে কোথায় দেখবে

- **Django signals:** `post_save` এর মতো signal আসলে observer।
- **GUI:** button এ click হলে সব listener কে জানানো।
- **SQLAlchemy events:** কোনো row insert বা update হওয়ার আগে-পরে hook।

## কখন ব্যবহার করবে

- একটা ঘটনার পর কয়েকটা স্বাধীন কাজ, আর তালিকাটা বাড়তে পারে
- subject কে observer দের থেকে আলাদা রাখতে চাও

## যা সাবধানে দেখতে হবে

::: warning Observer এর ফাঁদ
- **সব একই thread এ, পরপর চলে।** একটা observer ধীর হলে (যেমন SMS পাঠাতে ৩ সেকেন্ড) বাকিরা আর মূল কাজ, সবাই অপেক্ষা করে।
- **একজনের error সবাইকে থামায়।** উপরের `emit` এ একটা handler exception দিলে পরেরগুলো আর চলে না। দরকার হলে প্রতিটা handler কে `try/except` এ রাখো।
- **কোন ক্রমে চলবে তার ওপর নির্ভর করো না।** observer দের একে অপরের উপর নির্ভর করা উচিত না।
- **program crash করলে ঘটনা হারায়।** সব কিছু memory তে, কোথাও জমা থাকে না।
- **কোড কোথায় চলছে বোঝা কঠিন।** `emit` দেখে বোঝা যায় না কে কে শুনছে।
:::

ধীর কাজ, আলাদা service, বা "হারানো চলবে না" এমন ঘটনার জন্য observer যথেষ্ট না। তখন লাগে message queue বা pub/sub।

## যা নিয়ে গোলমাল হয়

Observer আর Pub/Sub দেখতে একই রকম, কিন্তু এক না। পার্থক্যটা আলাদা পেজে: [Observer vs Pub/Sub](/design-patterns/observer-vs-pubsub)।
