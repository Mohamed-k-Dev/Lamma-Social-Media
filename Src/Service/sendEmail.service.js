import { EventEmitter } from "node:events";
import { Resend } from "resend";

export const emitter = new EventEmitter();

async function sendMail({
  to = "",
  cc = [],
  bcc = [],
  text = "",
  subject = "",
  html = "",
  attachments = [],
} = {}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `Sarahah , No Reply <${process.env.RESEND_USER}>`,
    to,
    subject,
    html,
    attachments,
    cc,
    bcc,
    text,
  });
  if (error) {
    return console.log(error);
  }
  console.log(`Email sent successfully to ${to}. Message ID: ${data.id}`);
}

emitter.on(
  "sendMail",
  ({ to, cc, bcc, text, subject, html, attachments } = {}) => {
    sendMail({ to, cc, bcc, text, subject, html, attachments });
  }
);
