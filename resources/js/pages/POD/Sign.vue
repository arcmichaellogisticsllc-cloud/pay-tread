<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Head, router, useForm } from '@inertiajs/vue3'
import SignaturePad from 'signature_pad'

const props = defineProps<{ load: any; rules: any }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let sig: SignaturePad | null = null

const form = useForm({
  signer_name: '',
  signer_role: 'receiver',
  signature_png: '',
  lat: null as number | null,
  lng: null as number | null,
  accuracy_m: null as number | null,
  receiver_email: '',
  receiver_phone_e164: ''
})

function getGeo() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.lat = pos.coords.latitude
      form.lng = pos.coords.longitude
      form.accuracy_m = Math.round(pos.coords.accuracy)
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function clearSig() {
  if (sig) sig.clear()
}

function submit() {
  if (!sig || sig.isEmpty()) {
    alert('Please capture a signature')
    return
  }
  form.signature_png = sig.toDataURL('image/png')

  // If you have Ziggy's `route()` available:
  // const url = route('loads.pod.submit', { load: props.load.id })
  // If not, use a plain path:
  const url = `/loads/${props.load.id}/pod/submit`

  router.post(url, form, {
    preserveScroll: true,
    onError: (errs) => console.log('validation', errs),
    onSuccess: () => console.log('submitted')
  })
}

onMounted(() => {
  if (canvasRef.value) {
    sig = new SignaturePad(canvasRef.value, { minWidth: 1, maxWidth: 2 })
  }
  getGeo()
})
</script>
