
import { Resend } from "resend";
import { render } from "@react-email/render";

/**
 * Send an email using Resend and render a React Email component to HTML.
 *
 * @async
 * @param {Object} params - Parameters for sending the email.
 * @param {string | string[]} params.to - Recipient email address(es).
 * @param {string} params.subject - Subject line for the email.
 * @param {import("react").ReactElement} params.react - A React component (email template) to render.
 * @returns {Promise<{
 *   success: boolean;
 *   data?: any;
 *   error?: string;
 * }>} Result of the email send operation.
 *   - `success`: whether the email was sent.
 *   - `data`: response data from Resend (if succeeded).
 *   - `error`: error message if failed.
 *
 * @throws {Error} If the RESEND_API_KEY is missing or rendering fails.
 */


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
