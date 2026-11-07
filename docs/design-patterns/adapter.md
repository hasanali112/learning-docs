# Adapter

**এক লাইনে:** একটা জিনিসের interface আমার কোডের প্রত্যাশার সাথে মিলছে না। মাঝখানে একটা ছোট অনুবাদক বসাও, যাতে দুজন কথা বলতে পারে।

ধরন: Structural

::: tip প্লাগের উদাহরণ
বিদেশি তিন-পিনের charger দেশি দুই-পিনের সকেটে লাগে না। মাঝখানে একটা adapter লাগালে কাজ হয়। charger বা সকেট কোনোটাই বদলাতে হয় না।
:::

## সমস্যা

আমাদের কোড সব courier এর কাছে একই জিনিস আশা করে:

```python
class Courier(Protocol):
    def book(self, order_id: int, address: str, cod: int) -> str: ...   # tracking id ফেরত
```

কিন্তু প্রতিটা courier এর API আলাদা:
- একটা চায় `recipient_address`, আরেকটা চায় `address_line`
- একটা টাকা নেয় টাকায়, আরেকটা পয়সায়
- একটা tracking id দেয় `data.consignment.tracking_code` এ, আরেকটা দেয় সোজা `id` তে

এই পার্থক্যগুলো যদি order এর কোডে ঢুকে পড়ে, তাহলে order এর কোড প্রতিটা courier এর খুঁটিনাটি জেনে ফেলে।

## সমাধান

প্রতিটা courier এর জন্য একটা adapter, যেটা আমাদের interface মেনে চলে আর ভেতরে অনুবাদ করে:

```python
class SteadfastAdapter:
    def __init__(self, client: SteadfastClient):
        self.client = client   # courier এর নিজের SDK বা HTTP client

    def book(self, order_id: int, address: str, cod: int) -> str:
        resp = self.client.create_order(
            invoice=str(order_id),
            recipient_address=address,   # নামের পার্থক্য এখানেই মেটে
            cod_amount=cod,
        )
        return resp["consignment"]["tracking_code"]   # উত্তরের আকারও এখানে

class PathaoAdapter:
    def __init__(self, client: PathaoClient):
        self.client = client

    def book(self, order_id: int, address: str, cod: int) -> str:
        resp = self.client.post("/orders", json={
            "merchant_order_id": order_id,
            "address_line": address,
            "amount_to_collect": cod,
        })
        return resp["data"]["consignment_id"]
```

order এর কোড এখন সব courier কে একভাবে দেখে:

```python
tracking = courier.book(order.id, order.address, order.cod)
```

### আরেকটা সাধারণ ব্যবহার: status অনুবাদ

প্রতিটা courier ডেলিভারির অবস্থা আলাদা নামে পাঠায় (`"Delivered"`, `"delivered_approval_pending"`, `"DLV"`...)। adapter এগুলো আমাদের নিজের একটা `enum` এ রূপান্তর করে, যাতে বাকি কোডে শুধু `ParcelStatus.DELIVERED` এর মতো একটাই নাম থাকে।

## কখন ব্যবহার করবে

- বাইরের library বা API এর আকার তোমার কোডের সাথে মেলে না, আর সেটা বদলানো তোমার হাতে নেই
- একই কাজের কয়েকটা বাইরের সেবা আছে (courier, payment, SMS), আর তুমি সবাইকে এক রকম দেখতে চাও
- পুরনো কোড নতুন interface এর সাথে জুড়তে হবে

## কখন না

- দুইপক্ষের কোডই তোমার, আর একটাকে সরাসরি ঠিক করা যায়। তখন adapter না বসিয়ে interface টাই মিলিয়ে নাও।

## যা নিয়ে গোলমাল হয়

| Pattern | interface কি বদলায়? | উদ্দেশ্য |
|---|---|---|
| **Adapter** | হ্যাঁ, একটাকে আরেকটার মতো করে | না-মেলা দুটো জিনিস জোড়া লাগানো |
| [Decorator](/design-patterns/decorator) | না, একই থাকে | একই interface রেখে বাড়তি আচরণ যোগ |
| [Facade](/design-patterns/facade) | হ্যাঁ, নতুন সহজ interface বানায় | অনেকগুলো জটিল অংশকে একটা সহজ দরজার পেছনে লুকানো |

Hexagonal architecture এর "adapter" একই ধারণা, শুধু বড় পরিসরে: database, HTTP, বাইরের API, সবকিছু adapter এর পেছনে। বিস্তারিত: [Layered আর Hexagonal](/architecture/layered-hexagonal)।
