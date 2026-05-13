import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

Deno.serve(async (req) => {
  const payload = await req.json();
  const alert = payload.record;

  const { data: sensor, error: sensorError } = await supabase
    .from("sensor")
    .select("id, name, location_id, location(name)")
    .eq("id", alert.sensor_id)
    .single();

  if (sensorError || !sensor?.location_id) {
    return new Response("Sensor not found", { status: 400 });
  }

  const { data: members, error: membersError } = await supabase
    .from("user_location")
    .select("user_id")
    .eq("location_id", sensor.location_id);

  if (membersError) {
    return new Response("Could not fetch users", { status: 500 });
  }

  const emails: string[] = [];

  for (const member of members ?? []) {
    const { data, error } = await supabase.auth.admin.getUserById(member.user_id);

    if (!error && data.user?.email) {
      emails.push(data.user.email);
    }
  }

  if (emails.length === 0) {
    return new Response("No emails found", { status: 200 });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "SmartHome <onboarding@resend.dev>",
      to: emails,
      subject: "Temperaturalarm",
      html: `
        <h2>Temperaturalarm</h2>
        <p><strong>Lokation:</strong> ${sensor.location?.name ?? "Ukendt lokation"}</p>
        <p><strong>Sensor:</strong> ${sensor.name}</p>
        <p><strong>Besked:</strong> ${alert.message}</p>
        <p><strong>Målt temperatur:</strong> ${alert.value}°C</p>
        <p><strong>Grænseværdi:</strong> ${alert.threshold}°C</p>
      `,
    }),
  });

  if (!resendResponse.ok) {
    return new Response(await resendResponse.text(), { status: 500 });
  }

  await supabase
    .from("alerts")
    .update({ email_sent: true })
    .eq("id", alert.id);

  return new Response("Email sent", { status: 200 });
});