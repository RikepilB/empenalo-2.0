export type AuthRole = "client" | "business";

export type Profile = {
  id: string;
  role: AuthRole;
  full_name: string | null;
  phone: string | null;
  document_number: string | null;
  created_at: string;
};

export type CurrentUser = {
  user: {
    id: string;
    email: string | null;
    email_confirmed_at: string | null;
  };
  profile: Profile;
};

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type BusinessContext = {
  business: {
    id: string;
    name: string;
    district: string | null;
    verified_at: string | null;
  };
  subscription: {
    id: string;
    status: SubscriptionStatus;
    plan: {
      id: string;
      name: string;
      price_pen: number;
      monthly_propuestas: number | null;
    };
    propuestas_used_this_period: number;
    propuestas_remaining: number | null;
    current_period_end: string | null;
  } | null;
};

export type BusinessProfile = {
  id: string;
  name: string;
  trade_name: string | null;
  ruc: string | null;
  phone: string | null;
  district: string | null;
  address: string | null;
  city: string | null;
  email: string | null;
  verification_status: "pending" | "verified" | "rejected";
};
