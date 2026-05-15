# Emails automatiques – Dar Baraï

## Provider : Resend

Le projet utilise [Resend](https://resend.com) comme service d'envoi d'emails transactionnels.

**Variables d'environnement**
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=reservations@darbarai.com   # adresse expéditeur (emails transactionnels)
RESEND_FROM_NAME="Dar Barai"                  # nom expéditeur (ASCII obligatoire)
RESEND_NEWSLETTER_EMAIL=newsletter@darbarai.com  # expéditeur newsletter (optionnel, fallback sur RESEND_FROM_EMAIL)
```

**Templates partagés :** `app/server/utils/emailTemplates.ts`

**Commun à tous les emails :**
- Footer avec adresse de contact `contact@darbarai.com`
- Mention « Cet email est envoyé automatiquement, merci de ne pas y répondre directement. »

---

## Emails transactionnels (Resend)

### 1. Demande de réservation reçue — client
**Fichier :** `app/server/api/reservations/notify/[id].post.ts`  
**Déclencheur :** Client clique sur « Confirmer ma réservation » (mode Payer plus tard)  
**Destinataire :** Client  
**Template :** `templates.reservationRequest`  
**Contenu :** Confirmation de réception, détails complets (riad, dates, durée, voyageurs, total), info que la gérante va les contacter pour le règlement.

---

### 2. Nouvelle demande — notification admin
**Fichier :** `app/server/api/reservations/notify/[id].post.ts`  
**Déclencheur :** Idem (mode Payer plus tard)  
**Destinataires :** Tous les profils `role = 'admin'` (avec fallback `auth.admin.getUserById` si `profiles.email` est null)  
**Template :** `templates.adminNewReservation(d, "later")`  
**Contenu :** Détails complets, informations client (nom, 📧 email, 📞 téléphone), bannière ambrée rappelant de contacter le client pour convenir du règlement.

---

### 3. Réservation confirmée — client
**Fichier :** `app/server/api/admin/reservations/[id].patch.ts`  
**Déclencheur :** Admin clique sur « Confirmer » dans le tableau des réservations  
**Destinataire :** Client  
**Template :** `templates.reservationConfirmed`  
**Contenu :** Confirmation, détails complets, invitation à contacter `contact@darbarai.com`.

---

### 4. Annulation par le client — confirmation client
**Fichier :** `app/server/api/reservations/[id].patch.ts`  
**Déclencheur :** Client annule depuis son espace « Mes réservations »  
**Destinataire :** Client  
**Template :** `templates.reservationCancelled`  
**Contenu :** Confirmation d'annulation, dates concernées, lien `contact@darbarai.com`.

---

### 5. Annulation par le client — notification admin
**Fichier :** `app/server/api/reservations/[id].patch.ts`  
**Déclencheur :** Idem  
**Destinataires :** Tous les admins  
**Template :** `templates.adminReservationCancelled`  
**Contenu :** Détails de la réservation annulée, informations client (nom, 📧 email, 📞 téléphone).

---

### 6. Annulation par l'admin — notification client
**Fichier :** `app/server/api/admin/reservations/[id].patch.ts`  
**Déclencheur :** Admin clique sur « Annuler » dans le tableau des réservations  
**Destinataire :** Client  
**Template :** `templates.reservationCancelledByAdmin`  
**Contenu :** « {Dar Baraï ou Dar Tanawi} a annulé votre réservation », excuses, lien `contact@darbarai.com`.

---

### 7. Newsletter
**Fichier :** `app/server/api/newsletter/send.post.ts`  
**Déclencheur :** Manuel — admin depuis `/admin/newsletter`  
**Destinataires :** Tous les profils `newsletter_subscribed = true`  
**Template :** `templates.newsletter(contentFr, unsubUrl, contentEn?)`  
**Contenu :**
- Objet : `{Sujet FR} | {Subject EN}` (la partie EN omise si non renseignée)
- Expéditeur : nom personnalisable dans l'éditeur (champ « Nom de l'expéditeur »)
- Corps : section FR, puis séparateur + label « ENGLISH VERSION » + section EN (si remplie)
- Footer : lien de désabonnement sécurisé (HMAC SHA-256)
- Envoi par lots de 50 (limite plan gratuit Resend)

---

## Emails gérés par Supabase Auth

Ces emails sont envoyés par Supabase, **pas par Resend** — à configurer dans le dashboard Supabase → *Authentication → Email Templates*.

| Email | Déclencheur |
|-------|-------------|
| Confirmation de compte | Inscription |
| Réinitialisation de mot de passe | « Mot de passe oublié » |

> Les templates Supabase utilisent le même design que les emails Resend (envoyés via le hook `send-confirmation.post.ts` et `reset-password.post.ts`).

---

## Architecture technique

```
Action utilisateur / admin
        ↓
app/server/api/...  (auth Bearer token + vérification role)
        ↓
serverSupabaseServiceRole(event)  ← bypass RLS pour lire profils/admins
        ↓
sendEmail() / sendToAdmins()  ← app/server/utils/emailTemplates.ts
        ↓
Resend SDK → resend.emails.send({ from, to, subject, html })
```

**Fallback email null :** si `profiles.email` est null (trigger Supabase non exécuté), les endpoints utilisent `auth.admin.getUserById(userId)` pour récupérer l'adresse depuis l'auth.

---

## Emails à implémenter (prochaines étapes)

| Email | Déclencheur | Priorité |
|-------|-------------|----------|
| Rappel avant arrivée | Cron J-3 ou J-7 | 🟢 Basse |
