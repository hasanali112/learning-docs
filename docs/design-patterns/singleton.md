# Singleton

**এক লাইনে:** একটা class এর পুরো program এ শুধু একটাই object থাকবে, আর সবাই সেই একটাকেই ব্যবহার করবে।

ধরন: Creational

## সমস্যা

কিছু জিনিস বারবার বানানো দামি বা ভুল:
- **Database connection pool:** প্রতিটা request এ নতুন pool বানালে database এ শত শত connection খুলে যায়।
- **Settings:** `.env` file প্রতিবার পড়া অপচয়, আর দুই জায়গায় দুই রকম মান থাকার ঝুঁকি।
- **HTTP client:** প্রতিবার নতুন `httpx.Client` বানালে connection আবার ব্যবহার হয় না।

```python
def get_orders():
    pool = create_pool(DB_URL)    # প্রতিবার নতুন pool, খারাপ
    ...
```

## ক্লাসিক সমাধান

```python
class Settings:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.db_url = "postgresql://..."
        return cls._instance

a = Settings()
b = Settings()
print(a is b)   # True, একই object
```

## Python এর সহজ উপায়

Python এ আলাদা class কৌশল প্রায় লাগেই না।

**১. module নিজেই singleton।** একটা module প্রথমবার import হলে একবারই চলে, তারপর সবাই একই module পায়।

```python
# settings.py
DB_URL = "postgresql://..."
http_client = httpx.Client(timeout=10)

# অন্য যেকোনো file
from settings import http_client   # সবাই একই client পায়
```

**২. `lru_cache` দিয়ে একবারই বানানো।** FastAPI এর অফিসিয়াল ডকুমেন্টেশনেও settings এর জন্য এই উপায় দেখানো হয়েছে।

```python
from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    db_url: str

@lru_cache
def get_settings() -> Settings:
    return Settings()   # প্রথমবার বানায়, পরে একই object ফেরত দেয়
```

**৩. FastAPI তে `lifespan`।** server চালুর সময় একবার বানাও, বন্ধের সময় বন্ধ করো।

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient()
    yield
    await app.state.http.aclose()

app = FastAPI(lifespan=lifespan)
```

## কখন ব্যবহার করবে

- জিনিসটা সত্যিই একটাই হওয়া উচিত: config, connection pool, logger
- বানানো দামি, আর একই জিনিস বারবার ব্যবহার করা যায়

## কখন না

::: warning Singleton এর দাম
- **লুকানো global state:** যেকোনো জায়গা থেকে বদলানো যায়, তাই কে কখন বদলালো খুঁজে পাওয়া কঠিন।
- **test কঠিন:** এক test singleton বদলালে পরের test এ সেই বদল রয়ে যায়। নকল বসানোও ঝামেলা।
- **লুকানো dependency:** function এর signature দেখে বোঝা যায় না যে এটা ভেতরে একটা global জিনিস ব্যবহার করছে।
:::

ভালো অভ্যাস: object একবারই বানাও, কিন্তু যাদের দরকার তাদের **হাতে দিয়ে দাও** (dependency injection), নিজেরা global থেকে তুলে না নিক। FastAPI এর `Depends(get_settings)` ঠিক এটাই করে, আর test এ `app.dependency_overrides` দিয়ে সহজে বদলানো যায়।

## যা নিয়ে গোলমাল হয়

- **"একটাই object" আর "global variable" এক না।** Singleton নিশ্চিত করে যে দ্বিতীয়টা বানানোই যাবে না। global variable শুধু একটা নাম, কেউ চাইলে আরেকটা বানাতে পারে।
- **একাধিক process এ singleton একটা না।** uvicorn কে `--workers 4` দিলে ৪টা আলাদা process চলে, প্রতিটার নিজের singleton থাকে। পুরো system এ সত্যিকারের "একটা" লাগলে (যেমন counter) সেটা database বা Redis এ রাখতে হয়।
- **thread এর সময়:** দুইটা thread একসাথে প্রথমবার `Settings()` call করলে ক্লাসিক রূপে দুটো object তৈরি হতে পারে। module বা `lifespan` উপায়ে এই ঝুঁকি থাকে না।
