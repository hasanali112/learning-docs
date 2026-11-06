import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'

// GitHub Pages এ সাইট থাকে /<repo-name>/ এর নিচে।
// deploy workflow DOCS_BASE সেট করে দেয়, লোকালি '/' থাকে।
const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  lang: 'bn',
  title: 'Learning Notes',
  description: 'আমার শেখার নোট: Python, FastAPI, System Design আর আরো অনেক কিছু',
  base,
  cleanUrls: true,

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap',
      },
    ],
  ],

  markdown: {
    lineNumbers: true,
  },

  themeConfig: {
    nav: [{ text: 'হোম', link: '/' }],
    sidebar,

    outline: { level: [2, 3], label: 'এই পেজে' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hasanali112/learning-docs' },
      // নিজের LinkedIn profile এর লিংক বসিয়ে দাও
      { icon: 'linkedin', link: 'https://www.linkedin.com/' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'খুঁজুন', buttonAriaLabel: 'খুঁজুন' },
          modal: {
            noResultsText: 'কিছু পাওয়া যায়নি',
            resetButtonTitle: 'মুছে দাও',
            footer: { selectText: 'খোলো', navigateText: 'সরাও', closeText: 'বন্ধ' },
          },
        },
      },
    },

    docFooter: { prev: 'আগের নোট', next: 'পরের নোট' },
    darkModeSwitchLabel: 'থিম',
    lightModeSwitchTitle: 'লাইট মোড',
    darkModeSwitchTitle: 'ডার্ক মোড',
    sidebarMenuLabel: 'মেনু',
    returnToTopLabel: 'উপরে যাও',
    notFound: {
      title: 'পেজটা পাওয়া যায়নি',
      quote: 'এই ঠিকানায় কোনো নোট নেই।',
      linkText: 'হোমে ফেরো',
    },
  },
})
