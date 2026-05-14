# Dar Baraï & Dar Tanawi — Site de réservation

Site de réservation pour deux riads à Marrakech. Stack : **Nuxt 4 · Supabase · Stripe · Resend · Tailwind CSS · i18n FR/EN**.

---

## Installation

```bash
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run dev
```

---

## Variables d'environnement (`.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_KEY` | Clé publique (anon) Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (côté serveur uniquement) |
| `STRIPE_PUBLIC_KEY` | Clé publique Stripe (`pk_...`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe (`whsec_...`) |
| `RESEND_API_KEY` | Clé API Resend (`re_...`) |
| `RESEND_FROM_EMAIL` | Adresse expéditeur des emails |
| `RESEND_FROM_NAME` | Nom expéditeur des emails |
| `NUXT_PUBLIC_SITE_URL` | URL publique du site (ex: `https://www.darbarai.com`) |
| `NUXT_PUBLIC_CONTACT_WHATSAPP` | Numéro WhatsApp sans `+` (ex: `33612345678`) |
| `NUXT_PUBLIC_CONTACT_EMAIL` | Email de contact affiché aux clients |

Sans `STRIPE_SECRET_KEY`, l'app tourne en **mode dev** : les réservations sont créées directement en `confirmed` sans passer par Stripe.

---

## Services externes

### Supabase

- Authentification email/password + Google OAuth
- Base de données (riads, réservations, profils, services)
- Storage (images riads)

**Trigger à configurer** (`SQL Editor`) :

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Resend (emails transactionnels)

Resend est utilisé pour deux types d'emails :
1. **Emails d'auth** (confirmation inscription, reset password) — via SMTP Supabase
2. **Email de confirmation de réservation** — envoyé par le webhook Stripe

**Configuration SMTP dans Supabase Dashboard → Authentication → Settings → SMTP Provider :**

```
Enable Custom SMTP:  ✓
Sender name:         Dar Baraï
Sender email:        reservations@darbarai.com
Host:                smtp.resend.com
Port:                465
Username:            resend
Password:            re_xxxxxxxxx   ← clé API Resend
```

Plan gratuit : 3 000 emails/mois (largement suffisant).

Pour que les emails arrivent depuis `@darbarai.com` (et non en spam), vérifier le domaine dans **Resend → Domains**. Obligatoire en production, optionnel en développement.

### Stripe

- Paiement par carte via **Stripe Elements** (formulaire embarqué)
- PaymentIntent créé côté serveur à la création de la réservation
- Webhook `payment_intent.succeeded` → passe la réservation en `confirmed` + envoie l'email de confirmation

**Webhook en local** (Stripe CLI) :

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copier le whsec_... affiché dans STRIPE_WEBHOOK_SECRET
```

Carte de test : `4242 4242 4242 4242` · date future · CVV quelconque.

**Webhook en production** : Stripe Dashboard → Developers → Webhooks → Add endpoint  
URL : `https://www.darbarai.com/api/stripe/webhook`  
Events : `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Architecture

```
app/
  pages/
    index.vue              # Page d'accueil
    riads/[riadSlug].vue   # Fiche riad
    booking/index.vue      # Récap + paiement
    account/               # Espace client
    admin/                 # Back-office
    auth/                  # Login, register, callback, reset
  components/
    booking/
      BookingWidget.vue          # Widget de réservation (dates, voyageurs)
      CalendarPicker.client.vue  # Sélecteur de dates flatpickr
    admin/
      AdminCalendar.client.vue   # Calendrier admin des réservations
  server/api/
    reservations/create.post.ts  # Crée réservation + PaymentIntent
    stripe/webhook.post.ts       # Webhook Stripe → confirme réservation
    ical/sync.post.ts            # Sync Airbnb/Booking.com
  composables/
    useAuth.ts    # Auth Supabase (signIn, signUp, signOut, resetPassword)
    useRiad.ts    # Fetch riads, formatPrice
    useBooking.ts # Dates bloquées
i18n/locales/
  fr.json   # Traductions françaises
  en.json   # Traductions anglaises
```

---

## Modes de paiement

Sur la page de récap, l'utilisateur choisit entre :

- **Carte bancaire** — paiement Stripe immédiat, réservation confirmée automatiquement via webhook
- **Payer plus tard** — réservation en `pending`, la gérante contacte le client par WhatsApp/email pour convenir du règlement

---

## Déploiement

- **Hébergeur** : Vercel — déploiement automatique à chaque `git push` sur `main`
- **Domaine** : `darbarai.com` (OVH)
- **Repo** : GitHub — compte `darbaraidev`

### Checklist post-déploiement

- [ ] Connecter `darbarai.com` dans Vercel → Settings → Domains
- [ ] Ajouter les entrées DNS chez OVH (A + CNAME fournis par Vercel)
- [ ] Mettre à jour l'URL de callback Google OAuth dans Supabase → Authentication → URL Configuration
- [ ] Vérifier le domaine `darbarai.com` dans Resend → Domains (ajouter enregistrements DNS)
- [ ] Configurer le SMTP Supabase avec Resend (voir section Resend ci-dessus)
- [ ] Configurer le webhook Stripe avec l'URL de prod : `https://darbarai.com/api/stripe/webhook`
- [ ] Renseigner `STRIPE_*` dans les variables d'environnement Vercel

---

## Informations légales

**DAR BARAÏ** — SARL AU (droit marocain)
- RC : 154065 — Tribunal de commerce de Marrakech
- ICE : 003577950000075
- Capital : 10 000 DHS
- Adresse : Place la Liberté, Angle Av. My Hassan et Av. Mohamed V, Rés. Berdaï, Imm. B, Appt. 2, Marrakech, Maroc
- Responsable de publication : Nathalie Couderc
- Contact : contact@darbarai.com
