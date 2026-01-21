import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const forumAttendeeClient = createClient(
  import.meta.env.VITE_FORUM_ATTENDEE_URL,
  import.meta.env.VITE_FORUM_ATTENDEE_ANON_KEY
);

export const forumEventClient = createClient(
  import.meta.env.VITE_FORUM_EVENT_URL,
  import.meta.env.VITE_FORUM_EVENT_ANON_KEY
);

export const nonForumAttendeeClient = createClient(
  import.meta.env.VITE_NON_FORUM_ATTENDEE_URL,
  import.meta.env.VITE_NON_FORUM_ATTENDEE_ANON_KEY
);

export const nonForumEventClient = createClient(
  import.meta.env.VITE_NON_FORUM_EVENT_URL,
  import.meta.env.VITE_NON_FORUM_EVENT_ANON_KEY
);

export type Sponsor = {
  id: string;
  name: string;
  url: string | null;
  domain: string | null;
  business_description: string | null;
  about: string | null;
  logo_url: string | null;
  poc_name: string | null;
  poc_email: string | null;
  poc_phone: string | null;
  sinc_rep: string | null;
  created_at: string;
  updated_at: string;
};

export type ForumSponsor = {
  id: string;
  forum_id: string;
  name: string;
  level: string;
  company_url: string | null;
  poc_name: string;
  poc_email: string;
  poc_phone: string;
  about: string;
  logo_url: string | null;
  sinc_rep: string | null;
  created_at: string;
  updated_at: string;
};

export type Forum = {
  id: string;
  name: string;
  brand: string | null;
  date: string;
  city: string | null;
  venue: string | null;
  created_at: string;
  updated_at: string;
};

export type NonForumEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  venue: string;
  type: string;
  brand: string;
  created_at: string;
  updated_at: string;
};
