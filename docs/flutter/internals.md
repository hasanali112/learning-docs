<script setup>
const startupFlow = {
  title: 'App চালু হলে কী কী ঘটে',
  nodes: [
    { id: 'main', label: 'main()', sub: 'তোমার code' },
    { id: 'bind', label: 'Binding', sub: 'Flutter জেগে ওঠে' },
    { id: 'run', label: 'runApp()', sub: 'root widget' },
    { id: 'tree', label: 'প্রথম build', sub: 'তিন tree তৈরি' },
    { id: 'frame', label: 'প্রথম frame', sub: 'screen এ দেখা' },
  ],
  steps: [
    {
      node: 'main',
      title: '১. Android/iOS তোমার main() চালায়',
      text: 'user app এর icon এ চাপলে phone এর OS app খোলে। Flutter engine (C++) চালু হয়, Dart VM জেগে ওঠে, তারপর তোমার main.dart এর main() ডাকে।',
      code: 'void main() => runApp(const SafarApp());',
    },
    {
      node: 'bind', edge: 0,
      title: '২. WidgetsFlutterBinding: framework আর engine জোড়া লাগে',
      text: 'runApp এর ভেতরে প্রথমে WidgetsFlutterBinding তৈরি হয়। এটা framework আর engine এর মাঝের সেতু: engine থেকে "frame আঁকো", "এখানে touch হয়েছে" বার্তা নেয়, আর framework এর আঁকা ছবি engine কে পাঠায়। runApp এর আগে plugin ব্যবহার করতে হলে তাই নিজে ensureInitialized() ডাকতে হয়।',
      code: 'WidgetsFlutterBinding.ensureInitialized();\n// SchedulerBinding, GestureBinding,\n// RendererBinding, WidgetsBinding ... সব এক সাথে',
    },
    {
      node: 'run', edge: 1,
      title: '৩. runApp(): তোমার widget সবার উপরে বসে',
      text: 'runApp তোমার SafarApp কে একটা বিশেষ root এর নিচে বসায়। এই root এর Element আর RenderView (পুরো screen এর মাপের RenderObject) আগে থেকে তৈরি।',
      code: 'RenderView (পুরো screen)\n └─ SafarApp  ← তোমার widget',
    },
    {
      node: 'tree', edge: 2,
      title: '৪. প্রথম build: তিনটা tree একসাথে তৈরি হয়',
      text: 'Flutter উপর থেকে নিচে প্রতিটা widget এর build() চালায়। প্রতিটা widget এর জন্য একটা Element বানায়, আর যেগুলো আসলে কিছু আঁকে (Text, Padding...) তাদের জন্য RenderObject বানায়।',
      code: 'SafarApp → MaterialApp.router → MainShell\n → Scaffold → HomeScreen → Text ...',
    },
    {
      node: 'frame', edge: 3,
      title: '৫. প্রথম frame: layout, paint, screen',
      text: 'tree তৈরি হলে layout (মাপ) আর paint (আঁকা) হয়, engine GPU দিয়ে pixel বসায়। এই মুহূর্তে splash screen সরে গিয়ে তোমার app দেখা যায়। এরপর থেকে শুধু কিছু বদলালে নতুন frame আঁকা হয়।',
      code: 'build → layout → paint → GPU → 📱',
    },
  ],
}

const reconcileFlow = {
  title: 'Rebuild এ Flutter পুরনো আর নতুন widget কীভাবে মেলায়',
  nodes: [
    { id: 'new', label: 'নতুন Widget', sub: 'build() থেকে' },
    { id: 'can', label: 'canUpdate?', sub: 'type + key' },
    { id: 'el', label: 'Element', sub: 'রাখো / বদলাও' },
    { id: 'ro', label: 'RenderObject', sub: 'props বসাও' },
    { id: 'out', label: 'ফলাফল', sub: 'কম কাজ' },
  ],
  steps: [
    {
      node: 'new',
      title: '১. build() নতুন widget ফেরত দিল',
      text: 'setState এর পরে build() আবার চলে, আর নতুন Widget object ফেরত দেয়। পুরনো Widget object গুলো ফেলে দেওয়া হয়। এতে সমস্যা নেই, কারণ Widget শুধু ছোট একটা নকশা।',
      code: '// আগে\nText(\'চাপা হয়েছে 0 বার\')\n// এখন\nText(\'চাপা হয়েছে 1 বার\')',
    },
    {
      node: 'can', edge: 0,
      title: '২. Widget.canUpdate: একই type আর একই key?',
      text: 'Flutter একই জায়গার পুরনো Element এর widget আর নতুন widget তুলনা করে। নিয়মটা খুব সোজা: runtimeType একই আর key একই হলে "update করা যাবে"। React এর reconciliation ও ঠিক এই নিয়মে চলে।',
      code: 'static bool canUpdate(Widget old, Widget new) =>\n  old.runtimeType == new.runtimeType &&\n  old.key == new.key;',
    },
    {
      node: 'el', edge: 1,
      title: '৩ক. মিললে: Element রেখে দেয়',
      text: 'Text আর Text, key দুটোই null: মিলেছে। Element টা থেকে যায়, শুধু তার widget field এ নতুন Text বসে। StatefulWidget হলে তার State object ও থেকে যায়, তাই ভেতরের মান হারায় না।',
      code: 'element.widget = newText;   // Element আর State পুরনোটাই',
    },
    {
      node: 'el', edge: 1,
      title: '৩খ. না মিললে: পুরনো Element ফেলে নতুন বানায়',
      text: 'ধরো আগে ছিল Text, এখন Icon। type আলাদা, তাই পুরনো Element আর তার নিচের সব কিছু (State সহ) মুছে নতুন Element বানানো হয়। এজন্যই if-else দিয়ে widget বদলালে নিচের State হারিয়ে যায়।',
      code: 'Text ≠ Icon  →  unmount পুরনো, mount নতুন',
    },
    {
      node: 'ro', edge: 2,
      title: '৪. RenderObject এ শুধু বদলানো props বসে',
      text: 'Element রাখা হলে RenderObject ও রাখা হয়। Flutter শুধু নতুন props (লেখা, রং) বসায়। লেখা বদলালে RenderParagraph নিজেকে "layout লাগবে" চিহ্ন দেয়। রং বদলালে শুধু "paint লাগবে", layout না।',
      code: 'renderParagraph.text = \'চাপা হয়েছে 1 বার\';\n// → markNeedsLayout()',
    },
    {
      node: 'out', edge: 3,
      title: '৫. const হলে পুরো কাজটাই বাদ',
      text: 'const Text(\'Home\') প্রতিবার একই object (identical)। Flutter দেখে widget হুবহু একই, তাই সেই Element আর তার নিচের কিছুই আবার build করে না। এটাই const এর আসল লাভ, React.memo এর মতো কিন্তু বিনা খরচে।',
      code: 'if (identical(oldWidget, newWidget)) return; // কিছুই করো না',
    },
  ],
}

const frameFlow = {
  title: 'একটা frame: setState থেকে screen পর্যন্ত',
  nodes: [
    { id: 'dirty', label: 'setState()', sub: 'dirty চিহ্ন' },
    { id: 'vsync', label: 'Vsync', sub: 'screen এর তাল' },
    { id: 'build', label: 'Build', sub: 'UI thread' },
    { id: 'layout', label: 'Layout', sub: 'UI thread' },
    { id: 'paint', label: 'Paint', sub: 'Layer tree' },
    { id: 'raster', label: 'Raster', sub: 'GPU' },
  ],
  steps: [
    {
      node: 'dirty',
      title: '১. setState(): শুধু চিহ্ন দেওয়া',
      text: 'setState সাথে সাথে কিছু আঁকে না। তোমার function চালিয়ে মান বদলায়, তারপর Element কে "dirty" (আবার build লাগবে) চিহ্ন দেয়, dirty তালিকায় রাখে, আর engine কে বলে "পরের frame এ আমাকে ডেকো"। এক frame এ ১০ বার setState ডাকলেও build হবে একবারই।',
      code: 'setState(fn)\n → fn()\n → element.markNeedsBuild()\n → scheduleFrame()',
    },
    {
      node: 'vsync', edge: 0,
      title: '২. Vsync: screen বলে "এখন আঁকো"',
      text: 'phone এর screen সেকেন্ডে ৬০ বা ১২০ বার নিজেকে নতুন করে। প্রতিবার engine একটা vsync সংকেত পাঠায়। প্রথমে animation গুলো (Ticker) নতুন মান নেয়। তারপর বাকি ধাপ শুরু হয়। ৬০Hz এ পুরো কাজ ১৬ms এর মধ্যে, ১২০Hz এ ৮ms এর মধ্যে শেষ করতে হয়।',
      code: 'handleBeginFrame()   // animation এর tick\nhandleDrawFrame()    // build, layout, paint',
    },
    {
      node: 'build', edge: 1,
      title: '৩. Build: শুধু dirty Element গুলো',
      text: 'buildScope() dirty তালিকা উপর থেকে নিচে সাজিয়ে প্রতিটার build() চালায়। পুরো app না, শুধু যেগুলো বদলেছে আর তাদের নিচে যেগুলো সত্যিই বদলায়। এজন্য বড় widget কে ছোট ছোট widget এ ভাগ করলে কম build হয়।',
      code: 'buildScope()\n  for element in dirty (উপর → নিচে):\n    element.rebuild()',
    },
    {
      node: 'layout', edge: 2,
      title: '৪. Layout: যাদের মাপ বদলেছে',
      text: 'flushLayout() শুধু "layout লাগবে" চিহ্ন দেওয়া RenderObject গুলোর মাপ আবার বের করে। parent constraint পাঠায়, child মাপ ফেরত দেয় (নিচে বিস্তারিত)।',
      code: 'pipelineOwner.flushLayout()',
    },
    {
      node: 'paint', edge: 3,
      title: '৫. Paint: আঁকার নির্দেশ লেখা',
      text: 'flushPaint() এ RenderObject গুলো সরাসরি pixel আঁকে না। "এখানে এই রঙের গোল বাক্স, এখানে এই লেখা" এমন নির্দেশের তালিকা (display list) লেখে, Layer এর ভেতরে। সব Layer মিলে একটা Layer tree, যেটা engine এর কাছে পাঠানো হয়।',
      code: 'flushPaint()\ncompositeFrame()  → Layer tree → engine',
    },
    {
      node: 'raster', edge: 4,
      title: '৬. Raster: GPU pixel আঁকে',
      text: 'আলাদা একটা thread (raster thread) এ engine এর Impeller সেই নির্দেশগুলো GPU কে দিয়ে আসল pixel আঁকায়। এর মধ্যে UI thread পরের frame এর কাজ শুরু করতে পারে। শেষে addPostFrameCallback এ রাখা কাজগুলো চলে।',
      code: 'Raster thread: Impeller → GPU → 📱\nUI thread: পরের frame এর জন্য তৈরি',
    },
  ],
}

const layoutFlow = {
  title: 'Layout: constraints নিচে, size উপরে',
  nodes: [
    { id: 'screen', label: 'Screen', sub: '390 × 844' },
    { id: 'pad', label: 'Padding', sub: '16 চারপাশে' },
    { id: 'col', label: 'Column', sub: 'উপর-নিচে' },
    { id: 'text', label: 'Text', sub: '\'Scholarship\'' },
  ],
  steps: [
    {
      node: 'screen',
      title: '১. Screen: "ঠিক 390 × 844 হও"',
      text: 'সবার উপরে screen নিজে। সে তার child কে tight constraint দেয়: চওড়া ঠিক 390, উঁচু ঠিক 844, এর কম-বেশি না।',
      code: 'BoxConstraints(w: 390..390, h: 844..844)',
    },
    {
      node: 'pad', edge: 0,
      title: '২. Padding: নিজের অংশ বাদ দিয়ে নিচে পাঠায়',
      text: 'Padding চারপাশে 16 রাখবে। তাই child কে বলে: "তুমি সর্বোচ্চ 358 × 812 হতে পারো"। constraint নিচে যাওয়ার পথে প্রতিটা parent নিজের মতো করে বদলায়।',
      code: '390 − 16 − 16 = 358\n844 − 16 − 16 = 812\nBoxConstraints(w: 0..358, h: 0..812)',
    },
    {
      node: 'col', edge: 1,
      title: '৩. Column: উপর-নিচে সীমা খুলে দেয়',
      text: 'Column প্রতিটা child কে চওড়ায় সর্বোচ্চ 358 দেয়, কিন্তু উঁচুতে কোনো সীমা দেয় না (unbounded), কারণ সে child দের উপর-নিচে সাজিয়ে তবেই নিজের মাপ জানবে। এজন্যই Column এর ভেতরে ListView দিলে error আসে: ListView অসীম উঁচু হতে চায়।',
      code: 'BoxConstraints(w: 0..358, h: 0..∞)',
    },
    {
      node: 'text', edge: 2,
      title: '৪. Text: নিজের মাপ ঠিক করে',
      text: 'Text কে বলা হয়েছে সর্বোচ্চ 358 চওড়া। সে font আর লেখা মেপে দেখে তার লাগবে 120 × 24। এর বেশি জায়গা পেলেও সে নিজের দরকারি মাপটাই নেয়।',
      code: 'Text এর size = 120 × 24',
    },
    {
      node: 'col', edge: 2, reverse: true,
      title: '৫. Size উপরে: Column নিজের মাপ জানে',
      text: 'Text তার মাপ উপরে Column কে জানায়। সব child এর মাপ জেনে Column নিজের মাপ ঠিক করে, আর প্রতিটা child কে কোথায় বসাবে (offset) সেটা ঠিক করে। child নিজে জানে না সে কোথায় বসেছে, শুধু parent জানে।',
      code: 'Text.offset = (0, 0)\nColumn.size = 358 × 812 (mainAxisSize: max)',
    },
    {
      node: ['pad', 'screen'], edge: 0, reverse: true,
      title: '৬. একইভাবে সবার উপর পর্যন্ত',
      text: 'Padding Column কে (16, 16) তে বসায়, নিজের মাপ 390 × 844 জানায়। পুরো tree এভাবে একবার নিচে নেমে একবার উপরে ওঠে, তাই Flutter এর layout খুব দ্রুত। এই নিয়মের নাম: Constraints go down. Sizes go up. Parent sets position.',
      code: 'Column.offset = (16, 16)\nPadding.size = 390 × 844',
    },
  ],
}

const gestureFlow = {
  title: 'আঙুল দিয়ে চাপলে onPressed পর্যন্ত',
  nodes: [
    { id: 'finger', label: 'আঙুল', sub: 'touch' },
    { id: 'engine', label: 'Engine', sub: 'PointerEvent' },
    { id: 'hit', label: 'Hit test', sub: 'কার উপর পড়লো' },
    { id: 'arena', label: 'Gesture arena', sub: 'কে জিতবে' },
    { id: 'cb', label: 'onPressed', sub: 'তোমার code' },
  ],
  steps: [
    {
      node: 'finger',
      title: '১. আঙুল screen ছুঁলো',
      text: 'ধরো তুমি Home এর 🔔 বোতামে চাপলে। phone এর OS touch টা ধরে Flutter engine কে দেয়।',
      code: 'touch at (318, 70)',
    },
    {
      node: 'engine', edge: 0,
      title: '২. Engine: PointerDownEvent বানায়',
      text: 'engine touch টাকে Flutter এর ভাষায় একটা PointerDownEvent বানিয়ে framework এর GestureBinding এ পাঠায়।',
      code: 'PointerDownEvent(position: Offset(318, 70))',
    },
    {
      node: 'hit', edge: 1,
      title: '৩. Hit test: ওই জায়গায় কারা আছে?',
      text: 'GestureBinding RenderView থেকে শুরু করে RenderObject tree তে নিচে নামে: "(318, 70) কি তোমার ভেতরে?" যার ভেতরে পড়ে, সে তালিকায় ওঠে। এখানে layout এর offset আর size কাজে লাগে। শেষে তালিকা হয়: বোতাম, AppBar, Scaffold, ... root।',
      code: 'HitTestResult:\n  🔔 বোতামের RenderBox গুলো\n  RenderPadding (SafarAppBar)\n  ... RenderView',
    },
    {
      node: 'arena', edge: 2,
      title: '৪. Gesture arena: tap না scroll?',
      text: 'বোতামের TapGestureRecognizer আর পেছনের ListView এর scroll recognizer দুজনেই এই touch দাবি করে। এরা একটা "arena" তে লড়ে। আঙুল না সরিয়ে তুলে নিলে tap জেতে। আঙুল টেনে নিলে scroll জেতে, আর tap বাতিল হয়।',
      code: 'Arena: [Tap, VerticalDrag]\nআঙুল উঠলো, সরেনি → Tap জিতলো',
    },
    {
      node: 'cb', edge: 3,
      title: '৫. জয়ী recognizer তোমার function ডাকে',
      text: 'Tap জিতলে সে তোমার onPressed চালায়। সেখানে setState বা context.push থাকলে আবার frame এর পুরো চক্র শুরু হয়।',
      code: 'onPressed: () {}   // ← এখানে পৌঁছালো',
    },
  ],
}

const inheritedFlow = {
  title: 'Theme.of(context) কীভাবে কাজ করে',
  nodes: [
    { id: 'theme', label: 'Theme', sub: 'InheritedWidget' },
    { id: 'reg', label: 'of(context)', sub: 'খোঁজা + নাম লেখা' },
    { id: 'change', label: 'theme বদলালো', sub: 'dark mode' },
    { id: 'notify', label: 'updateShouldNotify', sub: 'সত্যিই বদলেছে?' },
    { id: 'rebuild', label: 'dependents', sub: 'আবার build' },
  ],
  steps: [
    {
      node: 'theme',
      title: '১. MaterialApp এর ভেতরে একটা Theme বসে আছে',
      text: 'MaterialApp এর theme: AppTheme.light() আসলে tree এর উপরে একটা Theme widget বসায়। এটা InheritedWidget, যার কাজ নিচের সবাইকে data দেওয়া। React এর Context.Provider এর মতো।',
      code: 'MaterialApp\n └─ Theme(data: ThemeData)   ← InheritedWidget\n     └─ ... তোমার সব screen',
    },
    {
      node: 'reg', edge: 0,
      title: '২. Theme.of(context): খুঁজে আনে, আর নাম লিখে রাখে',
      text: 'প্রতিটা Element জানে তার উপরে কোন কোন InheritedWidget আছে (একটা map এ রাখা), তাই খোঁজা এক ধাপেই হয়, tree বেয়ে উঠতে হয় না। সাথে সাথে Theme এর খাতায় এই widget এর নাম লেখা হয়: "এ আমার উপর নির্ভর করে"। React এর useContext এর মতো।',
      code: 'Theme.of(context)\n → context.dependOnInheritedWidgetOfExactType<_InheritedTheme>()',
    },
    {
      node: 'change', edge: 1,
      title: '৩. phone এ dark mode চালু হলো',
      text: 'themeMode: system থাকায় MaterialApp নতুন ThemeData দিয়ে Theme কে আবার build করে।',
      code: 'Theme(data: AppTheme.dark())',
    },
    {
      node: 'notify', edge: 2,
      title: '৪. updateShouldNotify: সত্যিই বদলেছে?',
      text: 'নতুন আর পুরনো data তুলনা করা হয়। না বদলালে কাউকে জানানো হয় না। বদলালে খাতায় যাদের নাম আছে, শুধু তাদের।',
      code: 'bool updateShouldNotify(old) => data != old.data;',
    },
    {
      node: 'rebuild', edge: 3,
      title: '৫. যারা Theme.of ডেকেছিল, শুধু তারাই আবার build',
      text: 'NavIcon, SafarAppBar এর মতো যারা context.colors পড়েছিল, তারা dirty হয়ে নতুন রং নিয়ে আবার আঁকে। যারা theme পড়েনি, তাদের কিছুই হয় না। MediaQuery.of, GoRouter.of, Provider এর context.watch সব এই একই কৌশলে চলে।',
      code: '// তোমার extension এর ভেতরেও এটাই:\nColorScheme get colors => Theme.of(this).colorScheme;',
    },
  ],
}

const hotReloadFlow = {
  title: 'Hot Reload: State না হারিয়ে নতুন code',
  nodes: [
    { id: 'save', label: 'Save / r', sub: 'তুমি' },
    { id: 'compile', label: 'Compile', sub: 'শুধু বদলানো ফাইল' },
    { id: 'vm', label: 'Dart VM', sub: 'code বদলায়' },
    { id: 'reassemble', label: 'reassemble', sub: 'সব dirty' },
    { id: 'build', label: 'build()', sub: 'নতুন code এ' },
  ],
  steps: [
    {
      node: 'save',
      title: '১. তুমি ফাইল save করলে বা r চাপলে',
      text: 'debug mode এ app চলছে JIT (Just In Time) এ। মানে Dart VM চলতে চলতেই code বদলাতে পারে।',
      code: 'Text(\'Home Screen\')  →  Text(\'হোম\')',
    },
    {
      node: 'compile', edge: 0,
      title: '২. শুধু বদলানো অংশ compile হয়',
      text: 'flutter tool পুরো app না, শুধু যে library বদলেছে সেটা kernel ফাইলে (Dart এর মাঝামাঝি রূপ) compile করে।',
      code: 'home_screen.dart → home_screen.dill (incremental)',
    },
    {
      node: 'vm', edge: 1,
      title: '৩. চলমান VM এ নতুন code ঢুকে যায়',
      text: 'VM পুরনো class আর function এর জায়গায় নতুন version বসায়। কিন্তু memory তে থাকা object গুলো (State, তাদের মান) যেমন ছিল তেমনই থাকে।',
      code: 'HomeScreen.build → নতুন version\n_index = 2  → যেমন ছিল',
    },
    {
      node: 'reassemble', edge: 2,
      title: '৪. reassemble: পুরো tree কে dirty',
      text: 'framework সব Element কে dirty চিহ্ন দেয়, যাতে নতুন build() চলে। main() বা initState() আবার চলে না, global variable আর static field এর শুরুর মানও আবার বসে না।',
      code: 'WidgetsBinding.reassembleApplication()',
    },
    {
      node: 'build', edge: 3,
      title: '৫. নতুন code দিয়ে build, পুরনো State সহ',
      text: 'এজন্যই Hot Reload এ Tourist tab খোলা থাকলে খোলাই থাকে। কিন্তু router (global variable), main() বা initState বদলালে Hot Restart লাগে, আর pubspec এ নতুন asset বা package যোগ করলে app পুরো বন্ধ করে আবার run করতে হয়।',
      code: 'Hot Reload  r: code বদলায়, State থাকে\nHot Restart R: সব মুছে main() থেকে\nFull run    : native অংশ বা asset বদলালে',
    },
  ],
}
</script>

# Flutter Internal Engine: ভেতরে কীভাবে কাজ করে

তুমি শুধু widget লেখো আর `setState` ডাকো। বাকি সব (কী আঁকা হবে, কোথায় বসবে, কতবার আঁকা হবে, আঙুলের চাপ কার কাছে যাবে) Flutter ভেতরে নিজে সামলায়। এই নোটে সেই ভেতরের কাজটা ধাপে ধাপে, flowchart দিয়ে দেখানো হয়েছে।

এটা বুঝলে বোঝা যাবে: `const` কেন দ্রুত, State কেন হারায় না (আর কখন হারায়), overflow error কেন আসে, Hot Reload কেন সবসময় কাজ করে না, আর `Theme.of(context)` কীভাবে কাজ করে।

::: tip আগে পড়ে নাও
[Widget আর StatelessWidget](/flutter/widgets-basics) আর [Constructor আর build()](/flutter/constructor-and-build)। keyword গুলোর ছোট তালিকা পাবে [শেখার keyword তালিকা](/flutter/keywords) তে।
:::

## ১. বড় ছবি: Flutter এর স্তরগুলো

Flutter একটা বড় জিনিস না, কয়েকটা স্তর একটার ওপর আরেকটা:

```txt
┌──────────────────────────────────────────────────────┐
│ তোমার app (Dart)        SafarApp, HomeScreen ...     │
├──────────────────────────────────────────────────────┤
│ Framework (Dart)                                     │
│   Material / Cupertino   Scaffold, NavigationBar     │
│   Widgets                StatelessWidget, State      │
│   Rendering              RenderObject, layout        │
│   Animation · Painting · Gestures                    │
│   Foundation             ChangeNotifier, Key         │
├──────────────────────────────────────────────────────┤
│ Engine (C++)                                         │
│   Impeller (আঁকা) · Dart runtime · লেখা মাপা           │
├──────────────────────────────────────────────────────┤
│ Embedder (Android / iOS / Web / Desktop)             │
│   window, touch, thread, plugin এর সাথে যোগাযোগ        │
└──────────────────────────────────────────────────────┘
```

| স্তর | কী করে | Web এর সাথে মিল |
|---|---|---|
| তোমার app | widget লেখো | তোমার React component |
| Framework | widget থেকে মাপ, আঁকা, touch সব সামলায়। পুরোটা Dart এ লেখা, চাইলে ভেতরে ঢুকে পড়তে পারো | React + ReactDOM |
| Engine | আসল pixel আঁকা (Impeller, পুরনো কিছু device এ Skia), Dart চালানো, লেখার মাপ | browser এর rendering engine (Blink) |
| Embedder | Android বা iOS এর সাথে কথা বলে: screen, touch, keyboard | browser নিজে, OS এর সাথে |

::: warning সবচেয়ে বড় পার্থক্য
React Native বা web app OS এর নিজস্ব button, text ব্যবহার করে। **Flutter করে না।** Flutter প্রতিটা pixel নিজে আঁকে, ঠিক একটা game engine এর মতো। এজন্যই Android আর iOS এ হুবহু একই দেখায়, আর তোমার design এর মতো যেকোনো আকার আঁকা যায়।
:::

## ২. App চালু হলে কী হয়

<FlowSteps v-bind="startupFlow" />

## ৩. তিনটা tree

Flutter এর পুরো engine বোঝার চাবি এটাই। তুমি শুধু **Widget** লেখো, কিন্তু Flutter ভেতরে তিনটা tree রাখে।

```txt
Widget tree            Element tree              RenderObject tree
(তুমি লেখো)            (Flutter রাখে)             (Flutter রাখে)

Scaffold        ──→    StatefulElement   ──→     (নিজে আঁকে না)
 └─ Padding     ──→     └─ SingleChild…   ──→     RenderPadding
     └─ Text    ──→         └─ Stateless…  ──→      (নিজে আঁকে না)
         └─ RichText ──→       └─ MultiChild… ──→     RenderParagraph
```

| | Widget | Element | RenderObject |
|---|---|---|---|
| কী | নকশা (blueprint): "এখানে লেখা থাকবে, এই রঙে" | tree তে আসল জায়গা | মাপা আর আঁকার কাজের লোক |
| কে বানায় | তুমি, build() এ | Flutter | Flutter (শুধু যারা আঁকে তাদের জন্য) |
| কতক্ষণ থাকে | এক build পর্যন্ত, তারপর ফেলে দেওয়া হয় | widget screen এ থাকা পর্যন্ত | widget screen এ থাকা পর্যন্ত |
| বদলানো যায়? | না, immutable (সব field `final`) | হ্যাঁ | হ্যাঁ |
| খরচ | খুব সস্তা | মাঝারি | ভারী (layout, paint) |
| কী থাকে | props | State, `BuildContext`, InheritedWidget এর খোঁজ | size, offset, আঁকার নির্দেশ |
| React এ | JSX থেকে তৈরি element object | Fiber | DOM node আর তার layout box |

**তিনটা কেন?** Widget প্রতি build এ নতুন করে বানালেও খরচ প্রায় নেই। ভারী জিনিসগুলো (State, মাপ, আঁকা) থাকে Element আর RenderObject এ, যারা থেকে যায়। তাই Flutter সেকেন্ডে ৬০ বার পুরো widget tree নতুন করে বানাতে পারে, আর তবুও দ্রুত চলে।

### সব widget আঁকে না

| ধরন | উদাহরণ | Element | RenderObject |
|---|---|---|---|
| Component widget: শুধু অন্য widget জোড়া লাগায় | `StatelessWidget`, `StatefulWidget`, `Container`, `Scaffold`, তোমার `HomeScreen` | `ComponentElement` | নেই |
| RenderObject widget: আসলে মাপে আর আঁকে | `Padding`, `Row`, `Column`, `RichText`, `SizedBox`, `Opacity` | `RenderObjectElement` | আছে |
| Inherited widget: নিচের সবাইকে data দেয় | `Theme`, `MediaQuery`, Provider | `InheritedElement` | নেই |

::: details Container আসলে কী?
`Container` নিজে কিছু আঁকে না। তুমি যা দাও, সেই অনুযায়ী সে ভেতরে অন্য widget জোড়া লাগায়:

```dart
Container(
  padding: EdgeInsets.all(16),
  color: Colors.white,
  child: Text('হ্যালো'),
)
// ভেতরে আসলে হয়:
ColoredBox(
  color: Colors.white,
  child: Padding(
    padding: EdgeInsets.all(16),
    child: Text('হ্যালো'),
  ),
)
```

তাই শুধু padding লাগলে `Padding`, শুধু রং লাগলে `ColoredBox` লেখা একটু হালকা। Flutter এর বেশিরভাগ widget এভাবে ছোট ছোট widget জোড়া লাগিয়ে বানানো (composition)।
:::

### BuildContext আসলে কী

```dart
Widget build(BuildContext context) { ... }
```

`context` আসলে **এই widget এর Element**। Flutter `build(element)` ডাকে, শুধু type টা `BuildContext` দেখায়, যাতে তুমি Element এর ভেতরের জিনিস ভুল করে না বদলাও। তাই:

- `Theme.of(context)` মানে "আমার Element থেকে উপরে Theme খোঁজো"।
- `context.push()` মানে "আমার Element থেকে উপরে Router খোঁজো"।
- ভুল `context` দিলে (যেমন Scaffold এর ঠিক উপরের context দিয়ে `Scaffold.of`) কিছু পাওয়া যায় না, কারণ খোঁজা শুরু হয় ভুল জায়গা থেকে।

## ৪. Rebuild: পুরনো আর নতুন মেলানো

<FlowSteps v-bind="reconcileFlow" />

এই নিয়ম থেকে যা শেখার:

| ঘটনা | ফল | কী করবে |
|---|---|---|
| একই জায়গায় একই type এর widget | Element আর State থাকে | — |
| `if` দিয়ে এক type থেকে আরেক type | নিচের সব State মুছে যায় | দরকার হলে State উপরে রাখো |
| list এর ক্রম বদলালো, key নেই | State ভুল item এ চলে যায় | `ValueKey(id)` দাও |
| `const` widget | কিছুই আবার build হয় না | যেখানে পারো `const` দাও |
| বড় একটা build() এ setState | পুরো বড় অংশ আবার build | বদলানো অংশ আলাদা ছোট widget এ রাখো |

## ৫. একটা frame: setState থেকে screen

<FlowSteps v-bind="frameFlow" />

| ধাপ | কোন function | কী হয় |
|---|---|---|
| Animate | `handleBeginFrame` | Ticker গুলো নতুন মান নেয় (animation চলে) |
| Build | `buildScope` | dirty Element গুলোর build() |
| Layout | `flushLayout` | যাদের মাপ বদলেছে, তাদের মাপ |
| Compositing bits | `flushCompositingBits` | কোন অংশ আলাদা layer এ আঁকা হবে |
| Paint | `flushPaint` | আঁকার নির্দেশ লেখা |
| Composite | `compositeFrame` | Layer tree engine এ পাঠানো |
| Semantics | `flushSemantics` | screen reader এর জন্য তথ্য |
| Post-frame | `addPostFrameCallback` | frame শেষে তোমার রাখা কাজ |

::: tip ১৬ms এর হিসাব
৬০Hz screen এ এক frame এর জন্য সময় ১৬ms। Build, layout, paint মিলে এর বেশি লাগলে frame বাদ পড়ে, আর scroll বা animation আটকে আটকে চলে (একে বলে **jank**)। তাই build() এর ভেতরে ভারী কাজ (JSON parse, বড় হিসাব, file পড়া) রাখবে না।
:::

## ৬. Layout: constraints এর নিয়ম

<FlowSteps v-bind="layoutFlow" />

```txt
Constraints go down.   parent → child: "এর মধ্যে থাকো"
Sizes go up.           child → parent: "আমার মাপ এত"
Parent sets position.  parent ঠিক করে child কোথায় বসবে
```

এই নিয়ম থেকেই সবচেয়ে বেশি দেখা error গুলো আসে:

| Error | কেন | ঠিক করা |
|---|---|---|
| `RenderFlex overflowed by 42 pixels` (হলুদ-কালো দাগ) | Row/Column এর child দের মোট মাপ জায়গার চেয়ে বেশি | `Expanded`/`Flexible` দাও, বা scroll করাও |
| `Vertical viewport was given unbounded height` | Column (অসীম উঁচু দেয়) এর ভেতরে ListView (অসীম উঁচু হতে চায়) | ListView কে `Expanded` দিয়ে মুড়ে দাও |
| `BoxConstraints forces an infinite width` | Row এর ভেতরে এমন কিছু যে "যত জায়গা আছে সব নেবো" বলে | `Expanded` বা নির্দিষ্ট `width` |
| `SizedBox(width: 100)` দিলেও child 100 হয় না | parent আগেই tight constraint দিয়েছে (যেমন screen) | মাঝে `Center` বা `Align` দাও, এরা loose constraint দেয় |

::: details Row এ লম্বা লেখা কেন বাইরে চলে যায়
Row child দের চওড়ায় কোনো সীমা দেয় না (unbounded), কারণ সে আগে সবার মাপ জেনে তবেই সাজায়। তাই লম্বা Text ভাবে তার অসীম জায়গা আছে, আর এক লাইনে পুরোটা লেখে। `Expanded(child: Text(...))` দিলে Row তাকে বাকি জায়গাটুকুর সীমা দেয়, তখন Text নতুন লাইনে চলে যায়। তোমার `SafarAppBar` এ শিরোনাম এজন্যই `Expanded` এর ভেতরে।
:::

## ৭. Paint, Layer আর thread

Paint ধাপে RenderObject গুলো একটা **Canvas** এ আঁকার নির্দেশ লেখে। নির্দেশগুলো জমা হয় **Layer** এ। সাধারণত অনেক RenderObject একই layer এ আঁকে। কিন্তু কিছু জিনিস আলাদা layer পায়: `Opacity`, `ClipRRect`, `Transform`, আর `RepaintBoundary`।

**আলাদা layer কেন:** একটা অংশ ঘন ঘন বদলালে (যেমন ঘুরতে থাকা loading), শুধু সেই layer আবার আঁকা হয়, পুরো screen না। `RepaintBoundary` দিয়ে এটা নিজে করা যায়।

Flutter কয়েকটা thread এ কাজ ভাগ করে:

| Thread | কী করে | এটা আটকালে |
|---|---|---|
| UI thread | তোমার Dart code: build, layout, paint, event | screen আটকে যায়, tap কাজ করে না |
| Raster thread | Layer tree নিয়ে Impeller দিয়ে GPU তে আঁকা | animation আটকে আটকে চলে |
| Platform thread | Android/iOS এর সাথে কথা, plugin | — |
| I/O thread | ছবি decode, ফাইল পড়া | ছবি দেরিতে আসে |

::: warning Dart একটা thread এ চলে
তোমার সব Dart code (build, setState, API এর response সামলানো) একটাই thread এ চলে, JavaScript এর মতো। `await` thread কে আটকায় না, কাজটা পরে করার জন্য সারিতে রাখে (event loop)। কিন্তু বড় হিসাব (১০ হাজার item sort, বড় JSON parse) সত্যিই thread আটকে দেয়। তখন `compute()` বা Isolate দিয়ে আলাদা থ্রেডে পাঠাও। নতুন Flutter version এ Android আর iOS এ UI thread আর platform thread একই হয়ে গেছে, কিন্তু নিয়ম একই: UI thread আটকাবে না।
:::

## ৮. Touch: আঙুল থেকে onPressed

<FlowSteps v-bind="gestureFlow" />

এখান থেকে যা বোঝা যায়:

- **Hit test layout এর ওপর নির্ভর করে।** কোনো widget দেখা গেলেও তার মাপ 0 হলে বা অন্য কিছুর নিচে চাপা পড়লে tap ধরে না।
- **`GestureDetector` এর খালি জায়গায় tap ধরে না।** ভেতরে কিছু আঁকা না থাকলে hit test এ সে পড়ে না। `behavior: HitTestBehavior.opaque` দিলে পুরো জায়গা ধরে।
- **Tap চূড়ান্ত হয় আঙুল তোলার পরে।** scroll করা যায় এমন list এর ভেতরে বোতাম থাকলে arena আঙুল তোলা পর্যন্ত অপেক্ষা করে নিশ্চিত হয় এটা tap নাকি scroll। তাই scroll শুরু করলে বোতামের tap বাতিল হয়ে যায়।

## ৯. InheritedWidget: Theme.of কীভাবে কাজ করে

<FlowSteps v-bind="inheritedFlow" />

তুমি যেসব `of(context)` ব্যবহার করো, সব এই একই কৌশলে চলে:

| তুমি লেখো | উপরে যে InheritedWidget খোঁজে |
|---|---|
| `Theme.of(context)`, `context.colors` | `Theme` |
| `MediaQuery.sizeOf(context)` | `MediaQuery` (screen বা keyboard বদলালে আবার build) |
| `GoRouter.of(context)`, `context.push()` | router এর InheritedWidget |
| `context.watch<T>()` (Provider) | Provider এর InheritedWidget |
| `ScaffoldMessenger.of(context)` | ScaffoldMessenger |

::: tip `.of` আর `.sizeOf` এর পার্থক্য
`MediaQuery.of(context)` পুরো MediaQuery এর উপর নির্ভর করে: keyboard উঠলেও আবার build হয়। `MediaQuery.sizeOf(context)` শুধু মাপের উপর নির্ভর করে, তাই কম build হয়। যতটা দরকার, ঠিক ততটুকুই পড়ো।
:::

## ১০. Hot Reload, Hot Restart আর mode

<FlowSteps v-bind="hotReloadFlow" />

| Mode | Dart কীভাবে চলে | কখন | বৈশিষ্ট্য |
|---|---|---|---|
| Debug | JIT (চলতে চলতে compile) | `flutter run` | Hot Reload, assert চালু, DevTools। ধীর, তাই গতি এখানে মাপবে না |
| Profile | AOT (আগে থেকে machine code) | `flutter run --profile` | প্রায় আসল গতি, DevTools এ গতি মাপা যায় |
| Release | AOT | `flutter build apk` | সবচেয়ে দ্রুত, ছোট। assert আর debug তথ্য বাদ |

## ১১. Platform এর সাথে কথা বলা

Flutter নিজে camera, GPS বা browser খুলতে পারে না, এগুলো Android/iOS এর কাজ। `url_launcher`, `image_picker` এর মতো package ভেতরে **platform channel** দিয়ে Kotlin/Swift code কে বার্তা পাঠায়, আর উত্তর `Future` হিসেবে ফেরত পায়।

```txt
Dart: launchUrl(uri)
  → MethodChannel('url_launcher').invokeMethod('launch', ...)
     → Android (Kotlin): Intent দিয়ে browser খোলে
     ← true
  ← Future<bool> শেষ
```

এজন্য এমন package যোগ করার পরে Hot Restart এ কাজ হয় না, app পুরো বন্ধ করে আবার run করতে হয়। native অংশটা নতুন করে build হতে হয়।

## সারাংশ: ভেতরের কাজ জানলে কী লাভ

| ভেতরের কাজ | তোমার code এ এর মানে |
|---|---|
| Widget সস্তা, Element থেকে যায় | ভয় না পেয়ে বারবার build হতে দাও, State Element এ নিরাপদ |
| canUpdate (type + key) | if দিয়ে widget বদলালে State হারায়, list এ key দাও |
| `const` হলে identical | যেখানে পারো `const` |
| setState শুধু dirty চিহ্ন দেয় | একবারে অনেক setState ডাকলেও build একবারই |
| dirty Element আর তার নিচে build | setState ছোট widget এ রাখো |
| Constraints down, sizes up | overflow আর unbounded error এর কারণ এখানেই |
| ১৬ms এ এক frame | build() এ ভারী কাজ না |
| Dart এক thread এ চলে | বড় হিসাব `compute()` এ পাঠাও |
| Hit test layout দেখে | মাপ 0 হলে tap ধরে না |
| InheritedWidget এ নির্ভরতা লেখা থাকে | যতটুকু দরকার ততটুকুই পড়ো (`sizeOf`) |
| Hot Reload State রাখে, main আবার চালায় না | global বা initState বদলালে Hot Restart দাও |

## সূত্র

- [Flutter architectural overview](https://docs.flutter.dev/resources/architectural-overview)
- [Inside Flutter](https://docs.flutter.dev/resources/inside-flutter)
- [Understanding constraints](https://docs.flutter.dev/ui/layout/constraints)
- [Hot reload](https://docs.flutter.dev/tools/hot-reload)
