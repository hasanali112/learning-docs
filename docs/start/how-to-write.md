# নতুন নোট কীভাবে লিখবো

## চালু করা

```bash
cd "/home/hasan/My Project/Arvion/learning-docs"
npm run dev
```

browser এ `http://localhost:5173` খোলো। ফাইল save করলেই পেজ নিজে থেকে আপডেট হয়।

## নতুন নোট যোগ করা

**১. ফাইল বানাও।** `docs/` এর ভেতরে বিষয়ের ফোল্ডারে একটা `.md` ফাইল:

```txt
docs/fastapi/dependency-injection.md
```

**২. লেখো।** প্রথম লাইনে `#` দিয়ে শিরোনাম, তারপর `##` আর `###` দিয়ে অংশ। ডান পাশের **এই পেজে** অংশে এগুলোই দেখায়।

```md
# Dependency Injection

## কী জিনিস

## কেন লাগে
```

**৩. মেনুতে যোগ করো।** `docs/.vitepress/sidebar.ts` এ ঠিক group এর ভেতরে:

```ts
{ text: 'Dependency Injection', link: '/fastapi/dependency-injection' },
```

নতুন বিষয় হলে নতুন group:

```ts
{
  text: 'System Design',
  collapsed: false,
  items: [
    { text: 'Design Pattern', link: '/system-design/design-pattern' },
  ],
},
```

breadcrumb (উপরের "FastAPI › Dependency Injection") এই sidebar থেকেই নিজে তৈরি হয়।

## কাজের কিছু জিনিস

### টিপ আর সতর্কতার বাক্স

```md
::: tip মনে রাখার কৌশল
লেখা
:::

::: warning সাবধান
লেখা
:::

::: details লুকানো অংশ (ক্লিক করলে খোলে)
লেখা
:::
```

::: tip দেখতে এরকম
এটা একটা tip বাক্স।
:::

### কোড

তিনটা backtick এর পরে ভাষার নাম দিলে রং হয়: `python`, `bash`, `ts`, `rust`। লাইন হাইলাইট করতে:

````md
```python{2}
def hello():
    print("এই লাইন হাইলাইট হবে")
```
````

### অন্য নোটের লিংক

```md
[Bytecode আর compile](/python/bytecode)
```

::: warning ভাঙা লিংক
এমন কোনো নোটের লিংক দিলে যেটা নেই, `npm run build` error দেবে। এতে ভুল লিংক আগেই ধরা পড়ে।
:::

### Markdown এ যা এড়াতে হবে

VitePress Markdown কে Vue দিয়ে পড়ে। তাই সাধারণ লেখায় (কোড ব্লকের বাইরে) দুটো জোড়া বাঁকা বন্ধনী আর খালি `<` `>` চিহ্ন এড়িয়ে চলো, এগুলো কোড ব্লক বা backtick এর ভেতরে লেখো।

## GitHub Pages এ তোলা

শুধু প্রথমবার:

```bash
cd "/home/hasan/My Project/Arvion/learning-docs"
git init
git add .
git commit -m "docs: প্রথম নোট"
git branch -M main
git remote add origin https://github.com/<তোমার-username>/learning-docs.git
git push -u origin main
```

তারপর GitHub এ repo এর **Settings → Pages → Build and deployment → Source** এ **GitHub Actions** বেছে নাও। কয়েক মিনিট পর সাইট এখানে চলে আসবে:

```txt
https://<তোমার-username>.github.io/learning-docs/
```

এরপর থেকে নতুন নোট লিখে শুধু push করলেই হবে:

```bash
git add .
git commit -m "docs: dependency injection নোট"
git push
```

`.github/workflows/deploy.yml` প্রতিটা push এ নিজে থেকে build করে সাইট আপডেট করে। repo এর নাম যাই হোক, সঠিক ঠিকানা workflow নিজেই ঠিক করে নেয়।
