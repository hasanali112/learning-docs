<script setup>
const loopFlow = {
  title: 'Agent loop: ভাবো → কাজ করো → দেখো',
  nodes: [
    { id: 'goal', label: 'প্রশ্ন', sub: 'লক্ষ্য' },
    { id: 'think', label: 'LLM ভাবে', sub: 'পরের কাজ কী' },
    { id: 'act', label: 'Tool চালাও', sub: 'কোড চালায়' },
    { id: 'obs', label: 'ফল দেখো' },
    { id: 'ans', label: 'উত্তর' },
  ],
  steps: [
    {
      node: 'goal',
      title: '১. কাস্টমারের প্রশ্ন',
      text: 'কাস্টমার জানতে চায় তার order কোথায়। এই উত্তর LLM এর জানা নেই, খুঁজে বের করতে হবে।',
      code: '"amar order ta kothay? 01711000000"',
    },
    {
      node: 'think', edge: 0,
      title: '২. LLM ঠিক করে কী করতে হবে',
      text: 'LLM এর কাছে কয়েকটা tool এর তালিকা আছে। সে বুঝলো আগে phone নম্বর দিয়ে order খুঁজতে হবে। LLM নিজে কোড চালায় না, শুধু বলে "এই tool টা এই input দিয়ে চালাও"।',
      code: 'tool call: search_orders(phone="01711000000")',
    },
    {
      node: 'act', edge: 1,
      title: '৩. আমাদের কোড tool চালায়',
      text: 'Tool হলো আমাদের লেখা একটা সাধারণ Python function। এটা database থেকে order খোঁজে।',
      code: 'SELECT ... FROM orders\nWHERE phone = $1 AND seller_id = $2',
    },
    {
      node: 'obs', edge: 2,
      title: '৪. ফলাফল LLM এর কাছে ফেরত',
      text: 'Tool এর ফল message হিসেবে LLM এর কাছে ফেরত যায়।',
      code: 'order #1042: লাল শাড়ি x2, status: shipped,\ntracking: PTH-88231',
    },
    {
      node: 'think', edge: 2, reverse: true,
      title: '৫. আবার ভাবা: আরো কিছু লাগবে?',
      text: 'LLM দেখলো order পাঠানো হয়েছে, কিন্তু এখন কোথায় সেটা জানতে courier এর tracking দেখা দরকার। তাই আরেকটা tool ডাকে। এই চক্র চলতে থাকে, যতক্ষণ না উত্তর দেওয়ার মতো যথেষ্ট তথ্য আসে।',
      code: 'tool call: track_parcel(tracking="PTH-88231")\n→ "মিরপুর hub এ, আজ ডেলিভারি হবে"',
    },
    {
      node: 'ans', edge: 3,
      title: '৬. যথেষ্ট তথ্য, এবার উত্তর',
      text: 'আর কোনো tool লাগবে না। LLM সব তথ্য মিলিয়ে কাস্টমারকে উত্তর লেখে, আর loop থামে।',
      code: '"আপনার ২টা লাল শাড়ির order এখন মিরপুর hub এ আছে,\nআজকেই ডেলিভারি হবে।"',
    },
  ],
}
</script>

# AI Agents

**AI agent হলো এমন একটা system, যেখানে LLM নিজে ঠিক করে একটা লক্ষ্যে পৌঁছাতে কোন কাজ করতে হবে, tool ব্যবহার করে সেই কাজ করে, ফল দেখে, আর দরকার হলে আবার করে।**

সাধারণ chatbot শুধু উত্তর লেখে। Agent **কাজ করে**: database খোঁজে, courier এর অবস্থা দেখে, order বানায়।

## Agent এর ভেতরে চক্র

<FlowSteps v-bind="loopFlow" />

এই চক্রকে বলে **ReAct** (Reason + Act): ভাবো, কাজ করো, ফল দেখো, আবার ভাবো।

## একটা agent এর ৫টা অংশ

| অংশ | কাজ | আমাদের Sales agent এ |
|---|---|---|
| **Model** | ভাবে আর সিদ্ধান্ত নেয় | Claude বা অন্য LLM |
| **Instructions** | ভূমিকা, নিয়ম, সীমা | system prompt |
| **Tools** | বাইরের জগতে কাজ করার হাত | `search_orders`, `check_stock`, `create_order` |
| **Memory** | আগের কথা মনে রাখা | কাস্টমার প্রতি কথোপকথন |
| **Guardrails** | কী করা যাবে না | শুধু নিজের seller এর data, টাকার কাজে seller এর অনুমতি |

## Workflow বনাম Agent

সব কাজে agent লাগে না। অনেক সময় নির্দিষ্ট ধাপের একটা workflow বেশি ভালো।

| | Workflow | Agent |
|---|---|---|
| ধাপ কে ঠিক করে | তুমি, কোডে | LLM, চলার সময় |
| পূর্বানুমান | একই input এ একই পথ | পথ বদলাতে পারে |
| খরচ আর সময় | কম, জানা | বেশি, অনিশ্চিত |
| কখন | ধাপগুলো সবসময় একই | কী লাগবে আগে জানা নেই |
| উদাহরণ | মেসেজ → ফর্ম পূরণ → যাচাই | "আমার order এর কী অবস্থা?" (কয়টা tool লাগবে আগে জানা নেই) |

::: tip নিয়ম
**যতটা সম্ভব workflow, যেখানে দরকার সেখানে agent।** আমাদের কাজের তালিকায় ধাপ ১-৬ (ফর্ম পূরণ) workflow, আর ধাপ ৯ থেকে agent।
:::

## Autonomy ধীরে ধীরে বাড়ানো

আপনার product এর মূল নীতির সাথে মিলিয়ে:

| স্তর | Agent কী করে | উদাহরণ |
|---|---|---|
| ১. শুধু পড়া | তথ্য খোঁজে আর জানায় | order এর অবস্থা বলা |
| ২. প্রস্তাব | কাজ তৈরি করে, seller নিশ্চিত করে | order এর খসড়া, seller "হ্যাঁ" বললে save |
| ৩. সীমার ভেতরে নিজে | নির্দিষ্ট সীমার ভেতরে নিজেই করে | ৫০০ টাকার নিচের boost নিজে চালানো |

শুরু হবে স্তর ১ থেকে। বিশ্বাস তৈরি হলে ধাপে ধাপে উপরে।

## যা নিয়ে গোলমাল হয়

- **Chatbot আর agent এক না।** Chatbot শুধু কথা বলে, agent tool দিয়ে কাজও করে।
- **LLM নিজে কোড চালায় না।** সে শুধু বলে কোন tool কোন input দিয়ে চালাতে হবে। আসলে চালায় আমাদের কোড, তাই নিয়ন্ত্রণ আমাদের হাতে।
- **Agent মানে AGI না।** Agent হলো LLM কে loop আর tool দিয়ে সাজানো, এর বুদ্ধি LLM এর চেয়ে বেশি না।
- **Multi-agent মানেই ভালো না।** Manager, Sales, Delivery এর মতো কয়েকটা agent ভাগ করা কাজে লাগে, কিন্তু প্রতিটা agent ভাগ করা মানে বেশি call, বেশি খরচ, বেশি ভুলের সুযোগ। আগে একটা agent কে ভালো করো।
- **Loop থামানো জরুরি।** Agent কখনো একই tool বারবার ডাকতে পারে। সর্বোচ্চ কয় ধাপ চলবে, সেই সীমা সবসময় রাখো।

পরের নোট: [RAG](/ai-engineer/rag)
