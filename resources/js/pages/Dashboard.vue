<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import PlaceholderPattern from '@/components/PlaceholderPattern.vue' // uses @ alias
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { BreadcrumbItem } from '@/types'

// Wayfinder-safe breadcrumb (no route helper needed)
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
]

// --- Mock data (replace with props when API is ready) ---
type Kpi = { label: string; value: string; sublabel?: string }
const kpis: Kpi[] = [
  { label: 'Active Loads', value: '12', sublabel: '3 in transit' },
  { label: 'Open Invoices', value: '$24,300', sublabel: '7 outstanding' },
  { label: 'Drivers Online', value: '5', sublabel: '2 idle' },
]

type LoadRow = {
  id: string
  ref: string
  shipper: string
  origin: string
  destination: string
  eta: string
  status: 'assigned' | 'in_transit' | 'delivered' | 'pod_submitted'
}
const recentLoads: LoadRow[] = [
  { id: '1', ref: 'PT-10231', shipper: 'Acme Co', origin: 'Dallas, TX', destination: 'Phoenix, AZ', eta: 'Today 5:30p', status: 'in_transit' },
  { id: '2', ref: 'PT-10230', shipper: 'Globex', origin: 'Houston, TX', destination: 'Atlanta, GA', eta: 'Tomorrow 11:00a', status: 'assigned' },
  { id: '3', ref: 'PT-10229', shipper: 'Soylent', origin: 'Austin, TX', destination: 'El Paso, TX', eta: 'Delivered', status: 'pod_submitted' },
]

type InvoiceRow = {
  id: string
  number: string
  customer: string
  amount: string
  due: string
  status: 'open' | 'overdue' | 'paid'
}
const invoices: InvoiceRow[] = [
  { id: 'i1', number: 'INV-2041', customer: 'Acme Co', amount: '$4,250', due: 'Due in 3 days', status: 'open' },
  { id: 'i2', number: 'INV-2039', customer: 'Globex', amount: '$12,040', due: 'Overdue 2 days', status: 'overdue' },
  { id: 'i3', number: 'INV-2037', customer: 'Soylent', amount: '$8,010', due: 'Paid', status: 'paid' },
]

// Badge helper
function pillClass(status: LoadRow['status'] | InvoiceRow['status']) {
  const base = 'rounded-full px-2.5 py-0.5 text-xs font-medium'
  switch (status) {
    case 'in_transit':   return `${base} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`
    case 'assigned':     return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300`
    case 'delivered':    return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`
    case 'pod_submitted':return `${base} bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300`
    case 'open':         return `${base} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300`
    case 'overdue':      return `${base} bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300`
    case 'paid':         return `${base} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300`
    default:             return `${base} bg-muted text-foreground`
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Dashboard" />

    <!-- Optional hero placeholders: remove when real widgets are ready -->
    <div class="grid gap-4 p-4 md:grid-cols-3">
      <div class="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <PlaceholderPattern />
      </div>
      <div class="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <PlaceholderPattern />
      </div>
      <div class="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
        <PlaceholderPattern />
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid gap-4 p-4 md:grid-cols-3">
      <Card v-for="k in kpis" :key="k.label" class="shadow-sm">
        <CardHeader class="pb-2">
          <CardTitle class="text-sm text-muted-foreground">{{ k.label }}</CardTitle>
        </CardHeader>
        <CardContent class="flex items-baseline justify-between">
          <div class="text-2xl font-semibold">{{ k.value }}</div>
          <div v-if="k.sublabel" class="text-xs text-muted-foreground">{{ k.sublabel }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Loads + Invoices -->
    <div class="grid gap-4 p-4 lg:grid-cols-3">
      <!-- Recent Loads -->
      <Card class="lg:col-span-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Recent Loads</CardTitle>
          <Button as-child variant="outline" size="sm">
            <a href="/loads">View all</a>
          </Button>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-muted-foreground">
                <tr class="border-b">
                  <th class="py-2 pr-3">Ref</th>
                  <th class="py-2 pr-3">Shipper</th>
                  <th class="py-2 pr-3">From → To</th>
                  <th class="py-2 pr-3">ETA</th>
                  <th class="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in recentLoads" :key="row.id" class="border-b last:border-0">
                  <td class="py-2 pr-3 font-medium">{{ row.ref }}</td>
                  <td class="py-2 pr-3">{{ row.shipper }}</td>
                  <td class="py-2 pr-3">
                    <div class="truncate">{{ row.origin }} → {{ row.destination }}</div>
                  </td>
                  <td class="py-2 pr-3">{{ row.eta }}</td>
                  <td class="py-2 pr-3">
                    <span :class="pillClass(row.status)">{{ row.status.replaceAll('_',' ') }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <!-- Accounts Receivable -->
      <Card class="shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Accounts Receivable</CardTitle>
          <Button as-child variant="outline" size="sm">
            <a href="/invoices">Manage</a>
          </Button>
        </CardHeader>
        <CardContent>
          <ul class="space-y-3">
            <li v-for="inv in invoices" :key="inv.id" class="flex items-center justify-between">
              <div>
                <div class="font-medium">{{ inv.number }} · {{ inv.customer }}</div>
                <div class="text-xs text-muted-foreground">{{ inv.due }}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="text-sm font-semibold">{{ inv.amount }}</div>
                <span :class="pillClass(inv.status)">{{ inv.status }}</span>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <!-- Next actions -->
    <div class="grid gap-4 p-4 lg:grid-cols-3">
      <Card class="lg:col-span-3 shadow-sm">
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-3 md:grid-cols-3">
          <Button as-child variant="default"><a href="/loads/create">Create Load</a></Button>
          <Button as-child variant="outline"><a href="/invoices/create">Create Invoice</a></Button>
          <Button as-child variant="outline"><a href="/two-factor">Review 2FA Settings</a></Button>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>

