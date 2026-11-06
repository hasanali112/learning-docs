<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import type { DefaultTheme } from 'vitepress'

type Item = DefaultTheme.SidebarItem

const { theme, page } = useData<DefaultTheme.Config>()

// "/fastapi/setup" → "fastapi/setup", "/" → "index", "/fastapi/" → "fastapi/index"
function toPagePath(link: string): string {
  const path = link.replace(/^\//, '').replace(/\.(md|html)$/, '')
  if (path === '') return 'index'
  return path.endsWith('/') ? `${path}index` : path
}

// sidebar গাছে বর্তমান পেজ খুঁজে তার উপরের group গুলো বের করি
function findTrail(items: Item[], target: string, trail: Item[] = []): Item[] | null {
  for (const item of items) {
    const next = [...trail, item]
    if (item.link && toPagePath(item.link) === target) return next
    if (item.items) {
      const found = findTrail(item.items, target, next)
      if (found) return found
    }
  }
  return null
}

const crumbs = computed(() => {
  const sidebar = theme.value.sidebar
  if (!Array.isArray(sidebar)) return []
  const target = page.value.relativePath.replace(/\.md$/, '')
  return findTrail(sidebar, target) ?? []
})
</script>

<template>
  <nav v-if="crumbs.length > 1" class="breadcrumb" aria-label="breadcrumb">
    <template v-for="(crumb, i) in crumbs" :key="i">
      <a v-if="crumb.link && i < crumbs.length - 1" :href="withBase(crumb.link)">{{ crumb.text }}</a>
      <span v-else :class="{ current: i === crumbs.length - 1 }">{{ crumb.text }}</span>
      <span v-if="i < crumbs.length - 1" class="sep" aria-hidden="true">›</span>
    </template>
  </nav>
</template>
