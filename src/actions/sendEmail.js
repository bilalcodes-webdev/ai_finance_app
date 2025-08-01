
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export const sendEmail = async ({ to, subject, react }) => {
  try {
    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return {success: true, data}
  } catch (error) {
    console.log("Failed To Send Email", error)
  }
};
