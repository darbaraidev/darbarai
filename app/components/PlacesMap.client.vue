<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>

<script setup lang="ts">
import type { Place } from "~/types";
import { getCategoryMeta, getGroupColor } from "~/utils/mapCategories";

const props = defineProps<{
  places: Place[];
  selectedId: string | null;
}>();

const emit = defineEmits<{ select: [place: Place]; mapClick: [] }>();

const mapContainer = ref<HTMLElement | null>(null);

type LeafletType = typeof import("leaflet").default;
type LeafletMap = import("leaflet").Map;
type LeafletMarker = import("leaflet").Marker;

let L: LeafletType | null = null;
let map: LeafletMap | null = null;
const markerMap = new Map<string, LeafletMarker>();

const makeIcon = (place: Place, selected = false) => {
  if (!L) return null;
  const cat = place.categories[0];
  const emoji = getCategoryMeta(cat)?.groupIcon ?? "📍";
  const color = cat ? getGroupColor(cat) : "#6b7280";
  const size = selected ? 38 : 30;

  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:${selected ? "3px" : "2px"} solid white;box-shadow:0 ${selected ? 3 : 2}px ${selected ? 12 : 8}px rgba(0,0,0,${selected ? 0.55 : 0.35});display:flex;align-items:center;justify-content:center;font-size:${selected ? 18 : 14}px;line-height:1;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const rebuildMarkers = () => {
  if (!L || !map) return;
  markerMap.forEach((m) => m.remove());
  markerMap.clear();
  for (const place of props.places) {
    const icon = makeIcon(place, place.id === props.selectedId);
    if (!icon) continue;
    const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
    marker.on("click", () => emit("select", place));
    markerMap.set(place.id, marker);
  }
};

const updateSelected = (id: string | null) => {
  if (!L) return;
  for (const [pid, marker] of markerMap.entries()) {
    const place = props.places.find((p) => p.id === pid);
    if (!place) continue;
    const icon = makeIcon(place, pid === id);
    if (icon) marker.setIcon(icon);
  }
  if (id && map) {
    const place = props.places.find((p) => p.id === id);
    if (place) map.panTo([place.lat, place.lng]);
  }
};

watch(() => props.places, rebuildMarkers, { deep: true });
watch(() => props.selectedId, updateSelected);

onMounted(async () => {
  await nextTick();
  if (!mapContainer.value) {
    console.warn("[PlacesMap] container still null after nextTick");
    return;
  }
  L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  map = L.map(mapContainer.value).setView([31.6258, -7.9892], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
  map.on("click", () => emit("mapClick"));
  rebuildMarkers();
});

onUnmounted(() => {
  map?.remove();
  map = null;
  markerMap.clear();
});
</script>
