# Array

Array হলো একই type এর অনেকগুলো মান, memory তে **পাশাপাশি** (contiguous) সাজানো। প্রতিটা ঘরকে তার নম্বর (index) দিয়ে ধরা যায়।

## C

### বানানো আর মান দেওয়া

```c
int a[5];                   // 5 টা int এর জায়গা, মান garbage
int b[5] = {10, 20, 30};    // বাকি দুটো নিজে থেকে 0
int c[5] = {0};             // সবগুলো 0
int d[] = {1, 2, 3};        // size নিজে গুনে নেয়: 3
```

- index শুরু হয় **0** থেকে। `int a[5]` এর ঘরগুলো `a[0]` থেকে `a[4]`।
- size পরে বদলানো যায় না।

### memory তে কীভাবে বসে

```c
int b[5] = {10, 20, 30, 40, 50};
```

```txt
ঠিকানা    0x1000  0x1004  0x1008  0x100C  0x1010
        ┌───────┬───────┬───────┬───────┬───────┐
        │  10   │  20   │  30   │  40   │  50   │
        └───────┴───────┴───────┴───────┴───────┘
          b[0]    b[1]    b[2]    b[3]    b[4]
```

প্রতিটা `int` 4 byte, তাই ঠিকানা 4 করে বাড়ে। `b[i]` এর ঠিকানা = শুরুর ঠিকানা + `i × 4`। এই হিসাব এক ধাপেই হয়, তাই যেকোনো index এ যাওয়া সমান দ্রুত।

### loop দিয়ে পড়া আর লেখা

```c
int n = 5;
int a[5];
for (int i = 0; i < n; i++) {
    scanf("%d", &a[i]);      // a[i] এর ঠিকানা দিচ্ছি
}
for (int i = 0; i < n; i++) {
    printf("%d ", a[i]);
}
```

`&a[i]` মানে "`a` এর i নম্বর ঘরের ঠিকানা"। কেন `&` লাগে সেটা [Input আর Output](/foundation/input-output) নোটে আছে।

### size বের করা

```c
int a[5];
int len = sizeof(a) / sizeof(a[0]);   // 20 / 4 = 5
```

::: warning function এর ভেতরে এটা কাজ করে না
array কে function এ পাঠালে শুধু প্রথম ঘরের ঠিকানা যায়, পুরো array যায় না। তখন `sizeof(a)` দেয় pointer এর size (8), array এর নয়। তাই function এ size আলাদা করে পাঠাতে হয়:

```c
void print(int a[], int n) { ... }
```
:::

### সীমার বাইরে গেলে

```c
int a[5];
a[5] = 99;    // ঘর নেই! কিন্তু C আটকায় না
```

C কোনো সীমা পরীক্ষা (bounds check) করে না। `a[5]` এর ঠিকানায় অন্য কারও memory থাকতে পারে, সেটা নষ্ট হয়। ফল undefined behavior: কখনো কিছু হয় না, কখনো crash, কখনো অন্য variable এর মান বদলে যায়।

### runtime এ size: `int arr[n]` (VLA)

```c
int n;              // ১. stack এ n এর জন্য 4 byte আগেই রাখা আছে
scanf("%d", &n);    // ২. ধরো user দিল 5
int arr[n];         // ৩. এই লাইনে পৌঁছালে memory নেওয়া হয়
```

size `n` compile এর সময় জানা নেই, প্রোগ্রাম চলার সময় জানা যায়। এরকম array কে বলে **VLA (Variable Length Array)**, C99 থেকে আছে।

৩ নম্বর লাইনে যা হয়:

1. কতটা জায়গা লাগবে হিসাব হয়: `n × sizeof(int)` = `5 × 4` = **20 byte**।
2. **Stack pointer** (stack এর বর্তমান শেষ মাথা) 20 byte নিচে নামে। stack উপর থেকে নিচের দিকে বাড়ে।
3. ওই 20 byte এর শুরুর ঠিকানাটাই হয় `arr`।

```txt
উঁচু address
┌──────────────┐
│    n = 5     │  ← আগেই ছিল
├──────────────┤
│   arr[4]     │
│   arr[3]     │
│   arr[2]     │  ← 20 byte, পাশাপাশি
│   arr[1]     │
│   arr[0]     │  ← arr এখান থেকে শুরু
└──────────────┘  ← stack pointer এখানে নামলো
নিচু address
```

শুধু একটা register থেকে একটা সংখ্যা বিয়োগ হয়, তাই খুব দ্রুত। `malloc` এর মতো allocator এর কাছে জায়গা চাইতে হয় না।

| বিষয় | `int arr[n]` (VLA) |
| --- | --- |
| কখন memory নেয় | declaration লাইনে পৌঁছালে |
| কোথায় | stack এ |
| শুরুর মান | garbage |
| কখন ছাড়ে | যে `{ }` block এ declare, সেখান থেকে বের হলে নিজে থেকেই |
| পরে size বদলানো | যায় না, পরে `n` বদলালেও `arr` আগের size এই থাকে |

::: warning VLA এর সাবধানতা
- `int arr[n] = {0};` লেখা যায় না, compile error। শূন্য করতে loop চালাও।
- `n` আগে set করতে হবে। `scanf` এর আগে `int arr[n];` লিখলে `n` এ garbage।
- `n` অবশ্যই 0 এর বেশি হতে হবে।
- `n` বেশি বড় হলে **stack overflow**। macOS এ main এর stack মোটামুটি 8 MB, `n = 10000000` দিলে লাগে 40 MB, ফলে segmentation fault।
:::

### বড় বা পরিবর্তনশীল array: `malloc`

```c
#include <stdlib.h>

int *arr = malloc(n * sizeof(int));   // heap থেকে জায়গা
if (arr == NULL) { /* জায়গা পাওয়া যায়নি */ }
// ... arr[i] আগের মতোই ব্যবহার ...
free(arr);                            // নিজে ফেরত দিতে হবে
```

heap অনেক বড়, তাই বড় array এখানে নিরাপদ। `realloc` দিয়ে পরে size বাড়ানোও যায়। কিন্তু `free` ভুলে গেলে memory leak হয়।

### নিজে যাচাই

```c
for (int i = 0; i < n; i++) {
    printf("arr[%d] address = %p\n", i, (void*)&arr[i]);
}
```

পরপর দুটো ঘরের ঠিকানার পার্থক্য ঠিক **4**, মানে ঘরগুলো পাশাপাশি।

## অন্য ভাষায় একই জিনিস

### C++

C এর array C++ এও হুবহু চলে। কিন্তু C++ এ সাধারণত এই দুটো ব্যবহার করা হয়:

```cpp
#include <array>
#include <vector>

std::array<int, 5> a = {1, 2, 3};   // size compile time এ, C array এর মতো
std::vector<int> v(n);              // runtime size, সব 0, heap এ
v.push_back(42);                    // size বাড়ানো যায়
v.size();                           // size নিজেই জানে
v.at(10);                           // সীমার বাইরে হলে exception
v[10];                              // C এর মতো, কোনো পরীক্ষা নেই
```

- `vector` এর ভেতরের ঘরগুলোও পাশাপাশি থাকে, C array এর মতোই দ্রুত।
- `vector` scope শেষে নিজেই memory ছেড়ে দেয়, `free` লাগে না।
- standard C++ এ VLA নেই। `int arr[n]` g++ এ চলে শুধু compiler এর বাড়তি সুবিধা হিসেবে, তাই `vector` ব্যবহার করো।

### JavaScript

```js
const a = [10, 20, 30];
a.push(40);            // যত খুশি বাড়ানো যায়
a.length;              // 4
a[10];                 // undefined, error নয়
const mixed = [1, "hi", true];   // আলাদা type একসাথে

const nums = new Int32Array(5);  // C এর int array এর মতো
```

- সাধারণ `Array` একটা object। engine (V8) সব ঘর একই type হলে ভেতরে ভেতরে পাশাপাশি রাখে, না হলে ধীর পদ্ধতিতে চলে যায়।
- সীমার বাইরে পড়লে `undefined` আসে, লিখলে array বড় হয়ে যায়।
- `Int32Array` এর মতো **typed array** সত্যিকারের পাশাপাশি 4 byte এর ঘর, size নির্দিষ্ট, সব 0 দিয়ে শুরু।

### Python

```python
a = [10, 20, 30]       # list
a.append(40)
len(a)                 # 4
a[-1]                  # 40, শেষ থেকে গোনা
a[10]                  # IndexError
n = int(input())
arr = [0] * n          # runtime size, সব 0
```

- Python এর `list` এ ঘরগুলোতে **মান নয়, object এর ঠিকানা** থাকে। ঠিকানাগুলো পাশাপাশি, কিন্তু আসল সংখ্যাগুলো heap এর বিভিন্ন জায়গায় ছড়ানো।
- তাই আলাদা type একসাথে রাখা যায়, কিন্তু memory বেশি লাগে আর ধীর।
- `append` দ্রুত, কারণ list দরকারের চেয়ে একটু বেশি জায়গা আগেই নিয়ে রাখে।
- C এর মতো পাশাপাশি সংখ্যা দরকার হলে `array` module বা `numpy`।

### Rust

```rust
let a: [i32; 5] = [10, 20, 30, 40, 50];  // size compile time এ, stack এ
let b = [0; 5];                          // পাঁচটা 0
let len = a.len();                       // size নিজেই জানে

let n = 5;
let mut v: Vec<i32> = vec![0; n];        // runtime size, heap এ
v.push(42);
```

- `[i32; 5]` এ size type এর অংশ। `[i32; 5]` আর `[i32; 6]` আলাদা type।
- runtime size এর জন্য Rust এ VLA নেই, `Vec` ব্যবহার করা হয়।
- **সীমার বাইরে গেলে panic**, প্রোগ্রাম নিরাপদে থামে। C এর মতো অন্যের memory নষ্ট হয় না।
- `v.get(10)` দিলে panic না করে `None` ফেরত দেয়।
- `Vec` scope শেষে নিজেই memory ছেড়ে দেয়।

### Dart

```dart
var a = [10, 20, 30];               // List<int>, বাড়ানো যায়
a.add(40);
a.length;                           // 4

int n = 5;
var fixed = List<int>.filled(n, 0); // n টা 0, size নির্দিষ্ট
fixed.add(1);                       // error: fixed-length
a[10];                              // RangeError
```

- Dart এ আলাদা array type নেই, সবই `List`।
- `List.filled(n, 0)` C এর `int arr[n]` এর সবচেয়ে কাছের জিনিস, কিন্তু heap এ থাকে আর সব ঘর 0 দিয়ে শুরু হয়।
- পাশাপাশি সংখ্যা দরকার হলে `dart:typed_data` এর `Int32List`।

### Java

```java
int[] a = new int[5];           // সব 0 দিয়ে শুরু
int[] b = {10, 20, 30};
int n = sc.nextInt();
int[] arr = new int[n];         // runtime size চলে
a.length;                       // 5 (method নয়, field)
a[5] = 1;                       // ArrayIndexOutOfBoundsException

import java.util.ArrayList;
ArrayList<Integer> list = new ArrayList<>();
list.add(42);                   // বাড়ানো যায়
```

- Java তে array সবসময় **heap এ** থাকে। `a` variable এ থাকে শুধু তার reference।
- নিজে থেকে 0 (বা `false`, `null`) দিয়ে শুরু হয়, garbage কখনো থাকে না।
- `new int[n]` runtime size নেয়, তাই VLA এর দরকার নেই।
- `ArrayList<Integer>` এ `int` রাখা যায় না, `Integer` object রাখতে হয়। তাই `int[]` এর চেয়ে বেশি memory লাগে।

## সংক্ষেপে তুলনা

| ভাষা | runtime size এর উপায় | কোথায় থাকে | শুরুর মান | সীমার বাইরে গেলে |
| --- | --- | --- | --- | --- |
| C | `int arr[n]` বা `malloc` | stack বা heap | garbage | undefined behavior |
| C++ | `std::vector` | heap | 0 | `[]`: undefined, `.at()`: exception |
| JavaScript | `[]`, `new Int32Array(n)` | heap | typed array এ 0 | `undefined` |
| Python | `[0] * n` | heap (ঠিকানার list) | যা দেবে | `IndexError` |
| Rust | `vec![0; n]` | heap | যা দেবে | panic |
| Dart | `List.filled(n, 0)` | heap | যা দেবে | `RangeError` |
| Java | `new int[n]` | heap | 0 | exception |
