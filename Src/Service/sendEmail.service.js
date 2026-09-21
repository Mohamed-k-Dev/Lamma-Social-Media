import { EventEmitter } from "node:events";
import { Resend } from "resend";

export const emitter = new EventEmitter();

async function sendMail({ to, subject, html, attachments = [] } = {}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: `Sarahah , No Reply <${process.env.RESEND_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
  if (error) {
    return console.log(error);
  }
  console.log(data);
}

emitter.on("sendMail", async ({ to, subject, html, attachments = [] } = {}) => {
  sendMail({
    to,
    subject,
    html,
    attachments,
  });
});
