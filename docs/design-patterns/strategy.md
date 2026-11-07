# Strategy

**এক লাইনে:** একই কাজের কয়েকটা উপায় আছে। প্রতিটা উপায় আলাদা করে রাখো, আর runtime এ যেটা দরকার সেটা বসিয়ে দাও।

ধরন: Behavioral

## সমস্যা

ডেলিভারি চার্জ হিসাব করার নিয়ম seller ভেদে আলাদা:

```python
def delivery_charge(order, seller) -> int:
    if seller.charge_rule == "flat":
        return 60 if order.city == "ঢাকা" else 120
    elif seller.charge_rule == "weight":
        base = 60 if order.city == "ঢাকা" else 120
        return base + max(0, order.weight_kg - 1) * 20
    elif seller.charge_rule == "free_over_2000":
        if order.total >= 2000:
            return 0
        return 60 if order.city == "ঢাকা" else 120
    elif ...
```

নতুন নিয়ম এলে এই function আরো লম্বা হয়। প্রতিটা নিয়ম আলাদা করে test করা কঠিন। একটা নিয়ম বদলাতে গিয়ে আরেকটা ভাঙার ঝুঁকি থাকে।

## ক্লাসিক সমাধান

```python
from typing import Protocol

class ChargeStrategy(Protocol):
    def charge(self, order: Order) -> int: ...

def _zone_base(order: Order) -> int:
    return 60 if order.city == "ঢাকা" else 120

class FlatCharge:
    def charge(self, order: Order) -> int:
        return _zone_base(order)

class WeightCharge:
    def __init__(self, per_kg: int = 20):
        self.per_kg = per_kg

    def charge(self, order: Order) -> int:
        extra = max(0, order.weight_kg - 1) * self.per_kg
        return _zone_base(order) + int(extra)

class FreeOver:
    def __init__(self, limit: int):
        self.limit = limit

    def charge(self, order: Order) -> int:
        return 0 if order.total >= self.limit else _zone_base(order)
```

যে কোড চার্জ লাগায়, সে কোন নিয়ম সেটা জানে না:

```python
def checkout(order: Order, strategy: ChargeStrategy) -> int:
    return order.total + strategy.charge(order)

checkout(order, FreeOver(limit=2000))
```

## Python এর সহজ রূপ: শুধু function

Python এ function নিজেই একটা object, তাই একটা method এর জন্য পুরো class বানানোর দরকার প্রায়ই নেই:

```python
from typing import Callable

ChargeRule = Callable[[Order], int]

def flat(order: Order) -> int:
    return 60 if order.city == "ঢাকা" else 120

def free_over_2000(order: Order) -> int:
    return 0 if order.total >= 2000 else flat(order)

RULES: dict[str, ChargeRule] = {
    "flat": flat,
    "free_over_2000": free_over_2000,
}

charge = RULES[seller.charge_rule](order)
```

strategy এর নিজস্ব সেটিং (যেমন `per_kg`) থাকলে class বা `functools.partial` ব্যবহার করো। না থাকলে function ই যথেষ্ট।

## আরো কিছু জায়গা যেখানে strategy মানায়

- কোন courier এ পাঠাবে: সবচেয়ে সস্তা, সবচেয়ে দ্রুত, নাকি এলাকায় সবচেয়ে কম return
- fake order এর ঝুঁকি মাপার নিয়ম
- AI এর উত্তর কোন model দিয়ে বানাবে: দ্রুত আর সস্তা, নাকি ধীর কিন্তু ভালো

## কখন ব্যবহার করবে

- একই কাজের কয়েকটা উপায়, আর কোনটা চলবে সেটা runtime এ ঠিক হয়
- নতুন উপায় প্রায়ই যোগ হয়
- প্রতিটা উপায় আলাদা করে test করতে চাও

## কখন না

- উপায় মাত্র দুইটা আর বদলানোর সম্ভাবনা কম। তখন একটা `if` ই সবচেয়ে পরিষ্কার।

## যা নিয়ে গোলমাল হয়

- **Strategy বনাম [Factory](/design-patterns/factory):** factory একটা object **বানায়**। strategy হলো একটা **আচরণ**, যেটা বদলানো যায়। প্রায়ই দুটো একসাথে আসে: factory ঠিক strategy টা বানিয়ে দেয়।
- **Strategy বনাম State:** দুটো দেখতে প্রায় একই। strategy **বাইরে থেকে** বেছে দেওয়া হয় ("এই order এ FreeOver নিয়ম চালাও")। State pattern এ object **নিজের অবস্থা অনুযায়ী** নিজেই আচরণ বদলায় (parcel "pending" থেকে "shipped" হলে তার cancel এর নিয়ম বদলে যায়)।
- **Dependency Injection কি strategy?** কাছাকাছি। FastAPI এর `Depends` দিয়ে test এ আসল নিয়মের বদলে নকল নিয়ম দেওয়া, এটা strategy বদলানোরই একটা রূপ।
