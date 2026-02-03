<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'

// Grab only what we need without fighting your app-wide PageProps typing
const page = usePage()
const initial = (page.props || {}) as Record<string, unknown>

const form = useForm({
  token: String(initial.token ?? ''),
  email: String(initial.email ?? ''),
  password: '',
  password_confirmation: '',
})

function submit() {
  // You already have: Route::post('/reset-password')->name('password.store')
  form.post('/reset-password') // or route('password.store') if Ziggy is available
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <Head title="Reset Password" />

    <h1 class="mb-4 text-2xl font-semibold">Reset Password</h1>

    <form @submit.prevent="submit" class="space-y-4">
      <input
        v-model="form.email"
        type="email"
        name="email"
        autocomplete="email"
        required
        placeholder="Email"
        class="w-full rounded border p-2"
      />

      <input
        v-model="form.password"
        type="password"
        name="password"
        autocomplete="new-password"
        required
        placeholder="New password"
        class="w-full rounded border p-2"
      />

      <input
        v-model="form.password_confirmation"
        type="password"
        name="password_confirmation"
        autocomplete="new-password"
        required
        placeholder="Confirm new password"
        class="w-full rounded border p-2"
      />

      <!-- hidden token field -->
      <input v-model="form.token" type="hidden" name="token" />

      <button
        type="submit"
        :disabled="form.processing"
        class="w-full rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        Reset password
      </button>

      <div v-if="form.errors.email" class="text-sm text-red-600">{{ form.errors.email }}</div>
      <div v-if="form.errors.password" class="text-sm text-red-600">{{ form.errors.password }}</div>
      <div v-if="form.errors.token" class="text-sm text-red-600">{{ form.errors.token }}</div>
      <div v-if="form.recentlySuccessful" class="text-sm text-green-600">Password reset successful.</div>
    </form>
  </div>
</template>
