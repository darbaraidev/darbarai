// ============================================================
// Types globaux – Dar Baraï / Dar Tanawi
// ============================================================

// --- Riad -------------------------------------------------------
export interface Riad {
  id: string;
  slug: "dar-barai" | "dar-tanawi";
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  cover_image: string;
  images: string[];
  max_guests: number;
  base_price_per_night: number; // EUR centimes (Stripe)
  ical_airbnb_url: string | null;
  ical_booking_url: string | null;
  created_at: string;
}

// --- Availability -----------------------------------------------
export interface AvailabilityBlock {
  id: string;
  riad_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  source: "admin" | "airbnb" | "booking" | "reservation";
  label: string | null;
}

// --- Reservation ------------------------------------------------
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "refunded";

export interface Reservation {
  id: string;
  riad_id: string;
  riad?: Pick<Riad, "name" | "slug" | "cover_image">;
  user_id: string;
  profile?: Profile;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  guests: number;
  total_price: number; // EUR centimes
  status: ReservationStatus;
  stripe_payment_intent_id: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

// --- Profile (Supabase Auth) ------------------------------------
export type UserRole = "client" | "admin";

export interface Profile {
  id: string; // = auth.users.id
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  newsletter_subscribed: boolean;
  created_at: string;
}

// --- Newsletter -------------------------------------------------
export interface NewsletterSent {
  id: string;
  subject: string;
  subject_en: string | null;
  content_html: string;
  content_html_en: string | null;
  sent_at: string;
  recipients_count: number;
  sent_by: string;
}

// --- Booking form -----------------------------------------------
export interface BookingFormData {
  riadId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  specialRequests: string;
}

// --- API responses ----------------------------------------------
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

// --- Stripe Checkout -------------------------------------------
export interface CheckoutSession {
  sessionId: string;
  url: string;
}
