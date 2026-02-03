<script setup lang="ts">
import { Head, useForm, usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import SettingsLayout from '@/layouts/settings/Layout.vue'
import InputError from '@/components/InputError.vue'

const page = usePage()
const currentUser = (page.props?.auth?.user ?? {}) as Record<string, unknown>

const form = useForm({
  name: String(currentUser.name ?? ''),
  email: String(currentUser.email ?? ''),
})

function updateProfile() {
  form.put('/profile')
}

function deleteAccount() {
  if (confirm('Delete your account? This cannot be undone.')) {
    form.delete('/profile')
  }
}
</script>

<template>
  <AppLayout>
    <Head title="Profile" />
    <SettingsLayout>
      <div class="space-y-6 max-w-xl">
        <h1 class="text-2xl font-semibold">Profile</h1>
        <p class="text-muted-foreground">Update your account information.</p>

        <form @submit.prevent="updateProfile" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              v-model="form.name"
              autocomplete="name"
              required
              class="mt-1 w-full rounded border px-3 py-2"
              placeholder="Your name"
            />
            <InputError :message="form.errors.name" />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              v-model="form.email"
              autocomplete="email"
              required
              class="mt-1 w-full rounded border px-3 py-2"
              placeholder="you@example.com"
            />
            <InputError :message="form.errors.email" />
          </div>

          <button
            type="submit"
            :disabled="form.processing"
            class="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            Save changes
          </button>
        </form>

        <hr class="my-6" />

        <div>
          <h2 class="text-lg font-semibold">Danger zone</h2>
          <p class="mb-3 text-sm text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
          <button
            type="button"
            @click="deleteAccount"
            :disabled="form.processing"
            class="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Delete account
          </button>
        </div>
      </div>
    </SettingsLayout>
  </AppLayout>
</template>
