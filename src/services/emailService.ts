import { Resend } from 'resend';
import { env } from '../utils/env';
import { AppError } from '../utils/AppError';

const resend = new Resend(env.RESEND_API_KEY);

// Empêche qu'un prénom du type "<script>" soit interprété comme du HTML dans l'e-mail.
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Mise en page commune à tous les e-mails.
function layout(title: string, content: string, buttonLabel: string, buttonUrl: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#1f2937">
    <h2 style="color:#111827">${title}</h2>
    ${content}
    <p style="margin:32px 0">
      <a href="${buttonUrl}"
         style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">
        ${buttonLabel}
      </a>
    </p>
    <p style="font-size:12px;color:#6b7280">
      Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br>${buttonUrl}
    </p>
  </div>`;
}

async function send(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
  if (error) {
    console.error('Erreur Resend :', error);
    throw new AppError(502, "L'envoi de l'e-mail a échoué");
  }
}

// E-mail de bienvenue envoyé quand un admin invite un utilisateur.
export async function sendWelcomeInvitationEmail(params: {
  to: string;
  firstName: string;
  inviterName: string;
  token: string;
}) {
  const url = `${env.FRONTEND_URL}/accept-invitation?token=${params.token}`;
  const html = layout(
    `Bienvenue ${escapeHtml(params.firstName)} !`,
    `<p>${escapeHtml(params.inviterName)} t'a invité à rejoindre la plateforme de support informatique.</p>
     <p>Clique sur le bouton pour choisir ton mot de passe et activer ton compte. Le lien est valable 48 heures.</p>`,
    'Activer mon compte',
    url,
  );
  await send(params.to, 'Bienvenue : active ton compte', html);
}

export async function sendPasswordResetEmail(params: {
  to: string;
  firstName: string;
  token: string;
}) {
  const url = `${env.FRONTEND_URL}/reset-password?token=${params.token}`;
  const html = layout(
    'Réinitialisation du mot de passe',
    `<p>Bonjour ${escapeHtml(params.firstName)},</p>
     <p>Tu as demandé à réinitialiser ton mot de passe. Le lien est valable 1 heure.</p>
     <p>Si tu n'es pas à l'origine de cette demande, ignore simplement cet e-mail.</p>`,
    'Choisir un nouveau mot de passe',
    url,
  );
  await send(params.to, 'Réinitialisation de ton mot de passe', html);
}
