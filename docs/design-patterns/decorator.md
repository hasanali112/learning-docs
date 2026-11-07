# Decorator

**এক লাইনে:** একটা object কে আরেকটা object দিয়ে মুড়ে দাও, যার interface একই, কিন্তু মূল কাজের আগে বা পরে বাড়তি কিছু করে। মূল কোড বদলাতে হয় না।

ধরন: Structural

## সমস্যা

courier এ parcel book করার আগে-পরে কিছু বাড়তি কাজ লাগে:
- কতক্ষণ লাগলো সেটা log করা
- network fail করলে আবার চেষ্টা (retry) করা
- একই order দুইবার book না হয়, সেটা আটকানো

এগুলো প্রতিটা courier class এর ভেতরে লিখলে একই কোড তিন-চার জায়গায় কপি হয়। আর কোনোটায় শুধু log লাগবে, কোনোটায় শুধু retry, এমন প্রতিটা মিশ্রণের জন্য আলাদা class বানাতে হবে।

## ক্লাসিক সমাধান: object মুড়ে দেওয়া

```python
class LoggingCourier:
    def __init__(self, inner: Courier):
        self.inner = inner

    def book(self, order_id: int, address: str) -> str:
        start = time.perf_counter()
        result = self.inner.book(order_id, address)   # আসল কাজ ভেতরের জনকে দাও
        log.info("book %s took %.2fs", order_id, time.perf_counter() - start)
        return result

class RetryCourier:
    def __init__(self, inner: Courier, attempts: int = 3):
        self.inner = inner
        self.attempts = attempts

    def book(self, order_id: int, address: str) -> str:
        for i in range(self.attempts):
            try:
                return self.inner.book(order_id, address)
            except httpx.TransportError:
                if i == self.attempts - 1:
                    raise
                time.sleep(2 ** i)
```

প্রতিটা মোড়কের interface `Courier` এর মতোই, তাই যত খুশি স্তর জোড়া যায়:

```python
courier = LoggingCourier(RetryCourier(PathaoAdapter(client)))
courier.book(42, "মিরপুর ১০")
```

```txt
LoggingCourier  → সময় মাপা শুরু
  RetryCourier  → fail করলে আবার চেষ্টা
    PathaoAdapter → আসল API call
```

যে কোড `courier.book(...)` call করছে, সে জানেই না ভেতরে কয় স্তর আছে।

## Python এর `@decorator`: function এর জন্য একই ধারণা

```python
import functools

def retry(attempts: int = 3):
    def wrap(func):
        @functools.wraps(func)
        def inner(*args, **kwargs):
            for i in range(attempts):
                try:
                    return func(*args, **kwargs)
                except httpx.TransportError:
                    if i == attempts - 1:
                        raise
                    time.sleep(2 ** i)
        return inner
    return wrap

@retry(attempts=3)
def send_sms(phone: str, text: str) -> None:
    ...
```

`@retry(...)` লেখা আর `send_sms = retry(attempts=3)(send_sms)` লেখা একই জিনিস।

## কখন ব্যবহার করবে

- logging, retry, cache, সময় মাপা, permission check এর মতো **আড়াআড়ি কাজ** (cross-cutting concern), যেগুলো অনেক জায়গায় লাগে
- বাড়তি আচরণ বিভিন্ন মিশ্রণে চালু বা বন্ধ করতে চাও
- মূল class তোমার না, বা সেটা বদলাতে চাও না

## কখন না

- বাড়তি কাজটা শুধু একটা জায়গায় লাগে। তখন সরাসরি ওই function এ লিখে দাও।
- অনেক স্তর জমে গেলে error এর stack trace পড়া কঠিন হয়। ৩-৪ স্তরের বেশি হলে একবার ভাবো।

## যা নিয়ে গোলমাল হয়

::: warning Python এর `@` আর Decorator pattern কি একই?
**উদ্দেশ্য একই:** মূল জিনিস না বদলে আগে-পরে বাড়তি আচরণ যোগ করা।
**কিন্তু পুরোপুরি এক না:**
- Decorator pattern হলো একটা **নকশা**: একই interface এর object দিয়ে আরেকটা object মোড়ানো, runtime এ।
- Python এর `@` হলো **ভাষার একটা syntax**: function বা class define হওয়ার সাথে সাথে তাকে আরেকটা function এ পাঠানো।

আর `@` সবসময় মোড়ানোর কাজ করে না। FastAPI এর `@app.get("/orders")` function টা মোড়ায় না, শুধু route এর তালিকায় নাম লেখায় (registration), তারপর function টা যেমন ছিল তেমনই ফেরত দেয়। আবার `@property` বা `@dataclass` এর কাজও আলাদা।
:::

- **Decorator বনাম [Adapter](/design-patterns/adapter):** adapter interface **বদলায়**, decorator interface **একই রাখে**।
- **Decorator বনাম inheritance:** inheritance দিয়ে `LoggingRetryPathao` এর মতো class বানালে প্রতিটা মিশ্রণের জন্য আলাদা class লাগে। decorator দিয়ে runtime এ ইচ্ছামতো জোড়া যায়।
