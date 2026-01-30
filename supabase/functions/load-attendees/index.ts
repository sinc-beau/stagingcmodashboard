import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  sourceEventId: string;
  sourceDatabase: string;
  eventType: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  company: string | null;
  title: string | null;
  phone: string | null;
  stage: string | null;
  approval_status: string | null;
  alternative_email?: string | null;
  alternative_number?: string | null;
  wishlist?: string | null;
  no_show_reason?: string | null;
}

function getAttendeeTableName(eventType: string): string {
  const tableMap: Record<string, string> = {
    'dinner': 'dinner_attendees',
    'veb': 'veb_attendees',
    'vrt': 'vrt_attendees',
    'activation': 'activation_attendees',
    'learn_go': 'learn_go_attendees'
  };
  return tableMap[eventType] || 'attendees';
}

function getAttendeeSelectFields(eventType: string): string {
  const baseFields = 'id, first_name, last_name, email, company, title, attendance_status, wishlist, no_show_reason, event_id';

  const typeFieldsMap: Record<string, string> = {
    'dinner': `${baseFields}, alternative_email, register_number, alternative_number`,
    'activation': `${baseFields}, alternative_email, register_number, alternative_number`,
    'veb': `${baseFields}, register_number, alternative_number`,
    'vrt': `${baseFields}, register_number, alternative_number`,
    'learn_go': 'id, first_name, last_name, email, company, title, attendance_status, no_show_reason, event_id'
  };

  return typeFieldsMap[eventType] || baseFields;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { sourceEventId, sourceDatabase, eventType }: RequestPayload = await req.json();

    if (!sourceEventId || !sourceDatabase || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: sourceEventId, sourceDatabase, eventType' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const isForum = sourceDatabase === 'forum_event';

    let attendeeClient;
    if (isForum) {
      attendeeClient = createClient(
        Deno.env.get('FORUM_ATTENDEE_URL')!,
        Deno.env.get('FORUM_ATTENDEE_ANON_KEY')!
      );
    } else {
      attendeeClient = createClient(
        Deno.env.get('NON_FORUM_ATTENDEE_URL')!,
        Deno.env.get('NON_FORUM_ATTENDEE_ANON_KEY')!
      );
    }

    let attendeeData: Attendee[] = [];

    if (isForum) {
      const { data, error } = await attendeeClient
        .from('attendees')
        .select('id, first_name, last_name, email, company, title, stage, cellphone, forum_id')
        .eq('forum_id', sourceEventId);

      if (error) {
        throw error;
      }

      attendeeData = (data || []).map((a: any) => ({
        id: a.id,
        name: `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        email: a.email,
        company: a.company,
        title: a.title,
        phone: a.cellphone,
        stage: a.stage,
        approval_status: null,
      }));
    } else {
      const tableName = getAttendeeTableName(eventType);
      const selectFields = getAttendeeSelectFields(eventType);

      const { data, error } = await attendeeClient
        .from(tableName)
        .select(selectFields)
        .eq('event_id', sourceEventId);

      if (error) {
        throw error;
      }

      attendeeData = (data || []).map((a: any) => ({
        id: a.id,
        name: `${a.first_name || ''} ${a.last_name || ''}`.trim(),
        email: a.email,
        company: a.company,
        title: a.title,
        phone: a.register_number || null,
        stage: null,
        approval_status: a.attendance_status,
        alternative_email: a.alternative_email || null,
        alternative_number: a.alternative_number || null,
        wishlist: a.wishlist || null,
        no_show_reason: a.no_show_reason || null,
      }));
    }

    return new Response(
      JSON.stringify({ attendees: attendeeData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error loading attendees:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to load attendees', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
