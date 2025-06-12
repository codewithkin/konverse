import prisma from "@/helpers/prisma";
import {betterAuth} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {sendEmail} from "@/helpers/email";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({user, url}, request) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your Konverse account",
        text: `Welcome to Konverse! Please confirm your email by clicking the link: ${url}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.4;">
            <h2>Welcome to Konverse 👋</h2>
            <p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>
            <a href="${url}" style="display:inline-block; padding:10px 20px; margin-top:10px; background-color:#6366f1; color:white; text-decoration:none; border-radius:6px;">
              Verify Email
            </a>
            <p>If you didn’t create a Konverse account, you can ignore this email.</p>
          </div>
        `,
      });
    },
  },
  plugins: [nextCookies()],
});
