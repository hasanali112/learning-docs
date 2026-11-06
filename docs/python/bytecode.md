# Bytecode আর compile

Python কি লাইন ধরে ধরে চালায়, নাকি Rust এর মতো আগে compile করে? উত্তর: আগে compile করে, কিন্তু Rust এর মতো করে না।

## Rust বনাম Python

```txt
Rust:    main.rs ──rustc──▶ machine code (binary) ──▶ CPU সরাসরি চালায়
         (চালানোর আগেই, একবার)

Python:  main.py ──compile──▶ bytecode (.pyc) ──▶ VM (eval loop) ──▶ CPU
         (চালানোর মুহূর্তে)       CPU বোঝে না      নিজে machine code
```

::: info মনে রাখো
Rust bytecode বানায় না, সরাসরি **machine code** বানায়। bytecode বানায় Python (আর Java)।
:::

| | Rust | Python (CPython) |
|---|---|---|
| কখন compile হয় | চালানোর আগে (`cargo build`) | চালানোর সময়, ফাইল import হওয়ার মুহূর্তে |
| কী বানায় | machine code | bytecode |
| কে চালায় | CPU সরাসরি | VM এর eval loop |
| VM লাগে? | না | হ্যাঁ |

## Bytecode কী

**Bytecode হলো Python এর VM এর জন্য লেখা সহজ নির্দেশের তালিকা।** তোমার কোড আর CPU এর machine code এর মাঝামাঝি একটা ভাষা।

রেসিপির উদাহরণ: Python কোড হলো "একটা মুরগির ঝোল বানাও"। bytecode হলো "১. পাত্র নাও ২. তেল দাও ৩. পেঁয়াজ দাও"। প্রতিটা ধাপ এত সহজ যে না ভেবেই করা যায়। VM হলো সেই রাঁধুনি, যে ধাপগুলো একটা একটা করে পড়ে আর করে।

## compile এর ধাপ

1. **tokenizer:** লেখাকে ছোট টুকরো (token) করে
2. **parser:** টুকরো থেকে গাছের মতো কাঠামো বানায়, নাম **AST**। syntax ভুল থাকলে `SyntaxError` এখানেই আসে।
3. **compiler:** AST থেকে bytecode বানায়

Python 3.14 এ `result = {"order_id": 101}` এর আসল output:

```txt
tokens:
  NAME "result"   OP "="   OP "{"
  STRING "order_id"   OP ":"   NUMBER 101   OP "}"

AST:
  Assign(
    targets=[Name(id="result")],
    value=Dict(keys=[Constant("order_id")], values=[Constant(101)]))
```

## আসল bytecode

```python
def create_order(order):
    result = {"order_id": 101, "qty": order.qty}
    return result
```

`dis.dis(create_order)` (Python 3.14):

```txt
LOAD_CONST        'order_id'   # "order_id" তুলে রাখো
LOAD_SMALL_INT    101          # 101 তুলে রাখো
LOAD_CONST        'qty'        # "qty" তুলে রাখো
LOAD_FAST_BORROW  order        # order variable তুলে রাখো
LOAD_ATTR         qty          # তার থেকে .qty বের করো
BUILD_MAP         2            # উপরের ৪টা দিয়ে ২ জোড়ার dict বানাও
STORE_FAST        result       # dict টা result এ রাখো
LOAD_FAST_BORROW  result       # result তুলে নাও
RETURN_VALUE                   # ফেরত দাও
```

এক লাইনের কোড ভেঙে ৭টা ছোট নির্দেশ হয়েছে।

### "তুলে রাখো" মানে: VM এর stack

VM একটা **stack** দিয়ে হিসাব রাখে, থালার স্তূপের মতো: নতুনটা উপরে রাখা হয়, নেওয়ার সময় উপর থেকে নেওয়া হয়।

```txt
LOAD_CONST 'order_id'  →  [ 'order_id' ]
LOAD_SMALL_INT 101     →  [ 'order_id', 101 ]
LOAD_CONST 'qty'       →  [ 'order_id', 101, 'qty' ]
LOAD_ATTR qty          →  [ 'order_id', 101, 'qty', 2 ]
BUILD_MAP 2            →  [ {'order_id': 101, 'qty': 2} ]
STORE_FAST result      →  [ ]
```

এই stack memory এর stack/heap এর stack থেকে আলাদা জিনিস।

## তিনটা গুরুত্বপূর্ণ কথা

**১. compile হয় পুরো ফাইল একবারে।** কোনো ফাইল import হলে Python পুরো ফাইলটা একসাথে bytecode বানায়, তারপর চালানো শুরু করে। প্রমাণ:

```python
print("শুরু")

def never_called():
    x = (1 +        # syntax ভুল
```

চালালে "শুরু" ও print হয় না, সরাসরি `SyntaxError`, যদিও function টা কখনো call হয় না।

**২. compile হয় ফাইল ধরে, দরকার পড়লে।** প্রতিটা ফাইল (module) শুধু প্রথমবার import হওয়ার সময় compile হয়। import না হলে compile ও হয় না।

**৩. `.pyc` তে জমা থাকে।** `__pycache__/main.cpython-314.pyc`। পরের বার source না বদলালে আবার compile করে না। সরাসরি `python main.py` দিয়ে চালানো ফাইলের `.pyc` রাখা হয় না, শুধু import হওয়া ফাইলের রাখা হয়।

## সরাসরি machine code বানায় না কেন

1. **সব কম্পিউটারে চলে।** machine code CPU অনুযায়ী আলাদা (x86, ARM)। bytecode সব জায়গায় একই, শুধু VM প্রতিটা CPU এর জন্য আলাদা করে বানানো থাকে।
2. **Python এর নমনীয়তা।** চালানোর আগে জানা যায় না `order.qty` কী হবে: সংখ্যা, লেখা, নাকি অন্য কিছু। Rust compile এর সময়েই সব type জানে।
3. **compile দ্রুত।** bytecode বানানো সহজ, Rust এর মতো লম্বা সময় লাগে না।

এর দাম হলো গতি: VM কে প্রতিটা নির্দেশ পড়ে বুঝে কাজ করতে হয়। Python 3.11 থেকে বারবার চলা instruction কে দ্রুত রূপে বদলে নেয় (specializing interpreter)। 3.13 থেকে পরীক্ষামূলক JIT আছে, তবে default এ বন্ধ।

## নিজে চালিয়ে দেখো

```python
import dis

def add(a, b):
    return a + b

dis.dis(add)
```

```bash
python -m dis main.py                           # ফাইলের bytecode
python -m py_compile main.py && ls __pycache__  # .pyc তৈরি
```

instruction এর নাম Python এর version অনুযায়ী একটু বদলায়।
