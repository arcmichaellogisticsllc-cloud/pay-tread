<script setup lang="ts">
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Head, useForm } from '@inertiajs/vue3'
import { LoaderCircle } from 'lucide-vue-next'

const form = useForm({
  password: '',
})

function submit() {
  form.post('/user/confirm-password', {
    onFinish: () => form.reset('password'),
  })
}
</script>

<template>
  <AuthLayout
    title="Confirm your password"
    description="This is a secure area of the application. Please confirm your password before continuing."
  >
    <Head title="Confirm password" />

    <form @submit.prevent="submit">
      <div class="space-y-6">
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            v-model="form.password"
            required
            autocomplete="current-password"
            autofocus
          />
          <InputError :message="form.errors.password" />
        </div>

        <div class="flex items-center">
          <Button
            type="submit"
            class="w-full"
            :disabled="form.processing"
            data-test="confirm-password-button"
          >
            <LoaderCircle v-if="form.processing" class="h-4 w-4 animate-spin" />
            Confirm Password
          </Button>
        </div>
      </div>
    </form>
  </AuthLayout>
</template>
