# Memory: stack, heap আর leak

Python যখন variable আর object বানায়, memory কোথায় যায়? আর কখন সেটা ফেরত যায়?

## Stack আর Heap

```python
def make_order():
    name = input()        # "লাল শাড়ি"
    qty = 2
    items = [name, qty]
    return items
```

- **Stack:** প্রতিটা function call এ একটা **frame** তৈরি হয়। frame এ থাকে local variable এর **slot**। slot এ object নিজে থাকে না, থাকে শুধু তার **ঠিকানা** (reference)।
- **Heap:** আসল object গুলো (string, list, dict) থাকে এখানে।

```txt
Stack (make_order frame)        Heap
  name  ──────────────────▶  str "লাল শাড়ি"   refcount ২
  qty   ──────────────────▶  int 2            স্থায়ী
  items ──────────────────▶  list [ • , • ]   refcount ১
                                    │   └──▶ int 2
                                    └──────▶ str "লাল শাড়ি"
```

list ভেতরে string এর কপি রাখে না, শুধু ঠিকানা রাখে। তাই string কে এখন দুজন দেখছে: `name` আর list। কতজন দেখছে সেই হিসাবকে বলে **reference count (refcount)**।

## Refcount: কখন object মোছে

- কেউ object এর ঠিকানা রাখলে refcount বাড়ে, ছেড়ে দিলে কমে।
- **refcount ০ হলেই CPython সাথে সাথে object মুছে দেয়।**
- function শেষ হলে frame সরে যায়, তার slot গুলোর ধরা ছেড়ে যায়, refcount কমে।

-5 থেকে 256 পর্যন্ত ছোট সংখ্যা Python শুরুতেই বানিয়ে রাখে। Python 3.12 থেকে এগুলো স্থায়ী (immortal), এদের refcount কখনো বদলায় না। তাই `qty = 2` নতুন memory নেয় না।

## memory কোথা থেকে আসে

```txt
তোমার কোড → allocator ─┬─ ≤ ৫১২ byte → pymalloc → (arena ফুরালে) ─┐
                        └─ > ৫১২ byte → malloc (C) ─────────────────┴─▶ Linux kernel (mmap) → RAM
```

1. **pymalloc:** ছোট object এর জন্য। kernel এর কাছ থেকে আগেই বড় খণ্ড (arena, ১ MB) নিয়ে রাখে, তারপর সেখান থেকে খালি block দেয়। তাই সাধারণত kernel কে জিজ্ঞেস করতে হয় না, খুব দ্রুত।
2. **malloc:** বড় object এর জন্য, যেমন `[0] * 100_000` (প্রায় ৮০০ KB)। এত বড় অংশের জন্য malloc সরাসরি kernel কে `mmap` system call দিয়ে চায়।
3. **kernel:** প্রথমে শুধু virtual ঠিকানা দেয়। প্রথমবার লেখার সময় **page fault** হয়, তখন ৪ KB করে আসল RAM page দেয়।

## Garbage collector: চক্রের জন্য

```python
a = []
a.append(a)   # list নিজেকেই ধরে আছে
del a         # refcount তবুও ১
```

এখানে refcount কখনো ০ হয় না। Python এর garbage collector (`gc` module) মাঝে মাঝে এরকম চক্র খুঁজে মুছে দেয়।

## Stack এর সীমা

প্রতিটা function call একটা frame যোগ করে। খুব গভীর recursion হলে Python থামিয়ে দেয়: default সীমা ১০০০ (`sys.getrecursionlimit()`), পার হলে `RecursionError`।

## Memory leak

### ১. request শেষেও কিছু ধরে রাখা

```python
ALL_ORDERS = []                 # global, কখনো মোছে না

@app.post("/orders")
def create_order(order: Order):
    ALL_ORDERS.append(order)    # ← সমস্যা
    return {"order_id": 101}
```

প্রতিটা request একটা Order রেখে যায়, refcount কখনো ০ হয় না। pymalloc এর block ফুরায়, বারবার mmap হয়, RAM ভরে যায়। শেষে Linux এর **OOM killer** process টাকে জোর করে বন্ধ করে দেয়।

**সমাধান:** আসল জায়গা database। memory তে রাখতেই হলে সীমা দাও:

```python
from collections import deque
RECENT = deque(maxlen=1000)    # পুরনোটা নিজে বাদ যায়
```

::: warning cache এ সীমা দাও
`@functools.cache` আর `lru_cache(maxsize=None)` সীমাহীন। `lru_cache(maxsize=1000)` এর মতো সীমা দাও।
:::

### ২. বড় data একবারে memory তে আনা

পুরো file বা হাজার হাজার row একসাথে পড়লে একটা request এই অনেক memory নেয়। অল্প অল্প করে পড়ো: generator, pagination, streaming response।

### ৩. memory না কমা মানেই leak না

pymalloc পুরো arena খালি হলে তবেই kernel কে ফেরত দেয়। তাই object মুছলেও htop এ সংখ্যা প্রায়ই কমে না। **leak মানে request এর পর request memory বাড়তেই থাকা।**

## leak খুঁজবে কীভাবে

```python
import tracemalloc

tracemalloc.start()
snap1 = tracemalloc.take_snapshot()
# ... অনেকগুলো request পাঠাও ...
snap2 = tracemalloc.take_snapshot()

for stat in snap2.compare_to(snap1, "lineno")[:5]:
    print(stat)   # কোন লাইন সবচেয়ে বেশি memory বাড়াল
```

## নিজে চালিয়ে দেখো

```python
import sys
x = [1, 2, 3]
id(x)               # object এর ঠিকানা
sys.getrefcount(x)  # refcount (১ বেশি দেখায়, কারণ function নিজেও ধরে)
sys.getsizeof(x)    # কত byte
```
