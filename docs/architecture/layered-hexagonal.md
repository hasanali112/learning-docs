# Layered আর Hexagonal Architecture

আগের পেজে ছিল system কয় ভাগে ভাঙবে। এই পেজে **একটা app বা module এর ভেতরে** কোড কীভাবে স্তরে সাজাবে।

## Layered Architecture

সবচেয়ে পরিচিত গঠন। কোড উপর থেকে নিচে কয়েকটা স্তরে ভাগ করা, আর প্রতিটা স্তর শুধু ঠিক নিচের স্তরকে call করে।

```txt
Router / Controller   HTTP request নেয়, response দেয়
        ▼
Service               ব্যবসার নিয়ম (business logic)
        ▼
Repository            database থেকে পড়া আর লেখা
        ▼
Database
```

FastAPI তে এমন দেখায়:

```python
# router.py: শুধু HTTP এর কাজ
@router.post("/orders")
def create_order(data: OrderIn, service: OrderService = Depends(get_order_service)):
    return service.place_order(data)

# service.py: ব্যবসার নিয়ম
class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo

    def place_order(self, data: OrderIn) -> Order:
        if data.qty > 10:
            raise ValueError("একবারে ১০টার বেশি না")
        return self.repo.save(Order(**data.model_dump()))

# repository.py: শুধু database
class OrderRepository:
    def save(self, order: Order) -> Order:
        ...  # SQL বা ORM
```

**সুবিধা:** বুঝতে সহজ, বেশিরভাগ CRUD app এর জন্য যথেষ্ট।

**দুর্বলতা:** dependency উপর থেকে নিচে যায়, তাই ব্যবসার নিয়ম (service) database এর উপর নির্ভর করে। database বা বাইরের API বদলালে ব্যবসার কোডেও হাত দিতে হয়। test করতে আসল database লাগে।

## Hexagonal Architecture (Ports and Adapters)

মূল ধারণা: **ব্যবসার নিয়ম মাঝখানে থাকবে, আর বাইরের কোনো কিছুর উপর নির্ভর করবে না।** database, HTTP, courier এর API, এগুলো সব বাইরে।

```txt
            HTTP (FastAPI)        CLI / cron job
                  │                     │
            [ adapter ]           [ adapter ]
                  ▼                     ▼
          ┌──────── port ─────────────────┐
          │                               │
          │   Core: ব্যবসার নিয়ম            │
          │   (framework বা DB কিছু জানে না) │
          │                               │
          └──────── port ─────────────────┘
                  ▲                     ▲
            [ adapter ]           [ adapter ]
                  │                     │
            PostgreSQL          Pathao / Steadfast API
```

দুটো শব্দ:
- **Port:** core এর বানানো একটা interface, যেটা বলে "আমার এমন একটা জিনিস লাগবে"। যেমন "parcel book করতে পারে এমন কেউ"।
- **Adapter:** সেই interface এর আসল implementation, বাইরের কোনো নির্দিষ্ট জিনিসের জন্য। যেমন Pathao এর API call করার কোড।

### Python এ

```python
from typing import Protocol

# port: core নিজে ঠিক করে তার কী লাগবে
class CourierPort(Protocol):
    def book(self, order_id: int, address: str) -> str: ...

# core: শুধু port চেনে, কোন courier সেটা জানে না
class DeliveryService:
    def __init__(self, courier: CourierPort):
        self.courier = courier

    def ship(self, order_id: int, address: str) -> str:
        if len(address) < 10:
            raise ValueError("ঠিকানা অসম্পূর্ণ")
        return self.courier.book(order_id, address)

# adapter: বাইরের নির্দিষ্ট API
class PathaoAdapter:
    def book(self, order_id: int, address: str) -> str:
        # httpx দিয়ে Pathao এর API call
        return "PTH-123"

# test এর জন্য নকল adapter, network লাগে না
class FakeCourier:
    def book(self, order_id: int, address: str) -> str:
        return "FAKE-1"
```

`DeliveryService` কোথাও Pathao এর নাম জানে না। নতুন courier এলে শুধু নতুন adapter লিখতে হয়, core এ হাত দিতে হয় না। test এ `FakeCourier` দিলেই হয়।

::: tip মূল নিয়ম: dependency ভেতরের দিকে
Layered এ ব্যবসার কোড নির্ভর করে database এর উপর। Hexagonal এ উল্টো: database এর adapter নির্ভর করে core এর বানানো port এর উপর। এই উল্টে দেওয়াকে বলে **dependency inversion**।
:::

## একই ধারণার অনেক নাম

| নাম | মূল কথা |
|---|---|
| Hexagonal / Ports and Adapters | core মাঝখানে, বাইরের সব কিছু adapter দিয়ে |
| Onion Architecture | একই ধারণা, স্তরগুলো পেঁয়াজের খোসার মতো আঁকা |
| Clean Architecture | একই ধারণা, আরো কয়েকটা নির্দিষ্ট স্তরের নাম সহ |

নাম আর আঁকার ধরন আলাদা, কিন্তু তিনটাতেই এক নিয়ম: **ব্যবসার নিয়ম বাইরের কিছুর উপর নির্ভর করবে না।**

## কোনটা কখন

| অবস্থা | পছন্দ |
|---|---|
| সাধারণ CRUD, বাইরের API কম | Layered যথেষ্ট |
| অনেক বাইরের API (courier, payment, Facebook), যেগুলো বদলাতে পারে | Hexagonal |
| ব্যবসার নিয়ম জটিল আর test জরুরি | Hexagonal |
| খুব ছোট script বা prototype | কোনোটাই না, সোজা লেখো |

::: warning অতিরিক্ত করো না
প্রতিটা ছোট জিনিসের জন্য port আর adapter বানালে কোড অনেক file এ ছড়িয়ে যায়, কিন্তু লাভ হয় না। যেখানে বাইরের জিনিস **সত্যিই বদলাতে পারে** বা test এ নকল দরকার, শুধু সেখানে port রাখো।
:::

এখানে যে `Depends(...)` দেখলে, সেটা Dependency Injection। FastAPI এ এর ব্যবহার: [FastAPI এর ভেতরের pattern](/design-patterns/fastapi-patterns)।
