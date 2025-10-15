<script setup lang="ts">
import HeadingSmall from '@/components/HeadingSmall.vue'
import TwoFactorRecoveryCodes from '@/components/TwoFactorRecoveryCodes.vue'
import TwoFactorSetupModal from '@/components/TwoFactorSetupModal.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTwoFactorAuth } from '@/composables/useTwoFactorAuth'
import AppLayout from '@/layouts/AppLayout.vue'
import SettingsLayout from '@/layouts/settings/Layout.vue'
import { disable, enable, show } from '@/routes/two-factor'
import type { BreadcrumbItem } from '@/types'
import { Form, Head } from '@inertiajs/vue3'
import { ShieldBan, ShieldCheck } from 'lucide-vue-next'
import { onUnmounted, ref } from 'vue'

interface Props {
  requiresConfirmation?: boolean
  twoFactorEnabled?: boolean
}

withDefaults(defineProps<Props>(), {
  requiresConfirmation: false,
  twoFactorEnabled: false,
})

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Two-Factor Authentication', href: show.url() },
]

const { hasSetupData, clearTwoFactorAuthData } = useTwoFactorAuth()
const showSetupModal = ref(false)

onUnmounted(() => {
  clearTwoFactorAuthData()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Two-Factor Authentication" />
    <SettingsLayout>
      <div class="space-y-6">
        <HeadingSmall
          title="Two-Factor Authentication"
          description="Manage your two-factor authentication settings"
        />

        <!-- Disabled state -->
        <div v-if="!twoFactorEnabled" class="flex flex-col items-start space-y-4">
          <Badge variant="destructive">Disabled</Badge>

          <p class="text-muted-foreground">
            When you enable two-factor authentication, you'll be prompted for a
            secure code during login from a TOTP app on your phone.
          </p>

          <div>
            <Button v-if="hasSetupData" @click="showSetupModal = true">
              <ShieldCheck class="mr-2 h-4 w-4" />
              Continue Setup
            </Button>

            <Form v-else v-bind="enable.form()" @success="showSetupModal = true" #default="{ processing }">
              <Button type="submit" :disabled="processing">
                <ShieldCheck class="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            </Form>
          </div>
        </div>

        <!-- Enabled state -->
        <div v-else class="flex flex-col items-start space-y-4">
          <Badge variant="default">Enabled</Badge>

          <p class="text-muted-foreground">
            With two-factor enabled, you'll enter a code from your TOTP app at sign-in.
          </p>

          <TwoFactorRecoveryCodes />

          <div class="relative inline">
            <Form v-bind="disable.form()" #default="{ processing }">
              <Button variant="destructive" type="submit" :disabled="processing">
                <ShieldBan class="mr-2 h-4 w-4" />
                Disable 2FA
              </Button>
            </Form>
          </div>
        </div>

        <TwoFactorSetupModal
          v-model:isOpen="showSetupModal"
          :requiresConfirmation="requiresConfirmation"
          :twoFactorEnabled="twoFactorEnabled"
        />
      </div>
    </SettingsLayout>
  </AppLayout>
</template>
