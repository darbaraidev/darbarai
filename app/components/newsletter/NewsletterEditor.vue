<template>
  <div class="space-y-6">
    <!-- Nom expéditeur -->
    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1">Nom de l'expéditeur</label>
      <input
        v-model="form.from_name"
        type="text"
        class="input-field"
        placeholder="Dar Baraï Marrakech"
      />
      <p class="text-xs text-stone-400 mt-1">Apparaît dans la boîte de réception à la place de l'adresse email.</p>
    </div>

    <!-- Champs sujet -->
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1"
          >Sujet (FR)</label
        >
        <input
          v-model="form.subject"
          type="text"
          class="input-field"
          placeholder="Nouveautés Dar Baraï – Été 2026"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1"
          >Subject (EN)</label
        >
        <input
          v-model="form.subject_en"
          type="text"
          class="input-field"
          placeholder="Dar Baraï News – Summer 2026"
        />
      </div>
    </div>

    <!-- Tabs FR / EN -->
    <div>
      <div class="flex gap-2 border-b border-stone-200 mb-4">
        <button
          v-for="lang in ['fr', 'en']"
          :key="lang"
          class="px-4 py-2 text-sm font-medium border-b-2 transition-colors uppercase"
          :class="
            activeLang === lang
              ? 'border-terracotta-600 text-terracotta-700'
              : 'border-transparent text-stone-400 hover:text-stone-600'
          "
          @click="activeLang = lang"
        >
          {{ lang }}
        </button>
      </div>

      <!-- Barre d'outils TipTap -->
      <div
        v-if="editor"
        class="flex flex-wrap gap-1 p-2 bg-stone-50 border border-stone-200 rounded-t-lg border-b-0"
      >
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-sm font-bold"
          :class="editor.isActive('bold') ? 'bg-stone-200' : ''"
          @click="editor.chain().focus().toggleBold().run()"
        >
          B
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-sm italic"
          :class="editor.isActive('italic') ? 'bg-stone-200' : ''"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          I
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-sm underline"
          :class="editor.isActive('underline') ? 'bg-stone-200' : ''"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          U
        </button>
        <div class="w-px bg-stone-300 mx-1" />
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          :class="
            editor.isActive('heading', { level: 2 }) ? 'bg-stone-200' : ''
          "
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          H2
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          :class="
            editor.isActive('heading', { level: 3 }) ? 'bg-stone-200' : ''
          "
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          H3
        </button>
        <div class="w-px bg-stone-300 mx-1" />
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          :class="editor.isActive('bulletList') ? 'bg-stone-200' : ''"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          • Liste
        </button>
        <div class="w-px bg-stone-300 mx-1" />
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          @click="setLink"
        >
          Lien
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          @click="editor.chain().focus().unsetLink().run()"
        >
          Suppr lien
        </button>
        <div class="w-px bg-stone-300 mx-1" />
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          @click="editor.chain().focus().setTextAlign('left').run()"
        >
          ←
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          @click="editor.chain().focus().setTextAlign('center').run()"
        >
          ↔
        </button>
        <button
          type="button"
          class="p-1.5 rounded hover:bg-stone-200 transition-colors text-xs"
          @click="editor.chain().focus().setTextAlign('right').run()"
        >
          →
        </button>
      </div>

      <!-- Éditeur -->
      <EditorContent
        :editor="editor"
        class="prose max-w-none min-h-[300px] border border-stone-200 rounded-b-lg p-4 focus-within:ring-2 focus-within:ring-terracotta-500 focus-within:border-transparent bg-white"
      />
    </div>

    <!-- Stats destinataires -->
    <div v-if="recipientsCount !== null" class="text-sm text-stone-500">
      {{ recipientsCount }} abonné(s) recevront cet email.
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        type="button"
        class="btn-secondary"
        :disabled="sending"
        @click="onPreview"
      >
        Prévisualiser
      </button>
      <button
        type="button"
        class="btn-primary"
        :disabled="sending || !form.subject"
        @click="onSend"
      >
        {{ sending ? t("common.loading") : "Envoyer la newsletter" }}
      </button>
    </div>

    <div v-if="sent" class="badge-success px-3 py-2 rounded-lg text-sm">
      Newsletter envoyée avec succès !
    </div>
    <div v-if="sendError" class="text-red-600 text-sm">{{ sendError }}</div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

const { t } = useI18n();
const supabase = useSupabaseClient();

const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
};

const activeLang = ref<"fr" | "en">("fr");
const form = reactive({
  from_name: "",
  subject: "",
  subject_en: "",
  content_fr: "",
  content_en: "",
});

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
  ],
  content: "",
  onUpdate: ({ editor }) => {
    if (activeLang.value === "fr") {
      form.content_fr = editor.getHTML();
    } else {
      form.content_en = editor.getHTML();
    }
  },
});

// Switcher de langue : sauvegarder l'ancien contenu, charger le nouveau
watch(activeLang, (lang) => {
  if (!editor.value) return;
  editor.value.commands.setContent(
    lang === "fr" ? form.content_fr : form.content_en,
  );
});

const setLink = () => {
  const url = window.prompt("URL du lien");
  if (!url) return;
  editor.value?.chain().focus().setLink({ href: url }).run();
};

// Nombre d'abonnés
const recipientsCount = ref<number | null>(null);
const { count } = await supabase
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("newsletter_subscribed", true);
recipientsCount.value = count;

const sending = ref(false);
const sent = ref(false);
const sendError = ref<string | null>(null);

const onPreview = () => {
  const combined =
    form.content_fr +
    (form.content_en
      ? `<hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0"/>
         <p style="font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 16px">English version</p>
         ${form.content_en}`
      : "");
  const w = window.open("", "_blank");
  if (w) w.document.write(combined);
};

const onSend = async () => {
  sending.value = true;
  sendError.value = null;
  try {
    const token = await getToken();
    await $fetch("/api/newsletter/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        from_name: form.from_name || undefined,
        subject: form.subject,
        subject_en: form.subject_en,
        content_html: form.content_fr,
        content_html_en: form.content_en,
      },
    });
    sent.value = true;
  } catch (e: any) {
    sendError.value = e?.data?.message ?? e?.message ?? "Erreur inconnue";
  } finally {
    sending.value = false;
  }
};

onUnmounted(() => editor.value?.destroy());
</script>
