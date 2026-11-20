import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Breadcrumb from './Breadcrumb.vue'
import FlowSteps from './FlowSteps.vue'
import LangCompare from './LangCompare.vue'
import SidebarToggle from './SidebarToggle.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // প্রতিটা নোটের শিরোনামের উপরে breadcrumb বসাই
  // উপরের bar এ, search এর বাম পাশে sidebar লুকানো/দেখানোর বাটন
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'doc-before': () => h(Breadcrumb),
      'nav-bar-content-before': () => h(SidebarToggle),
    }),
  // যেকোনো নোটে <FlowSteps> দিয়ে animated flowchart বসানো যায়
  enhanceApp({ app }) {
    app.component('FlowSteps', FlowSteps)
    // ভাষাগুলোর পাশাপাশি তুলনা: <LangCompare />
    app.component('LangCompare', LangCompare)
  },
} satisfies Theme
