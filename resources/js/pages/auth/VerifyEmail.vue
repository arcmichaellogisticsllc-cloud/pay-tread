<script setup lang="ts">
import { Head, useForm } from '@inertiajs/vue3'

const form = useForm({})

function resend() {
  // You have Route::post('/email/verification-notification')->name('verification.send')
  form.post('/email/verification-notification')
}
</script>

<template>
  <div class="mx-auto max-w-md">
    <Head title="Verify Email" />
    <h1 class="mb-3 text-2xl font-semibold">Verify your email</h1>

    <p class="mb-6 text-sm text-muted-foreground">
      Thanks for signing up! Before getting started, please verify your email address by
      clicking on the link we just emailed to you. If you didn't receive the email, we can
      send another.
    </p>

    <form @submit.prevent="resend" class="space-y-3">
      <button
        type="submit"
        :disabled="form.processing"
        class="w-full rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50"
      >
        Resend verification email
      </button>
    </form>

    <p v-if="form.recentlySuccessful" class="mt-3 text-sm text-green-600">
      A new verification link has been sent to your email address.
    </p>
  </div>
</template>
