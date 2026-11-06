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
