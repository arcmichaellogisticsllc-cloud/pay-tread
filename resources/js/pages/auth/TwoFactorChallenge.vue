<script setup lang="ts">
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { Head, useForm } from '@inertiajs/vue3'
import { computed, ref, watch } from 'vue'

type Mode = 'code' | 'recovery'

const showRecoveryInput = ref(false) // false => code mode, true => recovery mode
const code = ref<number[]>([])       // six slots from the PinInput
const codeValue = computed<string>(() => code.value.join(''))

// Inertia form. We send either "code" or "recovery_code".
const form = useForm({
  code: '',
  recovery_code: '',
})

watch(codeValue, (val) => {
  if (!showRecoveryInput.value) {
    form.code = val
  }
})

function toggleRecoveryMode() {
  showRecoveryInput.value = !showRecoveryInput.value
  // clear both values and errors when switching modes
  code.value = []
  form.code = ''
  form.recovery_code = ''
  form.clearErrors()
}

function submit() {
  // Ensure the latest code string is captured when in code mode
  if (!showRecoveryInput.value) {
    form.code = codeValue.value
    form.recovery_code = ''
  } else {
    form.code = ''
  }

  form.post('/two-factor-challenge', {
    onError: () => {
      // Reset the PIN slots on error in code mode (UX nicety)
      if (!showRecoveryInput.value) code.value = []
    },
  })
}

// Small helper for headings/labels
const authConfigContent = computed(() => {
  if (showRecoveryInput.value) {
    return {
      title: 'Recovery Code',
      description:
        'Please confirm access to your account by entering one of your emergency recovery codes.',
      toggleText: 'login using an authentication code',
    }
  }
  return {
    title: 'Authentication Code',
    description: 'Enter the authentication code provided by your authenticator application.',
    toggleText: 'login using a recovery code',
  }
})
</script>

<template>
  <AuthLayout :title="authConfigContent.title" :description="authConfigContent.description">
    <Head title="Two-Factor Authentication" />

    <div class="space-y-6">
      <!-- Authentication code mode -->
      <template v-if="!showRecoveryInput">
        <form @submit.prevent="submit" class="space-y-4">
          <!-- Hidden field that carries the 6-digit code -->
          <input type="hidden" name="code" :value="form.code" />

          <div class="flex flex-col items-center justify-center space-y-3 text-center">
            <div class="flex w-full items-center justify-center">
              <PinInput id="otp" placeholder="○" v-model="code" type="number" otp>
                <PinInputGroup>
                  <PinInputSlot
                    v-for="(id, index) in 6"
                    :key="id"
                    :index="index"
                    :disabled="form.processing"
                    autofocus
                  />
                </PinInputGroup>
              </PinInput>
            </div>
            <InputError :message="form.errors.code" />
          </div>

          <Button type="submit" class="w-full" :disabled="form.processing">Continue</Button>

          <div class="text-center text-sm text-muted-foreground">
            <span>or you can </span>
            <button
              type="button"
              class="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
              @click="toggleRecoveryMode"
            >
              {{ authConfigContent.toggleText }}
            </button>
          </div>
        </form>
      </template>

      <!-- Recovery code mode -->
      <template v-else>
        <form @submit.prevent="submit" class="space-y-4">
          <Input
            name="recovery_code"
            type="text"
            v-model="form.recovery_code"
            placeholder="Enter recovery code"
            autofocus
            required
          />
          <InputError :message="form.errors.recovery_code" />

          <Button type="submit" class="w-full" :disabled="form.processing">Continue</Button>

          <div class="text-center text-sm text-muted-foreground">
            <span>or you can </span>
            <button
              type="button"
              class="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current dark:decoration-neutral-500"
              @click="toggleRecoveryMode"
            >
              {{ authConfigContent.toggleText }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </AuthLayout>
</template>
