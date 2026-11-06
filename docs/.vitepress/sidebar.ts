import type { DefaultTheme } from 'vitepress'

// নতুন নোট লিখলে এখানে তার লিংক যোগ করো।
// link হলো docs/ ফোল্ডারের ভেতরের ফাইলের পথ, .md ছাড়া।
// উদাহরণ: docs/fastapi/setup.md  →  link: '/fastapi/setup'
export const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'শুরু',
    collapsed: false,
    items: [
      { text: 'এই সাইট সম্পর্কে', link: '/start/intro' },
      { text: 'নতুন নোট কীভাবে লিখবো', link: '/start/how-to-write' },
    ],
  },
  {
    text: 'FastAPI',
    collapsed: false,
    items: [
      { text: 'Setup আর venv', link: '/fastapi/setup' },
      { text: 'uvicorn, Starlette, Pydantic', link: '/fastapi/core-parts' },
      { text: 'একটা request এর পুরো যাত্রা', link: '/fastapi/request-journey' },
    ],
  },
  {
    text: 'Python এর ভেতরের কথা',
    collapsed: false,
    items: [
      { text: 'Bytecode আর compile', link: '/python/bytecode' },
      { text: 'Memory: stack, heap আর leak', link: '/python/memory' },
    ],
  },
]
