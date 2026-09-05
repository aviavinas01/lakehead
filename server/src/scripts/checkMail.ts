/**
 * Checks the mail configuration without waiting for a student to fill in a
 * form and hoping.
 *
 *   npm run mail:check            authenticate against the mail host only
 *   npm run mail:check -- --send  authenticate, then send a real test message
 *                                 to MAIL_TO
 *
 * Nothing here touches the running server, the database or the request path —
 * it is a standalone script that reads the same environment the API does and
 * uses the same transport. Run it locally with server/.env filled in, or on
 * Render from a shell once the dashboard variables are set.
 *
 * Exits non-zero when the check fails, so CI or a deploy hook can use it.
 */

import { mailService } from "../services/mail.service.js";
import { env } from "../config/env.js";

const wantsSend = process.argv.includes("--send");

async function main() {
  console.log("Mail configuration");
  console.log("──────────────────");
  console.log(`  host       ${env.MAIL_HOST ?? "(unset)"}`);
  console.log(`  port       ${env.MAIL_PORT ?? 587}`);
  console.log(`  secure     ${env.MAIL_SECURE}  ${env.MAIL_SECURE === "true" ? "(implicit TLS — expects port 465)" : "(STARTTLS — expects port 587)"}`);
  console.log(`  user       ${env.MAIL_USER ?? "(unset)"}`);
  console.log(`  pass       ${env.MAIL_PASS ? `set, ${env.MAIL_PASS.length} characters` : "(unset)"}`);
  console.log(`  from       ${env.MAIL_FROM ?? env.MAIL_USER ?? "(unset)"}`);
  console.log(`  to         ${mailService.recipients.join(", ") || "(unset)"}`);
  console.log("");

  if (!mailService.configured) {
    console.error(
      "✗ Not configured. MAIL_HOST, MAIL_USER, MAIL_PASS and MAIL_TO are all\n" +
        "  required before anything is sent. The site works without them —\n" +
        "  inquiries save and reach the dashboard — but no email goes out."
    );
    process.exit(1);
  }

  /* Connect and authenticate without sending. This is where a wrong password,
     a blocked port or the wrong secure/port pairing shows up. */
  const check = await mailService.verify();
  if (!check.ok) {
    console.error(`✗ Could not authenticate: ${check.reason}`);
    console.error("");
    console.error("  Common causes:");
    console.error("    · MAIL_SECURE=true on port 587, or false on 465 —");
    console.error("      they must match, 587 is STARTTLS and 465 is implicit TLS");
    console.error("    · Google Workspace needs an App Password with 2FA on,");
    console.error("      not the account password");
    console.error("    · Port 25 is blocked by every cloud host. Use 587.");
    process.exit(1);
  }
  console.log("✓ Authenticated against the mail host.");

  if (!wantsSend) {
    console.log("");
    console.log("  Re-run with --send to put a real test message in the inbox.");
    return;
  }

  const result = await mailService.send({
    subject: "Lakehead website — mail test",
    text:
      "This is a test from the Lakehead website server.\n\n" +
      "If you are reading it, form notifications will arrive here too.\n" +
      "Replying to a real notification writes to the student, not to us.",
    html:
      "<p>This is a test from the Lakehead website server.</p>" +
      "<p>If you are reading it, form notifications will arrive here too. " +
      "Replying to a real notification writes to the student, not to us.</p>",
  });

  if (!result.ok) {
    console.error(`✗ Authenticated, but the send failed: ${result.reason}`);
    process.exit(1);
  }
  console.log(`✓ Test message sent to ${mailService.recipients.join(", ")}.`);
  console.log("  Check the spam folder too — a first message from a new");
  console.log("  server often lands there before the domain is trusted.");
}

main().catch((err) => {
  console.error("✗ Unexpected failure:", err);
  process.exit(1);
});
