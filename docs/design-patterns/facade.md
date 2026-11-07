# Facade

**এক লাইনে:** অনেকগুলো জটিল অংশের সামনে একটা সহজ দরজা বসাও। বাইরের কোড শুধু দরজাটা চেনে, ভেতরের জটিলতা না।

ধরন: Structural

::: tip রেস্টুরেন্টের উদাহরণ
তুমি waiter কে বলো "একটা বিরিয়ানি"। ভেতরে কে চাল ধোয়, কে মাংস রান্না করে, কে প্লেট সাজায়, তোমার জানতে হয় না। waiter হলো facade।
:::

## সমস্যা

একটা order নিশ্চিত করতে অনেক কাজ:

```python
# chat handler এর ভেতরে
stock.reserve(order.items)
risk = fraud.score(order.phone, order.address)
if risk > 0.7:
    stock.release(order.items)
    raise HighRisk()
payment.create_bkash_invoice(order.id, order.advance)
tracking = courier.book(order.id, order.address, order.cod)
sms.send(order.phone, f"অর্ডার নিশ্চিত, tracking: {tracking}")
```

একই কাজ লাগে chat handler এ, website এর checkout এ, আর AI agent এর কাছেও। তিন জায়গায় একই ধাপ, একই ক্রম, একই ভুলের সম্ভাবনা। কোনো একটায় `stock.release` ভুলে গেলে স্টক আটকে থাকে।

## সমাধান

```python
class CheckoutFacade:
    def __init__(self, stock, fraud, payment, courier, sms):
        self.stock = stock
        self.fraud = fraud
        self.payment = payment
        self.courier = courier
        self.sms = sms

    def confirm(self, order: Order) -> str:
        self.stock.reserve(order.items)
        try:
            if self.fraud.score(order.phone, order.address) > 0.7:
                raise HighRisk()
            self.payment.create_bkash_invoice(order.id, order.advance)
            tracking = self.courier.book(order.id, order.address, order.cod)
        except Exception:
            self.stock.release(order.items)
            raise
        self.sms.send(order.phone, f"অর্ডার নিশ্চিত, tracking: {tracking}")
        return tracking
```

এখন তিন জায়গাতেই শুধু একটা লাইন:

```python
tracking = checkout.confirm(order)
```

```txt
chat handler ──┐
website ───────┼──→ CheckoutFacade.confirm() ──→ stock, fraud, payment, courier, sms
AI agent ──────┘
```

ভেতরের অংশগুলো (stock, payment...) এখনো আলাদাভাবে ব্যবহার করা যায়। facade শুধু সাধারণ কাজটা সহজ করে, ভেতরের দরজা বন্ধ করে না।

## কখন ব্যবহার করবে

- কয়েকটা অংশ মিলিয়ে একটা সাধারণ কাজ হয়, আর সেটা কয়েক জায়গা থেকে লাগে
- একটা জটিল library বা subsystem এর শুধু অল্প অংশ লাগে, তাই একটা সহজ মুখ বানাতে চাও
- modular monolith এ একটা module এর **public API** বানাতে: বাইরের module শুধু facade দেখে, ভেতরের class না

## কখন না

::: warning God object হয়ে যাওয়া
facade এ সব কিছু ঢোকাতে থাকলে সেটা হাজার লাইনের একটা class হয়ে যায়, যেটা সবকিছু জানে আর সবকিছু করে। facade এর কাজ শুধু **ক্রম ঠিক রাখা আর সমন্বয়**, আসল ব্যবসার নিয়ম ভেতরের অংশগুলোতেই থাকা উচিত।
:::

## যা নিয়ে গোলমাল হয়

- **Facade বনাম [Adapter](/design-patterns/adapter):** adapter একটা জিনিসকে **আরেকটা নির্দিষ্ট interface** এর সাথে মেলায়। facade **অনেকগুলো** জিনিসের সামনে একটা **নতুন, সহজ** interface বানায়।
- **Facade বনাম service layer:** layered architecture এর "service" প্রায়ই facade এর কাজ করে। নাম আলাদা, ধারণা কাছাকাছি।
- **Facade বনাম API Gateway:** API gateway হলো microservices এর সামনে বসা একটা আলাদা server। এটাকে architecture স্তরের facade বলা যায়, কিন্তু GoF এর facade একটা program এর ভেতরের class।
