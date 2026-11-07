# Factory

**এক লাইনে:** object বানানোর কাজটা একটা জায়গায় রাখো। যে ব্যবহার করবে, সে শুধু বলবে "আমাকে একটা courier দাও", কোন class থেকে বানানো হলো সেটা তার জানতে হবে না।

ধরন: Creational

## সমস্যা

seller যে courier বেছে নিয়েছে, সেই অনুযায়ী object বানাতে হবে। এই `if` কোড অনেক জায়গায় ছড়িয়ে যায়:

```python
# order.py
if seller.courier == "pathao":
    courier = PathaoCourier(api_key=...)
elif seller.courier == "steadfast":
    courier = SteadfastCourier(api_key=..., secret=...)
elif seller.courier == "redx":
    courier = RedXCourier(token=...)

# return.py এ আবার একই if...
# report.py এ আবার একই if...
```

নতুন courier এলে প্রতিটা জায়গায় খুঁজে খুঁজে `elif` যোগ করতে হয়। একটা জায়গা ভুলে গেলেই bug।

## সমাধান

বানানোর সব কোড একটা function এ:

```python
from typing import Protocol

class Courier(Protocol):
    def book(self, order_id: int, address: str) -> str: ...

class PathaoCourier:
    def __init__(self, api_key: str): ...
    def book(self, order_id: int, address: str) -> str: ...

class SteadfastCourier:
    def __init__(self, api_key: str, secret: str): ...
    def book(self, order_id: int, address: str) -> str: ...

def make_courier(name: str, creds: dict) -> Courier:
    if name == "pathao":
        return PathaoCourier(creds["api_key"])
    if name == "steadfast":
        return SteadfastCourier(creds["api_key"], creds["secret"])
    raise ValueError(f"অজানা courier: {name}")
```

এখন সবাই শুধু এটা লেখে:

```python
courier = make_courier(seller.courier, seller.creds)
tracking_id = courier.book(order.id, order.address)
```

## Python এর সহজ রূপ: dictionary

অনেক `if` এর বদলে একটা registry:

```python
COURIERS = {
    "pathao": PathaoCourier,
    "steadfast": SteadfastCourier,
    "redx": RedXCourier,
}

def make_courier(name: str, **creds) -> Courier:
    try:
        return COURIERS[name](**creds)
    except KeyError:
        raise ValueError(f"অজানা courier: {name}") from None
```

নতুন courier এলে শুধু dictionary তে একটা লাইন যোগ।

## কখন ব্যবহার করবে

- কোন class এর object লাগবে সেটা runtime এ ঠিক হয় (config, user এর পছন্দ, database এর মান)
- বানানোর কোড জটিল (credentials, retry, timeout সেট করা), আর কয়েক জায়গায় লাগে
- ব্যবহারকারীকে নির্দিষ্ট class থেকে আলাদা রাখতে চাও

## কখন না

- class একটাই, আর বদলানোর সম্ভাবনা নেই। তখন সরাসরি `PathaoCourier(...)` লেখাই পরিষ্কার।

## যা নিয়ে গোলমাল হয়

GoF বইয়ে "factory" নামে দুটো আলাদা pattern আছে, আর উপরের সহজ রূপটা আসলে তৃতীয় একটা:

| নাম | কী |
|---|---|
| **Simple Factory** | উপরের মতো একটা function, যেটা ঠিক object বানিয়ে দেয়। GoF এর তালিকায় নেই, কিন্তু সবচেয়ে বেশি ব্যবহৃত। |
| **Factory Method** | parent class একটা method রাখে যেটা object বানায়, আর child class গুলো ঠিক করে কোনটা বানাবে। |
| **Abstract Factory** | একসাথে মিলে কাজ করা **একটা পুরো পরিবার** এর object বানায়। যেমন একটা courier এর জন্য booking client, tracking client আর webhook parser, তিনটাই একই courier এর। |

দৈনন্দিন Python কোডে সাধারণত simple factory ই যথেষ্ট।

Factory আর [Builder](/design-patterns/builder) এর পার্থক্য: factory ঠিক করে **কোন** object বানাবে, builder ঠিক করে একটা জটিল object **কীভাবে ধাপে ধাপে** জোড়া লাগাবে।
