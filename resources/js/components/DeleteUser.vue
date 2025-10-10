<!-- resources/js/components/DeleteUser.vue -->
<script setup lang="ts">
import ProfileController from '@/actions/settings/profileController';

const destroy = ProfileController.destroy.form();
</script>

<template>
  <form :action="destroy.action" :method="destroy.method" class="space-y-4">
    <input type="hidden" name="_method" value="delete" />
    <p class="text-sm text-gray-600">
      Deleting your account is permanent. This action cannot be undone.
    </p>
    <button type="submit" class="px-4 py-2 rounded bg-red-600 text-white">
      Delete Account
    </button>
  </form>
</template>
