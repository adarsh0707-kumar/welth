import { Resend } from "resend";
import { render } from "@react-email/render";

export async function sendEmail({ to, subject, react }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");
  console.log("Sending email to:", to);
  console.log("Subject:", subject);

  try {
    // Render the React component to HTML
    const html = await render(react);
    console.log("Rendered HTML:", html.substring(0, 200) + "..."); // Log first 200 chars

    const { data, error } = await resend.emails.send({
      from: "Welth <noreply@adarshgoddev.info>",
      to,
      subject,
      html: html, // Use the rendered HTML
    });

    if (error) {
      console.error("Resend API error:", error);
      return {
        success: false,
        error,
      };
    }

    console.log("Email sent successfully:", data);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
