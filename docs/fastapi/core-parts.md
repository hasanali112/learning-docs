# uvicorn, Starlette, Pydantic: কে কী করে

FastAPI নিজে শূন্য থেকে সব লেখেনি। ভেতরে কয়েকটা library একসাথে কাজ করে। কোনটা কী করে, সেটা বুঝলে error এর মানে বোঝাও সহজ হয়।

## মূল ধারণা: app আর server আলাদা

তুমি FastAPI দিয়ে যা লেখো সেটা **app**: কিছু function, যেগুলো বলে কোন request এ কী উত্তর দিতে হবে।

```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

কিন্তু এই কোড নিজে থেকে internet এর request শুনতে পারে না। কাউকে একটা **port** (যেমন 8000) খুলে বসে থাকতে হয়, request এলে app এর কাছে পৌঁছে দিতে হয়, তারপর উত্তর ফেরত পাঠাতে হয়। এই কাজ করে **server**।

::: tip রেস্টুরেন্টের উদাহরণ
**FastAPI app** হলো শেফ, জানে কোন অর্ডারে কী রান্না হবে। **uvicorn** হলো ওয়েটার, অর্ডার নিয়ে শেফকে দেয় আর খাবার ফেরত আনে। শেফ যত ভালোই হোক, ওয়েটার না থাকলে কাস্টমার খাবার পায় না।
:::

## পুরো ছবি

```txt
Rust backend / browser
        │  request
        ▼
   uvicorn ─────────────── server: port খুলে request নেয়
        │
        ▼
   ┌─ FastAPI app ────────────────────────────┐
   │  Starlette → কোন URL এ কোন function চলবে   │
   │  Pydantic  → আসা data ঠিক আছে কিনা         │
   │  তোমার কোড  → আসল কাজ                      │
   └───────────────────────────────────────────┘
        │  response
        ▼
   uvicorn উত্তর ফেরত পাঠায়
```

## uvicorn: দরজা

- একটা **program**, যেটা port এ বসে থাকে। uvicorn নিজে port না, port হলো কম্পিউটারের দরজার নম্বর।
- `localhost:8000` মানে "এই কম্পিউটারের ৮০০০ নম্বর দরজা, যেখানে uvicorn অপেক্ষা করছে"।
- এটা **ASGI server**। ASGI হলো একটা নিয়ম, যেটা ঠিক করে server আর Python app কীভাবে কথা বলবে।
- `uvicorn[standard]` এ আসে `uvloop` (দ্রুত async engine), `httptools` (দ্রুত HTTP পড়া), `websockets` আর `watchfiles` (কোড বদলালে নিজে restart হয়)।

`fastapi dev` আর `fastapi run` ভেতরে uvicorn ই চালায়:

| Command | কখন | কী করে |
|---|---|---|
| `fastapi dev main.py` | কোড লেখার সময় | কোড save করলেই নিজে restart হয়, শুধু নিজের কম্পিউটার থেকে খোলা যায় |
| `fastapi run main.py` | আসল server এ | auto-restart বন্ধ, বাইরে থেকেও খোলা যায় |

## Starlette: রাস্তা দেখায়

FastAPI এর web অংশ পুরোটাই Starlette এর উপর বানানো। Starlette:
- URL আর method দেখে ঠিক function বেছে নেয় (routing)
- function যা return করে, সেটাকে response বানায়
- কোনো route না মিললে নিজেই `404 Not Found` দেয়

## Pydantic: চেকপোস্ট

আসা data ঠিক আছে কিনা পরীক্ষা করে:

```python
class Order(BaseModel):
    product: str
    qty: int
    phone: str
```

`qty` তে সংখ্যার বদলে `"দুইটা"` এলে Pydantic request আটকে দেয়, তোমার function চলেই না। FastAPI নিজে থেকে `422` error দেয়, কোন field এ কী ভুল সেটা সহ। এর জন্য validation কোড লিখতে হয় না।

Pydantic এর মূল অংশ (`pydantic-core`) Rust এ লেখা, তাই যাচাই খুব দ্রুত হয়।

## httpx: উল্টো দিকের কাজ

uvicorn **আসা** request নেয়। কিন্তু তোমার কোড নিজে যখন **বাইরে** request পাঠাবে (যেমন Facebook বা courier এর API তে), তখন লাগে `httpx`। FastAPI এর `TestClient` ও ভেতরে httpx ব্যবহার করে।

## এক লাইনে মনে রাখো

| নাম | কাজ |
|---|---|
| **uvicorn** | দরজা: request ঢোকে আর বের হয় |
| **Starlette** | রাস্তা দেখানো: কোন URL কোথায় যাবে |
| **Pydantic** | চেকপোস্ট: data ঠিক আছে কিনা |
| **FastAPI** | সবগুলোকে জুড়ে দেওয়া framework, সাথে `/docs` পেজ |
| **httpx** | নিজে অন্য কোথাও request পাঠানোর tool |

::: details আমি প্রথমে যা ভুল বুঝেছিলাম
- ভেবেছিলাম Starlette request **পাঠায়**। আসলে Starlette app এর ভেতরে আসা request **সামলায়**। পাঠানোর কাজ httpx এর।
- ভেবেছিলাম uvicorn নিজেই port। আসলে uvicorn একটা program, যেটা port এ বসে থাকে।
:::
