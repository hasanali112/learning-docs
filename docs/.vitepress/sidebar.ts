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
      { text: 'LLM এর মূল ধারণা', link: '/ai-engineer/llm-basics' },
      { text: 'Prompt লেখা', link: '/ai-engineer/prompting' },
      { text: 'Structured Output', link: '/ai-engineer/structured-output' },
      { text: 'LangChain এর মূল অংশ', link: '/ai-engineer/langchain-basics' },
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
