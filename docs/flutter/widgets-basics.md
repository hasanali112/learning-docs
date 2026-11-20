<script setup>
const rebuildFlow = {
  title: 'StatefulWidget এ বাটন চাপলে কী হয়',
  nodes: [
    { id: 'tap', label: 'User চাপে', sub: 'onPressed' },
    { id: 'set', label: 'setState()', sub: 'state বদলায়' },
    { id: 'build', label: 'build()', sub: 'আবার চলে' },
    { id: 'diff', label: 'Flutter মেলায়', sub: 'আগের সাথে' },
    { id: 'screen', label: 'Screen', sub: 'শুধু বদলানো অংশ' },
  ],
  steps: [
    {
      node: 'tap',
      title: '১. User বাটন চাপলো',
      text: 'বাটনের onPressed এ দেওয়া function চলে।',
      code: 'onPressed: _increment',
    },
    {
      node: 'set', edge: 0,
      title: '২. setState দিয়ে state বদলানো',
      text: 'React এর setCount এর মতো। শুধু ভ্যারিয়েবল বদলালে হবে না, setState এর ভেতরে বদলাতে হবে, তাহলেই Flutter জানবে কিছু বদলেছে।',
      code: 'setState(() {\n  _count++;\n});',
    },
    {
      node: 'build', edge: 1,
      title: '৩. build() আবার চলে',
      text: 'Flutter নতুন মান দিয়ে build() আবার চালায়, আর একটা নতুন widget tree এর বর্ণনা পায়।',
      code: "Text('$_count')   // এখন 1",
    },
    {
      node: 'diff', edge: 2,
      title: '৪. আগের tree এর সাথে মেলানো',
      text: 'React এর virtual DOM এর মতো। Flutter পুরনো আর নতুন বর্ণনা মিলিয়ে দেখে ঠিক কোথায় বদল হয়েছে।',
      code: "আগে: Text('0')\nএখন: Text('1')  ← শুধু এটা বদলেছে",
    },
    {
      node: 'screen', edge: 3,
      title: '৫. শুধু বদলানো অংশ আবার আঁকা',
      text: 'পুরো screen না, শুধু লেখাটা নতুন করে আঁকা হয়। তাই build() বারবার চললেও app দ্রুত থাকে।',
    },
  ],
}
</script>

# Widget আর StatelessWidget

Flutter এ screen বানানো শুরু করার আগে তিনটা জিনিস বুঝতে হয়: **widget কী**, **class টা কীভাবে লেখা হয়**, আর **একটা screen কীভাবে টুকরো করে বানাতে হয়**। এখানে সব Next.js (React) আর OOP এর সাথে মিলিয়ে।

::: tip import এর লাইন
Flutter 3.47 থেকে Material আলাদা package: `import 'package:material_ui/material_ui.dart';`। এর আগের version এ লেখা হতো `import 'package:flutter/material.dart';`। নিচের সব কোডে নতুনটা ব্যবহার করা হয়েছে।
:::

## Widget কী

Flutter docs বলে: **"In Flutter, almost everything is a widget—even layout models are widgets."** লেখা, বাটন, ছবি তো widget বটেই, এমনকি padding, মাঝখানে বসানো, পাশাপাশি সাজানো, সবই widget।

React এ যেমন সব কিছু component, Flutter এ তেমন সব কিছু widget। Flutter এর docs নিজেই বলে এর widget framework **React থেকে অনুপ্রাণিত**।

| Next.js / React | Flutter |
|---|---|
| Component | Widget |
| JSX tree (`<div><p/></div>`) | Widget tree (`Center(child: Text())`) |
| `props` | constructor এর parameter (`final` field) |
| `useState` | `StatefulWidget` + `setState` |
| `return (<div>...</div>)` | `build()` method থেকে `return Widget` |
| `className="flex flex-col"` | `Column` widget |
| `useContext(ThemeContext)` | `Theme.of(context)` |

### Widget tree: JSX এর মতো

```tsx
// React
<div className="flex items-center justify-center">
  <p className="text-blue-600">Hello</p>
</div>
```

```dart
// Flutter
Center(
  child: Text(
    'Hello',
    style: TextStyle(color: Colors.blue),
  ),
)
```

পার্থক্য হলো, JSX এ HTML এর মতো ট্যাগ লেখো, আর Flutter এ সরাসরি class এর object বানাও। একটা widget এর ভেতরে আরেকটা widget রাখতে `child:` (একটা) বা `children:` (অনেকগুলো) ব্যবহার হয়।

## প্রথমে একটু OOP

Flutter এর widget আসলে একটা **class**। তাই কয়েকটা OOP শব্দ জানা দরকার:

| OOP শব্দ | মানে | Widget এ কোথায় |
|---|---|---|
| **Class** | একটা নকশা (blueprint) | `class ProductCard` |
| **Object** | নকশা থেকে বানানো আসল জিনিস | `ProductCard(name: 'চা')` |
| **Inheritance** (`extends`) | আরেকটা class এর ক্ষমতা নিয়ে নেওয়া | `extends StatelessWidget` |
| **Constructor** | object বানানোর সময় যে function চলে | `const ProductCard({...})` |
| **Field** | object এর ভেতরে রাখা মান | `final String name;` |
| **Override** (`@override`) | parent class এর method নিজের মতো করে লেখা | `Widget build(...)` |

**মূল কথা:** `StatelessWidget` হলো Flutter এর বানানো একটা parent class। তুমি `extends` করে তার সব ক্ষমতা নাও, শুধু `build()` method টা নিজে লিখে দাও: "আমাকে দেখতে কেমন হবে"।

## StatelessWidget

Docs এর সংজ্ঞা: **"A widget that does not require mutable state."** মানে যে widget এর ভেতরে এমন কোনো মান নেই যেটা নিজে থেকে বদলায়। বাইরে থেকে যা পায় (props), শুধু তা দিয়েই নিজেকে দেখায়।

উদাহরণ: `Text`, `Icon`, একটা product এর card, একটা শিরোনাম।

### Class এর কাঠামো, লাইন ধরে

```dart
import 'package:material_ui/material_ui.dart';            // ১

class ProductCard extends StatelessWidget {                // ২
  const ProductCard({                                      // ৩
    super.key,                                             // ৪
    required this.name,                                    // ৫
    this.price = 0,                                        // ৬
  });

  final String name;                                       // ৭
  final int price;

  @override                                                // ৮
  Widget build(BuildContext context) {                     // ৯
    return Card(                                           // ১০
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('$name: $price টাকা'),
      ),
    );
  }
}
```

| লাইন | কী করে | React এ কী |
|---|---|---|
| ১ | Material widget গুলো import | `import React from 'react'` |
| ২ | `ProductCard` নামে class, `StatelessWidget` থেকে inherit | `function ProductCard(...)` |
| ৩ | Constructor। `const` থাকলে Flutter object টা আবার ব্যবহার করতে পারে, দ্রুত হয় | — |
| ৪ | `key`: list এ widget চিনে রাখার জন্য, parent কে দিয়ে দেওয়া | `key` prop |
| ৫ | `required`: এই prop না দিলে error | TypeScript এ `name: string` |
| ৬ | Default মান | `price = 0` |
| ৭ | `final` field: props রাখার জায়গা, একবার সেট হলে বদলায় না | `props.name` |
| ৮ | Parent class এর method নিজে লিখছি, এটা জানানো | — |
| ৯ | `build()`: এই widget দেখতে কেমন হবে | component এর `return` |
| ১০ | একটা widget tree ফেরত দেওয়া | JSX ফেরত দেওয়া |

### একই জিনিস React এ

```tsx
type Props = { name: string; price?: number };

export function ProductCard({ name, price = 0 }: Props) {
  return (
    <div className="card p-4">
      <p>{name}: {price} টাকা</p>
    </div>
  );
}
```

### ব্যবহার করা

```tsx
// React
<ProductCard name="চা" price={20} />
```

```dart
// Flutter
const ProductCard(name: 'চা', price: 20)
```

Flutter এ named parameter (`name:`) দিয়ে মান দেওয়া হয়, ঠিক React এর props এর মতো। Docs এর নিয়ম: constructor এ `key` প্রথমে, `child` থাকলে সবার শেষে।

### build() কখন চলে

Docs বলে তিনটা সময়ে:

1. widget প্রথমবার screen এ আসলে
2. parent নতুন মান (props) দিলে
3. যে `InheritedWidget` এর উপর নির্ভর করে (যেমন `Theme`) সেটা বদলালে, যেমন light থেকে dark mode

React এর মতোই: props বা context বদলালে component আবার render হয়।

## BuildContext কী

`build(BuildContext context)` এর `context` হলো **widget tree তে এই widget এর ঠিকানা**। এটা দিয়ে উপরের দিকে থাকা জিনিস খোঁজা যায়:

```dart
Theme.of(context).colorScheme.primary   // উপরের MaterialApp এর theme থেকে রং
```

React এর `useContext(ThemeContext)` এর মতো। Theme `MaterialApp` এ একবার দেওয়া থাকে, নিচের সব widget `context` দিয়ে সেটা পায়।

## StatelessWidget বনাম StatefulWidget

Docs: **"A widget is either stateful or stateless. If a widget can change—when a user interacts with it, for example—it's stateful."**

| | StatelessWidget | StatefulWidget |
|---|---|---|
| কখন | শুধু দেখায়, নিজে বদলায় না | user এর কাজে বদলায় (চাপা, লেখা, টিক দেওয়া) |
| উদাহরণ | `Text`, `Icon`, card | `Checkbox`, `TextField`, `Slider` |
| React এ | `useState` ছাড়া component | `useState` সহ component |
| Class কয়টা | ১টা | ২টা: widget + state |

### StatefulWidget এর দুই class

```dart
class Counter extends StatefulWidget {          // ১. widget: বাইরের রূপ, props
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {     // ২. state: বদলানো মান আর build()
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: _increment,
      child: Text('চাপা হয়েছে $_count বার'),
    );
  }
}
```

```tsx
// একই জিনিস React এ
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>চাপা হয়েছে {count} বার</button>;
}
```

**দুইটা class কেন?** Docs এর ব্যাখ্যা: widget object গুলো ক্ষণস্থায়ী, প্রতিবার build এ নতুন করে বানানো হয়। কিন্তু `State` object থেকে যায় build এর মাঝেও। তাই বদলানো মান (`_count`) রাখা হয় `State` এ, যাতে হারিয়ে না যায়। React এ এই কাজটা `useState` আড়ালে করে দেয়।

`_` দিয়ে শুরু নাম (`_CounterState`, `_count`) মানে **private**, এই ফাইলের বাইরে থেকে দেখা যায় না।

<FlowSteps v-bind="rebuildFlow" />

::: tip কোনটা বাছবো
সবসময় **StatelessWidget দিয়ে শুরু করো।** যদি দেখো widget এর ভেতরের কোনো মান user এর কাজে বদলাতে হবে, তখন StatefulWidget এ বদলাও। আর বড় app এ data লোড বা business logic ViewModel এ রাখা হয়, widget এ না। দেখো [App Architecture: MVVM](/flutter/app-architecture)।
:::

## একটা screen design করতে কী কী লাগে

Docs এর layout গাইড ধাপগুলো এভাবে দেয়: layout widget বাছো, দেখা যায় এমন widget বানাও, সেটা layout এ বসাও, layout টা page এ বসাও, চালিয়ে দেখো। কাজের সময় এটা এই ক্রমে করো:

### ধাপ ১: Design কে বাক্সে ভাগ করো

কাগজে বা Figma তে screen টা দেখে নিজেকে জিজ্ঞেস করো:
- কোন জিনিসগুলো **উপর থেকে নিচে** সাজানো? → `Column`
- কোনগুলো **পাশাপাশি**? → `Row`
- কোনটা **লম্বা list**, scroll করবে? → `ListView`
- কোনটা **একটার উপর আরেকটা**? → `Stack`

```txt
┌──────────────────────────┐
│ [লোগো]          [🔔]     │ ← Row
├──────────────────────────┤
│ শিরোনাম                  │
│ [ খোঁজার বক্স         ]   │ ← Column (উপর থেকে নিচে)
│ ┌────┐ ┌────┐ ┌────┐     │ ← Row এর ভেতর ৩টা card
│ └────┘ └────┘ └────┘     │
│ card                     │ ← ListView (scroll)
│ card                     │
└──────────────────────────┘
```

### ধাপ ২: Layout widget চেনো (Tailwind এর সাথে)

| Tailwind / CSS | Flutter widget |
|---|---|
| `flex flex-col` | `Column` |
| `flex flex-row` | `Row` |
| `justify-*` | `mainAxisAlignment` |
| `items-*` | `crossAxisAlignment` |
| `flex-1` | `Expanded` |
| `p-4` | `Padding(padding: EdgeInsets.all(16))` |
| `gap-4` বা ফাঁকা জায়গা | `SizedBox(height: 16)` |
| `bg-*`, `rounded-*`, `border` | `Container` / `DecoratedBox` |
| `overflow-y-auto` list | `ListView` |
| `grid grid-cols-2` | `GridView` |
| `relative` + `absolute` | `Stack` + `Positioned` |
| `flex items-center justify-center` | `Center` |

Docs এর কথায়: `Row` দিয়ে "horizontally", `Column` দিয়ে "vertically" সাজাও, আর জায়গা ভাগ করতে `Expanded`।

### ধাপ ৩: Screen এর কাঠামো লেখো

প্রতিটা screen সাধারণত একটা `Scaffold` দিয়ে শুরু হয়। এটা পাতার কাঠামো: উপরের bar, মূল অংশ, নিচের nav।

```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('হোম')),
      body: SafeArea(                       // notch আর status bar এর নিচে
        child: ListView(                    // scroll হবে
          padding: const EdgeInsets.all(16),
          children: const [
            Text('শিরোনাম'),
            SizedBox(height: 12),
            ProductCard(name: 'চা', price: 20),
            ProductCard(name: 'কফি', price: 60),
          ],
        ),
      ),
    );
  }
}
```

| Scaffold এর অংশ | কাজ | Next.js এ |
|---|---|---|
| `appBar` | উপরের bar | header |
| `body` | মূল অংশ | `<main>` |
| `bottomNavigationBar` | নিচের nav | mobile nav |
| `floatingActionButton` | ভাসমান বাটন | fixed button |

### ধাপ ৪: বড় অংশগুলো আলাদা widget এ ভাগ করো

একটা `build()` ১০০ লাইনের বেশি হলে টুকরো করো, React এ যেমন বড় component ভেঙে ছোট component বানাও। Docs এর পরামর্শ: আলাদা অংশের জন্য **helper method এর চেয়ে আলাদা widget class ভালো**, এতে Flutter অপ্রয়োজনীয় rebuild এড়াতে পারে।

```dart
// ❌ এড়াও
Widget _buildHeader() => Row(...);

// ✅ এভাবে লেখো
class HomeHeader extends StatelessWidget { ... }
```

### ধাপ ৫: রং, font আর মাপ theme থেকে নাও

```dart
// ❌ সরাসরি রং
Text('শিরোনাম', style: TextStyle(color: Color(0xFF5B21B6), fontSize: 22))

// ✅ theme থেকে
Text('শিরোনাম', style: Theme.of(context).textTheme.titleLarge)
```

Tailwind এ যেমন `#5B21B6` না লিখে `text-primary` লেখো। তাহলে রং বদলালে শুধু theme ফাইল বদলাতে হয়, আর dark mode নিজে থেকেই কাজ করে।

### ধাপ ৬: ঠিক জায়গায় ফাইল রাখো

```txt
lib/
├── main.dart                       ← শুধু runApp()
├── app.dart                        ← MaterialApp, theme (layout.tsx এর মতো)
└── ui/
    ├── core/themes/                ← রং, font, spacing
    ├── core/widgets/               ← অনেক screen এ লাগে এমন widget
    └── home/
        └── widgets/
            ├── home_screen.dart    ← screen (page.tsx এর মতো)
            └── home_header.dart    ← এই screen এর ছোট অংশ
```

ফাইলের নাম `snake_case` (`home_screen.dart`), class এর নাম `PascalCase` (`HomeScreen`)। এটা Dart এর নিয়ম।

### ধাপ ৭: চালাও আর বারবার মেলাও

- কোড save করো, তারপর **hot reload** (`r`): বদল সাথে সাথে দেখা যায়।
- নতুন class বানালে, নাম বদলালে বা font যোগ করলে **hot restart** (`R`) বা app বন্ধ করে আবার চালানো লাগে।
- Design এর পাশে রেখে মিলিয়ে দেখো। ছোট phone আর dark mode এও একবার দেখো।

## নতুনরা যে ভুল করে

::: warning সাবধান
- `const` বাদ দেওয়া: যেখানে মান বদলায় না সেখানে `const` দিলে Flutter দ্রুত চলে। VS Code নিজেই নীল দাগ দিয়ে মনে করিয়ে দেয়।
- সব কিছু StatefulWidget বানানো: শুধু দেখানোর জিনিস StatelessWidget দিয়েই হয়।
- `setState` ছাড়া মান বদলানো: `_count++` লিখলে মান বদলাবে, কিন্তু screen বদলাবে না।
- একটা `build()` এ পুরো screen ঠাসা: ছোট widget class এ ভাগ করো।
- `Column` এর ভেতরে লম্বা list: screen এর বাইরে চলে গেলে overflow error দেয় (হলুদ-কালো দাগ)। scroll লাগলে `ListView` ব্যবহার করো।
:::

## সূত্র

- [Building user interfaces with Flutter](https://docs.flutter.dev/ui)
- [StatelessWidget class (API)](https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html)
- [Adding interactivity](https://docs.flutter.dev/ui/interactivity)
- [Layouts in Flutter](https://docs.flutter.dev/ui/layout)
- [Flutter for React Native developers](https://docs.flutter.dev/flutter-for/react-native-devs)
