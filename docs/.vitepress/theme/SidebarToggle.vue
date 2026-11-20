<script setup lang="ts">
// বড় screen এ পুরো sidebar লুকানো/দেখানোর বাটন।
// পছন্দটা browser এ মনে থাকে (localStorage), পরের বার খুললেও একই থাকে।
import { onMounted, ref } from 'vue'
import { useSidebar } from 'vitepress/theme'

const KEY = 'sidebar-collapsed'
const CLASS = 'sidebar-collapsed'

const { hasSidebar } = useSidebar()
const collapsed = ref(false)

function apply(value: boolean) {
  collapsed.value = value
  document.documentElement.classList.toggle(CLASS, value)
  try {
    localStorage.setItem(KEY, value ? '1' : '0')
  } catch {
    // private mode এ storage না থাকলেও বাটন কাজ করবে
  }
}

onMounted(() => {
  let saved = false
  try {
    saved = localStorage.getItem(KEY) === '1'
  } catch {}
  apply(saved)
})
</script>

<template>
  <button
    v-if="hasSidebar"
    class="sidebar-toggle"
    type="button"
    :aria-label="collapsed ? 'মেনু দেখাও' : 'মেনু লুকাও'"
    :title="collapsed ? 'মেনু দেখাও' : 'মেনু লুকাও'"
    :aria-pressed="collapsed"
    @click="apply(!collapsed)"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path v-if="collapsed" d="m13 10 2 2-2 2" />
      <path v-else d="m15 10-2 2 2 2" />
    </svg>
  </button>
</template>

<style scoped>
.sidebar-toggle {
  display: none;
}

/* মোবাইলে VitePress এর নিজের "মেনু" বাটন আছে, তাই এটা শুধু বড় screen এ */
@media (min-width: 960px) {
  .sidebar-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 8px;
    border-radius: 8px;
    color: var(--vp-c-text-2);
    transition: color 0.2s, background-color 0.2s;
  }

  .sidebar-toggle:hover {
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-default-soft);
  }
}
</style>
