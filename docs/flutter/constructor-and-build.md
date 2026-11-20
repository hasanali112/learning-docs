<script setup>
const buildFlow = {
  title: 'build() কে ডাকে, context কোথা থেকে আসে',
  nodes: [
    { id: 'run', label: 'runApp()', sub: 'তুমি ডাকো' },
    { id: 'obj', label: 'Widget object', sub: 'constructor চলে' },
    { id: 'el', label: 'Element', sub: 'tree তে জায়গা' },
    { id: 'build', label: 'build(context)', sub: 'Flutter ডাকে' },
    { id: 'child', label: 'নিচের widget', sub: 'আবার একই কাজ' },
  ],
  steps: [
    {
      node: 'run',
      title: '১. তুমি শুধু runApp() ডাকো',
      text: 'main.dart এ তুমি শুধু একটা widget object বানিয়ে Flutter এর হাতে দাও। এরপর বাকি সব Flutter করে।',
      code: 'void main() => runApp(const MyApp());',
    },
    {
      node: 'obj', edge: 0,
      title: '২. Constructor চলে, object তৈরি',
      text: 'const MyApp() লিখলেই constructor চলে আর একটা object তৈরি হয়। এই object এ শুধু props (final field) থাকে। এখনো কিছু আঁকা হয়নি।',
      code: 'MyApp  { key: null }',
    },
    {
      node: 'el', edge: 1,
      title: '৩. Flutter tree তে একটা জায়গা বানায়',
      text: 'Flutter এই widget এর জন্য tree তে একটা জায়গা (Element) বানায়। এই জায়গাটাই BuildContext। Docs: "BuildContext objects are actually Element objects"।',
      code: 'Root\n └─ MyApp  ← এখানে (context)',
    },
    {
      node: 'build', edge: 2,
      title: '৪. Flutter নিজে build(context) ডাকে',
      text: 'তুমি কখনো build() ডাকো না। React যেমন নিজে render() ডাকে, Flutter তেমন নিজে build() ডাকে, আর ধাপ ৩ এর জায়গাটা context হিসেবে পাঠিয়ে দেয়।',
      code: 'final child = widget.build(element);',
    },
    {
      node: 'child', edge: 3,
      title: '৫. ফেরত আসা widget এর জন্য আবার একই কাজ',
      text: 'build() যে widget ফেরত দিল (MaterialApp, Scaffold...), সেগুলোর প্রতিটার জন্য Flutter আবার ধাপ ২ থেকে ৪ করে। এভাবে পুরো tree তৈরি হয়, তারপর screen এ আঁকা হয়।',
      code: 'Root\n └─ MyApp\n     └─ MaterialApp\n         └─ Scaffold\n             └─ Text',
    },
  ],
}
</script>

# Constructor আর build(): TypeScript এর সাথে মিলিয়ে

Widget এর দুইটা জিনিস প্রথমে সবচেয়ে অদ্ভুত লাগে:

```dart
const ProductCard({super.key, required this.name});   // ← এটা কী?

Widget build(BuildContext context) { ... }            // ← context কোথা থেকে আসে?
```

দুটোই ধাপে ধাপে TypeScript এর সাথে মিলিয়ে ভাঙা হলো। শেষে গিয়ে দেখবে, এগুলো আসলে TS এর জিনিসেরই ছোট রূপ।

## অংশ ১: Constructor

### ১.১ সবচেয়ে সাধারণ class

```ts
// TypeScript
class Product {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const p = new Product('চা');
```

```dart
// Dart: TS এর মতো করে লেখা
class Product {
  String name;

  Product(String name) : name = name;
}

final p = Product('চা');
```

তিনটা পার্থক্য:

| TS | Dart | কেন |
|---|---|---|
| `constructor(...)` | `Product(...)` | Dart এ constructor এর নাম = class এর নাম |
| `new Product()` | `Product()` | Dart এ `new` লেখা লাগে না |
| body তে `this.name = name` | `: name = name` | Dart এ মান দেওয়ার কাজ body এর আগে, `:` এর পরে হয় (initializer list) |

::: tip body তে কেন না?
Dart এ `String name` মানে এটা কখনো `null` হবে না। body চলার আগেই object তৈরি হয়ে যায়, তখন `name` খালি থাকতো। তাই Dart চায় body এর **আগেই** মান বসাতে। এজন্য `:` দিয়ে লেখা হয়।
:::

### ১.২ ছোট রূপ: `this.name`

উপরের কাজটা এত বেশি লাগে যে Dart একটা shortcut দিয়েছে:

```dart
class Product {
  String name;

  Product(this.name);   // parameter এ this.name = "যা আসবে সোজা name field এ রাখো"
}
```

TypeScript এও ঠিক এই জিনিস আছে, নাম **parameter property**:

```ts
class Product {
  constructor(public name: string) {}   // একই কাজ: parameter সোজা field এ
}
```

| TS | Dart |
|---|---|
| `constructor(public name: string) {}` | `Product(this.name);` |

### ১.৩ `final` = `readonly`

```ts
class Product {
  constructor(public readonly name: string) {}
}
```

```dart
class Product {
  final String name;    // একবার মান বসলে আর বদলানো যাবে না
  Product(this.name);
}
```

Widget এর সব field `final` হয়, কারণ widget হলো একটা **বর্ণনা**: "এই নামের card দেখাও"। বর্ণনা বদলাতে হলে Flutter নতুন widget বানায়, পুরনোটা বদলায় না। React এর props ও তো component এর ভেতর থেকে বদলানো যায় না, একই ভাবনা।

### ১.৪ Positional বনাম Named parameter

এখানেই সবচেয়ে বেশি গুলিয়ে যায়।

**Positional:** ক্রম অনুযায়ী মান দিতে হয়।

```ts
class Product {
  constructor(public name: string, public price: number) {}
}
new Product('চা', 20);
```

```dart
class Product {
  final String name;
  final int price;
  Product(this.name, this.price);
}
Product('চা', 20);
```

**Named:** নাম ধরে মান দিতে হয়, ক্রম লাগে না। Parameter গুলো `{ }` এর ভেতরে থাকে।

```ts
// TS এ named এর মতো কাজ: object নিয়ে destructure
class Product {
  name: string;
  price: number;
  constructor({ name, price = 0 }: { name: string; price?: number }) {
    this.name = name;
    this.price = price;
  }
}
new Product({ name: 'চা', price: 20 });
```

```dart
class Product {
  final String name;
  final int price;
  Product({required this.name, this.price = 0});
}
Product(name: 'চা', price: 20);
Product(price: 20, name: 'চা');   // ক্রম উল্টালেও চলে
```

| TS | Dart | মানে |
|---|---|---|
| `{ name }: { name: string }` | `{required this.name}` | দিতেই হবে |
| `price = 0` | `this.price = 0` | না দিলে 0 |
| `note?: string` | `this.note` + `final String? note;` | না দিলে `null` |
| `new Product({ name: 'চা' })` | `Product(name: 'চা')` | ডাকার ধরন |

**Flutter এর সব widget named parameter ব্যবহার করে।** তাই `Text('হ্যালো', style: ...)`, `Padding(padding: ..., child: ...)` এভাবে লেখা হয়। এটা React এর props এর মতোই পড়তে লাগে: `<Padding padding={...}>`।

### ১.৫ `const` constructor

```dart
const Product({required this.name});
```

`const` মানে: সব field যদি আগে থেকেই জানা থাকে, তাহলে এই object টা **compile এর সময়েই একবার বানিয়ে রাখা যাবে**, আর বারবার একই object ব্যবহার হবে।

```dart
const a = Product(name: 'চা');
const b = Product(name: 'চা');
// a আর b আসলে একই object, memory তে একটাই
```

TS এ সবচেয়ে কাছের জিনিস `as const` বা `Object.freeze()`, তবে Dart এর `const` আরও শক্ত। Flutter এ লাভ হলো: `const` widget কে Flutter আবার build করে না, তাই app দ্রুত চলে। এজন্য VS Code বারবার বলে "add const"।

`const` constructor বানাতে হলে সব field অবশ্যই `final` হতে হয়।

### ১.৬ `super.key`: parent class কে মান পাঠানো

```dart
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.name});
  ...
}
```

`StatelessWidget` (parent) এর নিজের একটা constructor আছে, যেটা `key` নামে একটা মান নেয়। `super.key` মানে "যে key আসবে, সেটা সোজা parent এর constructor এ দিয়ে দাও"।

TS এ ঠিক একই কাজ:

```ts
class ProductCard extends StatelessWidget {
  constructor({ key, name }: { key?: Key; name: string }) {
    super({ key });       // ← parent কে key দেওয়া
    this.name = name;
  }
}
```

Dart এর পুরনো লম্বা রূপ দেখলে এটা আরও পরিষ্কার হয়:

```dart
const ProductCard({Key? key, required this.name}) : super(key: key);   // লম্বা
const ProductCard({super.key, required this.name});                     // ছোট, একই কাজ
```

**`key` কী কাজে লাগে?** List এ অনেকগুলো একই রকম widget থাকলে, কোনটা কোনটা, Flutter `key` দিয়ে চেনে। React এর list এ `key` prop এর মতো। বেশিরভাগ সময় তুমি নিজে key দেবে না, শুধু `super.key` লিখে রাখবে।

### ১.৭ পুরো widget constructor, এক নজরে

```dart
class ProductCard extends StatelessWidget {
  const ProductCard({        // const: দ্রুত, compile time এ বানানো যায়
    super.key,               // key → parent (StatelessWidget) কে
    required this.name,      // দিতেই হবে, সোজা name field এ
    this.price = 0,          // না দিলে 0
    this.note,               // না দিলে null
  });

  final String name;         // readonly props
  final int price;
  final String? note;        // ? = null হতে পারে
  ...
}

// ব্যবহার
const ProductCard(name: 'চা', price: 20)
```

```tsx
// TS / React এ একই জিনিস
type Props = { name: string; price?: number; note?: string };

function ProductCard({ name, price = 0, note }: Props) { ... }

<ProductCard name="চা" price={20} />
```

## অংশ ২: `build(BuildContext context)`

### ২.১ React এর class component দিয়ে বুঝি

আজকাল React এ function component বেশি চলে, কিন্তু পুরনো **class component** দেখলে Flutter একদম মিলে যায়:

```tsx
// React class component
class ProductCard extends React.Component<Props> {
  render() {
    return <p>{this.props.name}</p>;
  }
}
```

```dart
// Flutter
class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.name});
  final String name;

  @override
  Widget build(BuildContext context) {
    return Text(name);
  }
}
```

| React class component | Flutter |
|---|---|
| `extends React.Component` | `extends StatelessWidget` |
| `this.props.name` | `name` (field) |
| `render()` | `build(context)` |
| JSX ফেরত দেয় | একটা `Widget` ফেরত দেয় |
| React নিজে `render()` ডাকে | Flutter নিজে `build()` ডাকে |

**মূল কথা: তুমি কখনো `build()` নিজে ডাকো না।** তুমি শুধু লিখে রাখো "আমাকে দেখতে এমন হবে"। কখন ডাকবে, সেটা Flutter ঠিক করে, ঠিক যেমন React ঠিক করে কখন `render()` চলবে।

### ২.২ `@override` কেন

`StatelessWidget` এর ভেতরে Flutter এমন কিছু লিখে রেখেছে (সরল করে):

```dart
abstract class StatelessWidget extends Widget {
  const StatelessWidget({super.key});

  Widget build(BuildContext context);   // শুধু ঘোষণা, ভেতরে কিছু নেই
}
```

TS এ একই জিনিস:

```ts
abstract class StatelessWidget {
  abstract build(context: BuildContext): Widget;   // child class কে লিখতেই হবে
}

class ProductCard extends StatelessWidget {
  override build(context: BuildContext): Widget {   // TS 4.3+ এও override আছে
    return new Text(this.name);
  }
}
```

মানে parent বলে দিয়েছে "প্রত্যেক widget এর একটা build থাকতেই হবে"। তুমি সেটা নিজের মতো করে লিখছো, তাই উপরে `@override` লেখো। না লিখলেও চলে, কিন্তু লিখলে ভুল নাম দিলে (যেমন `biuld`) Dart সাথে সাথে ধরিয়ে দেয়।

### ২.৩ Method এর গঠন, টুকরো করে

```dart
Widget build(BuildContext context) {
  return Text(name);
}
```

```ts
build(context: BuildContext): Widget {
  return new Text(this.name);
}
```

| অংশ | মানে |
|---|---|
| `Widget` (শুরুতে) | return type: এই method একটা Widget ফেরত দেবে। TS এ এটা শেষে `: Widget` |
| `build` | method এর নাম, এটাই হতে হবে |
| `BuildContext context` | parameter: type `BuildContext`, নাম `context`। TS এ `context: BuildContext` |
| `return Text(name)` | একটাই widget ফেরত দিতে হয়, যার ভেতরে বাকি সব (JSX এ যেমন একটা root লাগে) |

Dart এ **type আগে, নাম পরে** (`BuildContext context`), TS এ **নাম আগে, type পরে** (`context: BuildContext`)। শুধু এই উল্টোটা মনে রাখলেই অনেকটা পরিষ্কার হয়ে যায়।

### ২.৪ `context` কোথা থেকে আসে

<FlowSteps v-bind="buildFlow" />

সারকথা: `context` হলো **widget tree তে এই widget এর ঠিকানা**। Flutter এটা বানায় আর `build()` ডাকার সময় পাঠিয়ে দেয়। তুমি কখনো নিজে `BuildContext` বানাও না।

### ২.৫ `context` দিয়ে কী করা হয়

ঠিকানা জানা থাকলে tree এর **উপরের দিকে** থাকা জিনিস খোঁজা যায়:

```dart
@override
Widget build(BuildContext context) {
  final theme = Theme.of(context);          // উপরের MaterialApp এর theme
  final size = MediaQuery.sizeOf(context);  // screen কত বড়
  return Text(
    name,
    style: theme.textTheme.titleLarge,
  );
}
```

React এ একই কাজ hook দিয়ে:

```tsx
function ProductCard({ name }: Props) {
  const theme = useContext(ThemeContext);    // উপরের Provider থেকে
  return <p style={theme.title}>{name}</p>;
}
```

| React | Flutter |
|---|---|
| `useContext(ThemeContext)` | `Theme.of(context)` |
| window এর মাপ | `MediaQuery.sizeOf(context)` |
| `useRouter()` | `Navigator.of(context)` |

React এর hook নিজে নিজে জানে কোন component এর ভেতরে চলছে। Flutter এ সেটা খোলাখুলি `context` হিসেবে হাতে দেওয়া হয়, এটাই পার্থক্য।

::: warning একটা সাধারণ ভুল
`context` শুধু `build()` এর ভেতরে (বা সেখান থেকে ডাকা function এ) ব্যবহার করো। class এর field এ `context` রেখে দিয়ে পরে ব্যবহার করা যায় না, কারণ widget tree বদলালে সেই ঠিকানা আর ঠিক থাকে না।
:::

## সব একসাথে: Dart ↔ TypeScript

| বিষয় | TypeScript | Dart |
|---|---|---|
| Constructor এর নাম | `constructor()` | class এর নাম, `Product()` |
| Object বানানো | `new Product()` | `Product()` |
| Parameter সোজা field এ | `constructor(public name: string)` | `Product(this.name)` |
| বদলানো যায় না | `readonly` | `final` |
| Named parameter | `({ name }: {...})` | `({required this.name})` |
| Optional | `note?: string` | `String? note` |
| Default | `price = 0` | `this.price = 0` |
| Parent কে পাঠানো | `super({ key })` | `super.key` |
| Compile time constant | `as const` (কাছাকাছি) | `const` |
| Type লেখা | `name: string` | `String name` |
| Return type | `build(): Widget` | `Widget build()` |
| Abstract method লেখা | `override build()` | `@override Widget build()` |
| Private | `private` / `#name` | নামের শুরুতে `_` |

## নিজে করে দেখো

এই TS class টা Dart এ লেখো, তারপর নিচে মিলিয়ে নাও:

```ts
class Student {
  constructor(
    public readonly name: string,
    public readonly cgpa: number = 0,
    public readonly ielts?: number,
  ) {}
}
new Student('রাফি', 3.5);
```

::: details উত্তর দেখো
```dart
class Student {
  const Student(this.name, [this.cgpa = 0, this.ielts]);

  final String name;
  final double cgpa;
  final double? ielts;
}

const s = Student('রাফি', 3.5);
```

`[ ]` হলো optional positional parameter। Named দিয়ে লিখলে আরও পরিষ্কার হয়, আর Flutter এ সেটাই চলে:

```dart
class Student {
  const Student({required this.name, this.cgpa = 0, this.ielts});

  final String name;
  final double cgpa;
  final double? ielts;
}

const s = Student(name: 'রাফি', cgpa: 3.5);
```
:::

## সূত্র

- [Dart: Constructors](https://dart.dev/language/constructors)
- [Dart: Functions (named আর positional parameter)](https://dart.dev/language/functions)
- [StatelessWidget class (API)](https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html)
- [BuildContext class (API)](https://api.flutter.dev/flutter/widgets/BuildContext-class.html)
- [Building user interfaces with Flutter](https://docs.flutter.dev/ui)
