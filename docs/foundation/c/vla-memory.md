# Array: `int arr[n]` আর memory

`int arr[n];` লিখলে memory কখন, কোথায়, কীভাবে নেওয়া হয়?

## VLA কী

```c
int n;
scanf("%d", &n);
int arr[n];
```

এখানে array এর size `n` compile এর সময় জানা নেই, প্রোগ্রাম চলার সময় (runtime) জানা যায়। এরকম array কে বলে **VLA (Variable Length Array)**। C99 থেকে C তে আছে।

## ধাপে ধাপে কী হয়

```c
int n;              // ১. stack এ n এর জন্য 4 byte আগেই রাখা আছে
scanf("%d", &n);    // ২. ধরো user দিল 5, তাহলে n = 5
int arr[n];         // ৩. এই লাইনে পৌঁছালে memory allocate হয়
```

৩ নম্বর লাইনে:

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
│   arr[2]     │  ← 20 byte, পাশাপাশি (contiguous)
│   arr[1]     │
│   arr[0]     │  ← arr এখান থেকে শুরু
└──────────────┘  ← stack pointer এখানে নামলো
নিচু address
```

এটা খুব দ্রুত, কারণ শুধু একটা register (stack pointer) থেকে একটা সংখ্যা বিয়োগ হয়। `malloc` এর মতো kernel বা allocator এর কাছে জায়গা চাইতে হয় না।

## মূল বৈশিষ্ট্য

| বিষয় | ব্যাখ্যা |
| --- | --- |
| কখন allocate | declaration লাইনে পৌঁছালে, প্রোগ্রাম শুরুতে নয় |
| কোথায় | stack এ, heap এ নয় |
| শুরুর মান | garbage থাকে, 0 নয় |
| কখন free | যে `{ }` block এ declare, সেখান থেকে বের হলে নিজে থেকেই |
| পরে size বদলানো | যায় না, পরে `n` বদলালেও `arr` এর size আগের মতোই |

::: warning initialize করা যায় না
`int arr[n] = {0};` লিখলে compile error। শূন্য করতে চাইলে loop চালাও বা `memset(arr, 0, sizeof(arr));` দাও।
:::

## সাবধানতা

- **`n` আগে set করতে হবে।** `scanf` এর আগে `int arr[n];` লিখলে `n` এ garbage থাকে, তখন undefined behavior।
- **`n` বেশি বড় হলে crash।** macOS এ main এর stack মোটামুটি **8 MB**। `n = 10000000` দিলে লাগে 40 MB, ফলে **stack overflow** হয়ে segmentation fault।
- **`n` অবশ্যই 0 এর বেশি।** 0 বা negative দিলে undefined behavior।

বড় array লাগলে `malloc` দিয়ে heap থেকে নাও:

```c
int *arr = malloc(n * sizeof(int));
// ... কাজ ...
free(arr);
```

## নিজে যাচাই

```c
for (int i = 0; i < n; i++) {
    printf("arr[%d] address = %p\n", i, (void*)&arr[i]);
}
printf("n address      = %p\n", (void*)&n);
```

পরপর দুটো element এর ঠিকানার পার্থক্য ঠিক **4** (একটা `int` এর size)। মানে element গুলো memory তে পাশাপাশি বসানো।
