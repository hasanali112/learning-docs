<script setup>
const parseFlow = {
  title: 'মেসেজ থেকে পূরণ হওয়া ফর্ম',
  nodes: [
    { id: 'model', label: 'Pydantic model', sub: 'ফর্মের নকশা' },
    { id: 'schema', label: 'JSON schema', sub: 'LLM এর ভাষায়' },
    { id: 'llm', label: 'LLM', sub: 'ফর্ম পূরণ' },
    { id: 'json', label: 'JSON উত্তর' },
    { id: 'check', label: 'Pydantic যাচাই' },
    { id: 'form', label: 'OrderForm', sub: 'কোডে ব্যবহারযোগ্য' },
  ],
  steps: [
    {
      node: 'model',
      title: '১. ফর্মের নকশা Python এ',
      text: 'প্রথমে আমরা Pydantic দিয়ে ঠিক করি ফর্মে কোন কোন ঘর থাকবে, কোনটার ধরন কী, আর প্রতিটা ঘরের ছোট বর্ণনা। এটাই একমাত্র জায়গা যেখানে ফর্মের আকার লেখা থাকে।',
      code: 'class OrderForm(BaseModel):\n    product: str | None   # পণ্যের নাম\n    qty: int | None       # কয়টা\n    phone: str | None     # মোবাইল নম্বর\n    address: str | None   # ঠিকানা',
    },
    {
      node: 'schema', edge: 0,
      title: '২. নকশা JSON schema তে রূপান্তর',
      text: 'LLM Python বোঝে না, কিন্তু JSON schema বোঝে। LangChain নিজে থেকেই Pydantic model কে JSON schema বানায়। ঘরের বর্ণনাগুলোও এর সাথে যায়, তাই বর্ণনা ভালো লিখলে model ভালো বোঝে।',
      code: '{\n  "title": "OrderForm",\n  "properties": {\n    "product": { "type": ["string", "null"], "description": "পণ্যের নাম" },\n    "qty":     { "type": ["integer", "null"], "description": "কয়টা" },\n    ...\n  }\n}',
    },
    {
      node: 'llm', edge: 1,
      title: '৩. Schema আর মেসেজ একসাথে LLM এ',
      text: 'মেসেজের সাথে schema টাও পাঠানো হয়। সাধারণত tool হিসেবে: "এই আকারের একটা ফর্ম পূরণ করার tool আছে, এটা call করো।" কিছু provider এর নিজস্ব structured output ব্যবস্থাও আছে। কোনটা ব্যবহার হবে, LangChain provider দেখে ঠিক করে।',
      code: 'মেসেজ: "ভাই লাল শাড়িটা ২টা দেন, মিরপুর ১০, ০১৭১১-০০০০০০"\n+ tool: OrderForm(schema)',
    },
    {
      node: 'json', edge: 2,
      title: '৪. LLM JSON ফেরত দেয়',
      text: 'LLM সাধারণ বাক্য না লিখে, schema মেনে ঘরগুলো পূরণ করে JSON দেয়। phone নম্বরটা কাস্টমার যেভাবে লিখেছে সেভাবেই আছে, Bangla অঙ্কে আর মাঝে dash সহ।',
      code: '{\n  "product": "লাল শাড়ি",\n  "qty": 2,\n  "phone": "০১৭১১-০০০০০০",\n  "address": "মিরপুর ১০"\n}',
    },
    {
      node: 'check', edge: 3,
      title: '৫. Pydantic যাচাই করে আর ঠিক করে',
      text: 'Pydantic প্রতিটা ঘরের ধরন মিলিয়ে দেখে। আমাদের লেখা validator phone নম্বরকে ঠিক format এ আনে: Bangla অঙ্ক থেকে ইংরেজি, dash বাদ। এই কাজ LLM কে দিইনি, কারণ কোড এটা প্রতিবার নিশ্চিতভাবে করতে পারে।',
      code: '"০১৭১১-০০০০০০"  →  "01711000000"  ✓\nqty: 2 (int)               ✓',
    },
    {
      node: 'llm', edge: 3, reverse: true,
      title: '৬. আকার ভুল হলে আবার চেষ্টা',
      text: 'মাঝে মাঝে LLM ভুল আকারে উত্তর দেয়, যেমন qty তে "দুইটা" লিখে ফেলে। তখন যাচাই fail করে, আর আমরা আবার চেষ্টা করতে পারি। মনে রাখো: আকারের ভুল (LLM এর দোষ) হলে আবার চেষ্টা; তথ্যের অভাব (কাস্টমার বলেনি) হলে কাস্টমারকে প্রশ্ন।',
      code: 'qty: "দুইটা"  ✗  integer হতে হবে\n→ আবার চেষ্টা (সর্বোচ্চ ২ বার)',
    },
    {
      node: 'form', edge: 4,
      title: '৭. হাতে একটা Python object',
      text: 'শেষে আমরা পাই একটা সাধারণ Python object। এখন কোড সহজে এটা ব্যবহার করতে পারে: কোন ঘর খালি দেখা, database এ রাখা, কাস্টমারকে নিশ্চিত করা।',
      code: 'form.product   → "লাল শাড়ি"\nform.qty       → 2\nform.phone     → "01711000000"\nform.missing() → []   # কিছু বাকি নেই',
    },
  ],
}
</script>

# Structured Output

**Structured output মানে LLM থেকে সাধারণ লেখার বদলে একটা নির্দিষ্ট আকারের data আনা, যেটা কোড সরাসরি ব্যবহার করতে পারে।** কাজের তালিকার ধাপ ১ থেকে ৩ পুরোটাই এর উপর দাঁড়িয়ে।

## সমস্যা: সাধারণ লেখা কোড পড়তে পারে না

LLM কে "order এর তথ্য বের করো" বললে উত্তর আসতে পারে এমন:

```txt
জি, কাস্টমার ২টা লাল শাড়ি চেয়েছেন। ঠিকানা মিরপুর ১০,
আর নম্বর ০১৭১১০০০০০০।
```

মানুষ পড়লে বোঝা যায়। কিন্তু কোড এখান থেকে qty কীভাবে বের করবে? পরেরবার model লিখতে পারে "পরিমাণ: দুইটা", তার পরেরবার অন্য কোনোভাবে। প্রতিবার আলাদা আকার মানে প্রতিবার ভাঙার ঝুঁকি।

আমাদের দরকার প্রতিবার **একই আকারের** উত্তর:

```json
{ "product": "লাল শাড়ি", "qty": 2, "phone": "01711000000", "address": "মিরপুর ১০" }
```

## পুরো প্রক্রিয়া

<FlowSteps v-bind="parseFlow" />

## ফর্মের নকশা: Pydantic model

```python
import re
from pydantic import BaseModel, Field, field_validator

BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")


class Item(BaseModel):
    product: str = Field(description="পণ্যের নাম, যেমন 'লাল শাড়ি'")
    color: str | None = Field(default=None, description="রং, না বললে null")
    size: str | None = Field(default=None, description="সাইজ, না বললে null")
    qty: int = Field(default=1, ge=1, description="কয়টা, সংখ্যায়")


class OrderForm(BaseModel):
    items: list[Item] = Field(default_factory=list, description="কাস্টমার যা যা চেয়েছে")
    customer_name: str | None = Field(default=None, description="কাস্টমারের নাম")
    phone: str | None = Field(default=None, description="মোবাইল নম্বর, যেভাবে লেখা আছে")
    address: str | None = Field(default=None, description="ডেলিভারির পুরো ঠিকানা")

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str | None) -> str | None:
        if v is None:
            return None
        digits = re.sub(r"\D", "", v.translate(BN_DIGITS))   # Bangla অঙ্ক → ইংরেজি, বাকি সব বাদ
        if digits.startswith("880"):                          # +880 বা 880 দিয়ে শুরু হলে
            digits = digits[2:]
        if not re.fullmatch(r"01[3-9]\d{8}", digits):
            return None        # ভুল নম্বর: খালি রাখো, agent আবার জিজ্ঞেস করবে
        return digits

    def missing(self) -> list[str]:
        """কোন জরুরি ঘর এখনো খালি। কোড দিয়ে হিসাব, LLM দিয়ে না।"""
        gaps = []
        if not self.items:
            gaps.append("items")
        if not self.phone:
            gaps.append("phone")
        if not self.address:
            gaps.append("address")
        return gaps
```

কয়েকটা জিনিস খেয়াল করো:
- **`Field(description=...)`** শুধু তোমার জন্য না। এই বর্ণনা schema এর সাথে LLM এর কাছে যায়, তাই এটাও prompt এর অংশ।
- **`str | None`** মানে ঘরটা খালি থাকতে পারে। এতে model কে জোর করে কিছু একটা বসাতে হয় না, আর অনুমান করে ভরার প্রবণতা কমে।
- **`missing()` কোডে লেখা।** "কী বাকি আছে" এই প্রশ্নের উত্তর নিশ্চিতভাবে দেওয়া যায়, তাই এটা LLM কে জিজ্ঞেস করার দরকার নেই।
- **ভুল phone নম্বরে error না দিয়ে `None`।** কাস্টমার ভুল নম্বর দিলে আবার LLM চালিয়ে লাভ নেই। খালি রাখলে `missing()` এ phone আসবে, আর agent কাস্টমারকে আবার জিজ্ঞেস করবে।

## কোন কাজ LLM করবে, কোনটা কোড

এটা পুরো AI engineering এর সবচেয়ে জরুরি অভ্যাসগুলোর একটা।

| কাজ | কে করবে | কেন |
|---|---|---|
| এলোমেলো Banglish থেকে product, qty, ঠিকানা বোঝা | **LLM** | নিয়ম লিখে এটা করা প্রায় অসম্ভব |
| "dui ta", "২টা", "two" কে 2 বানানো | **LLM** (prompt আর উদাহরণ দিয়ে) | ভাষা বোঝার কাজ |
| phone নম্বর ঠিক format এ আনা আর যাচাই | **কোড** | নিয়ম নির্দিষ্ট, প্রতিবার নিশ্চিত ফল চাই |
| কোন ঘর বাকি আছে | **কোড** | সোজা হিসাব |
| দাম আর স্টক | **Database** | LLM এর স্মৃতি বিশ্বাসযোগ্য না |
| qty ১ এর কম না হওয়া | **কোড** (`ge=1`) | নিয়ম নির্দিষ্ট |

::: tip সহজ নিয়ম
যে কাজের জন্য তুমি একটা নির্দিষ্ট নিয়ম লিখতে পারো, সেটা কোডে করো। যে কাজে "বুঝতে" হয়, সেটা LLM কে দাও।
:::

## LangChain এ এক লাইনে

```python
structured = model.with_structured_output(OrderForm)

form = structured.invoke("ভাই লাল শাড়িটা ২টা দেন, মিরপুর ১০, ০১৭১১-০০০০০০")
print(form.items[0].product, form.phone)   # লাল শাড়ি 01711000000
print(form.missing())                      # []
```

`with_structured_output` উপরের animation এর ২ থেকে ৫ নম্বর ধাপ নিজে করে: schema বানানো, LLM কে পাঠানো, JSON পড়া, Pydantic দিয়ে যাচাই। `model` কীভাবে বানাতে হয়, সেটা পরের নোটে।

### ভুল হলে কী হয়

LLM ভুল আকারে উত্তর দিলে `invoke` error দেয়। দুটো কাজের উপায়:

```python
# ১. ভুল হলে নিজে থেকে আবার চেষ্টা (সব মিলিয়ে সর্বোচ্চ ২ বার)
structured = model.with_structured_output(OrderForm).with_retry(stop_after_attempt=2)

# ২. error না দিয়ে কাঁচা উত্তরসহ সব হাতে নাও, debug এর জন্য ভালো
structured = model.with_structured_output(OrderForm, include_raw=True)
result = structured.invoke(message)
result["parsed"]          # OrderForm, বা ভুল হলে None
result["parsing_error"]   # কী ভুল হলো
result["raw"]             # LLM আসলে কী পাঠিয়েছিল
```

## ভালো schema এর নিয়ম

| নিয়ম | কারণ |
|---|---|
| ঘর কম আর সমতল রাখো | যত জটিল আকার, তত ভুলের সুযোগ |
| প্রতিটা ঘরের পরিষ্কার `description` | এটা model এর জন্য নির্দেশ |
| নির্দিষ্ট কয়েকটা মানের জন্য `Literal` | যেমন `Literal["order", "question", "other"]`, model এর বাইরে যাওয়ার সুযোগ থাকে না |
| খালি থাকতে পারে এমন ঘর `None` রাখো | নাহলে model বানিয়ে ভরবে |
| যা কোডে হিসাব করা যায় তা schema তে রেখো না | যেমন `missing`, মোট দাম |

## মনে রাখো

- LLM এর সাধারণ লেখা কোডের জন্য অনির্ভরযোগ্য। নির্দিষ্ট আকার চাও।
- Pydantic model এ একবার আকার লেখো। LangChain সেটা LLM কে বোঝায়, আর উত্তর যাচাই করে।
- বোঝার কাজ LLM এর, নিয়মের কাজ কোডের।
- আকারের ভুল হলে আবার চেষ্টা, তথ্য না থাকলে কাস্টমারকে প্রশ্ন।

আগের নোট: [Prompt লেখা](/ai-engineer/prompting) · পরের নোট: [LangChain এর মূল অংশ](/ai-engineer/langchain-basics)
