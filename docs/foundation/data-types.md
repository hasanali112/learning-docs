# Data Type

Data type বলে দেয় একটা মান memory তে **কত byte** জায়গা নেবে আর ওই byte গুলোকে **কীভাবে পড়তে হবে** (পূর্ণসংখ্যা, দশমিক, অক্ষর)।

## C

### মূল type গুলো

C তে variable বানানোর সময়েই type বলে দিতে হয়, পরে আর বদলানো যায় না।

```c
int age = 25;          // পূর্ণসংখ্যা
char grade = 'A';      // একটা অক্ষর
float price = 9.5f;    // ছোট দশমিক
double pi = 3.14159;   // বড়, বেশি নির্ভুল দশমিক
```

| Type | সাধারণ size | কী রাখে | মানের সীমা (মোটামুটি) |
| --- | --- | --- | --- |
| `char` | 1 byte | একটা অক্ষর বা ছোট সংখ্যা | -128 থেকে 127 |
| `short` | 2 byte | ছোট পূর্ণসংখ্যা | -32,768 থেকে 32,767 |
| `int` | 4 byte | পূর্ণসংখ্যা | প্রায় -2.1 বিলিয়ন থেকে 2.1 বিলিয়ন |
| `long` | 8 byte (macOS/Linux), 4 byte (Windows) | বড় পূর্ণসংখ্যা | platform অনুযায়ী |
| `long long` | 8 byte | খুব বড় পূর্ণসংখ্যা | প্রায় ±9.2 × 10^18 |
| `float` | 4 byte | দশমিক | প্রায় 7 অঙ্ক নির্ভুল |
| `double` | 8 byte | দশমিক | প্রায় 15-16 অঙ্ক নির্ভুল |

::: tip size নিজে দেখো
C standard শুধু সর্বনিম্ন size বলে দেয়, ঠিক size বলে না। তাই নিজের মেশিনে `sizeof` দিয়ে দেখো:

```c
printf("%zu\n", sizeof(int));     // 4
printf("%zu\n", sizeof(long));    // macOS এ 8
```
:::

### char আসলে একটা সংখ্যা

```c
char c = 'A';
printf("%c\n", c);   // A
printf("%d\n", c);   // 65
```

memory তে `'A'` জমা থাকে সংখ্যা `65` হিসেবে (ASCII কোড)। `%c` দিলে অক্ষর দেখায়, `%d` দিলে সংখ্যা।

### unsigned: শুধু ধনাত্মক

```c
unsigned int count = 4000000000u;   // int এ ধরতো না, unsigned এ ধরে
```

`unsigned` দিলে negative অংশ বাদ যায়, তাই ধনাত্মক দিকে দ্বিগুণ জায়গা পাওয়া যায়। `unsigned int` এর সীমা 0 থেকে প্রায় 4.29 বিলিয়ন।

### নির্দিষ্ট size চাইলে

```c
#include <stdint.h>

int32_t a;    // সব মেশিনে ঠিক 4 byte
int64_t b;    // সব মেশিনে ঠিক 8 byte
uint8_t c;    // ঠিক 1 byte, 0 থেকে 255
```

### bool

```c
#include <stdbool.h>

bool done = true;   // আসলে 1 হিসেবে জমা থাকে
```

C তে মূলত `0` মানে false, বাকি সব true।

### সাবধানতা

- **ভেতরের (local) variable এ মান না দিলে garbage।** `int x; printf("%d", x);` যেকোনো আজব সংখ্যা দেখাতে পারে।
- **signed overflow হলো undefined behavior।** `int` এর সর্বোচ্চ মানে 1 যোগ করলে কী হবে C কোনো নিশ্চয়তা দেয় না।
- **unsigned overflow ঘুরে আসে।** `unsigned` এর সর্বোচ্চ মানে 1 যোগ করলে 0 হয়ে যায়।
- **দুটো int ভাগ করলে দশমিক কাটা যায়।** `5 / 2` হয় `2`। দশমিক চাইলে `5.0 / 2` লেখো।

## অন্য ভাষায় একই জিনিস

### C++

C এর সব type C++ এও আছে, size একই। নতুন যা পাওয়া যায়:

```cpp
#include <string>
#include <cstdint>

bool ok = true;              // bool নিজেই একটা type, header লাগে না
std::string name = "Hasan";  // আসল string type
int64_t big = 9000000000;    // নির্দিষ্ট size
auto x = 3.14;               // compiler নিজেই বুঝে নেয়: double
```

`auto` দিলেও type compile এর সময়েই ঠিক হয়ে যায়, পরে বদলায় না।

### JavaScript

JavaScript এ সংখ্যার জন্য মূলত **একটাই type: `number`**। পূর্ণসংখ্যা আর দশমিক দুটোই 64-bit double (C এর `double`) হিসেবে থাকে।

```js
let age = 25;         // number
let pi = 3.14;        // এটাও number
let big = 2n ** 64n;  // bigint: যত বড় খুশি পূর্ণসংখ্যা
let name = "Hasan";   // string
let ok = true;        // boolean
let x;                // undefined
let y = null;         // null

console.log(typeof age);  // "number"
```

- type variable এর নয়, **মানের**। একই variable এ পরে string রাখা যায়।
- নির্ভুল পূর্ণসংখ্যার সীমা `Number.MAX_SAFE_INTEGER` = 9,007,199,254,740,991 (2^53 - 1)। এর বেশি হলে `bigint` লাগে।
- `5 / 2` হয় `2.5`, কারণ সবই double।
- `0.1 + 0.2` হয় `0.30000000000000004`। এটা double এর স্বভাব, C তেও একই হয়।

### Python

Python এ variable হলো একটা **নাম**, যেটা heap এর একটা object কে দেখায়। type থাকে object এর গায়ে।

```python
age = 25          # int
pi = 3.14         # float (C এর double)
name = "Hasan"    # str
ok = True         # bool
x = None          # কিছু নেই

print(type(age))  # <class 'int'>
```

- **`int` এর কোনো সীমা নেই।** `2 ** 100` সহজেই হিসাব হয়, overflow হয় না। দাম হিসেবে প্রতিটা int একটা পুরো object, ছোট সংখ্যাও প্রায় 28 byte নেয় (`sys.getsizeof(1)`)।
- `float` সবসময় 64-bit double।
- `5 / 2` হয় `2.5`, আর `5 // 2` হয় `2` (C এর মতো ভাগ)।
- `bool` আসলে `int` এর একটা প্রকার: `True + True` হয় `2`।

### Rust

Rust এ type এর নামেই size লেখা থাকে, তাই অনুমান করতে হয় না।

```rust
let age: i32 = 25;        // signed, 32 bit = 4 byte (C এর int)
let count: u64 = 4_000_000_000;  // unsigned, 8 byte
let pi: f64 = 3.14;       // C এর double
let ok: bool = true;
let c: char = 'অ';        // 4 byte, যেকোনো Unicode অক্ষর
let x = 10;               // type না দিলে i32 ধরে নেয়
```

| পূর্ণসংখ্যা | size |
| --- | --- |
| `i8` / `u8` | 1 byte |
| `i16` / `u16` | 2 byte |
| `i32` / `u32` | 4 byte |
| `i64` / `u64` | 8 byte |
| `i128` / `u128` | 16 byte |
| `isize` / `usize` | মেশিনের pointer এর সমান (64-bit এ 8 byte) |

- **মান না দিয়ে variable ব্যবহার করলে compile error।** C এর মতো garbage পড়ার সুযোগই নেই।
- **overflow:** debug build এ প্রোগ্রাম panic করে থেমে যায়, release build এ ঘুরে আসে। ইচ্ছা করে নিয়ন্ত্রণ করতে `checked_add`, `wrapping_add` আছে।
- `char` C এর মতো 1 byte নয়, 4 byte। তাই বাংলা অক্ষরও একটা `char` এ ধরে।
- আলাদা type এর মধ্যে নিজে থেকে রূপান্তর হয় না: `i32 + i64` হলে error, `as` দিয়ে বদলাতে হয়।

### Dart

```dart
int age = 25;          // native এ 64-bit পূর্ণসংখ্যা
double pi = 3.14;      // 64-bit double
num any = 10;          // int বা double যেকোনোটা
String name = 'Hasan';
bool ok = true;
var x = 10;            // type নিজে বুঝে নেয়: int, পরে বদলানো যায় না

int? maybe;            // ? দিলে null রাখা যায়
```

- Dart এ সবকিছুই object, `int` ও।
- **Null safety:** সাধারণ `int` এ `null` রাখা যায় না। `null` রাখতে চাইলে `int?` লিখতে হয়।
- Flutter web এ compile হলে `int` আসলে JavaScript এর `number` হয়ে যায়, তাই 2^53 এর বেশি নির্ভুল থাকে না।
- `5 / 2` হয় `2.5`, আর `5 ~/ 2` হয় `2`।

### Java

Java তে size সব মেশিনে **একই**, এটা ভাষার নিয়মেই বাঁধা।

```java
byte b = 10;         // 1 byte
short s = 1000;      // 2 byte
int age = 25;        // 4 byte
long big = 9000000000L;  // 8 byte
float f = 9.5f;      // 4 byte
double pi = 3.14;    // 8 byte
char c = 'A';        // 2 byte (UTF-16)
boolean ok = true;
String name = "Hasan";   // primitive নয়, object
```

- **local variable এ মান না দিয়ে পড়লে compile error।** class এর field হলে নিজে থেকে 0 বা null পায়।
- **overflow ঘুরে আসে** (`Integer.MAX_VALUE + 1` হয় `Integer.MIN_VALUE`), crash বা undefined behavior নেই।
- প্রতিটা primitive এর একটা object রূপ আছে: `int` → `Integer`। collection এ (যেমন `ArrayList`) শুধু object রূপ রাখা যায়।

## সংক্ষেপে তুলনা

| ভাষা | type কখন ঠিক হয় | পূর্ণসংখ্যার size | মান না দিলে | overflow হলে |
| --- | --- | --- | --- | --- |
| C | compile time | platform অনুযায়ী | garbage | signed: undefined behavior |
| C++ | compile time | platform অনুযায়ী | garbage | signed: undefined behavior |
| JavaScript | runtime | একটাই number (double) | `undefined` | নির্ভুলতা হারায় |
| Python | runtime | সীমাহীন | ব্যবহারই করা যায় না (NameError) | হয় না |
| Rust | compile time | নামেই লেখা (`i32`) | compile error | debug এ panic |
| Dart | compile time | 64-bit | non-null হলে compile error | ঘুরে আসে |
| Java | compile time | সব মেশিনে একই | local হলে compile error | ঘুরে আসে |
