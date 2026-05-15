<template>
  <div>
    <h1 class="text-2xl font-semibold text-stone-800 mb-2">Emails transactionnels</h1>
    <p class="text-sm text-stone-500 mb-6">
      Référence de tous les emails envoyés automatiquement par la plateforme, avec leur déclencheur et leurs destinataires.
    </p>

    <!-- Note commune à tous les emails -->
    <div class="rounded-xl border border-stone-200 bg-stone-50 px-5 py-4 mb-8 text-sm text-stone-600 space-y-1.5">
      <p class="font-medium text-stone-700">Commun à tous les emails</p>
      <p>· Expéditeur : <span class="font-mono text-xs bg-white border border-stone-200 px-1.5 py-0.5 rounded">RESEND_FROM_NAME &lt;RESEND_FROM_EMAIL&gt;</span> (configuré dans <span class="font-mono text-xs">.env</span>)</p>
      <p>· Footer : adresse de contact <strong>contact@darbarai.com</strong> sur chaque email.</p>
      <p>· Footer : mention <em>« Cet email est envoyé automatiquement, merci de ne pas y répondre directement. »</em></p>
    </div>

    <div class="space-y-4">
      <div
        v-for="group in emailGroups"
        :key="group.title"
        class="card overflow-hidden"
      >
        <!-- En-tête groupe -->
        <div class="px-5 py-3 border-b border-stone-100 bg-stone-50 flex items-center gap-2">
          <span class="text-base">{{ group.icon }}</span>
          <h2 class="text-sm font-semibold text-stone-700">{{ group.title }}</h2>
        </div>

        <div class="divide-y divide-stone-100">
          <div
            v-for="email in group.emails"
            :key="email.id"
            class="p-5"
          >
            <div class="flex items-start justify-between gap-4 mb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="font-medium text-stone-800 text-sm">{{ email.subject }}</span>
                  <span
                    v-for="tag in email.to"
                    :key="tag"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="tag === 'Client' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'"
                  >
                    {{ tag }}
                  </span>
                </div>
                <p class="text-xs text-stone-500 leading-relaxed">{{ email.trigger }}</p>
              </div>
              <span class="shrink-0 text-xs px-2.5 py-1 rounded-lg border font-mono" :class="actionClass(email.action)">
                {{ email.action }}
              </span>
            </div>

            <!-- Aperçu contenu -->
            <div class="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600 leading-relaxed space-y-1">
              <p class="font-medium text-stone-700 mb-1.5">Contenu du mail :</p>
              <p v-for="line in email.content" :key="line">{{ line }}</p>
            </div>

            <!-- Endpoint technique -->
            <p class="mt-2.5 text-xs text-stone-400 font-mono">
              {{ email.endpoint }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "admin", layout: "admin" });

useSeoMeta({ title: "Emails – Admin" });

function actionClass(action: string) {
  if (action.startsWith("POST")) return "border-green-200 text-green-700 bg-green-50";
  if (action.startsWith("PATCH")) return "border-amber-200 text-amber-700 bg-amber-50";
  if (action.startsWith("DELETE")) return "border-red-200 text-red-700 bg-red-50";
  return "border-stone-200 text-stone-500 bg-white";
}

const emailGroups = [
  {
    title: "Réservation — côté client",
    icon: "📅",
    emails: [
      {
        id: "request",
        subject: "Demande de réservation reçue – {riad}",
        to: ["Client"],
        trigger: "Le client clique sur « Confirmer ma réservation » en mode Payer plus tard.",
        action: "POST /api/reservations/notify/:id",
        endpoint: "server/api/reservations/notify/[id].post.ts",
        content: [
          "Objet : Demande de réservation reçue – {Riad}",
          "Corps : Confirmation que la demande a bien été reçue.",
          "Détails : riad, dates d'arrivée / départ, durée, voyageurs, total.",
          "Info : la gérante va les contacter pour convenir du règlement.",
          "Réf. courte de la réservation.",
        ],
      },
      {
        id: "confirmed_client",
        subject: "Réservation confirmée – {riad}",
        to: ["Client"],
        trigger: "Un admin clique sur « Confirmer » dans le tableau des réservations.",
        action: "PATCH /api/admin/reservations/:id",
        endpoint: "server/api/admin/reservations/[id].patch.ts",
        content: [
          "Objet : Réservation confirmée ✓ – {Riad}",
          "Corps : Le paiement a été reçu, la réservation est confirmée.",
          "Détails complets : riad, dates, durée, voyageurs, total.",
          "Invitation à contacter contact@darbarai.com pour toute question.",
        ],
      },
      {
        id: "cancelled_by_user",
        subject: "Annulation de votre réservation – {riad}",
        to: ["Client"],
        trigger: "Le client annule sa propre réservation depuis son espace « Mes réservations ».",
        action: "PATCH /api/reservations/:id",
        endpoint: "server/api/reservations/[id].patch.ts",
        content: [
          "Objet : Annulation de votre réservation – {Riad}",
          "Corps : La réservation a bien été annulée.",
          "Dates concernées rappelées (arrivée → départ).",
          "Invitation à contacter contact@darbarai.com pour toute question.",
          "Réf. courte de la réservation.",
        ],
      },
      {
        id: "cancelled_by_admin",
        subject: "Annulation de votre réservation – {riad}",
        to: ["Client"],
        trigger: "Un admin clique sur « Annuler » dans le tableau des réservations.",
        action: "PATCH /api/admin/reservations/:id",
        endpoint: "server/api/admin/reservations/[id].patch.ts",
        content: [
          "Objet : Annulation de votre réservation – {Riad}",
          "Corps : {Dar Baraï ou Dar Tanawi} a annulé votre réservation (dates).",
          "Excuses pour la gêne occasionnée.",
          "Invitation à contacter contact@darbarai.com.",
          "Réf. courte de la réservation.",
        ],
      },
    ],
  },
  {
    title: "Réservation — notifications admin",
    icon: "🔔",
    emails: [
      {
        id: "admin_new_later",
        subject: "Demande de réservation – {riad}",
        to: ["Admins"],
        trigger: "Le client clique sur « Confirmer ma réservation » en mode Payer plus tard.",
        action: "POST /api/reservations/notify/:id",
        endpoint: "server/api/reservations/notify/[id].post.ts",
        content: [
          "Objet : Demande de réservation – {Riad}",
          "Corps : Mode de paiement = à convenir.",
          "Tableau des détails : riad, dates, durée, voyageurs, total.",
          "Informations client : nom, 📧 email cliquable, 📞 téléphone cliquable.",
          "Bannière ambrée : rappel de contacter le client pour convenir du règlement.",
          "Réf. complète de la réservation.",
        ],
      },
      {
        id: "admin_cancelled",
        subject: "Annulation – {client} · {riad}",
        to: ["Admins"],
        trigger: "Le client annule sa propre réservation depuis son espace.",
        action: "PATCH /api/reservations/:id",
        endpoint: "server/api/reservations/[id].patch.ts",
        content: [
          "Objet : Annulation – {Nom client} · {Riad}",
          "Corps : Un client a annulé sa réservation.",
          "Tableau des détails : riad, dates, durée, voyageurs, total.",
          "Informations client : nom, 📧 email cliquable, 📞 téléphone cliquable.",
          "Réf. complète de la réservation.",
        ],
      },
    ],
  },
  {
    title: "Compte utilisateur",
    icon: "👤",
    emails: [
      {
        id: "confirm_signup",
        subject: "Confirmez votre adresse email – Dar Baraï",
        to: ["Client"],
        trigger: "L'utilisateur crée un compte (inscription).",
        action: "Supabase Auth",
        endpoint: "server/api/auth/send-confirmation.post.ts",
        content: [
          "Objet : Confirmez votre adresse email – Dar Baraï",
          "Corps : Bienvenue chez Dar Baraï.",
          "Bouton « Confirmer mon adresse » (lien Supabase tokenisé).",
          "Lien texte alternatif si le bouton ne fonctionne pas.",
        ],
      },
      {
        id: "reset_password",
        subject: "Réinitialisation de votre mot de passe – Dar Baraï",
        to: ["Client"],
        trigger: "L'utilisateur clique sur « Mot de passe oublié ? » sur la page de connexion.",
        action: "Supabase Auth",
        endpoint: "server/api/auth/reset-password.post.ts",
        content: [
          "Objet : Réinitialisation de votre mot de passe – Dar Baraï",
          "Corps : Vous avez demandé à réinitialiser votre mot de passe pour {email}.",
          "Bouton « Choisir un nouveau mot de passe » (lien expirant sous 1 heure).",
          "Lien texte alternatif.",
        ],
      },
    ],
  },
  {
    title: "Newsletter",
    icon: "📨",
    emails: [
      {
        id: "newsletter",
        subject: "Libre (saisi par l'admin) — FR | EN",
        to: ["Abonnés newsletter"],
        trigger: "Un admin rédige et envoie une newsletter depuis Admin → Newsletter.",
        action: "POST /api/newsletter/send",
        endpoint: "server/api/newsletter/send.post.ts",
        content: [
          "Objet : '{Sujet FR} | {Subject EN}' — la partie EN est omise si non renseignée.",
          "Expéditeur : nom personnalisable dans l'éditeur (champ « Nom de l'expéditeur »), adresse = RESEND_NEWSLETTER_EMAIL.",
          "Corps : section française, puis séparateur + label 'ENGLISH VERSION', puis section anglaise (si remplie).",
          "Footer : lien de désabonnement sécurisé (HMAC SHA-256 sur l'adresse email).",
          "Envoi par lots de 50 (limite plan gratuit Resend).",
        ],
      },
    ],
  },
];
</script>
