import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Breadcrumb from './Breadcrumb.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  // প্রতিটা নোটের শিরোনামের উপরে breadcrumb বসাই
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(Breadcrumb) }),
} satisfies Theme
