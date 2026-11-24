# Input আর Output

প্রোগ্রাম keyboard (বা `input.txt`) থেকে মান পড়ে, আর screen এ (বা `output.txt` এ) লেখে। C তে এই কাজ করে `scanf` আর `printf`।

## C

### একটা লাইন ভেঙে দেখা

```c
int n;
scanf("%d", &n);
printf("n = %d\n", n);
```

`scanf("%d", &n);` এর তিনটা অংশ:

| অংশ | মানে |
| --- | --- |
| `scanf` | input থেকে লেখা পড়ে, সেটাকে বলা type এ রূপান্তর করে |
| `"%d"` | **format specifier**: "একটা দশমিক পূর্ণসংখ্যা (decimal int) পড়ো" |
| `&n` | **n এর ঠিকানা**: "পড়া মানটা এই ঠিকানায় লিখে দাও" |

### `%d` কী

input আসে শুধু অক্ষর হিসেবে। user `42` টাইপ করলে প্রোগ্রাম পায় দুটো অক্ষর `'4'` আর `'2'`। `%d` বলে দেয় এগুলোকে পূর্ণসংখ্যা `42` বানাতে হবে।

`%` দিয়ে শুরু, তারপর একটা অক্ষর যেটা type বলে দেয়:

| Specifier | Type | উদাহরণ |
| --- | --- | --- |
| `%d` বা `%i` | `int` | `42` |
| `%u` | `unsigned int` | `42` |
| `%ld` | `long` | `42` |
| `%lld` | `long long` | `9000000000` |
| `%f` | `float` (scanf এ), `float`/`double` (printf এ) | `3.140000` |
| `%lf` | `double` (scanf এ অবশ্যই এটা) | `3.14` |
| `%c` | `char` | `A` |
| `%s` | string (`char` এর array) | `Hasan` |
| `%x` | `int` কে hex এ | `2a` |
| `%p` | pointer বা ঠিকানা | `0x16fdff1ac` |
| `%zu` | `size_t` (`sizeof` এর ফল) | `4` |
| `%%` | একটা `%` চিহ্ন | `%` |

::: warning ভুল specifier = ভুল ফল
`double` পড়তে `scanf("%f", &d)` দিলে 8 byte এর জায়গায় 4 byte লেখা হয়, মান উল্টাপাল্টা আসে। `double` হলে scanf এ সবসময় `%lf`।
:::

printf এ বাড়তি নিয়ন্ত্রণ:

```c
printf("[%5d]\n", 42);     // [   42]  মোট 5 ঘর, ডান দিকে সাজানো
printf("[%-5d]\n", 42);    // [42   ]  বাম দিকে সাজানো
printf("[%05d]\n", 42);    // [00042]  খালি ঘরে 0
printf("%.2f\n", 3.14159); // 3.14     দশমিকের পরে 2 অঙ্ক
```

### `&n` কী, আর কেন লাগে

`&` হলো **address-of operator**। `&n` মানে "memory তে `n` কোথায় বসে আছে, সেই ঠিকানা"।

```txt
memory
┌──────────────┐
│   n = ???    │  ← ঠিকানা 0x16fdff1ac
└──────────────┘

scanf("%d", &n)  →  scanf পায় 0x16fdff1ac
                 →  ওই ঠিকানায় 42 লিখে দেয়
                 →  এখন n = 42
```

কেন লাগে: C তে function এ কিছু পাঠালে **মানের একটা কপি** যায়।

- `scanf("%d", n)` লিখলে scanf পায় `n` এর ভেতরের garbage মান, `n` কোথায় আছে সেটা জানে না। ওই garbage কে ঠিকানা ভেবে লিখতে গেলে প্রোগ্রাম crash করতে পারে।
- `scanf("%d", &n)` লিখলে scanf পায় ঠিকানা, তাই আসল `n` টাই বদলাতে পারে।

printf এ `&` লাগে না, কারণ printf শুধু মান পড়ে, বদলায় না: `printf("%d", n);`

::: tip string এ & লাগে না
```c
char name[50];
scanf("%49s", name);   // & নেই
```
array এর নাম নিজেই প্রথম ঘরের ঠিকানা হিসেবে কাজ করে, তাই `&` দিতে হয় না। `%49s` দিলে 49 অক্ষরের বেশি পড়বে না, array উপচে পড়বে না।
:::

### একসাথে অনেকগুলো পড়া

```c
int a, b;
scanf("%d %d", &a, &b);     // input: 3 5   বা   3⏎5
```

`%d` নিজেই শুরুর ফাঁকা জায়গা, tab আর নতুন লাইন বাদ দিয়ে পড়ে। তাই মানগুলো এক লাইনে থাকুক বা আলাদা লাইনে, দুইভাবেই কাজ করে।

### scanf এর return মান

```c
if (scanf("%d", &n) != 1) {
    printf("সংখ্যা দাওনি\n");
}
```

scanf ফেরত দেয় **কয়টা মান সফলভাবে পড়েছে**। input শেষ হয়ে গেলে ফেরত দেয় `EOF`। input যতক্ষণ আছে ততক্ষণ পড়তে:

```c
while (scanf("%d", &x) == 1) {
    // x নিয়ে কাজ
}
```

### `%c` এর ফাঁদ

```c
int n;
char c;
scanf("%d", &n);     // input: 5⏎
scanf("%c", &c);     // c পায় '\n', নতুন অক্ষর নয়!
```

`%d` সংখ্যা পড়ার পর Enter এর `'\n'` input এ রেখে দেয়। `%c` কিছু বাদ দেয় না, তাই সেটাই পড়ে ফেলে। সমাধান হলো `%c` এর আগে একটা space দেওয়া: `scanf(" %c", &c);`

## অন্য ভাষায় একই জিনিস

### C++

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;                  // %d বা & কিছুই লাগে না
    cout << "n = " << n << "\n";
}
```

- `cin` নিজেই variable এর type দেখে বোঝে কী পড়তে হবে, তাই format specifier লাগে না।
- `&` লাগে না, কারণ C++ এ `cin` variable টা **reference** হিসেবে পায়। reference মানে ভেতরে ভেতরে ঠিকানাই যায়, শুধু লিখতে হয় না।
- অনেক input থাকলে দ্রুত করতে main এর শুরুতে `ios::sync_with_stdio(false); cin.tie(nullptr);` দাও।
- দশমিক নির্দিষ্ট ঘরে দেখাতে: `cout << fixed << setprecision(2) << x;` (`<iomanip>` লাগে)।

### JavaScript (Node.js)

JavaScript এ scanf এর মতো ধাপে ধাপে পড়ার built-in উপায় নেই। সাধারণত পুরো input একবারে পড়ে টুকরো করা হয়:

```js
const data = require("fs").readFileSync(0, "utf8").trim().split(/\s+/);
let i = 0;
const n = Number(data[i++]);   // লেখা থেকে সংখ্যা
console.log(`n = ${n}`);
console.log(n.toFixed(2));     // printf("%.2f") এর মতো
```

- `readFileSync(0)` এ `0` মানে stdin (keyboard বা `input.txt`)।
- পড়া সবকিছু string, তাই `Number()` বা `parseInt()` দিয়ে রূপান্তর করতে হয়।
- ঠিকানা বা `&` এর ধারণা নেই, মান ফেরত আসে আর variable এ রাখা হয়।

### Python

```python
n = int(input())                     # একটা লাইন পড়ে int বানাও
a, b = map(int, input().split())     # এক লাইনে 3 5
print(f"n = {n}")
print(f"{3.14159:.2f}")              # 3.14
```

- `input()` সবসময় **একটা পুরো লাইন string হিসেবে** দেয়। তাই `int()` দিয়ে রূপান্তর করতে হয়, এটাই `%d` এর কাজ।
- `split()` ফাঁকা জায়গা ধরে ভাগ করে।
- `&` লাগে না: `input()` নতুন object ফেরত দেয়, `n` নামটা সেটাকে দেখায়।
- অনেক input হলে `import sys` করে `sys.stdin.readline()` দ্রুত।

### Rust

```rust
use std::io;

fn main() {
    let mut line = String::new();
    io::stdin().read_line(&mut line).unwrap();   // এখানে &mut!
    let n: i32 = line.trim().parse().unwrap();
    println!("n = {}", n);
    println!("{:.2}", 3.14159);                  // 3.14
}
```

- `&mut line` ঠিক C এর `&n` এর মতো ভাবনা: "আমার variable এর ঠিকানা দিলাম, এখানে লিখে দাও"। পার্থক্য হলো Rust এ বলে দিতে হয় এটা **বদলানো যাবে** (`mut`), আর compiler নিশ্চিত করে ঠিকানাটা সবসময় বৈধ।
- `read_line` লাইনের শেষের `'\n'` সহ পড়ে, তাই `trim()` দরকার।
- `parse()` সংখ্যা না পেলে error দেয়, `unwrap()` সেই error এ প্রোগ্রাম থামায়।

### Dart

```dart
import 'dart:io';

void main() {
  String? line = stdin.readLineSync();   // input শেষ হলে null
  int n = int.parse(line!.trim());
  print('n = $n');
  print(3.14159.toStringAsFixed(2));     // 3.14
}
```

- `readLineSync()` ফেরত দেয় `String?`, কারণ input না থাকলে `null` আসতে পারে। `!` দিয়ে বলছি "null নয়, আমি নিশ্চিত"।
- `int.parse()` হলো `%d` এর কাজ।
- Flutter app এ stdin নেই, সেখানে input আসে `TextField` থেকে।

### Java

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println("n = " + n);
        System.out.printf("%.2f%n", 3.14159);   // C এর মতোই %!
    }
}
```

- `nextInt()`, `nextDouble()`, `next()`: method এর নামেই type বলা, তাই `%d` লাগে না।
- `&` নেই: `nextInt()` মান ফেরত দেয়।
- Java এর `printf` C এর মতোই `%d`, `%f`, `%s` বোঝে। নতুন লাইনের জন্য `%n`।
- অনেক input হলে `Scanner` ধীর, তখন `BufferedReader` ব্যবহার করা হয়।

## সংক্ষেপে তুলনা

| ভাষা | পড়া | type বলার উপায় | ঠিকানা দিতে হয়? | লেখা |
| --- | --- | --- | --- | --- |
| C | `scanf("%d", &n)` | format specifier | হ্যাঁ, `&n` | `printf("%d", n)` |
| C++ | `cin >> n` | variable এর type দেখে | না (reference) | `cout << n` |
| JavaScript | `readFileSync(0)` | `Number()` | না | `console.log(n)` |
| Python | `int(input())` | `int()` | না | `print(n)` |
| Rust | `read_line(&mut s)` | `parse()` | হ্যাঁ, `&mut s` | `println!("{}", n)` |
| Dart | `stdin.readLineSync()` | `int.parse()` | না | `print(n)` |
| Java | `sc.nextInt()` | method এর নাম | না | `System.out.println(n)` |
