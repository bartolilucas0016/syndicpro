const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  const { type, destinataire, donnees } = req.body;

  if (!destinataire) {
    return res.status(400).json({ error: "Email manquant" });
  }

  try {
    let emailData;

    if (type === "relance") {
      emailData = {
        from: "SyndicPro <onboarding@resend.dev>",
        to: destinataire,
        subject: `Relance paiement — ${donnees.lot}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #c9a84c;">SyndicPro — Avis de relance</h2>
            <p>Bonjour <strong>${donnees.prenom} ${donnees.nom}</strong>,</p>
            <p>Un paiement de <strong>${donnees.montant} €</strong> est en attente pour le lot <strong>${donnees.lot}</strong>.</p>
            <p>Merci de régulariser votre situation dans les plus brefs délais.</p>
            <br/>
            <p>Cordialement,<br/>Le Syndic</p>
          </div>
        `,
      };
    }

    if (type === "recu") {
      emailData = {
        from: "SyndicPro <onboarding@resend.dev>",
        to: destinataire,
        subject: `Reçu de paiement — ${donnees.lot}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #2ecc71;">SyndicPro — Reçu de paiement</h2>
            <p>Bonjour <strong>${donnees.prenom} ${donnees.nom}</strong>,</p>
            <p>Nous confirmons la réception de votre paiement de <strong>${donnees.montant} €</strong> pour le lot <strong>${donnees.lot}</strong>.</p>
            <br/>
            <p>Cordialement,<br/>Le Syndic</p>
          </div>
        `,
      };
    }

    if (type === "convocation") {
      emailData = {
        from: "SyndicPro <onboarding@resend.dev>",
        to: destinataire,
        subject: `Convocation — ${donnees.titreAG}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2 style="color: #c9a84c;">SyndicPro — Convocation AG</h2>
            <p>Bonjour <strong>${donnees.prenom} ${donnees.nom}</strong>,</p>
            <p>Vous êtes convoqué(e) à l'assemblée générale <strong>${donnees.titreAG}</strong>.</p>
            <ul>
              <li><strong>Date :</strong> ${donnees.dateAG}</li>
              <li><strong>Lieu :</strong> ${donnees.lieu}</li>
            </ul>
            <br/>
            <p>Cordialement,<br/>Le Syndic</p>
          </div>
        `,
      };
    }

    const data = await resend.emails.send(emailData);
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
