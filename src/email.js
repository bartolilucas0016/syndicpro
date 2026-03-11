import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Envoyer une relance pour impayé
export async function envoyerRelance({ nom, prenom, email, montant, lot }) {
  const { data, error } = await resend.emails.send({
    from: "SyndicPro <onboarding@resend.dev>",
    to: email,
    subject: `Relance paiement — ${lot}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9a84c;">SyndicPro — Avis de relance</h2>
        <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p>Nous vous informons qu'un paiement de <strong>${montant} €</strong> est en attente pour votre lot <strong>${lot}</strong>.</p>
        <p>Merci de régulariser votre situation dans les plus brefs délais.</p>
        <br/>
        <p>Cordialement,<br/>Le Syndic</p>
      </div>
    `,
  });
  if (error) throw error;
  return data;
}

// Envoyer une convocation AG
export async function envoyerConvocation({ nom, prenom, email, titreAG, dateAG, lieu }) {
  const { data, error } = await resend.emails.send({
    from: "SyndicPro <onboarding@resend.dev>",
    to: email,
    subject: `Convocation — ${titreAG}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c9a84c;">SyndicPro — Convocation</h2>
        <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p>Vous êtes convoqué(e) à l'assemblée générale :</p>
        <ul>
          <li><strong>Objet :</strong> ${titreAG}</li>
          <li><strong>Date :</strong> ${new Date(dateAG).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</li>
          <li><strong>Lieu :</strong> ${lieu}</li>
        </ul>
        <p>Votre présence est importante.</p>
        <br/>
        <p>Cordialement,<br/>Le Syndic</p>
      </div>
    `,
  });
  if (error) throw error;
  return data;
}

// Envoyer un reçu de paiement
export async function envoyerRecu({ nom, prenom, email, montant, lot, date }) {
  const { data, error } = await resend.emails.send({
    from: "SyndicPro <onboarding@resend.dev>",
    to: email,
    subject: `Reçu de paiement — ${lot}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2ecc71;">SyndicPro — Reçu de paiement</h2>
        <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p>Nous confirmons la réception de votre paiement :</p>
        <ul>
          <li><strong>Montant :</strong> ${montant} €</li>
          <li><strong>Lot :</strong> ${lot}</li>
          <li><strong>Date :</strong> ${date}</li>
        </ul>
        <p>Merci pour votre règlement.</p>
        <br/>
        <p>Cordialement,<br/>Le Syndic</p>
      </div>
    `,
  });
  if (error) throw error;
  return data;
}