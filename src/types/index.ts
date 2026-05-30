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
