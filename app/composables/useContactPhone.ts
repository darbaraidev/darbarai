export const useContactPhone = () => {
  const { data } = useFetch("/api/site-settings", { key: "site-settings" });

  const phone = computed(() => (data.value as any)?.contact_phone ?? "+33750996975");

  const whatsappLink = computed(() => {
    const digits = phone.value.replace(/[^0-9]/g, "");
    return `https://wa.me/${digits}`;
  });

  const telLink = computed(() => `tel:${phone.value.replace(/\s/g, "")}`);

  return { phone, whatsappLink, telLink };
};
