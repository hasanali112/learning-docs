<script setup>
const frameFlow = {
  title: 'একটা frame: setState থেকে screen পর্যন্ত',
  nodes: [
    { id: 'set', label: 'setState()', sub: 'মান বদলালো' },
    { id: 'build', label: 'Build', sub: 'Widget tree' },
    { id: 'elem', label: 'Element', sub: 'মিলিয়ে দেখে' },
    { id: 'layout', label: 'Layout', sub: 'মাপ ঠিক করে' },
    { id: 'paint', label: 'Paint', sub: 'screen এ আঁকে' },
  ],
  steps: [
    {
      node: 'set',
      title: '১. তুমি setState() ডাকলে',
      text: 'Flutter সাথে সাথে কিছু আঁকে না। শুধু এই widget কে "dirty" (আবার আঁকতে হবে) বলে চিহ্ন দিয়ে রাখে, আর পরের frame এর জন্য অপেক্ষা করে। একটা frame মানে screen এর একবার আঁকা, সেকেন্ডে ৬০ বা ১২০ বার।',
      code: 'setState(() => _count++);\n// _CounterState → dirty',
    },
    {
      node: 'build', edge: 0,
      title: '২. Build: নতুন Widget tree',
      text: 'পরের frame এ Flutter dirty widget এর build() আবার চালায়। নতুন Widget object গুলো তৈরি হয়। Widget শুধু নকশা (blueprint), বানানো খুব সস্তা, তাই বারবার বানালেও সমস্যা নেই।',
      code: 'Text(\'চাপা হয়েছে 1 বার\')   // নতুন object',
    },
    {
      node: 'elem', edge: 1,
      title: '৩. Element: আগেরটার সাথে মেলায়',
      text: 'Element tree আগের মতোই থাকে। Flutter নতুন widget কে পুরনো Element এর সাথে মেলায়: type আর key একই হলে Element রেখে দেয়, শুধু নতুন props বসায়। State এখানেই থাকে, তাই হারায় না। const widget হলে মেলানোর কাজটাই বাদ যায়।',
      code: 'Element(Text)  ← পুরনোটাই\n  widget = নতুন Text',
    },
    {
      node: 'layout', edge: 2,
      title: '৪. Layout: মাপ আর জায়গা',
      text: 'RenderObject tree তে parent child কে constraint পাঠায় ("সর্বোচ্চ ৩৯০ চওড়া")। child নিজের মাপ ঠিক করে উপরে জানায়। তারপর parent ঠিক করে child কোথায় বসবে। যাদের কিছু বদলায়নি, তাদের layout আবার হয় না।',
      code: 'Constraints go down.\nSizes go up.\nParent sets position.',
    },
    {
      node: 'paint', edge: 3,
      title: '৫. Paint: pixel আঁকা',
      text: 'শেষে RenderObject গুলো নিজেদের আঁকে, আর Flutter এর engine (Impeller) GPU দিয়ে screen এ দেখায়। Flutter Android বা iOS এর নিজস্ব button ব্যবহার করে না, প্রতিটা pixel নিজে আঁকে। এজন্যই দুই platform এ হুবহু একই দেখায়।',
      code: 'RenderParagraph.paint()  → GPU → screen',
    },
  ],
}
</script>

# Flutter শেখার keyword তালিকা

Flutter শিখতে যত keyword জানতে হবে, সব এখানে এক জায়গায় রাখা: Flutter ভেতরে কীভাবে কাজ করে, Dart ভাষার keyword, তারপর Flutter এর widget, package আর tool। প্রতিটার পাশে TypeScript / React / CSS এর মিল দেওয়া আছে।

**কীভাবে পড়বে:**

- **স্তর ১:** এখনই লাগবে, এগুলো ছাড়া কোনো screen বানানো যায় না।
- **স্তর ২:** কয়েকটা screen বানানোর পরেই লাগবে (list, form, data load)।
- **স্তর ৩:** বড় app বা বিশেষ কাজে লাগে, পরে শিখলেও চলবে।
- **✅** মানে Safar app এ এর মধ্যেই ব্যবহার হয়েছে।

::: tip শেখার ক্রম
১. অংশ ০ (Flutter ভেতরে কীভাবে কাজ করে) একবার পড়ে নাও → ২. Dart এর স্তর ১ → ৩. Flutter এর "Widget এর ভিত্তি" আর "Layout" → ৪. Theme আর Navigation → ৫. List, Form, Async → ৬. State management (MVVM) → ৭. Package, Tool, Test → ৮. বাকি সব স্তর ৩।
:::

## অংশ ০: Flutter ভেতরে কীভাবে কাজ করে

এই অংশটা বুঝলে বাকি সব keyword কেন আছে, সেটা পরিষ্কার হয়ে যাবে।

### তিনটা tree

তুমি শুধু Widget লেখো, কিন্তু Flutter ভেতরে তিনটা আলাদা tree রাখে:

```txt
Widget tree              Element tree              RenderObject tree
(তুমি লেখো)              (Flutter রাখে)             (Flutter রাখে)
──────────────           ──────────────            ──────────────
নকশা (blueprint)         জায়গা, State থাকে          মাপ আর আঁকা
প্রতি build এ নতুন       থেকে যায়                    থেকে যায়
খুব সস্তা                = BuildContext             ভারী কাজ

Scaffold        ───→     Element         ───→      RenderBox
 └─ Text        ───→      └─ Element     ───→       └─ RenderParagraph
```

| keyword | কী | React এ | স্তর |
|---|---|---|---|
| Widget tree | তোমার লেখা নকশা। প্রতি build এ নতুন করে বানানো হয়, অপরিবর্তনীয় (immutable) | JSX থেকে তৈরি element | ১ |
| Element tree | widget এর আসল জায়গা। State আর BuildContext এখানে থাকে, build এর মাঝেও থেকে যায় | Fiber tree | ২ |
| RenderObject tree | মাপ মাপে (layout) আর আঁকে (paint) | browser এর layout/paint | ৩ |
| `Element` | tree তে একটা জায়গা। `BuildContext` আসলে একটা Element | Fiber node | ৩ |
| `RenderObject` / `RenderBox` | যে object আসলে মাপ আর আঁকার কাজ করে | DOM node এর layout box | ৩ |
| rebuild | build() আবার চলা। শুধু widget আবার বানায়, Element আর RenderObject যতটা পারে রেখে দেয় | re-render | ১ |
| immutable | widget এর field বদলানো যায় না (সব `final`)। বদলাতে হলে নতুন widget বানাও | props read-only | ১ |

### Constraints এর নিয়ম

Flutter এর layout এর পুরো নিয়ম এক লাইনে:

```txt
Constraints go down. Sizes go up. Parent sets position.
(parent সীমা বলে দেয় → child নিজের মাপ জানায় → parent জায়গা ঠিক করে)
```

| keyword | কী | CSS এ | স্তর |
|---|---|---|---|
| `BoxConstraints` ✅ | সর্বনিম্ন আর সর্বোচ্চ চওড়া/উঁচু | `min-width`, `max-width` | ২ |
| tight constraint | মাপ একটাই, child এর কোনো স্বাধীনতা নেই (`SizedBox(width: 100)`) | `width: 100px` | ২ |
| loose constraint | সর্বোচ্চ সীমা আছে, ছোট হতে পারে (`Center` child কে দেয়) | `max-width` | ২ |
| unbounded | সীমা অসীম (Column এর ভেতরে উপর-নিচে)। এখানে `Expanded` বা `ListView` দিলে error আসে | — | ২ |
| overflow (হলুদ-কালো দাগ) | child parent এর দেওয়া জায়গার চেয়ে বড় হয়ে গেছে | `overflow: visible` হয়ে বাইরে যাওয়া | ১ |

::: warning সবচেয়ে বেশি দেখা error
`RenderFlex overflowed` বা `Vertical viewport was given unbounded height` দেখলে প্রায় সবসময় কারণ constraints। Column এর ভেতরে ListView দিলে `Expanded` দিয়ে মুড়ে দাও, আর Row এর ভেতরে লম্বা Text থাকলে `Expanded` বা `Flexible` দাও।
:::

### একটা frame কীভাবে আঁকা হয়

<FlowSteps v-bind="frameFlow" />

| keyword | কী | স্তর |
|---|---|---|
| frame | screen একবার আঁকা। সেকেন্ডে ৬০ বা ১২০ বার হয় | ২ |
| jank | একটা frame আঁকতে বেশি সময় লাগায় screen আটকে যাওয়া | ২ |
| Impeller / Skia | Flutter এর আঁকার engine, GPU দিয়ে pixel আঁকে | ৩ |
| Dart VM, JIT, AOT | debug এ JIT (Hot Reload চলে), release এ AOT (machine code, দ্রুত) | ৩ |
| Hot Reload কেন কাজ করে | নতুন code দিয়ে build() আবার চলে, কিন্তু Element আর State থেকে যায় | ১ |
| `WidgetsFlutterBinding.ensureInitialized()` | `runApp` এর আগে plugin বা async কাজ করতে হলে প্রথমে ডাকতে হয় | ২ |
| `addPostFrameCallback` | এই frame আঁকা শেষ হলে কিছু করো (যেমন scroll বা dialog) | ৩ |

## অংশ ১: Dart ভাষার keyword

### Variable আর type

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `var` | variable বানায়, type Dart নিজে বুঝে নেয় | `let` | ১ |
| `final` ✅ | একবার মান দেওয়ার পর আর বদলানো যায় না। মান app চলার সময় ঠিক হতে পারে | `const` (variable) / `readonly` | ১ |
| `const` ✅ | মান code লেখার সময়ই জানা, কখনো বদলায় না। widget এর আগে দিলে Flutter বারবার নতুন করে বানায় না | `as const` এর কাছাকাছি | ১ |
| `late` | মান পরে দেওয়া হবে, কিন্তু ব্যবহারের আগে অবশ্যই দেওয়া হবে | `let x!: string` | ২ |
| `late final` | একবারই, পরে দেওয়া হবে | — | ২ |
| `int`, `double`, `num` | পূর্ণ সংখ্যা, দশমিক সংখ্যা, দুটোই | `number` | ১ |
| `String` ✅ | লেখা | `string` | ১ |
| `bool` ✅ | `true` / `false` | `boolean` | ১ |
| `List` ✅ | তালিকা: `List<String>` | `string[]` | ১ |
| `Map` | key-value জোড়া: `Map<String, int>` | `Record<string, number>` / object | ১ |
| `Set` | একই জিনিস দুবার থাকে না এমন তালিকা | `Set` | ২ |
| `Iterable` | যার ওপর loop চলে (List, Set এর parent)। `map()`, `where()` এটাই ফেরত দেয় | iterable | ২ |
| `dynamic` | যেকোনো type, Dart কোনো type check করে না। যত কম পারো ব্যবহার করো | `any` | ২ |
| `Object` / `Object?` | সব type এর parent (null সহ / ছাড়া) | `unknown` এর কাছাকাছি | ২ |
| `void` ✅ | কিছু ফেরত দেয় না | `void` | ১ |
| `Never` | function কখনো ফেরত আসে না (সবসময় error ছোড়ে) | `never` | ৩ |
| `null` | কোনো মান নেই | `null` | ১ |
| `true`, `false` ✅ | bool এর দুই মান | একই | ১ |
| `Function` | যেকোনো function এর type | `Function` | ২ |
| function type | নির্দিষ্ট function এর type: `void Function(int)` | `(n: number) => void` | ২ |
| `typedef` | type এর একটা ছোট নাম দেয় | `type Callback = () => void` | ৩ |
| `DateTime` | তারিখ আর সময় | `Date` | ১ |
| `Duration` | সময়ের দৈর্ঘ্য: `Duration(seconds: 2)` | ms সংখ্যা | ১ |
| `Uri` | link ভেঙে পড়া/বানানো | `URL` | ২ |

### Generics, Records আর Patterns

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| Generic `<T>` ✅ | type কে parameter বানানো: `List<String>`, `State<MainShell>` | `Array<string>` | ১ |
| `T extends ...` | generic type এর সীমা: `<T extends Widget>` | `<T extends Widget>` | ৩ |
| Record | নাম ছাড়া কয়েকটা মান একসাথে: `(String, int)`, পড়তে `r.$1` | tuple `[string, number]` | ২ |
| named record | `({String name, int age})` | `{ name: string; age: number }` | ২ |
| destructuring | `final (name, age) = getUser();` | `const [name, age] = ...` | ২ |
| pattern matching | `switch (shape) { Circle(:final r) => ..., Square() => ... }` | discriminated union + switch | ৩ |
| `if case` | `if (json case {'name': String name})` মিললে তবেই | type guard | ৩ |
| switch expression | `final label = switch (i) { 0 => 'Home', _ => 'অন্য' };` | object lookup / ternary | ২ |
| `_` (pattern এ) | "বাকি যেকোনো কিছু" | `default` | ২ |
| `extension type` | কোনো খরচ ছাড়া পুরনো type এর ওপর নতুন নাম আর নিয়ম: `extension type UserId(int id)` | branded type | ৩ |

### Class আর OOP

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `class` ✅ | class বানায় | `class` | ১ |
| constructor ✅ | class এর নামেই: `const Counter({super.key})` | `constructor()` | ১ |
| named constructor ✅ | একই class এর অন্য constructor: `Image.asset()`, `EdgeInsets.all()` | static factory method | ১ |
| initializer list | constructor এর body এর আগে `:` দিয়ে field বসানো: `Point(x) : _x = x;` | constructor body | ২ |
| `extends` ✅ | parent class থেকে সব পায় (inheritance) | `extends` | ১ |
| `this` ✅ | এই object নিজে। constructor এ `this.name` মানে সরাসরি field এ রাখো | `this` | ১ |
| `super` ✅ | parent class। `super.key` মানে key parent কে দিয়ে দাও | `super` | ১ |
| `static` ✅ | object না বানিয়ে class এর নাম দিয়ে ব্যবহার করা যায়: `NavIcons.home` | `static` | ১ |
| `abstract` ✅ | এই class থেকে সরাসরি object বানানো যায় না, শুধু extends করা যায় | `abstract` | ২ |
| `implements` ✅ | অন্য class এর সব method নিজে লিখে দেবো, এই প্রতিশ্রুতি | `implements` | ২ |
| `interface` | এই ফাইলের বাইরে class টাকে শুধু implements করা যাবে, extends না | `interface` | ৩ |
| `mixin` | একটা ছোট গুচ্ছ method, যা অনেক class এ জুড়ে দেওয়া যায় | কাছাকাছি কিছু নেই (mixin pattern) | ২ |
| `with` | class এ mixin জুড়ে দেয়: `with TickerProviderStateMixin` | — | ২ |
| `sealed` | class এর সব sub-class একই ফাইলে থাকবে। switch এ সব case ধরা পড়ে | discriminated union | ৩ |
| `base` | এই ফাইলের বাইরে class টাকে শুধু extends করা যাবে, implements না | — | ৩ |
| `final class` ✅ | এই ফাইলের বাইরে extends বা implements কোনোটাই করা যাবে না (`abstract final class NavIcons`) | — | ৩ |
| `factory` | এমন constructor যা নতুন object না বানিয়ে আগেরটা বা অন্য রকম object ফেরত দিতে পারে। `fromJson` এ খুব লাগে | static `create()` method | ২ |
| `new` | object বানায়। Dart এ লেখার দরকার নেই, `Text()` আর `new Text()` একই | `new` | — |
| `get` ✅ | field এর মতো পড়া যায় এমন method: `Size get preferredSize` | `get` | ২ |
| `set` | field এর মতো লেখা যায় এমন method | `set` | ৩ |
| `operator` | `+`, `==` এর মতো চিহ্নের নিজস্ব কাজ লেখা | — | ৩ |
| `==` আর `hashCode` | দুটো object কে কখন সমান ধরবে। model class এ override করতে হয় | deep equal | ২ |
| `identical()` | একই object কিনা (মান না, ঠিকানা) | `===` (object এ) | ৩ |
| `toString()` | object কে লেখায় রূপ দেয়, print এ দেখায় | `toString()` | ২ |
| `copyWith()` | কয়েকটা field বদলে নতুন object বানানোর প্রচলিত method (keyword না, pattern) | `{ ...obj, name }` | ২ |
| `enum` ✅ | কয়েকটা নির্দিষ্ট মানের type: `enum Status { open, closed }` | `enum` / union type | ২ |
| enhanced enum | enum এ field আর method: `enum Tab { home('/'); const Tab(this.path); final String path; }` | — | ৩ |
| `extension` ✅ | পুরনো class এ নতুন method যোগ করে, class না বদলে। `context.colors` এভাবেই বানানো | — | ২ |
| `covariant` | override করার সময় parameter এর type সরু করার অনুমতি | — | ৩ |
| `external` | method এর code অন্য জায়গায় (native/JS) লেখা | `declare` | ৩ |

### Annotation (`@` দিয়ে শুরু)

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `@override` ✅ | parent এর method নিজের মতো করে লিখছি, এটা জানায় | `override` | ১ |
| `@immutable` ✅ | এই class এর সব field `final` হতে হবে | `Readonly<>` | ২ |
| `@Deprecated('...')` | এটা পুরনো, ব্যবহার কোরো না | `/** @deprecated */` | ৩ |
| `@JsonSerializable()` | code generation কে বলে এই class এর জন্য JSON code বানাও | decorator | ৩ |

### Function আর parameter

| keyword / লেখা | কী করে | TS এ | স্তর |
|---|---|---|---|
| `return` ✅ | মান ফেরত দেয় | `return` | ১ |
| `=>` ✅ | এক লাইনের function: `int double(int x) => x * 2;` | arrow function | ১ |
| `{ }` এর ভেতরে parameter ✅ | named parameter: `Text('hi', style: ...)` | object parameter `({ style })` | ১ |
| `required` ✅ | named parameter টা দিতেই হবে | `?` ছাড়া property | ১ |
| `[ ]` এর ভেতরে parameter | ঐচ্ছিক positional parameter | `x?: number` | ৩ |
| default মান ✅ | `this.size = 24` | `size = 24` | ১ |
| return type নামের আগে ✅ | `Widget build()` | `build(): Widget` | ১ |
| anonymous function ✅ | নাম ছাড়া function: `(index) { ... }` | `(index) => { ... }` | ১ |
| closure | function বাইরের variable মনে রাখে | closure | ২ |
| `print` / `debugPrint` | console এ লেখা। Flutter এ `debugPrint` ভালো (লম্বা লেখা কাটে না) | `console.log` | ১ |

### Control flow

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `if`, `else` ✅ | শর্ত | একই | ১ |
| `? :` | ছোট if: `selected ? bold : normal` ✅ | একই | ১ |
| `for` ✅ | loop: `for (var i = 0; i < 5; i++)` | একই | ১ |
| `in` ✅ | তালিকার প্রতিটার উপর loop: `for (final a in actions)` | `for...of` | ১ |
| `while`, `do` | শর্ত সত্য থাকা পর্যন্ত loop | একই | ২ |
| `break`, `continue` | loop থামাও / এই ধাপ বাদ দাও | একই | ২ |
| `switch`, `case`, `default` | অনেক শর্তের মধ্যে একটা বাছাই। Dart এ switch মান ফেরতও দিতে পারে (switch expression) | `switch` | ২ |
| `when` | switch এর case এ বাড়তি শর্ত: `case int n when n > 0` | — | ৩ |
| `assert` | debug এ শর্ত মিথ্যা হলে থামায়, release এ কিছু করে না | `console.assert` | ৩ |

### Operator

| চিহ্ন | কী করে | TS এ | স্তর |
|---|---|---|---|
| `+ - * /` | হিসাব। `/` সবসময় দশমিক দেয়: `5 / 2 = 2.5` | একই | ১ |
| `~/` | ভাগ করে শুধু পূর্ণ অংশ: `5 ~/ 2 = 2` | `Math.trunc(5 / 2)` | ২ |
| `%` | ভাগশেষ | একই | ১ |
| `== !=` ✅ | সমান / সমান না (Dart এ `===` নেই) | `=== !==` | ১ |
| `&& \|\| !` | এবং, অথবা, না | একই | ১ |
| `& \| ^ << >>` | bit এর কাজ | একই | ৩ |
| `++ --` | ১ বাড়াও / কমাও | একই | ১ |

### Collection এর method

| method | কী করে | JS এ | স্তর |
|---|---|---|---|
| `.map()` ✅ | প্রতিটা বদলে নতুন তালিকা। শেষে `.toList()` লাগে | `.map()` | ১ |
| `.toList()` | Iterable থেকে List | `Array.from()` | ১ |
| `.where()` | শর্ত মেলে এমনগুলো | `.filter()` | ১ |
| `.forEach()` | প্রতিটার ওপর কাজ | `.forEach()` | ১ |
| `.firstWhere()` | শর্ত মেলে এমন প্রথমটা (না পেলে error) | `.find()` | ২ |
| `.firstOrNull`, `.lastOrNull` | প্রথম/শেষটা, না থাকলে null | `arr[0]` | ২ |
| `.any()`, `.every()` | একটাও মেলে? / সব মেলে? | `.some()`, `.every()` | ২ |
| `.fold()`, `.reduce()` | সব মিলিয়ে একটা মান | `.reduce()` | ২ |
| `.expand()` | প্রতিটা থেকে তালিকা, সব জুড়ে এক তালিকা | `.flatMap()` | ৩ |
| `.contains()`, `.indexOf()` | আছে কিনা, কোথায় | `.includes()`, `.indexOf()` | ১ |
| `.add()`, `.remove()`, `.insert()` | যোগ, বাদ, মাঝে বসানো | `.push()`, `.splice()` | ১ |
| `.sort()` | সাজায় (নিজের তালিকাই বদলায়) | `.sort()` | ২ |
| `.length`, `.isEmpty`, `.isNotEmpty` | কয়টা, খালি কিনা | `.length` | ১ |
| `.at(i)`, `[i]` ✅ | i নম্বরেরটা | `[i]`, `.at()` | ১ |
| `.entries`, `.keys`, `.values` | Map এর জোড়া, key, মান | `Object.entries` ইত্যাদি | ২ |
| `List.generate()` | নিয়ম মেনে তালিকা বানায় | `Array.from({length}, fn)` | ২ |

### String এর method

| method | কী করে | JS এ | স্তর |
|---|---|---|---|
| `.length`, `.isEmpty` | কত অক্ষর, খালি কিনা | একই | ১ |
| `.trim()` | দুই পাশের ফাঁকা বাদ | একই | ১ |
| `.toUpperCase()`, `.toLowerCase()` | বড়/ছোট হাতের | একই | ১ |
| `.contains()`, `.startsWith()` | আছে কিনা, এভাবে শুরু কিনা | `.includes()`, `.startsWith()` | ১ |
| `.split()`, `.join()` ✅ | ভাগ করা, জোড়া লাগানো | একই | ১ |
| `.replaceAll()` | সব বদলাও | একই | ১ |
| `.substring()` | কিছু অংশ কাটো | একই | ২ |
| `.padLeft()` ✅ | বামে ভরাট: `'7'.padLeft(2, '0')` → `07` | `.padStart()` | ২ |
| `int.parse()`, `int.tryParse()` ✅ | লেখা থেকে সংখ্যা (tryParse ভুল হলে null দেয়) | `parseInt()` | ১ |
| `.toString()`, `.toStringAsFixed(2)` ✅ | সংখ্যা থেকে লেখা, দশমিকের পরে ২ ঘর | `.toFixed(2)` | ১ |
| `'''...'''` | কয়েক লাইনের লেখা | template literal | ২ |
| raw string `r'...'` | `\` আর `$` কে সাধারণ অক্ষর ধরে | `String.raw` | ৩ |

### Error সামলানো

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `try`, `catch` | error ধরে | একই | ২ |
| `on` | নির্দিষ্ট ধরনের error ধরে: `on FormatException catch (e)` | `if (e instanceof ...)` | ২ |
| `finally` | error হোক বা না হোক, শেষে চলবেই | একই | ২ |
| `throw` | error ছোড়ে | একই | ২ |
| `rethrow` | ধরা error আবার উপরে পাঠায় | `throw e` | ৩ |
| `Exception` | যে সমস্যা আশা করা যায় (internet নেই), ধরে সামলাতে হয় | `Error` | ২ |
| `Error` | code এর ভুল (null, index বাইরে), ধরা না, ঠিক করতে হয় | bug | ২ |
| `StackTrace` | error কোথায় কোথায় হয়ে এলো | `error.stack` | ৩ |

### Async (পরে কাজ শেষ হবে এমন কাজ)

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `Future` | পরে একটা মান আসবে: `Future<User>` | `Promise<User>` | ২ |
| `async` | function টা Future ফেরত দেবে, ভেতরে await লেখা যাবে | `async` | ২ |
| `await` | Future শেষ হওয়া পর্যন্ত অপেক্ষা | `await` | ২ |
| `.then()`, `.catchError()` | await ছাড়া Future এর ফল ধরা | `.then()`, `.catch()` | ২ |
| `Future.wait()` | কয়েকটা Future একসাথে | `Promise.all()` | ২ |
| `Future.delayed()` | কিছু সময় পরে | `setTimeout` + Promise | ২ |
| `Timer` | নির্দিষ্ট সময় পরে বা বারবার কিছু করা | `setTimeout`, `setInterval` | ২ |
| `Stream` | সময়ের সাথে অনেকগুলো মান আসে (chat message, location) | Observable / async iterator | ৩ |
| `.listen()`, `StreamSubscription` | Stream শোনা, পরে `cancel()` করা | `subscribe()` / unsubscribe | ৩ |
| `StreamController` | নিজে Stream বানানো | Subject | ৩ |
| `async*`, `yield` | Stream বানায়, একটা একটা করে মান পাঠায় | `async function*` | ৩ |
| `sync*` | একটা একটা করে মান দেওয়া তালিকা (Iterable) বানায় | `function*` | ৩ |
| `Completer` | হাতে বানানো Future, পরে নিজে complete করা | `new Promise((resolve) => ...)` | ৩ |
| Isolate, `compute()` | ভারী কাজ আলাদা thread এ, যাতে screen আটকে না যায় | Web Worker | ৩ |
| event loop | Dart একটা thread এ চলে, async কাজ সারিতে অপেক্ষা করে | JS event loop | ২ |

### Type check

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `is` | এটা কি এই type? `if (x is String)` | `typeof` / `instanceof` | ২ |
| `is!` | এই type না | `!(x instanceof ...)` | ২ |
| `as` | এই type ধরে নাও: `x as String` | `x as string` | ২ |
| type promotion | `if (x != null)` এর পরে Dart নিজেই বোঝে x null না | type narrowing | ২ |

### Import আর ফাইল

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `import` ✅ | অন্য ফাইল বা package আনে | `import` | ১ |
| `package:` ✅ | package বা নিজের project থেকে import: `package:safar_app/...` | absolute import `@/` | ১ |
| relative import ✅ | `'../core/...'` | `'../core/...'` | ১ |
| `as` (import এ) | import এর একটা ছোট নাম: `import 'x.dart' as x;` | `import * as x` | ২ |
| `show` | শুধু নির্দিষ্ট জিনিস আনে | `import { a } from` | ২ |
| `hide` | নির্দিষ্ট জিনিস বাদ দিয়ে বাকি সব আনে | — | ৩ |
| `export` | অন্য ফাইলের জিনিস এই ফাইল থেকেও পাওয়া যাবে | `export * from` | ৩ |
| `deferred` | ফাইল দরকার হলে তবেই load হয় | dynamic `import()` | ৩ |
| `library`, `part`, `part of` | একটা library কে কয়েকটা ফাইলে ভাগ করা। code generation (json_serializable, freezed) এ দেখবে | — | ৩ |

### চিহ্ন (keyword না, কিন্তু সবখানে লাগে)

| চিহ্ন | কী করে | TS এ | স্তর |
|---|---|---|---|
| `_` ✅ | নামের শুরুতে দিলে private, শুধু এই ফাইলে দেখা যায় | `export` না দেওয়া | ১ |
| `?` ✅ (type এ) | null হতে পারে: `String? title` | `title?: string` | ১ |
| `!` ✅ | "এটা null না, আমি নিশ্চিত": `title!` | `title!` | ১ |
| `?.` | null না হলে তবেই: `user?.name` | একই | ১ |
| `?[]` | null না হলে তবেই index: `list?[0]` | `list?.[0]` | ২ |
| `??` | null হলে এটা দাও: `name ?? 'অতিথি'` | একই | ১ |
| `??=` | null হলে তবেই মান দাও | একই | ২ |
| `$` / `${}` ✅ | লেখার ভেতরে মান: `'$count বার'` | template literal | ১ |
| `...` ✅ | তালিকা ছড়িয়ে দেয় (spread) | `...` | ১ |
| `...?` | তালিকা null হলে কিছু না, না হলে ছড়াও | — | ২ |
| `..` | একই object এ পরপর কাজ (cascade): `paint..color = red..strokeWidth = 2` | — | ২ |
| তালিকায় `if` / `for` ✅ | `[if (dot) Dot(), for (final a in actions) a]` | `{dot && <Dot />}`, `.map()` | ১ |
| `//`, `///` ✅ | comment, আর documentation comment (hover এ দেখায়) | `//`, `/** */` | ১ |

## অংশ ২: Flutter এর keyword আর widget

### App শুরু

| keyword | কী করে | Next.js / React এ | স্তর |
|---|---|---|---|
| `main()` ✅ | app এর শুরু | `index.tsx` | ১ |
| `runApp()` ✅ | প্রথম widget Flutter এর হাতে দেয় | `createRoot().render()` | ১ |
| `MaterialApp` | পুরো app এর মূল: theme, title, home | root `layout.tsx` | ১ |
| `MaterialApp.router` ✅ | router সহ MaterialApp | App Router চালু | ১ |
| `CupertinoApp` | iPhone এর ধাঁচের app | — | ৩ |
| `debugShowCheckedModeBanner` ✅ | কোণের লাল "DEBUG" লেখা লুকায় | — | ১ |
| `themeMode` ✅ | light, dark না system অনুযায়ী | `prefers-color-scheme` | ১ |

### Widget এর ভিত্তি

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `Widget` ✅ | screen এর প্রতিটা অংশ, ছোট থেকে বড় সব | component | ১ |
| `StatelessWidget` ✅ | নিজে কিছু মনে রাখে না, শুধু দেখায় | `useState` ছাড়া component | ১ |
| `StatefulWidget` ✅ | ভেতরে বদলানো মান রাখে | `useState` সহ component | ১ |
| `State` ✅ | StatefulWidget এর বদলানো মান আর `build()` এখানে থাকে | `useState` এর আড়ালের জায়গা | ১ |
| `createState()` ✅ | Flutter এটা ডেকে State বানায় | — | ১ |
| `build()` ✅ | widget কী দেখাবে সেটা ফেরত দেয়, Flutter নিজে ডাকে | `return <JSX />` | ১ |
| `BuildContext` ✅ | tree তে এই widget এর জায়গা। এটা দিয়ে theme, router ইত্যাদি খোঁজা হয় | context / hooks এর ভিত্তি | ১ |
| `setState()` ✅ | মান বদলাও আর আবার build করো | `setX()` | ১ |
| `widget` | State এর ভেতর থেকে নিজের widget এর props পড়া: `widget.title` | `props` | ১ |
| `child` / `children` ✅ | ভেতরের একটা / অনেকগুলো widget | `children` | ১ |
| `Key`, `ValueKey`, `ObjectKey` | list এ কোন widget কোনটা, চেনার নাম-ট্যাগ | `key={id}` | ২ |
| `GlobalKey` | পুরো app এ একটাই, অন্য জায়গা থেকে widget এর State ধরা যায় (Form এ লাগে) | `useRef` | ২ |
| `Builder` | নতুন একটা `BuildContext` দরকার হলে (Scaffold এর ঠিক নিচে) | — | ২ |
| `Placeholder` ✅ | খালি জায়গায় ক্রস দেওয়া বাক্স, পরে আসল widget বসবে | TODO div | ১ |
| `InheritedWidget` | tree এর নিচে সবাইকে data দেয়। Theme, MediaQuery, Provider এর ভিত্তি | `createContext` | ৩ |
| `of(context)` pattern ✅ | `Theme.of(context)`, `MediaQuery.of(context)`: উপরের InheritedWidget খুঁজে আনে | `useContext()` | ১ |

### State এর জীবনচক্র (lifecycle)

| method | কখন চলে | React এ | স্তর |
|---|---|---|---|
| `initState()` | State প্রথমবার তৈরি হলে, একবার | `useEffect(() => {}, [])` | ২ |
| `didChangeDependencies()` | context থেকে পড়া কিছু (theme ইত্যাদি) বদলালে | — | ৩ |
| `didUpdateWidget()` | parent নতুন props দিলে | `useEffect(..., [prop])` | ৩ |
| `dispose()` | widget সরে গেলে, controller বন্ধ করতে | `useEffect` এর cleanup | ২ |
| `mounted` | widget এখনো screen এ আছে কিনা। await এর পরে setState এর আগে দেখতে হয় | — | ২ |
| `WidgetsBindingObserver` | app background এ গেল কি ফিরল, জানায় | `visibilitychange` | ৩ |
| `AppLifecycleState` | `resumed`, `paused` ইত্যাদি অবস্থা | page visibility state | ৩ |

### Layout

| widget | কী করে | CSS / Tailwind এ | স্তর |
|---|---|---|---|
| `Row` ✅ | পাশাপাশি সাজায় | `flex flex-row` | ১ |
| `Column` | উপর-নিচে সাজায় | `flex flex-col` | ১ |
| `mainAxisAlignment` | মূল দিকে কীভাবে সাজাবে | `justify-*` | ১ |
| `crossAxisAlignment` | আড়াআড়ি দিকে কীভাবে সাজাবে | `items-*` | ১ |
| `mainAxisSize` | Row/Column কতটা জায়গা নেবে: যতটা লাগে না সব | `w-fit` / `w-full` | ২ |
| `spacing` | Row/Column এর child দের মাঝে ফাঁক | `gap-2` | ১ |
| `Expanded` ✅ | বাকি সব জায়গা নিয়ে নেয় | `flex-1` | ১ |
| `Flexible` | জায়গা নিতে পারে, কিন্তু বাধ্য না | `flex-initial` | ২ |
| `Spacer` | ফাঁকা জায়গা ঠেলে দেয় | `flex-grow` div | ১ |
| `Container` ✅ | padding, রং, border, মাপ সব এক widget এ | `div` + class | ১ |
| `Padding` ✅ | ভেতরে ফাঁকা জায়গা | `p-4` | ১ |
| `EdgeInsets` ✅ | padding/margin এর মাপ: `.all()`, `.symmetric()`, `.fromLTRB()` | `p-4`, `px-2` | ১ |
| `SizedBox` ✅ | নির্দিষ্ট মাপ, বা দুটো widget এর মাঝে ফাঁক | `w-4`, `gap` | ১ |
| `Center` ✅ | মাঝখানে বসায় | `flex items-center justify-center` | ১ |
| `Align` ✅ | নির্দিষ্ট দিকে বসায় | `self-start` ইত্যাদি | ১ |
| `Stack` ✅ | একটার ওপর আরেকটা | `relative` | ১ |
| `Positioned` ✅ | Stack এর ভেতরে নির্দিষ্ট জায়গায় | `absolute top-2 right-2` | ১ |
| `clipBehavior` ✅ | বাইরে বের হওয়া অংশ কাটবে কিনা | `overflow-hidden` / `visible` | ২ |
| `Wrap` | জায়গা না থাকলে পরের লাইনে চলে যায় | `flex-wrap` | ২ |
| `BoxDecoration` ✅ | রং, border, গোল কোণ, ছায়া, gradient | `bg-*`, `border`, `rounded`, `shadow` | ১ |
| `BorderRadius` ✅ | কোণ গোল করা | `rounded-xl` | ১ |
| `Border`, `BorderSide` ✅ | border এর দিক, রং, পুরুত্ব | `border-t` | ১ |
| `BoxShadow` | ছায়া | `shadow-md` | ২ |
| `LinearGradient` ✅ | রঙের ঢাল | `bg-gradient-to-r` | ২ |
| `DecoratedBox` ✅ | শুধু decoration, padding ছাড়া | border/bg class | ২ |
| `ColoredBox` | শুধু পটভূমির রং, সবচেয়ে হালকা | `bg-*` | ২ |
| `ConstrainedBox` | সর্বনিম্ন/সর্বোচ্চ মাপ | `min-w`, `max-w` | ২ |
| `AspectRatio` | চওড়া আর উঁচুর অনুপাত | `aspect-video` | ২ |
| `FittedBox` | child কে জায়গায় আঁটিয়ে ছোট-বড় করে | `object-contain` | ২ |
| `ClipRRect`, `ClipOval` | গোল কোণে বা গোল করে কাটে (ছবিতে লাগে) | `rounded-xl overflow-hidden` | ২ |
| `Opacity` | স্বচ্ছতা | `opacity-50` | ২ |
| `Visibility`, `Offstage` | লুকানো, জায়গা রেখে বা না রেখে | `invisible` / `hidden` | ২ |
| `Transform` | ঘোরানো, সরানো, বড় করা | `rotate-*`, `translate-*`, `scale-*` | ৩ |
| `SafeArea` ✅ | notch আর status bar এর নিচে বসায় | `env(safe-area-inset-*)` | ১ |
| `MediaQuery` | screen এর মাপ, keyboard এর উচ্চতা: `MediaQuery.sizeOf(context)` | `window.innerWidth` | ২ |
| `LayoutBuilder` | parent কতটা জায়গা দিল দেখে layout বদলানো (tablet এ দুই কলাম) | container query | ২ |
| `OrientationBuilder` | খাড়া না আড়াআড়ি | `orientation` media query | ৩ |
| `IntrinsicHeight` | child দের মধ্যে সবচেয়ে উঁচুটার সমান (ধীর, কম ব্যবহার করো) | `items-stretch` | ৩ |
| `Table` | সারি-কলামের টেবিল | `table` | ৩ |

### দেখানোর widget

| widget | কী করে | HTML এ | স্তর |
|---|---|---|---|
| `Text` ✅ | লেখা | `p`, `span` | ১ |
| `TextStyle` ✅ | font size, weight, রং, `height` (line height) | CSS font | ১ |
| `maxLines`, `overflow: TextOverflow.ellipsis` | কয় লাইন, বেশি হলে `...` | `line-clamp-2`, `truncate` | ১ |
| `Text.rich`, `TextSpan` | এক লেখায় কয়েক রকম style (কিছু অংশ মোটা) | `<b>` সহ `p` | ২ |
| `SelectableText` | copy করা যায় এমন লেখা | `select-text` | ৩ |
| `Icon` ✅ | Material icon | icon font | ১ |
| `Image.asset` ✅ | app এর ভেতরের ছবি | `img src="/logo.png"` | ১ |
| `Image.network` | internet থেকে ছবি | `img src="https://..."` | ১ |
| `BoxFit` | ছবি কীভাবে জায়গায় বসবে: `cover`, `contain` | `object-cover` | ১ |
| `SvgPicture` ✅ | SVG ছবি (flutter_svg package) | inline `svg` | ২ |
| `CircleAvatar` | গোল প্রোফাইল ছবি বা অক্ষর | `rounded-full img` | ২ |
| `Card` | border সহ বাক্স | card div | ১ |
| `ListTile` | বাম icon, শিরোনাম, নিচের লেখা, ডান icon: তৈরি একটা সারি | list item | ১ |
| `Chip`, `FilterChip`, `ChoiceChip` | ছোট pill: tag, filter, বাছাই | badge / pill | ২ |
| `Badge` | icon এর কোণে সংখ্যা বা dot | notification badge | ২ |
| `Divider` | পাতলা দাগ | `hr` | ১ |
| `CircularProgressIndicator` | ঘুরতে থাকা loading | spinner | ১ |
| `LinearProgressIndicator` | লম্বা loading দাগ | progress bar | ২ |
| `Tooltip` ✅ | চেপে ধরলে বা hover এ ছোট লেখা | `title` | ২ |
| `ExpansionTile` | চাপলে খোলে-বন্ধ হয় (FAQ) | `details` / accordion | ২ |

### List আর scroll

| widget | কী করে | React এ | স্তর |
|---|---|---|---|
| `ListView` | scroll করা যায় এমন তালিকা | `overflow-y-auto` + map | ১ |
| `ListView.builder` | শুধু screen এ দেখা item গুলো বানায়, লম্বা list এর জন্য | virtualized list | ১ |
| `ListView.separated` | item এর মাঝে divider সহ | map + separator | ২ |
| `itemCount`, `itemBuilder` | কয়টা item, প্রতিটা কীভাবে বানাবে | `data.length`, `map` callback | ১ |
| `GridView` | ঘর ঘর করে সাজানো | `grid grid-cols-2` | ২ |
| `SingleChildScrollView` | একটা বড় widget কে scroll করায় | `overflow-auto` | ১ |
| `scrollDirection: Axis.horizontal` | পাশাপাশি scroll (Community এর tab chip) | `overflow-x-auto` | ১ |
| `ScrollController` | কোডে scroll করা, scroll এর জায়গা জানা | `ref.scrollTo()` | ২ |
| `IndexedStack` ✅ | সব child রাখে, একটাই দেখায় | `display: none` বাকিগুলোয় | ২ |
| `PageView` | পাতা উল্টানোর মতো swipe (onboarding) | carousel | ২ |
| `RefreshIndicator` | টেনে নামিয়ে refresh | pull to refresh | ২ |
| `Dismissible` | swipe করে সরানো (মুছে ফেলা) | swipe to delete | ২ |
| `CustomScrollView`, `SliverList`, `SliverAppBar` | জটিল scroll (scroll করলে ছোট হয়ে যাওয়া header) | — | ৩ |
| `NestedScrollView` | scroll এর ভেতরে scroll (header + tab + list) | — | ৩ |

### Input আর চাপ

| widget | কী করে | HTML / React এ | স্তর |
|---|---|---|---|
| `FilledButton`, `OutlinedButton`, `TextButton` | বোতাম | `button` | ১ |
| `ElevatedButton` | ছায়া সহ বোতাম (Material 3 এ FilledButton বেশি ব্যবহার হয়) | `button` | ২ |
| `IconButton` ✅ | শুধু icon এর বোতাম | icon `button` | ১ |
| `styleFrom()` ✅ | বোতামের রং, মাপ, আকার ঠিক করা | button class | ১ |
| `onPressed` / `onTap` ✅ | চাপলে কী হবে। `null` দিলে বোতাম বন্ধ (disabled) | `onClick`, `disabled` | ১ |
| `VoidCallback` ✅ | কিছু না নেওয়া, কিছু না ফেরত দেওয়া function এর type | `() => void` | ১ |
| `ValueChanged<T>` | একটা মান নেওয়া callback: `onChanged` | `(v: T) => void` | ২ |
| `GestureDetector` | যেকোনো widget কে চাপার মতো বানায় (ripple ছাড়া) | `div onClick` | ২ |
| `InkWell` | চাপার সাথে ripple effect। এর উপরে `Material` লাগে | — | ২ |
| `Material` | ripple, elevation আর রং এর আসল কাগজ | — | ৩ |
| `SegmentedButton` | পাশাপাশি কয়েকটা অপশন, একটা বাছাই | toggle group | ২ |
| `DropdownMenu` | ড্রপডাউন (দেশ বাছাই) | `select` | ২ |
| `Checkbox`, `Switch`, `Radio` | টিক, on/off, একটা বাছাই | `input type=...` | ২ |
| `Slider` | টেনে মান বাছাই (CGPA range) | `input type=range` | ২ |
| `showDatePicker` | তারিখ বাছাইয়ের popup | `input type=date` | ২ |
| `SearchBar`, `SearchAnchor` | খোঁজার ঘর আর সাজেশন | search input + combobox | ২ |
| `FocusNode` | কোন ঘরে cursor, সেটা নিয়ন্ত্রণ | `ref.focus()` | ৩ |
| `tooltip` ✅ | চেপে ধরলে নাম দেখায়, screen reader ও পড়ে | `title`, `aria-label` | ১ |

### Form আর লেখার ঘর

| keyword | কী করে | HTML / React এ | স্তর |
|---|---|---|---|
| `TextField` | লেখার ঘর | `input` | ১ |
| `InputDecoration` | label, hint, icon, border, error লেখা | `label`, `placeholder` | ১ |
| `TextEditingController` | লেখা পড়া/বদলানো। `dispose()` করতে হয় | `useRef` / controlled input | ২ |
| `onChanged`, `onSubmitted` | লেখা বদলালে / Enter চাপলে | `onChange`, `onSubmit` | ১ |
| `keyboardType` | কোন keyboard: সংখ্যা, email, phone | `type="email"`, `inputMode` | ১ |
| `obscureText` | password এর মতো লুকানো | `type="password"` | ১ |
| `textInputAction` | keyboard এর Enter বোতাম: Next, Done, Search | `enterKeyHint` | ২ |
| `Form` | কয়েকটা ঘর একসাথে validate করে | `form` | ২ |
| `TextFormField` | validation সহ TextField | `input` + rules | ২ |
| `validator` | ভুল হলে error লেখা ফেরত দেয়, ঠিক হলে `null` | zod rule | ২ |
| `GlobalKey<FormState>` | Form কে বাইরে থেকে `validate()`, `save()` করা | `useForm()` | ২ |
| `autovalidateMode` | কখন validate হবে: সাথে সাথে না submit এ | `mode: 'onChange'` | ৩ |
| `FocusScope.of(context).unfocus()` | keyboard নামিয়ে দেয় | `input.blur()` | ২ |

### Page এর কাঠামো

| widget | কী করে | Next.js এ | স্তর |
|---|---|---|---|
| `Scaffold` ✅ | page এর কাঠামো: appBar, body, nav bar | page layout | ১ |
| `body` ✅ | page এর মূল অংশ | `main` | ১ |
| `AppBar` | Material এর তৈরি উপরের bar | `header` | ১ |
| `PreferredSizeWidget` ✅ | নিজের বানানো appBar এর জন্য, উচ্চতা জানায় | — | ২ |
| `NavigationBar` ✅ | নিচের tab bar | bottom nav | ১ |
| `NavigationDestination` ✅ | একটা tab | nav link | ১ |
| `NavigationRail` | tablet এ পাশের nav bar | sidebar nav | ৩ |
| `TabBar`, `TabBarView`, `DefaultTabController` | page এর ভেতরে tab (Community: ফিড, প্রশ্ন-উত্তর, গ্রুপ) | tabs | ২ |
| `Drawer` | পাশ থেকে বের হওয়া menu | sidebar | ২ |
| `FloatingActionButton` | ভাসমান গোল বোতাম | fixed button | ২ |
| `SnackBar`, `ScaffoldMessenger` | নিচে ছোট বার্তা | toast | ২ |
| `showDialog`, `AlertDialog` | popup | modal | ২ |
| `showModalBottomSheet` | নিচ থেকে ওঠা panel | bottom sheet | ২ |
| `PopScope` | back চাপলে কী হবে নিয়ন্ত্রণ ("সেভ না করে বের হবে?") | `beforeunload` | ২ |

### Theme

| keyword | কী করে | CSS / Tailwind এ | স্তর |
|---|---|---|---|
| `ThemeData` ✅ | পুরো app এর রং, font, widget style | `tailwind.config` | ১ |
| `ColorScheme` ✅ | মূল রংগুলো: primary, surface, error | CSS variable | ১ |
| `ColorScheme.fromSeed` ✅ | একটা রং থেকে পুরো palette বানায় | palette generator | ১ |
| `TextTheme` ✅ | লেখার মাপগুলো: headlineSmall, bodyMedium | `text-xl` ইত্যাদি | ১ |
| `Theme.of(context)` ✅ | এখনকার theme পড়ে | `useTheme()` | ১ |
| `ThemeExtension` ✅ | ThemeData তে নিজের রং যোগ করা (`context.safar`) | custom CSS variable | ২ |
| `copyWith()` ✅ | theme বা style এর কিছু অংশ বদলে নতুন | `{ ...style, x }` | ১ |
| `navigationBarTheme` ইত্যাদি ✅ | একেক widget এর আলাদা theme | component variant | ২ |
| `WidgetStateProperty` ✅ | অবস্থা (selected, pressed) দেখে আলাদা style | `:hover`, `.active` | ২ |
| `Brightness` ✅ | light না dark | `prefers-color-scheme` | ১ |
| `Color`, `withValues(alpha:)` ✅ | রং, আর তার স্বচ্ছতা | `rgb()`, `/50` | ১ |
| `useMaterial3` | Material 3 design (এখন নিজে থেকেই চালু) | — | ৩ |
| font (pubspec) ✅ | নিজের font যোগ করা | `@font-face` | ১ |

### Navigation (go_router)

| keyword | কী করে | Next.js এ | স্তর |
|---|---|---|---|
| `GoRouter` ✅ | সব route এর তালিকা | `app/` folder | ১ |
| `GoRoute` ✅ | একটা page, `path` আর `builder` সহ | `page.tsx` | ১ |
| `initialLocation` ✅ | app খুললে প্রথম URL | `/` | ১ |
| `StatefulShellRoute.indexedStack` ✅ | কয়েকটা route এর চারপাশে স্থায়ী shell | `layout.tsx` | ২ |
| `StatefulShellBranch` ✅ | একটা tab, নিজের history সহ | — | ২ |
| `StatefulNavigationShell` ✅ | shell কে দেওয়া জিনিস: এখনকার page, currentIndex, goBranch | `children` + `usePathname` | ২ |
| `ShellRoute` | history আলাদা না রেখে শুধু shell | layout | ৩ |
| `context.go()` | এই URL এ যাও | `router.replace` / `Link` | ১ |
| `context.push()` | নতুন page উপরে বসাও | `router.push` | ১ |
| `context.pop()` | আগের page এ ফেরো, চাইলে মান নিয়ে | `router.back` | ১ |
| `name`, `context.goNamed()` | URL না লিখে route এর নাম দিয়ে যাওয়া | named route | ২ |
| `GoRouterState` ✅ | এখনকার route এর তথ্য (builder এর `state`) | route props | ২ |
| `state.pathParameters` | URL এর `:id` অংশ | `params` | ২ |
| `state.uri.queryParameters` | URL এর `?country=japan` অংশ | `searchParams` | ২ |
| `extra` | URL ছাড়া object পাঠানো (refresh এ হারায়) | router state | ৩ |
| `redirect` | শর্ত দেখে অন্য জায়গায় পাঠায় (login না থাকলে `/login`) | `middleware.ts` | ২ |
| `refreshListenable` | login অবস্থা বদলালে redirect আবার চালায় | — | ৩ |
| `errorBuilder` | ভুল URL হলে কোন page | `not-found.tsx` | ২ |
| deep link | বাইরের link থেকে সরাসরি app এর ভেতরের page | URL share | ৩ |
| `Navigator` | Flutter এর নিজস্ব page stack (go_router এর নিচে এটাই চলে) | browser history | ৩ |

### Async UI আর data

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `FutureBuilder` | Future এর অবস্থা (loading, data, error) দেখে আঁকে | `useQuery` এর কাছাকাছি | ২ |
| `AsyncSnapshot` | FutureBuilder এর অবস্থা: `hasData`, `hasError`, `connectionState` | `{ data, error, isLoading }` | ২ |
| `StreamBuilder` | Stream এর প্রতিটা নতুন মানে আবার আঁকে | subscription + state | ৩ |
| `http` / `dio` package | API call (dio তে interceptor, timeout সহজ) | `fetch` / `axios` | ২ |
| `jsonDecode` / `jsonEncode` | JSON লেখা থেকে Map, Map থেকে লেখা | `JSON.parse` / `JSON.stringify` | ২ |
| `fromJson` / `toJson` | Map থেকে model object, আর উল্টো | zod parse / class transform | ২ |
| `json_serializable` | fromJson/toJson নিজে থেকে বানায় | codegen | ৩ |
| `freezed` | immutable model, copyWith, `==` নিজে থেকে বানায় | — | ৩ |
| `build_runner` | code generation চালায়: `dart run build_runner build` | codegen CLI | ৩ |
| `Result` (pattern) | সফল না ব্যর্থ, সেটা type দিয়ে ফেরত দেওয়া | `{ ok, error }` | ২ |

### State management আর architecture (MVVM)

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `ChangeNotifier` | ViewModel এর ভিত্তি, মান বদলালে জানায় | store (Zustand) | ২ |
| `notifyListeners()` | "মান বদলেছে, আবার আঁকো" | store `set()` | ২ |
| `ListenableBuilder` | ViewModel শুনে আবার আঁকে | `useStore()` | ২ |
| `ValueNotifier`, `ValueListenableBuilder` | একটাই মানের ছোট ChangeNotifier আর তার builder | `useState` বাইরে রাখা | ২ |
| `Provider` (package) | widget tree তে নিচে ViewModel পৌঁছে দেয় | Context Provider | ২ |
| `ChangeNotifierProvider`, `MultiProvider` | ChangeNotifier দেওয়া, কয়েকটা একসাথে দেওয়া | nested Providers | ২ |
| `context.watch<T>()` | পড়ো, বদলালে আবার build করো | `useContext` + subscribe | ২ |
| `context.read<T>()` | একবার পড়ো, শুনো না (onPressed এর ভেতরে) | store `getState()` | ২ |
| `Consumer`, `Selector` | tree এর ছোট অংশ শুধু আবার build | selector hook | ৩ |
| Riverpod, Bloc | অন্য জনপ্রিয় state management package (একটা বাছাই করলেই হয়) | Redux, Jotai | ৩ |
| ViewModel, Repository, Service | MVVM এর তিন স্তর: UI state / data এর উৎস / API call | hooks / data layer / api client | ২ |
| Dependency Injection | object নিজে না বানিয়ে বাইরে থেকে দেওয়া | Context দিয়ে service দেওয়া | ২ |

### বাংলা আর অন্য ভাষা (localization)

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `flutter_localizations` | Flutter এর নিজের লেখা (বোতাম, তারিখ বাছাই) বাংলায় | — | ২ |
| `intl` package | তারিখ আর সংখ্যা ভাষা অনুযায়ী লেখা | `Intl` API | ২ |
| `DateFormat` | `DateFormat.yMMMd('bn')` → বাংলা তারিখ | `Intl.DateTimeFormat` | ২ |
| `NumberFormat` | টাকা, কমা দিয়ে সংখ্যা | `Intl.NumberFormat` | ২ |
| `.arb` ফাইল, `AppLocalizations` | সব লেখা এক ফাইলে, ভাষা বদলালে বদলায় | `next-intl` messages | ৩ |
| `Locale` | ভাষা আর দেশ: `Locale('bn', 'BD')` | `lang="bn"` | ২ |

### দরকারি package আর platform

| package / keyword | কী করে | Web এ | স্তর |
|---|---|---|---|
| `url_launcher` | browser এ link খোলা, phone call, email (official source link এর জন্য) | `a href target=_blank` | ২ |
| `shared_preferences` | ছোট setting phone এ রাখা (theme, ভাষা) | `localStorage` | ২ |
| `flutter_secure_storage` | token, password নিরাপদে রাখা | httpOnly cookie | ২ |
| `path_provider` | phone এর কোন folder এ ফাইল রাখবে | — | ৩ |
| `image_picker` | gallery বা camera থেকে ছবি (Community post) | `input type=file` | ২ |
| `cached_network_image` | internet এর ছবি একবার নামিয়ে রেখে দেয় | browser cache | ২ |
| `permission_handler` | camera, location এর অনুমতি চাওয়া | permission API | ৩ |
| `Platform.isAndroid`, `kIsWeb` | কোন platform এ চলছে | user agent | ২ |
| `kDebugMode`, `kReleaseMode` | debug না release, code এ জানা | `process.env.NODE_ENV` | ২ |
| `MethodChannel` | Android/iOS এর নিজস্ব code ডাকা | native bridge | ৩ |
| `AndroidManifest.xml`, `Info.plist` | Android আর iOS এর অনুমতি আর setting | `manifest.json` | ৩ |
| `flutter_launcher_icons`, `flutter_native_splash` | app icon আর খোলার সময়ের screen | favicon, splash | ৩ |

### Animation

| widget | কী করে | CSS এ | স্তর |
|---|---|---|---|
| `AnimatedContainer`, `AnimatedOpacity` | মান বদলালে নিজে থেকে animate হয় | `transition` | ২ |
| `AnimatedSwitcher` | একটা widget থেকে আরেকটায় যাওয়ার সময় animate | enter/exit transition | ২ |
| `Duration`, `Curves` | কতক্ষণ, কোন গতিতে: `Curves.easeOut` | `duration-300 ease-out` | ২ |
| `TweenAnimationBuilder` | একটা মান থেকে আরেকটায় animate | `@keyframes` | ৩ |
| `AnimationController`, `Tween` | সময় ধরে animation নিয়ন্ত্রণ | Web Animations API | ৩ |
| `TickerProviderStateMixin` | AnimationController কে frame এর তাল দেয় | `requestAnimationFrame` | ৩ |
| `Hero` | এক page থেকে আরেক page এ একই ছবি উড়ে যায় | shared element transition | ৩ |
| `CustomPaint`, `CustomPainter` | নিজে হাতে আঁকা (chart, আকার) | `canvas` | ৩ |

### Tool আর command

| command | কী করে | JS এ | স্তর |
|---|---|---|---|
| `flutter doctor` | setup ঠিক আছে কিনা দেখে | — | ১ |
| `flutter run` | app চালায় | `npm run dev` | ১ |
| `pubspec.yaml` ✅ | package, font, ছবির তালিকা | `package.json` | ১ |
| `pubspec.lock` ✅ | package এর ঠিক version | `package-lock.json` | ১ |
| `flutter pub add` ✅ | package যোগ করে | `npm install x` | ১ |
| `flutter pub get` ✅ | pubspec অনুযায়ী package নামায় | `npm install` | ১ |
| `flutter pub outdated` | কোন package এর নতুন version আছে | `npm outdated` | ২ |
| assets ✅ | app এর ভেতরের ছবি, font। pubspec এ নাম লিখতে হয়, যোগ করলে app আবার run করতে হয় | `public/` folder | ১ |
| Hot Reload (`r`) ✅ | code বদলালে state না হারিয়ে screen আপডেট | Fast Refresh | ১ |
| Hot Restart (`R`) ✅ | app আবার শুরু, state মুছে যায়। global variable বদলালে লাগে | page reload | ১ |
| `dart analyze` ✅ | error আর warning খোঁজে | `eslint` + `tsc` | ১ |
| `analysis_options.yaml` | lint এর নিয়ম | `.eslintrc` | ২ |
| `dart format` ✅ | code সাজায় | `prettier` | ১ |
| `dart fix --apply` | analyzer এর পরামর্শ নিজে ঠিক করে | `eslint --fix` | ২ |
| `flutter clean` | build এর পুরনো ফাইল মুছে দেয় (অদ্ভুত error এ কাজে লাগে) | `rm -rf .next` | ১ |
| debug / profile / release mode | উন্নয়ন / গতি মাপা / আসল app | dev / prod build | ২ |
| `flutter build apk`, `appbundle`, `ipa` | Play Store আর App Store এর ফাইল বানায় | `npm run build` | ২ |
| `--dart-define` | build এর সময় মান দেওয়া (API URL) | `.env` | ২ |
| flavor | একই code এ dev আর prod আলাদা app | environments | ৩ |
| DevTools, Flutter Inspector | widget tree দেখা, ধীর frame খোঁজা | React DevTools | ২ |
| Gradle, CocoaPods, Xcode | Android আর iOS build এর tool | webpack | ৩ |

### Test

| keyword | কী করে | JS এ | স্তর |
|---|---|---|---|
| `flutter test` ✅ | test চালায় | `vitest` / `jest` | ২ |
| `test()`, `group()` | সাধারণ (UI ছাড়া) test, আর কয়েকটাকে এক দলে | `test()`, `describe()` | ২ |
| `setUp()`, `tearDown()` | প্রতিটা test এর আগে/পরে | `beforeEach`, `afterEach` | ২ |
| `expect()` ✅ | ফলাফল মেলে কিনা | `expect()` | ২ |
| `testWidgets` ✅ | একটা widget test | `test()` + Testing Library | ২ |
| `tester.pumpWidget` ✅ | widget screen এ বসায় | `render()` | ২ |
| `tester.tap`, `pumpAndSettle` ✅ | চাপো, animation শেষ হওয়া পর্যন্ত অপেক্ষা | `fireEvent.click`, `waitFor` | ২ |
| `find.text`, `find.byTooltip` ✅ | screen এ খোঁজা | `screen.getByText` | ২ |
| `findsOneWidget`, `findsNothing` ✅ | ঠিক একটা পাওয়া গেছে / কিছুই না | `toBeInTheDocument()` | ২ |
| `mocktail` | নকল object বানানো (আসল API ছাড়া test) | `vi.mock` | ৩ |
| golden test | screenshot তুলে আগেরটার সাথে মেলানো | visual regression | ৩ |
| `integration_test` | পুরো app চালিয়ে test | Playwright | ৩ |

### Performance আর Accessibility

| keyword | কী করে | Web এ | স্তর |
|---|---|---|---|
| `const` widget ✅ | একবার বানানো, আবার build হয় না | `React.memo` | ১ |
| ছোট widget এ ভাগ করা ✅ | `setState` এ শুধু ছোট অংশ আবার build হয় | component ভাগ করা | ২ |
| `RepaintBoundary` | ঘন ঘন বদলানো অংশ আলাদা করে আঁকে | `will-change` | ৩ |
| `precacheImage` | ছবি আগেই load করে রাখা | `link rel=preload` | ৩ |
| `Semantics` | screen reader কে বলা এটা কী | `aria-*` | ২ |
| `semanticLabel` ✅ | ছবি বা icon এর নাম | `alt` | ১ |
| `MediaQuery.textScalerOf` | user বড় font চালু করলে কত গুণ | browser zoom | ২ |
| touch target ৪৮px | চাপার জায়গা কমপক্ষে এত বড় হওয়া উচিত | ৪৪px নিয়ম | ১ |

## আরও পড়ো

- [Widget আর StatelessWidget](/flutter/widgets-basics): Widget, State, private `_`
- [Constructor আর build()](/flutter/constructor-and-build): `this`, `super.key`, `required`, `const`
- [App Architecture: MVVM](/flutter/app-architecture): ChangeNotifier, Provider
- [Bottom Navigation আর go_router](/flutter/navigation-go-router): go_router, NavigationBar, Theme
