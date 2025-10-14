<!-- resources/js/pages/settings/Appearance.vue -->
<script setup lang="ts">
import { Head } from '@inertiajs/vue3'

import appearance from '@/routes/appearance'
import HeadingSmall from '@/components/HeadingSmall.vue'
import { type BreadcrumbItem } from '@/types'

import AppLayout from '@/layouts/AppLayout.vue'
import SettingsLayout from '@/layouts/settings/Layout.vue'

// Use named route helper
import { edit as editAppearance } from '@/routes/appearance'

const breadcrumbItems: BreadcrumbItem[] = [
  { title: 'Appearance settings', href: editAppearance().url },
]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbItems">
    <Head title="Appearance settings" />

    <SettingsLayout>
      <HeadingSmall
        title="Appearance"
        description="Theme, brand, and display settings."
      />
      <AppearanceTabs />
    </SettingsLayout>
  </AppLayout>
</template>
