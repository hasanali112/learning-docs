---
outline: [2, 3]
aside: false
pageClass: wide-page
---

<script setup>
import { withBase } from 'vitepress'
</script>

# একটা request এর পুরো যাত্রা

Rust backend থেকে একটা request এলে সেটা কোন কোন জায়গা পার হয়ে উত্তর হয়ে ফেরত যায়: Linux kernel, Python process, CPython VM, memory, আর শেষে RAM আর CPU।

## Animation এ দেখো

<iframe :src="withBase('/demos/request-journey.html?embed')" title="Request যাত্রার animated flowchart" class="demo-frame" loading="lazy"></iframe>

<p><a :href="withBase('/demos/request-journey.html')" target="_blank" rel="noopener">পুরো পেজে খোলো ↗</a></p>

## pymalloc এর পরে: object মুছলে কী হয় {#memory-free-gc}

Animation এ দেখলাম pymalloc কীভাবে নতুন object কে জায়গা দেয়। এখানে উল্টো দিকটা: object এর কাজ শেষ হলে কী হয়। একটা মিষ্টির দোকানের উদাহরণ দিয়ে ভাবো:

| pymalloc | দোকান |
|---|---|
| kernel | কারখানা |
| arena (১ MiB) | গুদাম |
| pool (১৬ KiB), প্রতিটায় একই মাপের block | তাক, প্রতিটায় একই মাপের বাক্স |
| block | বাক্স, এর ভেতরে একটা object থাকে |

### ক) GC: Python কীভাবে বোঝে কোন object আর লাগবে না

**১. Reference count:** প্রতিটা object জানে কতজন তাকে ধরে আছে।

```python
a = {"x": 1}   # count = 1  (a ধরে আছে)
b = a          # count = 2  (a, b)
del a          # count = 1
del b          # count = 0  → সাথে সাথে মুছে যায়
```

count ০ হলেই object সাথে সাথে মুছে যায়, কোনো অপেক্ষা নেই। বেশিরভাগ object এভাবেই মরে।

**২. ফাঁক: চক্র (cycle)।** দুটো object যদি একে অপরকে ধরে রাখে, তাহলে বাইরের কেউ না ধরলেও দুজনের count ১ থেকে যায়, কখনো ০ হয় না।

```python
a = []; b = []
a.append(b)    # a ধরে আছে b কে
b.append(a)    # b ধরে আছে a কে
del a, b       # বাইরের কেউ নেই, কিন্তু count এখনো ১ করে
```

**৩. Cycle GC (`gc` module):** মাঝে মাঝে চলে। list, dict, class object এর মতো যেসব object অন্যকে ধরে রাখতে পারে, সেগুলো দেখে। যে দল শুধু নিজেরা নিজেদের ধরে আছে, বাইরের কেউ না, সেই দলটাকে একসাথে মুছে দেয়।

**৪. Generation:** বেশিরভাগ object অল্প সময়েই মরে। তাই নতুন object গুলো ঘন ঘন চেক হয়। যারা কয়েকবার চেক পার করে বেঁচে থাকে, তারা পুরনো দলে যায় আর কম চেক হয়। (নতুন Python version এ এর খুঁটিনাটি একটু বদলেছে, মূল ধারণা একই।)

::: tip এক কথায়
reference count হলো মূল উপায়, যেটা সাথে সাথে মুছে দেয়। cycle GC হলো ব্যাকআপ, যেটা মাঝে মাঝে এসে চক্রগুলো পরিষ্কার করে।
:::

### খ) মুছে যাওয়ার পর বাক্সটা কোথায় যায়

```
বাক্স খালি   →  তাকের free list এ ফেরত      (Python এর কাছেই থাকে)
তাক খালি     →  গুদামে ফেরত, যেকোনো মাপে চলবে (Python এর কাছেই থাকে)
গুদাম খালি   →  kernel এ ফেরত (munmap)       ✅ শুধু তখনই memory কমে
```

পরের বার কেউ একই মাপের বাক্স চাইলে free list থেকে এই খালি বাক্সটাই আবার দেওয়া হয়।

### গ) কেন অনেক সময় Python এর memory কমে না

```
গুদাম A: [■][□][□][□][□][□][□][□]   ← মাত্র ১টা বাক্স ভরা
গুদাম B: [□][□][■][□][□][□][□][□]   ← মাত্র ১টা বাক্স ভরা
গুদাম C: [□][□][□][□][□][□][■][□]   ← মাত্র ১টা বাক্স ভরা
```

লাখ লাখ object মুছে গেছে, প্রায় সব বাক্স খালি। কিন্তু প্রতিটা গুদামে একটা করে ছোট object এখনো বেঁচে আছে। তাই কোনো গুদামই পুরো খালি না, কোনোটাই kernel এ ফেরত যায় না। `top` এ Python এখনো ৩ MiB ধরে রেখেছে দেখায়।

::: warning এটা memory leak না
leak মানে memory হারিয়ে যাওয়া, যেটা আর কখনো ব্যবহার করা যায় না। এখানে খালি বাক্সগুলো Python এর কাছেই আছে, নতুন object এ আবার কাজে লাগবে। শুধু kernel কে ফেরত দেওয়া যাচ্ছে না। এর নাম **fragmentation** (ছড়িয়ে-ছিটিয়ে থাকা)।
:::

### পুরো জীবনচক্র

```
object বানানো         →  pymalloc খালি বাক্স দেয়
ব্যবহার চলছে          →  reference count ওঠানামা করে
count ০ / cycle GC    →  object মুছে যায়
বাক্স → তাক → গুদাম   →  গুদাম পুরো খালি হলে তবেই kernel এ ফেরত
```

আরো বিস্তারিত: [Memory: stack, heap আর leak](/python/memory)।

## দুটো পর্ব

সবচেয়ে গুরুত্বপূর্ণ কথা: **Python প্রতিটা request এ কোড compile করে না।** কিছু কাজ server চালুর সময় একবারই হয়।

### পর্ব ১: একবার, server চালুর সময়

1. `fastapi dev main.py` লিখলে kernel `fork + exec` দিয়ে নতুন process বানায়, python প্রোগ্রামটা RAM এ আনে।
2. Python `main.py` পড়ে (kernel এর `read()` system call দিয়ে)।
3. লেখাটা ভেঙে **tokens**, তারপর **AST** (কোডের গঠন) হয়।
4. AST থেকে **bytecode** তৈরি হয়, `__pycache__` এ `.pyc` ফাইলে জমা থাকে। বিস্তারিত: [Bytecode আর compile](/python/bytecode)।
5. uvicorn event loop চালু করে।
6. kernel কে port 8000 এ socket খুলতে বলে (`socket`, `bind`, `listen`), তারপর `epoll_wait` এ ঘুমিয়ে থাকে।

### পর্ব ২: প্রতিটা request এ

**ঢোকা:**
1. Rust backend HTTP request পাঠায়।
2. **NIC** (network card) packet গুলো DMA দিয়ে সরাসরি RAM এ লেখে, interrupt দিয়ে kernel কে জানায়।
3. kernel এর **TCP/IP stack** packet জোড়া লাগায়, দেখে কোন port এর জন্য।
4. data **socket** buffer এ জমা হয়, epoll uvicorn কে জাগায়।
5. uvicorn **`recv()`** system call দিয়ে data kernel থেকে process এর memory তে আনে।
6. **Starlette** route খোঁজে, **Pydantic** যাচাই করে Order object বানায়।
7. তোমার function call হয়, নতুন frame তৈরি হয়।

**ভেতরের ইঞ্জিন:**

8. VM এর **eval loop** প্রতিটা bytecode instruction পড়ে (fetch), চেনে (dispatch), তার C কোড চালায় (execute)। value stack এ জিনিস তোলে আর নামায়।
9. নতুন dict লাগলে **pymalloc** তার pool এর free list থেকে একটা block দেয়, সাধারণত kernel লাগে না।
10. সব pool ভরে গেলে **`mmap()`** দিয়ে kernel এর কাছে নতুন ১ MiB arena চায়।
11. kernel শুধু virtual ঠিকানার পরিসর দেয়, process এর memory map এ লিখে রাখে। **page table** এ তখনো কোনো RAM বসানো নেই।
12. প্রথমবার লেখার সময় **page fault** হয়, kernel একটা ৪ KiB **RAM** frame দিয়ে page table এ লেখে।
13. data RAM থেকে **CPU cache** (৬৪ byte এর cache line) হয়ে CPU তে যায়।
14. **CPU core** eval loop এর machine code চালায়। তারপর পরের instruction এর জন্য আবার একই চক্র।

**ফেরা:**

15. `return` হলে Starlette dict কে JSON bytes বানায়।
16. uvicorn **`send()`** system call দিয়ে bytes kernel কে দেয়।
17. kernel TCP/IP দিয়ে packet বানায়, NIC পাঠায়, Rust উত্তর পায়।
18. refcount ০ হয়ে request এর সব object মুছে যায়, uvicorn আবার ঘুমায়। বিস্তারিত: [Memory](/python/memory)।

## ৬টা স্তর

| স্তর | কী থাকে |
|---|---|
| বাইরে | Rust backend, request পাঠায় আর উত্তর নেয় |
| Linux kernel · network | NIC, TCP/IP, socket |
| Python process | uvicorn, Starlette, Pydantic, তোমার কোড |
| CPython VM | compile (একবার), eval loop (প্রতিবার), pymalloc |
| Linux kernel · memory | process তৈরি, mmap, page table |
| Hardware | RAM, CPU cache, CPU core |

::: tip মূল কথা
network আর memory, দুটোই kernel এর হাতে। Python process কে দুটোর জন্যই system call দিয়ে kernel এর কাছে চাইতে হয়। system call তুলনামূলক ধীর, তাই pymalloc এর মতো জিনিস আগে থেকে memory জমিয়ে রাখে।
:::
