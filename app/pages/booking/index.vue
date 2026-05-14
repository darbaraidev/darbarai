<template>
  <div class="max-w-2xl mx-auto px-4 py-12">
    <!-- Retour -->
    <NuxtLink
      :to="localePath(`/riads/${riad.slug}`)"
      class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t("common.back") }}
    </NuxtLink>

    <h1 class="font-serif text-3xl text-stone-800 mb-8">{{ t("booking.recap_title") }}</h1>

    <!-- Écran de confirmation "payer plus tard" -->
    <div v-if="laterSuccess" class="card p-8 text-center space-y-6">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h2 class="font-serif text-2xl text-stone-800 mb-2">{{ t("booking.later_success_title") }}</h2>
        <p class="text-stone-500 text-sm leading-relaxed">{{ t("booking.later_success_desc") }}</p>
      </div>
      <div class="space-y-3 text-left bg-stone-50 rounded-xl p-4 text-sm">
        <p class="font-medium text-stone-700">{{ riadName }}</p>
        <p class="text-stone-500">{{ formatDate(checkIn) }} → {{ formatDate(checkOut) }}</p>
        <p class="text-stone-400 text-xs">Réf. {{ reservationId.slice(0, 8).toUpperCase() }}</p>
      </div>
      <div class="space-y-3">
        <a
          v-if="whatsappLink"
          :href="whatsappLink"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {{ t("booking.contact_whatsapp") }}
        </a>
        <a
          :href="`mailto:${contactEmail}?subject=${encodeURIComponent('Réservation ' + riadName)}&body=${encodeURIComponent('Bonjour,\n\nJe viens de faire une demande de réservation (réf. ' + reservationId.slice(0, 8).toUpperCase() + ') au ' + riadName + ' du ' + checkIn + ' au ' + checkOut + '.\n\nJe souhaite convenir du règlement.\n\nCordialement')}`"
          class="btn-outline w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium"
        >
          {{ t("booking.contact_email") }}
        </a>
        <NuxtLink :to="localePath('/account')" class="block text-center text-sm text-stone-400 hover:text-stone-600 pt-1">
          {{ t("account.my_reservations") }} →
        </NuxtLink>
      </div>
    </div>

    <!-- Formulaire de récap + paiement -->
    <div v-else class="card p-0 overflow-hidden">
      <!-- Riad -->
      <div class="flex items-center gap-4 p-6 border-b border-stone-100">
        <img
          :src="riad.cover_image"
          :alt="riadName"
          class="w-20 h-20 rounded-xl object-cover shrink-0"
        />
        <div>
          <p class="font-serif text-xl text-stone-800">{{ riadName }}</p>
          <p class="text-sm text-stone-500 mt-0.5">{{ riad.location?.address }}</p>
          <p v-if="riad.location?.neighborhood" class="text-xs text-stone-400">
            {{ riad.location.neighborhood }}
          </p>
          <a
            v-if="riad.location?.google_maps_url"
            :href="riad.location.google_maps_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-terracotta-600 hover:underline mt-1 inline-block"
          >{{ t("riads.view_on_map") }} →</a>
        </div>
      </div>

      <!-- Détails -->
      <div class="p-6 space-y-5 border-b border-stone-100">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
              {{ t("booking.check_in") }}
            </p>
            <p class="font-medium text-stone-800">{{ formatDate(checkIn) }}</p>
          </div>
          <div>
            <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
              {{ t("booking.check_out") }}
            </p>
            <p class="font-medium text-stone-800">{{ formatDate(checkOut) }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
            {{ t("booking.guests") }}
          </p>
          <p class="font-medium text-stone-800">{{ t("riads.guests", guests) }}</p>
        </div>

        <div v-if="specialRequests">
          <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
            {{ t("booking.special_requests") }}
          </p>
          <p class="text-stone-600 text-sm">{{ specialRequests }}</p>
        </div>
      </div>

      <!-- Prix -->
      <div class="p-6 space-y-3 border-b border-stone-100 bg-sand-50">
        <div class="flex justify-between text-stone-600 text-sm">
          <span>{{ formatPrice(riad.base_price_per_night) }} × {{ t("booking.nights", nights) }}</span>
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>
        <div class="flex justify-between font-semibold text-stone-800 pt-2 border-t border-sand-200">
          <span>{{ t("common.total") }}</span>
          <span>{{ formatPrice(totalPrice) }}</span>
        </div>
        <div class="flex items-start gap-2 pt-3 border-t border-sand-200">
          <span class="text-amber-500 shrink-0 mt-0.5">ℹ</span>
          <p class="text-xs text-stone-500 leading-relaxed">{{ t("booking.tourist_tax") }}</p>
        </div>
      </div>

      <!-- Choix du mode de paiement -->
      <div class="p-6 border-b border-stone-100">
        <p class="text-xs font-medium text-stone-500 uppercase tracking-wide mb-4">
          {{ t("booking.payment_method") }}
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            :class="[
              'rounded-xl border-2 p-4 text-left space-y-1 transition-colors',
              method === 'card'
                ? 'border-terracotta-500 bg-terracotta-50'
                : 'border-stone-200 hover:border-stone-300',
            ]"
            @click="method = 'card'"
          >
            <span class="text-xl">💳</span>
            <p class="font-medium text-sm text-stone-800">{{ t("booking.method_card") }}</p>
            <p class="text-xs text-stone-500">{{ t("booking.method_card_desc") }}</p>
          </button>
          <button
            type="button"
            :class="[
              'rounded-xl border-2 p-4 text-left space-y-1 transition-colors',
              method === 'later'
                ? 'border-terracotta-500 bg-terracotta-50'
                : 'border-stone-200 hover:border-stone-300',
            ]"
            @click="method = 'later'"
          >
            <span class="text-xl">💬</span>
            <p class="font-medium text-sm text-stone-800">{{ t("booking.method_later") }}</p>
            <p class="text-xs text-stone-500">{{ t("booking.method_later_desc") }}</p>
          </button>
        </div>
      </div>

      <!-- Stripe Elements (v-show pour garder le div dans le DOM au montage) -->
      <div v-show="method === 'card'" class="p-6 border-b border-stone-100">
        <div v-if="stripeLoading" class="space-y-3">
          <div class="h-10 bg-stone-100 rounded-lg animate-pulse"></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="h-10 bg-stone-100 rounded-lg animate-pulse"></div>
            <div class="h-10 bg-stone-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div v-else-if="devMode" class="rounded-xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-400">
          Stripe non configuré — paiement simulé en dev
        </div>
        <div v-show="!stripeLoading && !devMode" id="payment-element"></div>
      </div>

      <!-- Info "payer plus tard" -->
      <div v-if="method === 'later'" class="p-6 border-b border-stone-100">
        <p class="text-sm text-stone-600 leading-relaxed">{{ t("booking.method_later_info") }}</p>
      </div>

      <!-- CTA -->
      <div class="p-6 space-y-3">
        <p v-if="payError" class="text-sm text-red-600">{{ payError }}</p>
        <button
          class="btn-primary w-full py-4 text-base"
          :disabled="loading || stripeLoading"
          @click="pay"
        >
          {{ loading ? t("common.loading") : (method === "card" ? t("booking.pay_now") : t("booking.confirm_later")) }}
        </button>
        <p v-if="method === 'card'" class="text-center text-xs text-stone-400">
          {{ t("booking.no_charge_yet") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { differenceInCalendarDays, parseISO, format } from "date-fns"
import type { Stripe, StripeElements } from "@stripe/stripe-js"

const route = useRoute()
const localePath = useLocalePath()
const { t, locale } = useI18n()
const { formatPrice } = useRiad()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const config = useRuntimeConfig()

if (!user.value) {
  await navigateTo(
    localePath("/auth/login") + "?redirect=" + encodeURIComponent(route.fullPath)
  )
}

const riadId = route.query.riadId as string
const checkIn = route.query.checkIn as string
const checkOut = route.query.checkOut as string
const guests = Number(route.query.guests) || 1
const specialRequests = (route.query.specialRequests as string) || ""

if (!riadId || !checkIn || !checkOut) {
  await navigateTo(localePath("/"))
}

const { data: riad } = await useAsyncData("recap-riad:" + riadId, async () => {
  const { data } = await (supabase as any)
    .from("riads")
    .select("id, name, name_en, slug, cover_image, base_price_per_night, location")
    .eq("id", riadId)
    .single()
  return data
})

if (!riad.value) throw createError({ statusCode: 404 })

const riadName = computed(() =>
  locale.value === "fr" ? riad.value.name : riad.value.name_en || riad.value.name
)

const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))
const totalPrice = riad.value.base_price_per_night * nights

const formatDate = (d: string) =>
  format(parseISO(d), locale.value === "fr" ? "EEEE d MMMM yyyy" : "EEEE, MMMM d yyyy")

// Paiement
const method = ref<"card" | "later">("card")
const laterSuccess = ref(false)
const stripeLoading = ref(true)
const devMode = ref(false)
const loading = ref(false)
const payError = ref<string | false>(false)

const contactEmail = (config.public as any).contactEmail || "reservations@darbarai.com"
const whatsappLink = computed(() => {
  const phone = (config.public as any).contactWhatsapp as string
  if (!phone || !reservationId) return ""
  const msg = encodeURIComponent(
    `Bonjour, j'ai fait une demande de réservation (réf. ${reservationId.slice(0, 8).toUpperCase()}) au ${riadName.value} du ${checkIn} au ${checkOut}. Je souhaite convenir du règlement.`
  )
  return `https://wa.me/${phone}?text=${msg}`
})

let stripe: Stripe | null = null
let elements: StripeElements | null = null
let reservationId = ""
let accessToken = ""
const reservationCompleted = ref(false)

const deleteIfAbandoned = () => {
  if (reservationCompleted.value || !reservationId || !accessToken) return
  navigator.sendBeacon(
    `/api/reservations/${reservationId}`,
    new Blob([JSON.stringify({ token: accessToken })], { type: "application/json" })
  )
}

onBeforeUnmount(async () => {
  if (reservationCompleted.value || !reservationId) return
  await (supabase as any)
    .from("reservations")
    .delete()
    .eq("id", reservationId)
    .eq("status", "pending")
})

onMounted(async () => {
  window.addEventListener("beforeunload", deleteIfAbandoned)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    accessToken = session?.access_token ?? ""
    const data = await $fetch<{ clientSecret: string | null; reservationId: string }>(
      "/api/reservations/create",
      {
        method: "POST",
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
        body: {
          riad_id: riadId,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          special_requests: specialRequests || undefined,
        },
      }
    )

    reservationId = data.reservationId

    if (!data.clientSecret) {
      devMode.value = true
      stripeLoading.value = false
      return
    }

    const { loadStripe } = await import("@stripe/stripe-js")
    stripe = await loadStripe(config.public.stripePublicKey as string)
    if (!stripe) return

    elements = stripe.elements({
      clientSecret: data.clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#ce4123",
          colorBackground: "#ffffff",
          colorText: "#1c1917",
          colorDanger: "#dc2626",
          fontFamily: "inherit",
          borderRadius: "8px",
          spacingUnit: "4px",
        },
      },
    })

    const paymentElement = elements.create("payment")
    paymentElement.mount("#payment-element")

    stripeLoading.value = false
  } catch (err) {
    console.error(err)
    payError.value = t("errors.generic")
    stripeLoading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener("beforeunload", deleteIfAbandoned)
})

const pay = async () => {
  loading.value = true
  payError.value = false

  if (method.value === "later") {
    reservationCompleted.value = true
    laterSuccess.value = true
    loading.value = false
    return
  }

  if (devMode.value) {
    reservationCompleted.value = true
    await navigateTo(`/account?payment=success&reservation=${reservationId}`)
    return
  }

  if (!stripe || !elements) {
    loading.value = false
    return
  }

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/account?payment=success&reservation=${reservationId}`,
    },
    redirect: "if_required",
  })

  if (error) {
    payError.value = error.message ?? t("errors.generic")
    loading.value = false
  } else {
    reservationCompleted.value = true
    await navigateTo(`/account?payment=success&reservation=${reservationId}`)
  }
}

useSeoMeta({ title: `${t("booking.recap_title")} – Dar Baraï` })
</script>
