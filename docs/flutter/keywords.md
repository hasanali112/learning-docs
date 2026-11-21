# Flutter শেখার keyword তালিকা

Flutter শিখতে যত keyword জানতে হবে, সব এখানে এক জায়গায় রাখা: আগে Dart ভাষার keyword, তারপর Flutter এর widget আর ধারণা। প্রতিটার পাশে TypeScript / React এর মিল দেওয়া আছে।

**কীভাবে পড়বে:**

- **স্তর ১:** এখনই লাগবে, এগুলো ছাড়া কোনো screen বানানো যায় না।
- **স্তর ২:** কয়েকটা screen বানানোর পরেই লাগবে (list, form, data load)।
- **স্তর ৩:** বড় app বা বিশেষ কাজে লাগে, পরে শিখলেও চলবে।
- **✅** মানে Safar app এ এর মধ্যেই ব্যবহার হয়েছে।

::: tip শেখার ক্রম
১. Dart এর স্তর ১ → ২. Flutter এর "Widget এর ভিত্তি" আর "Layout" → ৩. Theme আর Navigation → ৪. List, Form, Async → ৫. State management (MVVM) → ৬. বাকি সব স্তর ৩।
:::

## অংশ ১: Dart ভাষার keyword

### Variable আর type

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `var` | variable বানায়, type Dart নিজে বুঝে নেয় | `let` | ১ |
| `final` ✅ | একবার মান দেওয়ার পর আর বদলানো যায় না। মান app চলার সময় ঠিক হতে পারে | `const` (variable) / `readonly` | ১ |
| `const` ✅ | মান code লেখার সময়ই জানা, কখনো বদলায় না। widget এর আগে দিলে Flutter বারবার নতুন করে বানায় না | `as const` এর কাছাকাছি | ১ |
| `late` | মান পরে দেওয়া হবে, কিন্তু ব্যবহারের আগে অবশ্যই দেওয়া হবে | `let x!: string` | ২ |
| `int`, `double`, `num` | পূর্ণ সংখ্যা, দশমিক সংখ্যা, দুটোই | `number` | ১ |
| `String` ✅ | লেখা | `string` | ১ |
| `bool` ✅ | `true` / `false` | `boolean` | ১ |
| `List` | তালিকা: `List<String>` | `string[]` | ১ |
| `Map` | key-value জোড়া: `Map<String, int>` | `Record<string, number>` / object | ১ |
| `Set` | একই জিনিস দুবার থাকে না এমন তালিকা | `Set` | ২ |
| `dynamic` | যেকোনো type, Dart কোনো type check করে না। যত কম পারো ব্যবহার করো | `any` | ২ |
| `Object` | সব type এর parent | `unknown` এর কাছাকাছি | ২ |
| `void` ✅ | কিছু ফেরত দেয় না | `void` | ১ |
| `null` | কোনো মান নেই | `null` | ১ |
| `true`, `false` ✅ | bool এর দুই মান | একই | ১ |
| `Function` | যেকোনো function এর type | `Function` | ২ |
| `typedef` | type এর একটা ছোট নাম দেয় | `type Callback = () => void` | ৩ |

### Class আর OOP

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `class` ✅ | class বানায় | `class` | ১ |
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
| `get` | field এর মতো পড়া যায় এমন method: `Size get preferredSize` ✅ | `get` | ২ |
| `set` | field এর মতো লেখা যায় এমন method | `set` | ৩ |
| `operator` | `+`, `==` এর মতো চিহ্নের নিজস্ব কাজ লেখা | — | ৩ |
| `enum` | কয়েকটা নির্দিষ্ট মানের type: `enum Status { open, closed }` | `enum` / union type | ২ |
| `extension` | পুরনো class এ নতুন method যোগ করে, class না বদলে। `context.colors` ✅ এভাবেই বানানো | — | ২ |
| `covariant` | override করার সময় parameter এর type সরু করার অনুমতি | — | ৩ |
| `external` | method এর code অন্য জায়গায় (native/JS) লেখা | `declare` | ৩ |
| `@override` ✅ | parent এর method নিজের মতো করে লিখছি, এটা জানায় | `override` | ১ |

### Function আর parameter

| keyword / লেখা | কী করে | TS এ | স্তর |
|---|---|---|---|
| `return` ✅ | মান ফেরত দেয় | `return` | ১ |
| `=>` ✅ | এক লাইনের function: `int double(int x) => x * 2;` | arrow function | ১ |
| `{ }` এর ভেতরে parameter ✅ | named parameter: `Text('hi', style: ...)` | object parameter `({ style })` | ১ |
| `required` ✅ | named parameter টা দিতেই হবে | `?` ছাড়া property | ১ |
| `[ ]` এর ভেতরে parameter | ঐচ্ছিক positional parameter | `x?: number` | ৩ |
| default মান | `this.size = 24` ✅ | `size = 24` | ১ |
| return type নামের আগে | `Widget build()` ✅ | `build(): Widget` | ১ |

### Control flow

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `if`, `else` ✅ | শর্ত | একই | ১ |
| `for` ✅ | loop: `for (var i = 0; i < 5; i++)` | একই | ১ |
| `in` ✅ | তালিকার প্রতিটার উপর loop: `for (final a in actions)` | `for...of` | ১ |
| `while`, `do` | শর্ত সত্য থাকা পর্যন্ত loop | একই | ২ |
| `break`, `continue` | loop থামাও / এই ধাপ বাদ দাও | একই | ২ |
| `switch`, `case`, `default` | অনেক শর্তের মধ্যে একটা বাছাই। Dart এ switch মান ফেরতও দিতে পারে (switch expression) | `switch` | ২ |
| `when` | switch এর case এ বাড়তি শর্ত: `case int n when n > 0` | — | ৩ |
| `assert` | debug এ শর্ত মিথ্যা হলে থামায়, release এ কিছু করে না | `console.assert` | ৩ |

### Error সামলানো

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `try`, `catch` | error ধরে | একই | ২ |
| `on` | নির্দিষ্ট ধরনের error ধরে: `on FormatException catch (e)` | `if (e instanceof ...)` | ২ |
| `finally` | error হোক বা না হোক, শেষে চলবেই | একই | ২ |
| `throw` | error ছোড়ে | একই | ২ |
| `rethrow` | ধরা error আবার উপরে পাঠায় | `throw e` | ৩ |

### Async (পরে কাজ শেষ হবে এমন কাজ)

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `Future` | পরে একটা মান আসবে: `Future<User>` | `Promise<User>` | ২ |
| `async` | function টা Future ফেরত দেবে, ভেতরে await লেখা যাবে | `async` | ২ |
| `await` | Future শেষ হওয়া পর্যন্ত অপেক্ষা | `await` | ২ |
| `Stream` | সময়ের সাথে অনেকগুলো মান আসে (chat message, location) | Observable / async iterator | ৩ |
| `async*`, `yield` | Stream বানায়, একটা একটা করে মান পাঠায় | `async function*` | ৩ |
| `sync*` | একটা একটা করে মান দেওয়া তালিকা (Iterable) বানায় | `function*` | ৩ |

### Type check

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `is` | এটা কি এই type? `if (x is String)` | `typeof` / `instanceof` | ২ |
| `is!` | এই type না | `!(x instanceof ...)` | ২ |
| `as` | এই type ধরে নাও: `x as String` | `x as string` | ২ |

### Import আর ফাইল

| keyword | কী করে | TS এ | স্তর |
|---|---|---|---|
| `import` ✅ | অন্য ফাইল বা package আনে | `import` | ১ |
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
| `??` | null হলে এটা দাও: `name ?? 'অতিথি'` | একই | ১ |
| `??=` | null হলে তবেই মান দাও | একই | ২ |
| `$` / `${}` ✅ | লেখার ভেতরে মান: `'$count বার'` | `` `${count} বার` `` | ১ |
| `...` ✅ | তালিকা ছড়িয়ে দেয় (spread) | `...` | ১ |
| `...?` | তালিকা null হলে কিছু না, না হলে ছড়াও | — | ২ |
| `..` | একই object এ পরপর কাজ (cascade): `paint..color = red..strokeWidth = 2` | — | ২ |
| তালিকায় `if` / `for` ✅ | `[if (dot) Dot(), for (final a in actions) a]` | `{dot && <Dot />}`, `.map()` | ১ |

## অংশ ২: Flutter এর keyword আর widget

### App শুরু আর tool

| keyword | কী করে | Next.js / React এ | স্তর |
|---|---|---|---|
| `main()` ✅ | app এর শুরু | `index.tsx` | ১ |
| `runApp()` ✅ | প্রথম widget Flutter এর হাতে দেয় | `createRoot().render()` | ১ |
| `MaterialApp` | পুরো app এর মূল: theme, title, home | root `layout.tsx` | ১ |
| `MaterialApp.router` ✅ | router সহ MaterialApp | App Router চালু | ১ |
| `pubspec.yaml` ✅ | package, font, ছবির তালিকা | `package.json` | ১ |
| `flutter pub add` ✅ | package যোগ করে | `npm install` | ১ |
| assets ✅ | app এর ভেতরের ছবি, font। pubspec এ নাম লিখতে হয় | `public/` folder | ১ |
| Hot Reload (`r`) ✅ | code বদলালে state না হারিয়ে screen আপডেট | Fast Refresh | ১ |
| Hot Restart (`R`) ✅ | app আবার শুরু, state মুছে যায়। global variable বদলালে লাগে | page reload | ১ |
| `dart analyze` ✅ | error আর warning খোঁজে | `eslint` + `tsc` | ১ |
| `dart format` ✅ | code সাজায় | `prettier` | ১ |

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
| `Key`, `ValueKey`, `GlobalKey` | list এ কোন widget কোনটা, চেনার নাম-ট্যাগ | `key={id}` | ২ |
| `child` / `children` ✅ | ভেতরের একটা / অনেকগুলো widget | `children` | ১ |

### State এর জীবনচক্র (lifecycle)

| method | কখন চলে | React এ | স্তর |
|---|---|---|---|
| `initState()` | State প্রথমবার তৈরি হলে, একবার | `useEffect(() => {}, [])` | ২ |
| `didChangeDependencies()` | context থেকে পড়া কিছু (theme ইত্যাদি) বদলালে | — | ৩ |
| `didUpdateWidget()` | parent নতুন props দিলে | `useEffect(..., [prop])` | ৩ |
| `dispose()` | widget সরে গেলে, controller বন্ধ করতে | `useEffect` এর cleanup | ২ |
| `mounted` | widget এখনো screen এ আছে কিনা। await এর পরে setState এর আগে দেখতে হয় | — | ২ |

### Layout

| widget | কী করে | CSS / Tailwind এ | স্তর |
|---|---|---|---|
| `Row` ✅ | পাশাপাশি সাজায় | `flex flex-row` | ১ |
| `Column` | উপর-নিচে সাজায় | `flex flex-col` | ১ |
| `mainAxisAlignment` | মূল দিকে কীভাবে সাজাবে | `justify-*` | ১ |
| `crossAxisAlignment` | আড়াআড়ি দিকে কীভাবে সাজাবে | `items-*` | ১ |
| `Expanded` ✅ | বাকি সব জায়গা নিয়ে নেয় | `flex-1` | ১ |
| `Flexible` | জায়গা নিতে পারে, কিন্তু বাধ্য না | `flex-initial` | ২ |
| `Spacer` | ফাঁকা জায়গা ঠেলে দেয় | `flex-grow` div | ১ |
| `Container` ✅ | padding, রং, border, মাপ সব এক widget এ | `div` + class | ১ |
| `Padding` ✅ | ভেতরে ফাঁকা জায়গা | `p-4` | ১ |
| `EdgeInsets` ✅ | padding/margin এর মাপ: `EdgeInsets.all(16)` | `p-4`, `px-2` | ১ |
| `SizedBox` ✅ | নির্দিষ্ট মাপ, বা দুটো widget এর মাঝে ফাঁক | `w-4`, `gap` | ১ |
| `Center` ✅ | মাঝখানে বসায় | `flex items-center justify-center` | ১ |
| `Align` ✅ | নির্দিষ্ট দিকে বসায় | `self-start` ইত্যাদি | ১ |
| `Stack` ✅ | একটার ওপর আরেকটা | `relative` | ১ |
| `Positioned` ✅ | Stack এর ভেতরে নির্দিষ্ট জায়গায় | `absolute top-2 right-2` | ১ |
| `Wrap` | জায়গা না থাকলে পরের লাইনে চলে যায় | `flex-wrap` | ২ |
| `BoxDecoration` ✅ | রং, border, গোল কোণ, ছায়া | `bg-*`, `border`, `rounded`, `shadow` | ১ |
| `BorderRadius` ✅ | কোণ গোল করা | `rounded-xl` | ১ |
| `DecoratedBox` ✅ | শুধু decoration, padding ছাড়া | border/bg class | ২ |
| `SafeArea` ✅ | notch আর status bar এর নিচে বসায় | `env(safe-area-inset-*)` | ১ |
| `MediaQuery` | screen এর মাপ, keyboard এর উচ্চতা | `window.innerWidth` | ২ |
| `LayoutBuilder` | parent কতটা জায়গা দিল দেখে layout বদলানো | container query | ৩ |
| constraints | parent child কে বলে "এর বেশি বা কম হতে পারবে না" | — (Flutter এর layout নিয়ম) | ২ |

### দেখানোর widget

| widget | কী করে | HTML এ | স্তর |
|---|---|---|---|
| `Text` ✅ | লেখা | `p`, `span` | ১ |
| `TextStyle` ✅ | font size, weight, রং | CSS font | ১ |
| `Icon` ✅ | Material icon | icon font | ১ |
| `Image.asset` ✅ | app এর ভেতরের ছবি | `img src="/logo.png"` | ১ |
| `Image.network` | internet থেকে ছবি | `img src="https://..."` | ১ |
| `SvgPicture` ✅ | SVG ছবি (flutter_svg package) | inline `svg` | ২ |
| `CircleAvatar` | গোল প্রোফাইল ছবি | `rounded-full img` | ২ |
| `Card` | ছায়া/border সহ বাক্স | card div | ১ |
| `Divider` | পাতলা দাগ | `hr` | ১ |

### List আর scroll

| widget | কী করে | React এ | স্তর |
|---|---|---|---|
| `ListView` | scroll করা যায় এমন তালিকা | `overflow-y-auto` + map | ১ |
| `ListView.builder` | শুধু screen এ দেখা item গুলো বানায়, লম্বা list এর জন্য | virtualized list | ১ |
| `GridView` | ঘর ঘর করে সাজানো | `grid grid-cols-2` | ২ |
| `SingleChildScrollView` | একটা বড় widget কে scroll করায় | `overflow-auto` | ১ |
| `IndexedStack` ✅ | সব child রাখে, একটাই দেখায় | `display: none` বাকিগুলোয় | ২ |
| `CustomScrollView`, Sliver | জটিল scroll (ছোট হয়ে যাওয়া header) | — | ৩ |
| `RefreshIndicator` | টেনে নামিয়ে refresh | pull to refresh | ২ |

### Input আর চাপ

| widget | কী করে | HTML / React এ | স্তর |
|---|---|---|---|
| `FilledButton`, `OutlinedButton`, `TextButton` | বোতাম | `button` | ১ |
| `IconButton` ✅ | শুধু icon এর বোতাম | icon `button` | ১ |
| `onPressed` / `onTap` ✅ | চাপলে কী হবে | `onClick` | ১ |
| `VoidCallback` ✅ | কিছু না নেওয়া, কিছু না ফেরত দেওয়া function এর type | `() => void` | ১ |
| `GestureDetector` | যেকোনো widget কে চাপার মতো বানায় (ripple ছাড়া) | `div onClick` | ২ |
| `InkWell` | চাপার সাথে ripple effect | — | ২ |
| `TextField` | লেখার ঘর | `input` | ১ |
| `TextEditingController` | TextField এর লেখা পড়া/বদলানো। dispose করতে হয় | `useRef` / controlled input | ২ |
| `Form`, `TextFormField` | validation সহ form | `form` + validation | ২ |
| `FocusNode` | কোন ঘরে cursor, সেটা নিয়ন্ত্রণ | `ref.focus()` | ৩ |
| `Checkbox`, `Switch`, `Radio` | টিক, on/off, একটা বাছাই | `input type=...` | ২ |
| `tooltip` ✅ | চেপে ধরলে নাম দেখায়, screen reader ও পড়ে | `title`, `aria-label` | ১ |

### Page এর কাঠামো

| widget | কী করে | Next.js এ | স্তর |
|---|---|---|---|
| `Scaffold` ✅ | page এর কাঠামো: appBar, body, nav bar | page layout | ১ |
| `body` ✅ | page এর মূল অংশ | `main` | ১ |
| `AppBar` | Material এর তৈরি উপরের bar | `header` | ১ |
| `PreferredSizeWidget` ✅ | নিজের বানানো appBar এর জন্য, উচ্চতা জানায় | — | ২ |
| `NavigationBar` ✅ | নিচের tab bar | bottom nav | ১ |
| `NavigationDestination` ✅ | একটা tab | nav link | ১ |
| `Drawer` | পাশ থেকে বের হওয়া menu | sidebar | ২ |
| `FloatingActionButton` | ভাসমান গোল বোতাম | fixed button | ২ |
| `SnackBar`, `ScaffoldMessenger` | নিচে ছোট বার্তা | toast | ২ |
| `showDialog`, `AlertDialog` | popup | modal | ২ |
| `showModalBottomSheet` | নিচ থেকে ওঠা panel | bottom sheet | ২ |

### Theme

| keyword | কী করে | CSS / Tailwind এ | স্তর |
|---|---|---|---|
| `ThemeData` ✅ | পুরো app এর রং, font, widget style | `tailwind.config` | ১ |
| `ColorScheme` ✅ | মূল রংগুলো: primary, surface, error | CSS variable | ১ |
| `TextTheme` ✅ | লেখার মাপগুলো: headlineSmall, bodyMedium | `text-xl` ইত্যাদি | ১ |
| `Theme.of(context)` ✅ | এখনকার theme পড়ে | `useTheme()` | ১ |
| `ThemeExtension` ✅ | ThemeData তে নিজের রং যোগ করা (`context.safar`) | custom CSS variable | ২ |
| `navigationBarTheme` ইত্যাদি ✅ | একেক widget এর আলাদা theme | component variant | ২ |
| `WidgetStateProperty` ✅ | অবস্থা (selected, pressed) দেখে আলাদা style | `:hover`, `.active` | ২ |
| `Brightness` ✅ | light না dark | `prefers-color-scheme` | ১ |

### Navigation (go_router)

| keyword | কী করে | Next.js এ | স্তর |
|---|---|---|---|
| `GoRouter` ✅ | সব route এর তালিকা | `app/` folder | ১ |
| `GoRoute` ✅ | একটা page, `path` আর `builder` সহ | `page.tsx` | ১ |
| `StatefulShellRoute.indexedStack` ✅ | কয়েকটা route এর চারপাশে স্থায়ী shell | `layout.tsx` | ২ |
| `StatefulShellBranch` ✅ | একটা tab, নিজের history সহ | — | ২ |
| `StatefulNavigationShell` ✅ | shell কে দেওয়া জিনিস: এখনকার page, currentIndex, goBranch | `children` + `usePathname` | ২ |
| `context.go()` | এই URL এ যাও | `router.replace` / `Link` | ১ |
| `context.push()` | নতুন page উপরে বসাও | `router.push` | ১ |
| `context.pop()` | আগের page এ ফেরো | `router.back` | ১ |
| `state.pathParameters` | URL এর `:id` অংশ | `params` | ২ |
| `Navigator` | Flutter এর নিজস্ব page stack (go_router এর নিচে এটাই চলে) | browser history | ৩ |

### Async UI আর data

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `FutureBuilder` | Future এর অবস্থা (loading, data, error) দেখে আঁকে | `useQuery` এর কাছাকাছি | ২ |
| `StreamBuilder` | Stream এর প্রতিটা নতুন মানে আবার আঁকে | subscription + state | ৩ |
| `http` package | API call | `fetch` | ২ |
| `jsonDecode` / `jsonEncode` | JSON লেখা থেকে Map, Map থেকে লেখা | `JSON.parse` / `JSON.stringify` | ২ |
| `fromJson` / `toJson` | Map থেকে model object, আর উল্টো | zod parse / class transform | ২ |

### State management (MVVM)

| keyword | কী করে | React এ | স্তর |
|---|---|---|---|
| `ChangeNotifier` | ViewModel এর ভিত্তি, মান বদলালে জানায় | store (Zustand) | ২ |
| `notifyListeners()` | "মান বদলেছে, আবার আঁকো" | store `set()` | ২ |
| `ListenableBuilder` | ViewModel শুনে আবার আঁকে | `useStore()` | ২ |
| `ValueNotifier` | একটাই মানের ছোট ChangeNotifier | `useState` বাইরে রাখা | ২ |
| `Provider` (package) | widget tree তে নিচে ViewModel পৌঁছে দেয় | Context Provider | ২ |
| `InheritedWidget` | Provider আর Theme এর নিচে আসলে এটাই চলে | `createContext` | ৩ |

### Animation (পরে)

| widget | কী করে | CSS এ | স্তর |
|---|---|---|---|
| `AnimatedContainer`, `AnimatedOpacity` | মান বদলালে নিজে থেকে animate হয় | `transition` | ২ |
| `AnimationController` | সময় ধরে animation নিয়ন্ত্রণ | `@keyframes` + JS | ৩ |
| `Hero` | এক page থেকে আরেক page এ একই ছবি উড়ে যায় | shared element transition | ৩ |

### Test

| keyword | কী করে | JS এ | স্তর |
|---|---|---|---|
| `flutter test` ✅ | test চালায় | `vitest` / `jest` | ২ |
| `testWidgets` ✅ | একটা widget test | `test()` + Testing Library | ২ |
| `tester.pumpWidget` ✅ | widget screen এ বসায় | `render()` | ২ |
| `tester.tap`, `pumpAndSettle` ✅ | চাপো, animation শেষ হওয়া পর্যন্ত অপেক্ষা | `fireEvent.click`, `waitFor` | ২ |
| `find.text`, `find.byTooltip` ✅ | screen এ খোঁজা | `screen.getByText` | ২ |

## আরও পড়ো

- [Widget আর StatelessWidget](/flutter/widgets-basics): Widget, State, private `_`
- [Constructor আর build()](/flutter/constructor-and-build): `this`, `super.key`, `required`, `const`
- [App Architecture: MVVM](/flutter/app-architecture): ChangeNotifier, Provider
- [Bottom Navigation আর go_router](/flutter/navigation-go-router): go_router, NavigationBar, Theme
