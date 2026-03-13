import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, copro_id, prenom, nom, role = "coproprietaire" } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: process.env.APP_URL || "https://syndicpro.vercel.app/",
    data: { role, copro_id: copro_id || null },
  });
  if (error) return res.status(400).json({ error: error.message });

  await supabaseAdmin.from("profiles").update({
    role,
    ...(copro_id ? { copro_id } : {}),
    ...(prenom ? { prenom } : {}),
    ...(nom ? { nom } : {}),
  }).eq("id", data.user.id);

  return res.status(200).json({ ok: true });
}
