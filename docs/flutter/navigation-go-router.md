<script setup>
const tapFlow = {
  title: 'Tourist tab এ tap করলে কী কী ঘটে',
  nodes: [
    { id: 'tap', label: 'User tap', sub: 'Tourist' },
    { id: 'bar', label: 'NavigationBar', sub: 'onDestinationSelected' },
    { id: 'shell', label: 'navigationShell', sub: 'goBranch(2)' },
    { id: 'router', label: 'GoRouter', sub: 'URL বদলায়' },
    { id: 'main', label: 'MainShell', sub: 'আবার build' },
  ],
  steps: [
    {
      node: 'tap',
      title: '১. User "Tourist" এ tap করলো',
      text: 'nav bar এর তৃতীয় tab। Flutter এ গোনা শুরু হয় 0 থেকে, তাই এর index হলো 2।',
      code: 'Home=0  Scholarship=1  Tourist=2  Community=3  Profile=4',
    },
    {
      node: 'bar', edge: 0,
      title: '২. NavigationBar তোমার function ডাকে',
      text: 'NavigationBar নিজে কিছু বদলায় না। সে শুধু জানায় "2 নম্বরে চাপ পড়েছে", আর onDestinationSelected এ তুমি যা লিখেছো সেটা চালায়।',
      code: 'onDestinationSelected: (index) {   // index = 2\n  navigationShell.goBranch(index);\n}',
    },
    {
      node: 'shell', edge: 1,
      title: '৩. goBranch(2): "তৃতীয় branch এ যাও"',
      text: 'Next.js এ <Link href="/tourist"> এ click করার মতো। তবে এখানে URL না লিখে branch এর নম্বর দাও।',
      code: 'navigationShell.goBranch(2)',
    },
    {
      node: 'router', edge: 2,
      title: '৪. GoRouter route বদলায়',
      text: 'router.dart এ branch 2 এর ভেতরে লেখা আছে GoRoute(path: \'/tourist\')। তাই URL হয় /tourist, আর builder থেকে TouristScreen তৈরি হয়।',
      code: '/  →  /tourist\nbuilder: (context, state) => const TouristScreen()',
    },
    {
      node: 'main', edge: 3,
      title: '৫. MainShell আবার আঁকা হয়',
      text: 'layout.tsx এর মতো MainShell থেকেই যায়, শুধু ভেতরের page বদলায়। currentIndex এখন 2, তাই Tourist icon রঙিন হয়। আগের Home page মুছে যায় না, শুধু লুকানো থাকে (indexedStack)।',
      code: 'body: navigationShell          // এখন TouristScreen\nselectedIndex: navigationShell.currentIndex   // 2',
    },
  ],
}
</script>

# Bottom Navigation আর go_router: Next.js এর সাথে মিলিয়ে

Safar app এ নিচে ৫টা tab এর nav bar বানানো হয়েছে: Home, Scholarship, Tourist, Community আর Profile। প্রতিটা tab একটা আলাদা route (`/`, `/scholarship` ...), ঠিক Next.js App Router এর page এর মতো।

এই নোটে কাজটায় ব্যবহার করা প্রতিটা key কী কাজ করে, সেটা লেখা আছে। প্রতিটার পাশে Next.js এর মিল দেওয়া আছে।

::: tip আগে পড়ে নাও
StatelessWidget, StatefulWidget আর `build()` কী, সেটা [Widget আর StatelessWidget](/flutter/widgets-basics) আর [Constructor আর build()](/flutter/constructor-and-build) নোটে আছে।
:::

## এক নজরে: Next.js এর folder বনাম Flutter এর ফাইল

Next.js এ folder বানালেই route হয়ে যায়। Flutter এ folder দিয়ে কিছু হয় না, route গুলো `router.dart` এ নিজের হাতে লিখে দিতে হয়।

```txt
Next.js (App Router)                    Flutter (go_router)
──────────────────────────────────────────────────────────────────────
app/layout.tsx  (root)              →   app.dart        MaterialApp.router
app/(tabs)/layout.tsx               →   main_shell.dart MainShell (nav bar)
  {children}                        →     body: navigationShell
app/(tabs)/page.tsx                 →   GoRoute('/')             HomeScreen
app/(tabs)/scholarship/page.tsx     →   GoRoute('/scholarship')  ScholarshipScreen
app/(tabs)/tourist/page.tsx         →   GoRoute('/tourist')      TouristScreen
app/(tabs)/community/page.tsx       →   GoRoute('/community')    CommunityScreen
app/(tabs)/profile/page.tsx         →   GoRoute('/profile')      ProfileScreen
(folder structure নিজেই route list)  →   routing/router.dart     GoRouter(...)
```

Safar app এর ফাইলগুলো:

```txt
lib/
  app.dart                     ← MaterialApp.router, router জুড়ে দেয়
  routing/router.dart          ← সব route এর তালিকা
  ui/shell/main_shell.dart     ← nav bar + বদলানো page (layout)
  ui/shell/nav_icon.dart       ← design এর SVG icon
  ui/home/home_screen.dart     ← প্রতিটা tab এর page
  ui/scholarship/...
  ui/tourist/...
  ui/community/...
  ui/profile/...
```

## অংশ ১: আগে যেভাবে করেছিলাম (setState দিয়ে)

প্রথমে route ছাড়াই, শুধু state দিয়ে tab বদলানো হয়েছিল। go_router কেন লাগে, সেটা বুঝতে এই ধাপটা কাজে লাগে।

```dart
class _MainShellState extends State<MainShell> {
  int _index = 0;                       // কোন tab select করা

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: const [HomeScreen(), ScholarshipScreen(), /* ... */],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (index) {
          setState(() {
            _index = index;
          });
        },
        destinations: const [ /* ... */ ],
      ),
    );
  }
}
```

Next.js এ এটা দেখতে হতো এরকম:

```tsx
// app/page.tsx   ← পুরো app এ মাত্র একটাই route: "/"
'use client'
export default function MainShell() {
  const [index, setIndex] = useState(0)
  return (
    <>
      {index === 0 && <HomeScreen />}
      {index === 1 && <ScholarshipScreen />}
      <BottomNav selected={index} onSelect={setIndex} />
    </>
  )
}
```

| key | কী করে | React / Next.js এ |
|---|---|---|
| `int _index = 0` | কোন tab select করা, সেটা মনে রাখে। `_` থাকায় এটা private, শুধু এই ফাইলেই ব্যবহার করা যায় | `const [index, setIndex] = useState(0)` |
| `setState(() { _index = i; })` | মান বদলায়, আর Flutter কে বলে `build()` আবার চালাতে | `setIndex(i)` |
| `IndexedStack` | সব children রেখে দেয়, শুধু `index` নম্বরেরটা দেখায়। বাকিগুলো লুকানো থাকে, মুছে যায় না | সবগুলো render করে বাকিগুলোতে `display: none` |
| `body` | Scaffold এর মাঝের অংশ, উপর থেকে nav bar এর ঠিক ওপর পর্যন্ত | layout এর ভেতরের main অংশ |

::: warning এটা route না
এখানে URL কখনো বদলায় না, পুরো app এ page আছে একটাই। HomeScreen আর ScholarshipScreen এখানে শুধু component। তাই Android এ back চাপলে আগের tab এ না গিয়ে app বন্ধ হয়ে যায়, আর কোনো tab এর link share করা যায় না।
:::

::: details setState ছাড়া শুধু `_index = index` লিখলে কী হয়?
মান বদলায়, কিন্তু Flutter জানতে পারে না যে কিছু বদলেছে, তাই screen আগের মতোই থাকে। React এ `state.x = 1` লিখে সরাসরি বদলালে যে সমস্যা হয়, এটাও তেমনই।
:::

## অংশ ২: go_router, প্রতিটা key

install করতে:

```bash
flutter pub add go_router      # npm install এর মতো, pubspec.yaml এ যোগ হয়
```

### router.dart: সব route এর তালিকা

```dart
final router = GoRouter(
  initialLocation: '/',
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) =>
          MainShell(navigationShell: navigationShell),
      branches: [
        // 0: Home
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        // 1: Scholarship
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/scholarship',
              builder: (context, state) => const ScholarshipScreen(),
            ),
          ],
        ),
        // 2, 3, 4: Tourist, Community, Profile একইভাবে
      ],
    ),
  ],
);
```

| key | কী করে | Next.js এ |
|---|---|---|
| `GoRouter(...)` | পুরো app এর route এর তালিকা। এটা একবারই বানানো হয় | পুরো `app/` folder |
| `initialLocation: '/'` | app খুললে প্রথমে কোন URL এ যাবে | site খুললে `/` |
| `routes: [...]` | উপরের স্তরের route গুলোর list | `app/` এর সরাসরি ভেতরের folder গুলো |
| `GoRoute` | একটা page | একটা `page.tsx` |
| `path: '/tourist'` | এই page এর URL | folder এর নাম `tourist/` |
| `builder: (context, state) => ...` | URL মিললে কোন widget দেখাবে | `export default function Page()` |
| `state` | URL এর তথ্য: `state.pathParameters`, `state.uri.queryParameters` | `params`, `searchParams` |
| `StatefulShellRoute.indexedStack` | কয়েকটা route এর চারপাশে একটা স্থায়ী shell (nav bar)। `.indexedStack` থাকায় tab বদলালেও আগের page হারায় না | `app/(tabs)/layout.tsx` |
| shell এর `builder: (context, state, navigationShell)` | shell widget বানায়, আর তার হাতে `navigationShell` দেয় | `function Layout({ children })` |
| `branches: [...]` | প্রতিটা tab এর জন্য একটা branch | layout এর ভেতরের folder গুলো |
| `StatefulShellBranch` | একটা tab। প্রতিটার নিজের আলাদা history থাকে | এর সোজা মিল নেই (নিচে দেখো) |

::: warning branch এর ক্রম = nav bar এর ক্রম
`goBranch(2)` মানে তৃতীয় branch। তাই `branches` এর ক্রম আর nav bar এর `destinations` এর ক্রম হুবহু এক হতে হবে। না মিললে Tourist এ tap করলে অন্য page খুলবে। এজন্য প্রতিটা branch এর উপরে `// 2: Tourist` ধরনের comment রাখা।
:::

::: details branch এ route একটা না, list কেন?
কারণ একটা tab এর ভেতরে আরও page থাকবে। যেমন Scholarship থেকে detail page:

```dart
GoRoute(
  path: '/scholarship',
  builder: (context, state) => const ScholarshipScreen(),
  routes: [
    GoRoute(
      path: ':id',                       // /scholarship/5
      builder: (context, state) =>
          ScholarshipDetail(id: state.pathParameters['id']!),
    ),
  ],
),
```

এটা Next.js এর `scholarship/[id]/page.tsx` এর মতো। প্রতিটা branch নিজের history রাখে, তাই Scholarship এ detail খোলা রেখে Community তে গিয়ে আবার ফিরে এলে detail page টাই খোলা থাকবে। Instagram বা Facebook app এর tab গুলো এভাবেই কাজ করে। Next.js এ এটা নিজে থেকে হয় না।
:::

### app.dart: app কে router দেওয়া

```dart
return MaterialApp.router(        // আগে ছিল MaterialApp(
  title: 'Safar',
  theme: AppTheme.light(),
  routerConfig: router,           // আগে ছিল home: const Scaffold(),
);
```

| key | কী করে | Next.js এ |
|---|---|---|
| `MaterialApp(home: ...)` | app খুললে শুধু একটা widget দেখায়, কোনো route থাকে না | শুধু একটা `page.tsx` |
| `MaterialApp.router` | কী দেখাবে সেটা URL দেখে router ঠিক করবে | App Router চালু করা |
| `routerConfig: router` | কোন router ব্যবহার হবে | `app/` folder টা নিজেই |

::: tip Hot Reload কাজ করে না
`router` একটা global variable, app চালুর সময় একবারই তৈরি হয়। তাই route বদলালে Hot Reload (`r`) দিলে কিছু হয় না, **Hot Restart (`R`)** দিতে হয়।
:::

## অংশ ৩: MainShell, অর্থাৎ layout

```dart
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) {
          navigationShell.goBranch(index);
        },
        destinations: [ /* ৫টা tab */ ],
      ),
    );
  }
}
```

একই জিনিস Next.js এ:

```tsx
// app/(tabs)/layout.tsx
export default function TabsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <>
      {children}
      <BottomNav active={pathname} />   {/* Link দিয়ে route বদলায় */}
    </>
  )
}
```

| key | কী করে | Next.js এ |
|---|---|---|
| `final StatefulNavigationShell navigationShell` | MainShell এর prop। go_router বাইরে থেকে দেয় | `{ children }: { children: ReactNode }` |
| `required this.navigationShell` | `this.` বাইরে থেকে আসা মান সরাসরি field এ রাখে। `required` থাকলে এটা না দিয়ে MainShell বানানোই যায় না | TS এ `?` ছাড়া prop |
| `body: navigationShell` | এখন যে page চলছে, সেটা দেখায় | `{children}` |
| `navigationShell.currentIndex` | এখন কোন tab, সেটা URL থেকে বের করে | `usePathname()` দেখে active বের করা |
| `navigationShell.goBranch(i)` | i নম্বর tab এ যায়, URL বদলায় | `<Link href="/tourist">` এ click |

**MainShell এখন Stateless কেন?** `_index` আর `setState` আর নেই। কোন tab, সেই তথ্য এখন go_router রাখে। MainShell নিজে কিছু মনে রাখে না, শুধু দেখায়। তাই StatelessWidget দিয়েই চলে।

### আগে আর এখন

| কাজ | setState দিয়ে | go_router দিয়ে |
|---|---|---|
| কোন tab | `_index` | `navigationShell.currentIndex` |
| tab বদলানো | `setState(() => _index = i)` | `navigationShell.goBranch(i)` |
| page দেখানো | `IndexedStack(children: [...])` | `navigationShell` |
| screen এর তালিকা থাকে | MainShell এ | `router.dart` এ |
| URL বদলায়? | না | হ্যাঁ |
| Back button, deep link | কাজ করে না | কাজ করে |

<FlowSteps v-bind="tapFlow" />

## অংশ ৪: NavigationBar আর design

### NavigationBar এর key

| key | কী করে |
|---|---|
| `NavigationBar` | Material 3 এর bottom nav। পুরনো `BottomNavigationBar` ব্যবহার করবে না |
| `selectedIndex` | কোন tab রঙিন দেখাবে |
| `onDestinationSelected: (index) {...}` | tap হলে চলে, `index` এ থাকে কোন tab এ চাপ পড়েছে |
| `destinations: [...]` | tab গুলোর list। কমপক্ষে ২টা থাকতে হবে, নইলে app crash করে |
| `NavigationDestination` | একটা tab |
| `icon` | select না থাকলে কোন icon |
| `selectedIcon` | select থাকলে কোন icon |
| `label` | নিচের লেখা |

::: warning icon এ widget দিতে হয়
`icon: Icons.home` লিখলে error আসে। `Icons.home` শুধু icon টা কোনটা সেটা বলে (`IconData`), আঁকে না। আঁকার জন্য widget লাগে: `icon: Icon(Icons.home)`।
:::

### নিজের SVG icon (NavIcon)

Design এর icon গুলো Material icon এ হুবহু পাওয়া যায় না, তাই `flutter_svg` package দিয়ে design এর SVG সরাসরি বসানো হয়েছে।

```dart
// nav_icon.dart (ছোট করে)
abstract final class NavIcons {
  static const tourist =
      '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/>';
}

class NavIcon extends StatelessWidget {
  const NavIcon(this.shapes, {super.key, this.selected = false});
  // selected হলে বেগুনি রেখা + হালকা বেগুনি fill, না হলে ধূসর রেখা
  // SVG string বানিয়ে SvgPicture.string(svg) দিয়ে আঁকে
}
```

ব্যবহার করা হয় একটা helper দিয়ে, যাতে ৫টা tab এ একই code বারবার লিখতে না হয়:

```dart
NavigationDestination _destination(String shapes, String label) {
  return NavigationDestination(
    icon: NavIcon(shapes),
    selectedIcon: NavIcon(shapes, selected: true),
    label: label,
  );
}

destinations: [
  _destination(NavIcons.home, 'Home'),
  _destination(NavIcons.tourist, 'Tourist'),
  // ...
],
```

React এ এটা হতো `<NavIcon shape={tourist} selected />` লেখার মতো।

### Theme দিয়ে সাজানো (navigationBarTheme)

রং widget এর ভেতরে না লিখে `app_theme.dart` এ লেখা হয়েছে। এতে light আর dark দুই mode আপনা থেকে ঠিক থাকে। CSS এ component এর ভেতরে রং না লিখে CSS variable দিয়ে theme বানানোর মতো।

```dart
navigationBarTheme: NavigationBarThemeData(
  height: 64,
  elevation: 0,
  backgroundColor: scheme.surface,
  surfaceTintColor: Colors.transparent,
  indicatorColor: Colors.transparent,
  labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
  labelTextStyle: WidgetStateProperty.resolveWith((states) {
    final selected = states.contains(WidgetState.selected);
    return TextStyle(
      fontSize: 12,
      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
      color: selected ? scheme.primary : AppColors.muted,
    );
  }),
),
```

| key | কী করে |
|---|---|
| `height` | bar কতটা উঁচু |
| `elevation: 0` | ছায়া নেই |
| `backgroundColor` | bar এর পটভূমি |
| `surfaceTintColor: transparent` | Material 3 এর হালকা রঙিন আভা বন্ধ |
| `indicatorColor: transparent` | select করা icon এর পেছনের pill লুকায় (design এ pill নেই) |
| `labelBehavior: alwaysShow` | সব tab এর label সবসময় দেখায় |
| `labelTextStyle` | label এর font, অবস্থা অনুযায়ী আলাদা |
| `WidgetStateProperty.resolveWith((states) {...})` | widget এর অবস্থা (selected, pressed, disabled) দেখে আলাদা মান দেয় |
| `states.contains(WidgetState.selected)` | tab টা কি select করা? |

`WidgetStateProperty.resolveWith` হলো CSS এর `:hover` / `.active` এর মতো। একটা মান না দিয়ে একটা function দাও, Flutter অবস্থা পাঠায়, আর তুমি সেই অনুযায়ী মান ফেরত দাও:

```css
.tab        { font-weight: 500; color: gray; }
.tab.active { font-weight: 700; color: purple; }
```

**উপরের border:** NavigationBar এ border এর option নেই। তাই MainShell এ nav bar কে `DecoratedBox` দিয়ে মুড়ে `Border(top: ...)` দেওয়া হয়েছে।

## go আর push: কখন কোনটা

এখনো ব্যবহার হয়নি, কিন্তু detail page বানাতে গেলেই লাগবে:

| Flutter | কী করে | Next.js এ |
|---|---|---|
| `navigationShell.goBranch(i)` | অন্য tab এ যাও | nav bar এর `<Link>` |
| `context.go('/tourist')` | এই URL এ যাও, history বদলে দাও | `router.replace('/tourist')` বা `<Link>` |
| `context.push('/scholarship/5')` | নতুন page উপরে বসাও, back চাপলে আগেরটায় ফেরে | `router.push('/scholarship/5')` |
| `context.pop()` | উপরের page সরাও, আগেরটায় ফেরো | `router.back()` |

## নতুন tab যোগ করার checklist

ধরো ৬ নম্বর tab "Saved" যোগ করবে:

1. `lib/ui/saved/saved_screen.dart` বানাও, `SavedScreen` widget।
2. `router.dart` এ `branches` এর **শেষে** একটা `StatefulShellBranch` যোগ করো, তাতে `GoRoute(path: '/saved', builder: ... SavedScreen())`।
3. `nav_icon.dart` এর `NavIcons` এ icon এর SVG আকার যোগ করো।
4. `main_shell.dart` এর `destinations` এর **শেষে** `_destination(NavIcons.saved, 'Saved')` যোগ করো।
5. ধাপ ২ আর ৪ এর ক্রম মিলিয়ে দেখো, তারপর Hot Restart (`R`)।

## যে ভুলগুলো হয়েছিল

| ভুল | Error | ঠিক করা |
|---|---|---|
| `const new({super.key})` | constructor এর নাম ভুল | `const MainShell({super.key})`, অর্থাৎ class এর নামই constructor এর নাম |
| `final router = GoRouter(...)` এর শেষে `;` নেই | `Expected to find ';'` | variable বানানো, `return` আর function call এর শেষে `;` লাগে। class বা function এর `{ }` এর পরে লাগে না |
| `return const Scaffold(... _index ...)` | `isn't a const constructor` | যার ভেতরে বদলানো যায় এমন জিনিস আছে, সেটা `const` হতে পারে না |
| `icon: Icons.home` | `IconData can't be assigned to Widget` | `icon: Icon(Icons.home)` |
| `_selectedIndex` এ unused warning | `isn't used` | warning, error না। পরে ব্যবহার করলে আপনা থেকে চলে যায় |
| route বদলে Hot Reload দেওয়া | কিছুই বদলায় না | Hot Restart (`R`) |
| `destinations` এ ১টা tab রেখে run করা | crash | `NavigationBar` এ কমপক্ষে ২টা tab লাগে |
