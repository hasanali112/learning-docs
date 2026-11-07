<script setup lang="ts">
// Step-by-step animated flowchart for notes.
// Usage in markdown: define the data in <script setup>, then <FlowSteps v-bind="flow" />
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface FlowNode {
  id: string
  label: string
  sub?: string
}

interface FlowStep {
  node?: string | string[] // node(s) to highlight
  edge?: number // arrow index to animate: k joins nodes[k] and nodes[k + 1]
  reverse?: boolean // data moves backwards on that arrow (loops, retries)
  title: string
  text: string
  code?: string // data at this moment
}

const props = withDefaults(
  defineProps<{ title?: string; nodes: FlowNode[]; steps: FlowStep[]; interval?: number }>(),
  { title: '', interval: 4800 },
)

const BN = '০১২৩৪৫৬৭৮৯'
const bn = (n: number) => String(n).replace(/\d/g, (d) => BN[Number(d)])
const asList = (n?: string | string[]) => (n === undefined ? [] : Array.isArray(n) ? n : [n])

const i = ref(0)
const playing = ref(false)
const root = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined

const step = computed(() => props.steps[i.value])
const atEnd = computed(() => i.value === props.steps.length - 1)
const progress = computed(() => ((i.value + 1) / props.steps.length) * 100)
const active = computed(() => new Set(asList(step.value.node)))
const seen = computed(() => new Set(props.steps.slice(0, i.value + 1).flatMap((s) => asList(s.node))))

function stop() {
  playing.value = false
  clearTimeout(timer)
}

function tick() {
  clearTimeout(timer)
  if (!playing.value) return
  timer = setTimeout(() => {
    if (atEnd.value) return stop()
    i.value++
    tick()
  }, props.interval)
}

function go(k: number) {
  stop()
  i.value = Math.max(0, Math.min(props.steps.length - 1, k))
}

function toggle() {
  if (playing.value) return stop()
  if (atEnd.value) i.value = 0
  playing.value = true
  tick()
}

function jumpTo(id: string) {
  const k = props.steps.findIndex((s) => asList(s.node).includes(id))
  if (k >= 0) go(k)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce || !('IntersectionObserver' in window) || !root.value) return
  // Start playing once the chart scrolls into view.
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return
      observer?.disconnect()
      playing.value = true
      tick()
    },
    { threshold: 0.4 },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
  observer?.disconnect()
})
</script>

<template>
  <div ref="root" class="fs">
    <div class="fs-head">
      <span class="fs-title">{{ title }}</span>
      <span class="fs-count">ধাপ {{ bn(i + 1) }} / {{ bn(steps.length) }}</span>
    </div>

    <div class="fs-track">
      <template v-for="(n, k) in nodes" :key="n.id">
        <button
          type="button"
          class="fs-node"
          :class="{ on: active.has(n.id), seen: seen.has(n.id) }"
          @click="jumpTo(n.id)"
        >
          <span class="fs-label">{{ n.label }}</span>
          <span v-if="n.sub" class="fs-sub">{{ n.sub }}</span>
        </button>
        <div
          v-if="k < nodes.length - 1"
          class="fs-edge"
          :class="{ on: step.edge === k, rev: step.edge === k && step.reverse }"
        >
          <span class="fs-dot" />
        </div>
      </template>
    </div>

    <div class="fs-bar"><span :style="{ width: progress + '%' }" /></div>

    <Transition name="fs-fade" mode="out-in">
      <div :key="i" class="fs-body" aria-live="polite">
        <p class="fs-step-title">{{ step.title }}</p>
        <p class="fs-text">{{ step.text }}</p>
        <pre v-if="step.code" class="fs-code">{{ step.code }}</pre>
      </div>
    </Transition>

    <div class="fs-ctl">
      <button type="button" :disabled="i === 0" @click="go(i - 1)">← আগের</button>
      <button type="button" class="fs-play" @click="toggle">
        {{ playing ? 'থামাও' : atEnd ? 'আবার দেখো' : 'চালাও' }}
      </button>
      <button type="button" :disabled="atEnd" @click="go(i + 1)">পরের →</button>
    </div>
  </div>
</template>

<style scoped>
.fs {
  margin: 24px 0;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.fs-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}
.fs-title { font-weight: 600; font-size: 15px; color: var(--vp-c-text-1); }
.fs-count { font-size: 13px; color: var(--vp-c-text-2); white-space: nowrap; }

.fs-track { display: flex; align-items: center; overflow-x: auto; padding: 6px 2px 10px; }
.fs-node {
  flex: 1 1 0;
  min-width: 86px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  font: inherit;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s, box-shadow 0.3s, transform 0.3s;
}
.fs-node.seen { color: var(--vp-c-text-1); }
.fs-node.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
  box-shadow: 0 0 0 4px var(--vp-c-brand-soft);
  transform: translateY(-2px);
}
.fs-label { font-size: 14px; font-weight: 600; line-height: 1.3; }
.fs-sub { font-size: 11.5px; line-height: 1.3; color: var(--vp-c-text-2); }

.fs-edge { position: relative; flex: 0 0 30px; height: 2px; background: var(--vp-c-divider); }
.fs-edge::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  border-left: 6px solid var(--vp-c-divider);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}
.fs-edge.on { background: var(--vp-c-brand-1); }
.fs-edge.on::after { border-left-color: var(--vp-c-brand-1); }
.fs-dot {
  display: none;
  position: absolute;
  top: -3px;
  left: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}
.fs-edge.on .fs-dot { display: block; animation: fs-move-x 1.1s ease-in-out infinite; }
.fs-edge.rev .fs-dot { animation-direction: reverse; }
@keyframes fs-move-x { from { left: 0; } to { left: calc(100% - 8px); } }
@keyframes fs-move-y { from { top: 0; } to { top: calc(100% - 8px); } }

.fs-bar { height: 3px; margin: 4px 0 16px; border-radius: 2px; background: var(--vp-c-divider); overflow: hidden; }
.fs-bar span { display: block; height: 100%; background: var(--vp-c-brand-1); transition: width 0.4s; }

.fs-body { min-height: 120px; }
.fs-step-title { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--vp-c-text-1); }
.fs-text { margin: 0; font-size: 15px; line-height: 1.75; color: var(--vp-c-text-1); }
.fs-code {
  margin: 12px 0 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.fs-ctl { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.fs-ctl button {
  padding: 6px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.fs-ctl button:disabled { opacity: 0.4; cursor: default; }
.fs-ctl .fs-play {
  border-color: var(--vp-button-brand-bg);
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.fs-fade-enter-active,
.fs-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.fs-fade-enter-from { opacity: 0; transform: translateY(6px); }
.fs-fade-leave-to { opacity: 0; }

/* Phones: stack the nodes top to bottom */
@media (max-width: 640px) {
  .fs { padding: 14px; }
  .fs-track { flex-direction: column; align-items: stretch; overflow: visible; }
  .fs-node { flex: none; }
  .fs-edge { flex: 0 0 22px; width: 2px; height: auto; align-self: center; }
  .fs-edge::after,
  .fs-edge.on::after {
    right: auto;
    top: auto;
    bottom: -1px;
    left: -4px;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 6px solid var(--vp-c-divider);
    border-bottom: 0;
  }
  .fs-edge.on::after { border-top-color: var(--vp-c-brand-1); }
  .fs-dot { left: -3px; top: 0; }
  .fs-edge.on .fs-dot { animation-name: fs-move-y; }
}

@media (prefers-reduced-motion: reduce) {
  .fs-node,
  .fs-bar span { transition: none; }
  .fs-edge.on .fs-dot { animation: none; }
}
</style>
