import {
  differenceInCalendarDays,
  eachDayOfInterval,
  parseISO,
  format,
} from "date-fns";
import type { AvailabilityBlock, BookingFormData, Reservation } from "~/types";

export const useBooking = () => {
  const supabase = useSupabaseClient();

  // Dates bloquées pour un riad
  const fetchBlockedDates = async (riadId: string): Promise<string[]> => {
    const { data } = await supabase
      .from("availability")
      .select("start_date, end_date")
      .eq("riad_id", riadId);

    if (!data) return [];

    const blocked: string[] = [];
    for (const block of data as AvailabilityBlock[]) {
      const days = eachDayOfInterval({
        start: parseISO(block.start_date),
        end: parseISO(block.end_date),
      });
      blocked.push(...days.map((d) => format(d, "yyyy-MM-dd")));
    }
    return blocked;
  };

  // Vérifier la disponibilité pour un créneau
  const checkAvailability = async (
    riadId: string,
    checkIn: string,
    checkOut: string,
  ): Promise<boolean> => {
    const blocked = await fetchBlockedDates(riadId);
    const requestedDays = eachDayOfInterval({
      start: parseISO(checkIn),
      end: parseISO(checkOut),
    }).map((d) => format(d, "yyyy-MM-dd"));

    // On ne vérifie pas le dernier jour (checkout)
    requestedDays.pop();
    return !requestedDays.some((day) => blocked.includes(day));
  };

  // Calculer le nombre de nuits
  const calcNights = (checkIn: string, checkOut: string): number =>
    differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));

  // Calculer le prix total (centimes)
  const calcTotal = (nights: number, pricePerNight: number): number =>
    nights * pricePerNight;

  // Créer la réservation + session Stripe
  const createBooking = async (
    form: BookingFormData,
    riadPricePerNight: number,
  ) => {
    const nights = calcNights(form.checkIn, form.checkOut);
    const total = calcTotal(nights, riadPricePerNight);

    const { data, error } = await useFetch("/api/reservations/create", {
      method: "POST",
      body: { ...form, totalPrice: total, nights },
    });
    return { data, error };
  };

  // Réservations de l'utilisateur connecté
  const fetchMyReservations = async (): Promise<Reservation[]> => {
    const { data } = await supabase
      .from("reservations")
      .select("*, riad:riads(name, slug, cover_image)")
      .order("created_at", { ascending: false });
    return data ?? [];
  };

  return {
    fetchBlockedDates,
    checkAvailability,
    calcNights,
    calcTotal,
    createBooking,
    fetchMyReservations,
  };
};
