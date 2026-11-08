import type { DefaultTheme } from 'vitepress'

// নতুন নোট লিখলে এখানে তার লিংক যোগ করো।
// link হলো docs/ ফোল্ডারের ভেতরের ফাইলের পথ, .md ছাড়া।
// উদাহরণ: docs/fastapi/setup.md  →  link: '/fastapi/setup'
export const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Python',
    collapsed: false,
    items: [
      {
        text: 'Python Fundamentals',
        collapsed: false,
        items: [
          { text: 'Bytecode আর compile', link: '/python/bytecode' },
          { text: 'Memory: stack, heap আর leak', link: '/python/memory' },
        ],
      },
      {
        text: 'FastAPI Fundamentals',
        collapsed: false,
        items: [
          { text: 'uvicorn, Starlette, Pydantic', link: '/fastapi/core-parts' },
          { text: 'একটা request এর পুরো যাত্রা', link: '/fastapi/request-journey' },
        ],
      },
      {
        text: 'FastAPI',
        collapsed: false,
        items: [{ text: 'Setup আর venv', link: '/fastapi/setup' }],
      },
    ],
  },
  {
    text: 'AI Engineer',
    collapsed: false,
    items: [
      {
        // roadmap: Working With LLMs → How LLMs Work → Common Terminology
        text: 'How LLMs Work',
        collapsed: false,
        items: [
          { text: 'AI vs AGI', link: '/ai-engineer/ai-vs-agi' },
          { text: 'Large Language Model (LLM)', link: '/ai-engineer/llm-basics' },
          {
            text: 'Core LLM Elements',
            collapsed: false,
            items: [
              { text: 'Tokens', link: '/ai-engineer/llm-basics#token' },
              { text: 'Context', link: '/ai-engineer/context-window' },
              {
                text: 'Sampling Parameters',
                link: '/ai-engineer/sampling-parameters',
                collapsed: false,
                items: [
                  { text: 'Temperature', link: '/ai-engineer/sampling-parameters#temperature' },
                  { text: 'Top-K', link: '/ai-engineer/sampling-parameters#top-k' },
                  { text: 'Top-P', link: '/ai-engineer/sampling-parameters#top-p' },
                  { text: 'Repetition Penalties', link: '/ai-engineer/sampling-parameters#repetition-penalties' },
                ],
              },
            ],
          },
          { text: 'Embeddings', link: '/ai-engineer/embeddings' },
          { text: 'Training', link: '/ai-engineer/training' },
          { text: 'Inference', link: '/ai-engineer/inference' },
          { text: 'Vector DBs', link: '/ai-engineer/vector-dbs' },
          { text: 'AI Agents', link: '/ai-engineer/ai-agents' },
          { text: 'RAG', link: '/ai-engineer/rag' },
          { text: 'Context Window', link: '/ai-engineer/context-window' },
          { text: 'Fine-tuning', link: '/ai-engineer/fine-tuning' },
          { text: 'Prompt Engineering', link: '/ai-engineer/prompting' },
          { text: 'Inference Engineering', link: '/ai-engineer/inference-engineering' },
          { text: 'Context Engineering', link: '/ai-engineer/context-engineering' },
        ],
      },
      {
        text: 'Building with LLMs',
        collapsed: false,
        items: [
          { text: 'Structured Output', link: '/ai-engineer/structured-output' },
          { text: 'LangChain এর মূল অংশ', link: '/ai-engineer/langchain-basics' },
        ],
      },
    ],
  },
  {
    text: 'Software Architecture ও Design Patterns',
    collapsed: false,
    items: [
      { text: 'Architecture vs Design Pattern', link: '/architecture/architecture-vs-pattern' },
      {
        text: 'Software Architecture',
        collapsed: false,
        items: [
          { text: 'Monolith, Modular Monolith, Microservices', link: '/architecture/monolith-microservices' },
          { text: 'Layered আর Hexagonal', link: '/architecture/layered-hexagonal' },
          { text: 'Event-Driven Architecture', link: '/architecture/event-driven' },
        ],
      },
      {
        text: 'Design Patterns',
        collapsed: false,
        items: [
          { text: 'শুরু: তিন ধরনের pattern', link: '/design-patterns/overview' },
          { text: 'Singleton', link: '/design-patterns/singleton' },
          { text: 'Factory', link: '/design-patterns/factory' },
          { text: 'Builder', link: '/design-patterns/builder' },
          { text: 'Adapter', link: '/design-patterns/adapter' },
          { text: 'Decorator', link: '/design-patterns/decorator' },
          { text: 'Facade', link: '/design-patterns/facade' },
          { text: 'Strategy', link: '/design-patterns/strategy' },
          { text: 'Observer', link: '/design-patterns/observer' },
          { text: 'Chain of Responsibility', link: '/design-patterns/chain-of-responsibility' },
          { text: 'Observer vs Pub/Sub', link: '/design-patterns/observer-vs-pubsub' },
          { text: 'FastAPI এর ভেতরের pattern', link: '/design-patterns/fastapi-patterns' },
        ],
      },
    ],
  },
]
