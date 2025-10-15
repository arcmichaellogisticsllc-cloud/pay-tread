<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'

const form = useForm({})

function destroy() {
  if (confirm('Delete your account? This cannot be undone.')) {
    form.delete('/profile')
  }
}
</script>

<template>
  <button
    type="button"
    @click="destroy"
    :disabled="form.processing"
    class="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
  >
    Delete account
  </button>
</template>
