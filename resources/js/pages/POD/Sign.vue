<script setup lang="ts">
import SignaturePad from 'signature_pad'

// Keep it minimal for a clean compile. We'll wire up logic in a later PR.
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold">POD Signature</h1>
    <p class="text-gray-600 mt-2">Scaffold page is up. We’ll hook it to data and canvas next.</p>
  </div>
</template>

<template>
  <Head :title="`Sign POD • Load ${load.ref}`" />
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-semibold">Sign POD — Load {{ load.ref }}</h1>

    <div v-if="load.bol_url" class="bg-white rounded shadow p-4">
      <div class="text-sm text-gray-500 mb-2">BOL Preview</div>
      <iframe :src="load.bol_url" class="w-full h-64 border rounded"></iframe>
    </div>

    <div class="bg-white rounded shadow p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm mb-1">Signer name</label>
          <input v-model="form.signer_name" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Signer role</label>
          <select v-model="form.signer_role" class="w-full border rounded p-2">
            <option value="receiver">Receiver</option>
            <option value="shipper_rep">Shipper Rep</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm mb-1">Signature</label>
        <div class="border rounded">
          <canvas ref="canvasRef" width="600" height="220" class="w-full"></canvas>
        </div>
        <button @click="clearSig" class="mt-2 text-sm text-gray-600 hover:text-gray-800">
          Clear
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm mb-1">Email (optional)</label>
          <input v-model="form.receiver_email" type="email" class="w-full border rounded p-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Phone (E.164)</label>
          <input v-model="form.receiver_phone_e164" placeholder="+1..." class="w-full border rounded p-2" />
        </div>
      </div>

      <div class="text-sm text-gray-500">
        Location accuracy:
        <b>{{ form.accuracy_m ?? '—' }}m</b>
        (need ≤ {{ rules.minAccuracyM }}m)
      </div>

      <div class="flex justify-end">
        <button @click="submit" class="px-4 py-2 bg-emerald-600 text-white rounded">
          Submit POD
        </button>
      </div>
    </div>
  </div>
</template>

    </div>
  </div>
</template>
