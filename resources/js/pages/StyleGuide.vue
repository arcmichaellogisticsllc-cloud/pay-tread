<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Style Guide" />
  <div class="p-6 space-y-4">
    <h1 class="text-2xl font-semibold">Style Guide</h1>
    <p class="text-muted-foreground">
      Placeholder page. Replace with your actual style guide when ready.
    </p>
  </div>
</template>
mkdir -p resources/js/pages
cat > resources/js/pages/StyleGuide.vue <<'EOF'
<script setup lang="ts">
// temporary stub so builds pass; add real content later
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold">Style Guide</h1>
    <p class="mt-2 opacity-80">Temporary placeholder component.</p>
  </div>
</template>
EOF
