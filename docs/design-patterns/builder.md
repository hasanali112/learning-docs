# Builder

**এক লাইনে:** অনেক optional অংশওয়ালা একটা জটিল object ধাপে ধাপে বানাও, আর শেষে একবারে যাচাই করে তৈরি করো।

ধরন: Creational

## সমস্যা

courier এ parcel পাঠানোর request এ অনেক কিছু থাকে, যার বেশিরভাগই optional:

```python
parcel = ParcelRequest(
    "রহিম", "01711000000", "মিরপুর ১০, ঢাকা",
    1200, None, True, False, None, 0.5, "শাড়ি", None, True,
)
```

কোন সংখ্যা কী বোঝায়? `True` টা কোনটার? ভুল জায়গায় একটা মান দিলে কেউ টেরও পাবে না। আর কিছু নিয়ম আছে যেগুলো কয়েকটা field মিলিয়ে দেখতে হয়, যেমন "COD হলে টাকার পরিমাণ লাগবেই"।

## ক্লাসিক সমাধান

```python
class ParcelBuilder:
    def __init__(self):
        self._data = {"fragile": False, "weight_kg": 0.5}

    def to(self, name: str, phone: str, address: str):
        self._data.update(name=name, phone=phone, address=address)
        return self          # self ফেরত দেয়, তাই পরের method জোড়া যায়

    def cod(self, amount: int):
        self._data["cod_amount"] = amount
        return self

    def fragile(self):
        self._data["fragile"] = True
        return self

    def build(self) -> "ParcelRequest":
        if "phone" not in self._data:
            raise ValueError("প্রাপকের তথ্য দাও")
        if self._data.get("cod_amount", 0) < 0:
            raise ValueError("COD টাকা ঋণাত্মক হতে পারে না")
        return ParcelRequest(**self._data)
```

ব্যবহার পড়তে প্রায় বাক্যের মতো:

```python
parcel = (
    ParcelBuilder()
    .to("রহিম", "01711000000", "মিরপুর ১০, ঢাকা")
    .cod(1200)
    .fragile()
    .build()
)
```

## Python এ প্রায়ই builder লাগে না

Python এ **keyword argument** আর **default মান** আছে, তাই সাধারণ ক্ষেত্রে Pydantic model বা dataclass ই যথেষ্ট:

```python
from pydantic import BaseModel, model_validator

class ParcelRequest(BaseModel):
    name: str
    phone: str
    address: str
    cod_amount: int = 0
    fragile: bool = False
    weight_kg: float = 0.5

    @model_validator(mode="after")
    def check(self):
        if self.cod_amount < 0:
            raise ValueError("COD টাকা ঋণাত্মক হতে পারে না")
        return self

parcel = ParcelRequest(
    name="রহিম", phone="01711000000",
    address="মিরপুর ১০, ঢাকা", cod_amount=1200, fragile=True,
)
```

নাম দিয়ে মান দেওয়া হচ্ছে, তাই কোনটা কী সেটা পরিষ্কার। যাচাই model নিজেই করে।

## কখন builder সত্যিই কাজে লাগে

- object টা **ধাপে ধাপে**, কয়েক জায়গা থেকে তৈরি হয়। যেমন একটা function ঠিকানা যোগ করে, আরেকটা পরে COD যোগ করে।
- একই ধাপগুলো দিয়ে **ভিন্ন ভিন্ন ফল** বানাতে হয়। যেমন একই parcel এর তথ্য থেকে Pathao এর JSON আর Steadfast এর JSON।
- **query বা লেখা তৈরি:** SQL query builder (SQLAlchemy তে `select(Order).where(...).order_by(...)`), বা Facebook post এর লেখা ধাপে ধাপে বানানো।

## কখন না

- object সহজ, আর keyword argument দিয়ে পরিষ্কার লেখা যায়। তখন builder শুধু বাড়তি কোড।

## যা নিয়ে গোলমাল হয়

- **Builder বনাম [Factory](/design-patterns/factory):** factory ঠিক করে **কোন** class এর object, আর সাধারণত এক ধাপে বানায়। builder একটা জটিল object **কীভাবে** ধাপে ধাপে জোড়া লাগবে সেটা ঠিক করে।
- **method chaining মানেই builder না।** `.where().order_by()` এর মতো জোড়া লাগানো লেখা (fluent interface) builder এ খুব দেখা যায়, কিন্তু এটা শুধু লেখার ধরন। builder এর আসল কাজ হলো ধাপে ধাপে জমা করা আর শেষে `build()` এ একবারে যাচাই করে তৈরি করা।
