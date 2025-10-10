<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const submitting = ref(false)

async function submit(e: Event) {
  e.preventDefault()
  submitting.value = true
  try {
    await fetch('/user/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(form.value),
    })
    // keep it simple for now
    alert('Submitted (wire up real backend later)')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="max-w-xl mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-semibold">Password settings</h1>

    <form @submit="submit" class="space-y-4">
      <div>
        <label class="block text-sm mb-1">Current password</label>
        <input v-model="form.current_password" type="password" class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">New password</label>
        <input v-model="form.password" type="password" class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm mb-1">Confirm new password</label>
        <input v-model="form.password_confirmation" type="password" class="w-full border rounded px-3 py-2" />
      </div>

      <button :disabled="submitting" class="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {{ submitting ? 'Saving…' : 'Save' }}
      </button>
    </form>
  </main>
</template>
