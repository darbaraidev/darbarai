// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  // Dossier source = app/
  srcDir: "app/",

  modules: [
    "@nuxtjs/supabase",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
  ],

  app: {
    head: {
      link: [{ rel: "icon", type: "image/png", href: "/images/logo_app.jpg" }],
    },
  },

  // Supabase
  supabase: {
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/callback",
      exclude: ["/**"],
    },
  },

  // i18n – FR + EN
  // @nuxtjs/i18n v10 résout langDir depuis {rootDir}/i18n/ par défaut
  i18n: {
    locales: [
      { code: "fr", language: "fr-FR", name: "Français", file: "fr.json" },
      { code: "en", language: "en-US", name: "English", file: "en.json" },
    ],
    defaultLocale: "fr",
    langDir: "../i18n/locales/",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
      fallbackLocale: "fr",
    },
  },

  // Variables d'environnement runtime
  runtimeConfig: {
    // Côté serveur uniquement
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    resendApiKey: process.env.RESEND_API_KEY,
    supabaseHookSecret: process.env.SUPABASE_HOOK_SECRET,
    // Côté client
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      contactWhatsapp: process.env.NUXT_PUBLIC_CONTACT_WHATSAPP ?? "",
      contactEmail:
        process.env.NUXT_PUBLIC_CONTACT_EMAIL ?? "contact@darbarai.com",
    },
  },

  // CSS global
  css: ["flatpickr/dist/flatpickr.css"],

  // Tailwind CSS
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
    configPath: "tailwind.config.ts",
  },

  // Images
  image: {
    domains: ["your-supabase-project.supabase.co"],
  },

  // Dossier server dans app/ (par défaut Nuxt 4 le cherche à la racine)
  serverDir: "./app/server",

  nitro: {
    routeRules: {
      // Page privée avec Leaflet : désactive le SSR pour éviter le mismatch d'hydratation
      "/carte": { ssr: false },
      "/en/carte": { ssr: false },
    },
  },
});
