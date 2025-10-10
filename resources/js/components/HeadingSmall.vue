<script setup lang="ts">
type Level = 'h2' | 'h3' | 'h4'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  as?: Level
  id?: string
}>(), {
  as: 'h2',
})

const Tag = props.as
</script>

<template>
  <header>
    <component :is="Tag" :id="id" class="text-xl font-semibold tracking-tight">
      <span v-if="title">{{ title }}</span>
      <slot v-else />
    </component>

    <p v-if="description" class="mt-1 text-sm text-muted-foreground">
      {{ description }}
    </p>
  </header>
</template>
<script setup lang="ts">
type Level = 'h2' | 'h3' | 'h4'
const { title, description, as = 'h2', id } = defineProps<{
  title: string
  description?: string
  as?: Level
  id?: string
}>()
const Tag = as
</script>
  