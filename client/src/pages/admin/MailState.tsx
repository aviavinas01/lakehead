import type { NotifyRecord } from "../../types/api";

/**
 * Whether an email went out, for one of the two the server sends.
 *
 * Shared by both Inquiries tabs — enquiries and IELTS booking requests send
 * the same two mails and record them the same way (see the server's
 * notify() in each controller). It lived inside Inquiries.tsx until the
 * second tab needed it; moved rather than copied, so the two cannot come to
 * describe the same state in different words.
 *
 * Renders nothing for a record taken before mail existed — those have no
 * record at all, and "not emailed" would be a false accusation rather than
 * information. The three real states each say something different: sent is
 * done, skipped means there was nothing to do (mail is not configured, or
 * there was no address to write to), and failed is the one that needs a
 * person, so it carries the reason with it.
 *
 * BOTH ARE SHOWN, and they are shown separately on purpose. The office copy
 * going out while the enquirer's bounces means a mistyped address; the
 * reverse means a problem with our own inbox. One combined badge would hide
 * whichever of the two failed.
 */
export default function MailState({
  record,
  label,
}: {
  record: NotifyRecord | undefined;
  label: string;
}) {
  if (!record) return null;
  if (record.state === "sent") {
    return <span className="inquiry-mail is-sent">✓ {label} emailed</span>;
  }
  if (record.state === "skipped") {
    return (
      <span className="inquiry-mail is-skipped" title={record.reason}>
        {label} not emailed{record.reason ? ` — ${record.reason}` : ""}
      </span>
    );
  }
  return (
    <span className="inquiry-mail is-failed" title={record.reason}>
      ⚠ {label} email failed{record.reason ? ` — ${record.reason}` : ""}
    </span>
  );
}
