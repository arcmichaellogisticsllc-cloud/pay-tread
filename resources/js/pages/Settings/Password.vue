<script setup lang="ts">
import HeadingSmall from '@/components/HeadingSmall.vue'
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  current_password: '',
  password: '',
  password_confirmation: '',
})

function submit() {
  form.put('/user/password', {
    preserveScroll: true,
    onSuccess: () => {
      form.reset('current_password', 'password', 'password_confirmation')
    },
  })
}
</script>

<template>
  <div class="mx-auto max-w-xl p-6">
    <HeadingSmall
      title="Password settings"
      description="Update your account password."
    />

    <form @submit.prevent="submit" class="mt-6 space-y-6">
      <div>
        <label for="current_password" class="block text-sm font-medium text-gray-700">
          Current password
        </label>
        <input
          v-model="form.current_password"
          id="current_password"
          name="current_password"
          type="password"
          autocomplete="current-password"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
        />
        <p v-if="form.errors.current_password" class="mt-2 text-sm text-red-600">
          {{ form.errors.current_password }}
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          New password
        </label>
        <input
          v-model="form.password"
          id="password"
          name="password"
          type="password"
          autocomplete="new-password"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
        />
        <p v-if="form.errors.password" class="mt-2 text-sm text-red-600">
          {{ form.errors.password }}
        </p>
      </div>

      <div>
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
          Confirm new password
        </label>
        <input
          v-model="form.password_confirmation"
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-black focus:ring-black"
        />
        <p v-if="form.errors.password_confirmation" class="mt-2 text-sm text-red-600">
          {{ form.errors.password_confirmation }}
        </p>
      </div>

      <div class="pt-2">
        <button
          type="submit"
          :disabled="form.processing"
          class="inline-flex items-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          <span v-if="form.processing">Saving…</span>
          <span v-else>Save</span>
        </button>

        <span v-if="form.recentlySuccessful" class="ml-3 text-sm text-green-600">
          Saved.
        </span>
      </div>
    </form>
  </div>
</template>
