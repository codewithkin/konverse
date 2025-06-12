import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kinzinzombe07@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  await transporter.sendMail({
    from: '"Konverse" <kinzinzombe07@gmail.com>',
    to,
    subject,
    text,
    html,
  });
}
