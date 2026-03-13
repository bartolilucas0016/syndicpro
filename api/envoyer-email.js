import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function esc(str) {
  if (str == null) return "—";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function validate(donnees, fields) {
  const missing = fields.filter(f => donnees?.[f] == null || donnees[f] === "");
  if (missing.length > 0) throw new Error(`Champs manquants : ${missing.join(", ")}`);
}

function baseHtml(accentColor, title, body) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;max-width:600px;width:100%;">
      <tr><td style="background:#0f1b2d;padding:24px 32px;border-radius:8px 8px 0 0;">
        <div style="font-family:Georgia,serif;font-size:22px;color:${accentColor};">SyndicPro</div>
        <div style="font-size:13px;color:#8a9ab5;margin-top:4px;">${esc(title)}</div>
      </td></tr>
      <tr><td style="padding:32px;color:#333333;font-size:14px;line-height:1.7;">
        ${body}
        <br><br>
        <p style="margin:0;color:#666;font-size:13px;">Cordialement,<br><strong>Le Syndic</strong></p>
      </td></tr>
      <tr><td style="padding:16px 32px;font-size:11px;color:#999;border-top:1px solid #eee;">
        Cet email a été envoyé automatiquement par SyndicPro.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

const templates = {
  relance(d) {
    validate(d, ["prenom", "nom", "lot", "montant"]);
    return {
      subject: `Relance paiement — Lot ${d.lot}`,
      html: baseHtml("#c9a84c", "Avis de relance", `
        <p>Bonjour <strong>${esc(d.prenom)} ${esc(d.nom)}</strong>,</p>
        <p>Un paiement de <strong style="color:#e74c3c;">${esc(d.montant)} €</strong> est en attente pour le lot <strong>${esc(d.lot)}</strong>.</p>
        <p>Merci de régulariser votre situation dans les plus brefs délais.</p>
      `),
      text: `Bonjour ${d.prenom} ${d.nom},\n\nUn paiement de ${d.montant} € est en attente pour le lot ${d.lot}.\nMerci de régulariser.\n\nCordialement,\nLe Syndic`,
    };
  },

  recu(d) {
    validate(d, ["prenom", "nom", "lot", "montant"]);
    return {
      subject: `Reçu de paiement — Lot ${d.lot}`,
      html: baseHtml("#2ecc71", "Reçu de paiement", `
        <p>Bonjour <strong>${esc(d.prenom)} ${esc(d.nom)}</strong>,</p>
        <p>Nous confirmons la réception de votre paiement de <strong style="color:#2ecc71;">${esc(d.montant)} €</strong> pour le lot <strong>${esc(d.lot)}</strong>${d.date ? ` le ${esc(d.date)}` : ""}.</p>
        <p>Merci pour votre règlement.</p>
      `),
      text: `Bonjour ${d.prenom} ${d.nom},\n\nPaiement de ${d.montant} € confirmé pour le lot ${d.lot}.\n\nCordialement,\nLe Syndic`,
    };
  },

  convocation(d) {
    validate(d, ["prenom", "nom", "titreAG", "dateAG"]);
    return {
      subject: `Convocation AG — ${d.titreAG}`,
      html: baseHtml("#c9a84c", "Convocation Assemblée Générale", `
        <p>Bonjour <strong>${esc(d.prenom)} ${esc(d.nom)}</strong>,</p>
        <p>Vous êtes convoqué(e) à l'assemblée générale <strong>${esc(d.titreAG)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#888;width:40%;">Date</td><td style="padding:8px 0;">${esc(d.dateAG)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Lieu</td><td style="padding:8px 0;">${esc(d.lieu)}</td></tr>
        </table>
      `),
      text: `Bonjour ${d.prenom} ${d.nom},\n\nConvocation AG : ${d.titreAG}\nDate : ${d.dateAG}\nLieu : ${d.lieu || "—"}\n\nCordialement,\nLe Syndic`,
    };
  },

  appel_de_fonds(d) {
    validate(d, ["prenom", "nom", "lot", "titreCharge", "quotePart"]);
    const attachments = d.pdfBase64
      ? [{ filename: d.pdfNom || "appel_de_fonds.pdf", content: Buffer.from(d.pdfBase64, "base64") }]
      : [];
    return {
      subject: `Appel de fonds — ${d.titreCharge}`,
      html: baseHtml("#c9a84c", "Appel de fonds", `
        <p>Bonjour <strong>${esc(d.prenom)} ${esc(d.nom)}</strong>,</p>
        <p>Appel de fonds pour le lot <strong>${esc(d.lot)}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#888;width:40%;">Objet</td><td style="padding:8px 0;font-weight:600;">${esc(d.titreCharge)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Résidence</td><td style="padding:8px 0;">${esc(d.residence)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Échéance</td><td style="padding:8px 0;">${esc(d.echeance)}</td></tr>
          <tr><td style="padding:8px 0;color:#888;">Quote-part</td><td style="padding:8px 0;font-weight:700;font-size:18px;color:#c9a84c;">${esc(d.quotePart)} €</td></tr>
        </table>
        <p>Merci de régler avant la date d'échéance.</p>
      `),
      text: `Bonjour ${d.prenom} ${d.nom},\n\nAppel de fonds : ${d.titreCharge}\nQuote-part : ${d.quotePart} €\nÉchéance : ${d.echeance || "—"}\n\nCordialement,\nLe Syndic`,
      attachments,
    };
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  const { type, destinataire, donnees } = req.body || {};

  console.log("[envoyer-email] type:", type, "| to:", destinataire, "| donnees:", JSON.stringify(donnees));

  if (!type) return res.status(400).json({ error: "Type manquant" });
  if (!destinataire) return res.status(400).json({ error: "Destinataire manquant" });
  if (!templates[type]) return res.status(400).json({ error: `Type inconnu : ${type}` });

  let emailContent;
  try {
    emailContent = templates[type](donnees || {});
  } catch (err) {
    console.error("[envoyer-email] Validation error:", err.message);
    return res.status(400).json({ error: err.message });
  }

  console.log("[envoyer-email] Sending from:", FROM);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: destinataire,
    ...emailContent,
  });

  if (error) {
    console.error("[envoyer-email] Resend error:", JSON.stringify(error));
    return res.status(500).json({ error: error.message || "Erreur Resend", details: error });
  }

  console.log("[envoyer-email] Sent OK, id:", data?.id);
  return res.status(200).json({ success: true, id: data?.id });
}
