<script setup lang="ts">
// JS · Python · Dart পাশাপাশি তুলনা: উপরে category chip আর search, নিচে তিন কলাম।
// ডেটা থাকে langCompareData.ts এ।
import { computed, ref } from 'vue'
import { categories, rows, type Row } from './langCompareData'

type Lang = 'js' | 'py' | 'dart'

const langs: { id: Lang; badge: string; name: string }[] = [
  { id: 'js', badge: 'JS', name: 'JavaScript' },
  { id: 'py', badge: 'PY', name: 'Python' },
  { id: 'dart', badge: 'DT', name: 'Dart' },
]

const active = ref('all')
const query = ref('')

const groups = computed(() => {
  const q = query.value.trim().toLowerCase()
  const match = (r: Row) =>
    !q || [r.title, r.js, r.py, r.dart, r.tip ?? ''].some((s) => s.toLowerCase().includes(q))

  return categories
    .filter((c) => active.value === 'all' || c.id === active.value)
    .map((c) => ({ ...c, rows: rows.filter((r) => r.cat === c.id && match(r)) }))
    .filter((g) => g.rows.length > 0)
})

// ───── ছোট syntax highlighter ─────
const KEYWORDS: Record<Lang, Set<string>> = {
  js: new Set(
    'let const var function return if else for while of in new class extends constructor super this import from export default async await try catch finally throw typeof instanceof switch case break delete get static'.split(' '),
  ),
  py: new Set(
    'def return if elif else for while in not and or is class import from as async await try except finally raise lambda with pass match case del global yield'.split(' '),
  ),
  dart: new Set(
    'var final const void return if else for while in new class extends implements abstract super this import as async await try catch on finally throw switch case default break required get static is late dynamic'.split(' '),
  ),
}
const LITERALS = new Set(['true', 'false', 'null', 'True', 'False', 'None', 'undefined'])

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const STR = String.raw`[fr]?"""[\s\S]*?"""|'''[\s\S]*?'''|\x60[\s\S]*?\x60|[fr]?"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'`
const TOKEN: Record<Lang, RegExp> = {
  js: new RegExp(String.raw`(\/\/.*|\/\*[\s\S]*?\*\/)|(${STR})|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$#][\w$]*)`, 'g'),
  py: new RegExp(String.raw`(#.*)|(${STR})|(\b\d+(?:\.\d+)?\b)|([A-Za-z_@][\w]*)`, 'g'),
  dart: new RegExp(String.raw`(\/\/.*|\/\*[\s\S]*?\*\/)|(${STR})|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)`, 'g'),
}

function highlight(code: string, lang: Lang): string {
  const re = TOKEN[lang]
  re.lastIndex = 0
  let out = ''
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index))
    last = re.lastIndex
    const [tok, comment, str, num, word] = m
    let cls = ''
    if (comment) cls = 'tk-com'
    else if (str) cls = 'tk-str'
    else if (num) cls = 'tk-num'
    else if (word) {
      if (LITERALS.has(word)) cls = 'tk-lit'
      else if (KEYWORDS[lang].has(word) || word.startsWith('@')) cls = 'tk-kw'
      else if (code[last] === '(' || /^[A-Z][a-z]/.test(word)) cls = 'tk-fn'
    }
    out += cls ? `<span class="${cls}">${esc(tok)}</span>` : esc(tok)
  }
  return out + esc(code.slice(last))
}
</script>

<template>
  <div class="lc">
    <div class="lc-chips" role="tablist">
      <button :class="['lc-chip', { on: active === 'all' }]" @click="active = 'all'">সব</button>
      <button
        v-for="c in categories"
        :key="c.id"
        :class="['lc-chip', { on: active === c.id }]"
        @click="active = c.id"
      >
        {{ c.label }}
      </button>
    </div>

    <input v-model="query" class="lc-search" type="search" placeholder="খুঁজো... যেমন: length, map, class, async" />

    <div class="lc-head">
      <div v-for="l in langs" :key="l.id" class="lc-lang">
        <span :class="['lc-badge', l.id]">{{ l.badge }}</span>
        <span class="lc-lang-name">{{ l.name }}</span>
      </div>
    </div>

    <p v-if="groups.length === 0" class="lc-empty">কিছু পাওয়া যায়নি</p>

    <section v-for="g in groups" :key="g.id" class="lc-group">
      <h2 class="lc-group-title">{{ g.label }}</h2>

      <div v-for="r in g.rows" :key="r.title" class="lc-row">
        <div class="lc-row-title">{{ r.title }}</div>
        <div class="lc-cols">
          <div v-for="l in langs" :key="l.id" class="lc-cell">
            <span :class="['lc-cell-tag', l.id]">{{ l.name }}</span>
            <pre><code v-html="highlight(r[l.id], l.id)"></code></pre>
          </div>
        </div>
        <p v-if="r.tip" class="lc-tip">💡 {{ r.tip }}</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lc {
  --lc-kw: #d73a6f;
  --lc-str: #22863a;
  --lc-num: #c25e00;
  --lc-lit: #1f6feb;
  --lc-fn: #7c3aed;
  --lc-com: #8b8b8b;
  --lc-tip: #9a6700;
  margin-top: 8px;
}
.dark .lc {
  --lc-kw: #f47ba6;
  --lc-str: #7ee2a8;
  --lc-num: #f5a97f;
  --lc-lit: #6cb6ff;
  --lc-fn: #c4a7ff;
  --lc-com: #8a8f98;
  --lc-tip: #e3c27a;
}

.lc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lc-chip {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.lc-chip:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-text-3);
}
.lc-chip.on {
  background: var(--vp-c-text-1);
  border-color: var(--vp-c-text-1);
  color: var(--vp-c-bg);
}

.lc-search {
  width: 100%;
  margin: 14px 0 6px;
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 15px;
}
.lc-search:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.lc-head,
.lc-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.lc-head {
  position: sticky;
  top: var(--vp-nav-height, 64px);
  z-index: 5;
  padding: 12px 0;
  border-bottom: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}
.lc-lang {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lc-badge {
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-end;
  width: 34px;
  height: 34px;
  padding: 3px 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}
.lc-badge.js { background: #f7df1e; color: #1a1a1a; }
.lc-badge.py { background: #3d79b0; color: #ffd43b; }
.lc-badge.dart { background: #1fb6f2; color: #0a3a5c; }
.lc-lang-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.lc-empty {
  padding: 24px 0;
  color: var(--vp-c-text-2);
}

.lc-group-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 36px 0 8px !important;
  padding-top: 0 !important;
  border-top: none !important;
  font-size: 22px !important;
}
.lc-group-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--vp-c-divider);
}

.lc-row {
  padding: 16px 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.lc-row-title {
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 15.5px;
  color: var(--vp-c-text-1);
}
.lc-cell {
  min-width: 0;
}
.lc-cell-tag {
  display: none;
}
.lc-cell pre {
  margin: 0;
  padding: 0;
  background: none;
  overflow-x: auto;
  white-space: pre;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}
.lc-cell code {
  padding: 0;
  background: none;
  font-size: inherit;
  color: inherit;
}
.lc-tip {
  margin: 10px 0 0 !important;
  font-size: 14.5px !important;
  line-height: 1.6 !important;
  color: var(--lc-tip);
}

:deep(.tk-kw) { color: var(--lc-kw); }
:deep(.tk-str) { color: var(--lc-str); }
:deep(.tk-num) { color: var(--lc-num); }
:deep(.tk-lit) { color: var(--lc-lit); }
:deep(.tk-fn) { color: var(--lc-fn); }
:deep(.tk-com) { color: var(--lc-com); font-style: italic; }

/* মোবাইলে কলামগুলো নিচে নিচে, প্রতিটার উপরে ভাষার নাম */
@media (max-width: 768px) {
  .lc-head {
    display: none;
  }
  .lc-cols {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .lc-cell {
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--vp-c-bg-soft);
  }
  .lc-cell-tag {
    display: inline-block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--vp-c-text-2);
  }
}
</style>
