<script setup>
const loadFlow = {
  title: 'Scholarship list লোড হওয়ার পুরো যাত্রা',
  nodes: [
    { id: 'view', label: 'View', sub: 'Screen widget' },
    { id: 'vm', label: 'ViewModel', sub: 'UI state' },
    { id: 'repo', label: 'Repository', sub: 'source of truth' },
    { id: 'svc', label: 'Service', sub: 'ApiClient' },
    { id: 'api', label: 'FastAPI', sub: 'backend' },
  ],
  steps: [
    {
      node: 'view',
      title: '১. Screen খোলে',
      text: 'User scholarship list screen এ ঢুকলো। View নিজে কিছু হিসাব করে না, শুধু ViewModel কে বলে "লোড করো"।',
      code: 'ScholarshipListScreen খুললো',
    },
    {
      node: 'vm', edge: 0,
      title: '২. ViewModel state বদলায়',
      text: 'ViewModel আগে state কে loading করে দেয়, যাতে screen এ spinner দেখায়। তারপর repository কে data চায়।',
      code: 'isLoading = true\nnotifyListeners()',
    },
    {
      node: 'repo', edge: 1,
      title: '৩. Repository data আনতে যায়',
      text: 'ViewModel জানে না data কোথা থেকে আসে (API, cache, নাকি fake)। এটা শুধু repository জানে।',
      code: 'repository.getScholarships()',
    },
    {
      node: 'svc', edge: 2,
      title: '৪. Service HTTP call করে',
      text: 'Service হলো সবচেয়ে নিচের layer। শুধু endpoint call করে, কোনো state রাখে না।',
      code: 'GET /api/scholarships',
    },
    {
      node: 'api', edge: 3,
      title: '৫. FastAPI উত্তর দেয়',
      text: 'আসল business logic (filter, AI matching) সব backend এ। Flutter শুধু ফলাফল নেয়।',
      code: '[{"id": 1, "title": "...", "funding_type": "full"}]',
    },
    {
      node: 'svc', edge: 3, reverse: true,
      title: '৬. Raw JSON ফেরত আসে',
      text: 'Service JSON টা API model এ বদলে উপরে পাঠায়।',
      code: 'List<ScholarshipApiModel>',
    },
    {
      node: 'repo', edge: 2, reverse: true,
      title: '৭. Repository app model বানায়',
      text: 'API এর নাম (funding_type) app এর নিজের model এ (FundingType.full) বদলে যায়। API বদলালে শুধু এখানেই বদলাতে হবে।',
      code: 'List<Scholarship>',
    },
    {
      node: 'vm', edge: 1, reverse: true,
      title: '৮. ViewModel নতুন state দেয়',
      text: 'list রেখে loading বন্ধ করে, তারপর notifyListeners() দিয়ে জানিয়ে দেয়।',
      code: 'scholarships = [...]\nisLoading = false\nnotifyListeners()',
    },
    {
      node: 'view', edge: 0, reverse: true,
      title: '৯. View আবার আঁকে',
      text: 'View শুধু state দেখে UI বানায়। data নিচ থেকে উপরে একদিকেই এলো, এটাই unidirectional data flow।',
      code: 'ListView এ ৫টা scholarship',
    },
  ],
}
</script>

# Flutter App Architecture: MVVM

Flutter app কে কীভাবে সাজালে বড় হলেও গুলিয়ে যায় না? Flutter এর official docs যেটা বলে, সেটাই এখানে। উদাহরণ: scholarship app, যেখানে backend হলো FastAPI আর Flutter শুধু client।

## মূল ভাবনা: দুইটা layer

Flutter docs বলে app কে দুই ভাগে ভাগ করো: **UI layer** আর **Data layer**।

```txt
┌─────────────── UI layer ───────────────┐
│  View (widget)   ◀──▶   ViewModel      │
└────────────────────────────┬───────────┘
                             │
┌─────────────── Data layer ─┴───────────┐
│  Repository   ◀──▶   Service           │──▶ FastAPI
└────────────────────────────────────────┘
```

| অংশ | কাজ | কী করবে না |
|---|---|---|
| **View** | UI আঁকে, user এর tap ধরে ViewModel কে জানায় | কোনো business logic, কোনো API call |
| **ViewModel** | app data কে **UI state** এ বদলায় (loading, error, list) | widget বা `BuildContext` ধরবে না |
| **Repository** | model data এর **source of truth**, raw data থেকে model বানায় | UI নিয়ে কিছু জানবে না, অন্য repository কেও জানবে না |
| **Service** | API endpoint wrap করে, `Future` / `Stream` ফেরত দেয় | কোনো state রাখবে না |

**View আর ViewModel এর সম্পর্ক এক-এক।** প্রতিটা screen এর নিজের একটা ViewModel থাকে।

::: tip Domain layer লাগবে?
Docs এ use-case (domain layer) **ঐচ্ছিক**, শুধু খুব জটিল logic থাকলে লাগে। আমাদের জটিল logic (matching, filter) সব FastAPI তে, তাই Flutter এ এটা লাগবে না।
:::

## একটা request এর পুরো যাত্রা

<FlowSteps v-bind="loadFlow" />

## Folder structure

Docs এর case study তে **UI ভাগ হয় feature ধরে, data ভাগ হয় type ধরে।**

```txt
lib/
├── main.dart                 ← DI সেটআপ, app চালু
├── config/                   ← base URL, env
├── routing/                  ← go_router
├── utils/
├── ui/                       ← feature ধরে
│   ├── core/                 ← সবার ব্যবহারের widget, theme
│   ├── scholarship_list/
│   │   ├── view_models/scholarship_list_view_model.dart
│   │   └── widgets/scholarship_list_screen.dart
│   ├── profile/
│   └── matching/
├── domain/
│   └── models/scholarship.dart        ← app এর নিজের model
└── data/                     ← type ধরে
    ├── services/api_client.dart       ← সব HTTP call
    ├── repositories/scholarship_repository.dart
    └── model/scholarship_api_model.dart   ← FastAPI এর JSON আকার
```

**কেন এভাবে?** প্রতিটা feature এর ঠিক একটা view আর একটা view model থাকে, তাই সেগুলো feature এর ফোল্ডারে একসাথে রাখা যায়। কিন্তু একটা repository অনেকগুলো feature ব্যবহার করে, তাই ওগুলো type অনুযায়ী আলাদা ফোল্ডারে থাকে।

## প্রতিটা layer এর কোড

### Model: immutable

```dart
// lib/domain/models/scholarship.dart
enum FundingType { full, partial, tuitionWaiver }

class Scholarship {
  const Scholarship({required this.id, required this.title, required this.funding});

  final int id;
  final String title;
  final FundingType funding;
}
```

সব field `final`। model বদলাতে চাইলে নতুন object বানাও, পুরনোটা বদলাবে না।

### Service: শুধু HTTP

```dart
// lib/data/services/api_client.dart
class ApiClient {
  ApiClient(this.baseUrl);
  final String baseUrl;

  Future<List<Map<String, dynamic>>> getScholarships() async {
    final res = await http.get(Uri.parse('$baseUrl/api/scholarships'));
    if (res.statusCode != 200) throw Exception('লোড হয়নি: ${res.statusCode}');
    return (jsonDecode(res.body) as List).cast<Map<String, dynamic>>();
  }
}
```

### Repository: abstract + আসল implementation

```dart
// lib/data/repositories/scholarship_repository.dart
abstract class ScholarshipRepository {
  Future<List<Scholarship>> getScholarships();
}

class RemoteScholarshipRepository implements ScholarshipRepository {
  RemoteScholarshipRepository(this._api);
  final ApiClient _api;

  @override
  Future<List<Scholarship>> getScholarships() async {
    final raw = await _api.getScholarships();
    return raw.map(_toModel).toList();
  }

  // API এর নাম → app এর model। FastAPI বদলালে শুধু এখানে হাত দিতে হবে
  Scholarship _toModel(Map<String, dynamic> j) => Scholarship(
        id: j['id'],
        title: j['title'],
        funding: switch (j['funding_type']) {
          'full' => FundingType.full,
          'partial' => FundingType.partial,
          _ => FundingType.tuitionWaiver,
        },
      );
}
```

Abstract class রাখার লাভ হলো টেস্টের সময় `FakeScholarshipRepository` বসিয়ে দেওয়া যায়, আসল API call করা লাগে না।

### ViewModel: UI state

```dart
// lib/ui/scholarship_list/view_models/scholarship_list_view_model.dart
class ScholarshipListViewModel extends ChangeNotifier {
  ScholarshipListViewModel(this._repo);
  final ScholarshipRepository _repo;

  List<Scholarship> scholarships = [];
  bool isLoading = false;
  String? error;

  Future<void> load() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      scholarships = await _repo.getScholarships();
    } catch (e) {
      error = 'লোড করা যায়নি';
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
```

### View: শুধু state দেখে আঁকে

```dart
// lib/ui/scholarship_list/widgets/scholarship_list_screen.dart
class ScholarshipListScreen extends StatelessWidget {
  const ScholarshipListScreen({super.key, required this.viewModel});
  final ScholarshipListViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: viewModel,
      builder: (context, _) {
        if (viewModel.isLoading) return const Center(child: CircularProgressIndicator());
        if (viewModel.error != null) return Center(child: Text(viewModel.error!));
        return ListView(
          children: [for (final s in viewModel.scholarships) ListTile(title: Text(s.title))],
        );
      },
    );
  }
}
```

### main.dart: সব জোড়া লাগানো (Dependency Injection)

```dart
void main() {
  runApp(
    MultiProvider(
      providers: [
        Provider(create: (_) => ApiClient('https://api.example.com')),
        Provider<ScholarshipRepository>(
          create: (c) => RemoteScholarshipRepository(c.read<ApiClient>()),
        ),
      ],
      child: const MyApp(),
    ),
  );
}
```

উপরের layer নিচের layer কে নিজে `new` করে বানায় না, বাইরে থেকে পায়। NestJS এর DI এর মতোই, শুধু decorator নেই।

## Best practice: docs কতটা জোর দিয়ে বলে

Docs প্রতিটা পরামর্শকে তিন ধাপে ভাগ করে।

**Strongly recommend (অবশ্যই মানবে):**
- Data layer আর UI layer আলাদা রাখা
- Data layer এ repository pattern
- UI layer এ MVVM (View + ViewModel)
- Widget এর ভেতরে logic না রাখা
- Unidirectional data flow: data নিচ থেকে উপরে আসে, event উপর থেকে নিচে যায়
- Immutable data model
- Dependency injection (docs এর উদাহরণে `provider`)
- Repository এর abstract class
- প্রতিটা layer আলাদা করে আর একসাথে টেস্ট করা, fake দিয়ে

**Recommend (ভালো, তবে বাধ্যতামূলক না):**
- User event এর জন্য `Command` pattern
- `freezed` / `built_value` দিয়ে immutable model generate করা
- Navigation এর জন্য `go_router`
- নামের একটা নিয়ম: `HomeViewModel`, `HomeScreen`, `UserRepository`, `ApiClient`

**Conditional (দরকার হলে):**
- `ChangeNotifier` / `Listenable` (Riverpod, Bloc ব্যবহার করলেও চলে, এটা নিজের পছন্দ)
- Domain layer (use-case)
- API model আর domain model আলাদা রাখা (বড় app এ)

::: warning নতুনরা যে ভুলগুলো করে
- Widget এর `build()` বা `onPressed` এর ভেতরে সরাসরি `http.get` লেখা
- ViewModel এ `BuildContext` পাঠানো বা Navigator চালানো
- এক repository থেকে আরেক repository ডাকা (দুটো লাগলে ViewModel দুটোকেই নেবে)
- FastAPI এর JSON সরাসরি UI তে ব্যবহার করা: API বদলালে সব screen ভেঙে যাবে
- Business logic (matching, eligibility হিসাব) Flutter এ লেখা: ওটা backend এর কাজ
:::

## সূত্র

- [Guide to app architecture](https://docs.flutter.dev/app-architecture/guide)
- [Architecture case study](https://docs.flutter.dev/app-architecture/case-study)
- [Architecture recommendations](https://docs.flutter.dev/app-architecture/recommendations)
