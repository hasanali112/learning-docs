# FastAPI Setup আর venv

FastAPI প্রজেক্ট শুরু করার ধাপগুলো, আর প্রতিটা ধাপ **কেন** করি।

## ১. প্রজেক্টের জন্য আলাদা ফোল্ডার

```bash
mkdir agents && cd agents
```

একটা repo তে অনেক service থাকতে পারে, যেমন `frontend/` (Next.js), `backend/` (Rust), `agents/` (Python)। প্রতিটা service নিজের ফোল্ডারে থাকলে তাদের dependency মিশে যায় না।

## ২. venv তৈরি

```bash
python3 -m venv .venv
```

**venv কেন:**
- এই প্রজেক্টের package গুলো system Python থেকে আলাদা থাকে
- অন্য প্রজেক্টের সাথে version conflict হয় না
- Python এর সাথেই আসে, আলাদা কিছু install করতে হয় না

নাম `.venv` (শুরুতে dot) দিলে VS Code নিজে থেকে চিনে নেয়, আর ফোল্ডারটা লুকানো থাকে।

## ৩. activate করা

```bash
source .venv/bin/activate
which python      # .../agents/.venv/bin/python দেখানো উচিত
```

::: warning মনে রাখো
activate না করলে `pip install` system Python এ চলে যায়। প্রতিবার নতুন terminal খুললে আবার activate করতে হয়।
:::

## ৪. pip upgrade

```bash
pip install --upgrade pip
```

venv এর ভেতরের pip পুরনো থাকতে পারে, আর পুরনো pip দিয়ে নতুন package ঠিকমতো install নাও হতে পারে।

## ৫. FastAPI install

```bash
pip install "fastapi[standard-no-fastapi-cloud-cli]" pydantic-settings
```

শুধু `fastapi` install করলে server আসে না, আসে শুধু framework। `[standard]` দিলে দরকারি সব package একসাথে চলে আসে। কোটেশন (`"..."`) দিতে হয়, নইলে কিছু terminal এ `[ ]` এর কারণে command ভুল পড়ে।

| Package | কাজ | কে ব্যবহার করে |
|---|---|---|
| `uvicorn` | server, port এ বসে request নেয় | FastAPI |
| `fastapi-cli` | `fastapi dev` / `fastapi run` command | FastAPI |
| `httpx` | `TestClient` দিয়ে test লেখা | Starlette |
| `python-multipart` | form data আর file upload নেওয়া | Starlette |
| `jinja2` | server থেকে HTML template বানানো | Starlette |
| `email-validator` | email যাচাই করা | Pydantic |

**`standard-no-fastapi-cloud-cli` কেন:** সাধারণ `[standard]` এর সাথে `fastapi-cloud-cli` ও আসে, যেটা FastAPI Cloud এ deploy করার জন্য। নিজের server এ চালালে ওটা লাগে না।

**`pydantic-settings` কেন:** `.env` ফাইলের সব মান string হয়ে আসে। `pydantic-settings` সেগুলো ঠিক type এ রূপান্তর করে, আর কোনো config ভুল বা অনুপস্থিত থাকলে app চালুর সময়েই error দেয়। API key বা DB URL কোডে লিখে রাখতে হয় না।

## ৬. dependency লক করা

```bash
pip freeze > requirements.txt
```

অন্য machine বা server এ `pip install -r requirements.txt` চালালে হুবহু একই version install হবে।

## ৭. .gitignore

```txt
.venv/
__pycache__/
.env
```

`.venv` অনেক বড় আর শুধু নিজের machine এর জন্য বানানো। `.env` এ secret থাকে, ওটা কখনো git এ যাবে না।

## Official doc

- [FastAPI: standard dependencies](https://fastapi.tiangolo.com/#dependencies)
- [FastAPI: Settings আর environment variable](https://fastapi.tiangolo.com/advanced/settings/)
