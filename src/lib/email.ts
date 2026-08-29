import { Resend } from "resend";

function client() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "Papertrail <onboarding@resend.dev>";

interface ReminderItem {
  buildingName: string;
  itemLabel: string;
  dueDate: string;
  daysRemaining: number;
}

function reminderHtml(items: ReminderItem[], linkUrl: string, linkLabel: string) {
  const rows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd4bc;">${i.buildingName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd4bc;">${i.itemLabel}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd4bc;">${i.dueDate}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #ddd4bc;">${
            i.daysRemaining < 0
              ? `${Math.abs(i.daysRemaining)} days overdue`
              : `${i.daysRemaining} days left`
          }</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:sans-serif;color:#23301f;">
      <h2 style="font-family:serif;">Papertrail reminder</h2>
      <p>The following are coming due or overdue:</p>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #23301f;">Building</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #23301f;">Item</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #23301f;">Due</th>
            <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #23301f;">Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="margin-top:24px;">
        <a href="${linkUrl}" style="color:#3a5f33;">${linkLabel}</a>
      </p>
    </div>
  `;
}

export async function sendEngineerReminder(
  to: string,
  items: ReminderItem[],
  buildingsUrl: string,
) {
  await client().emails.send({
    from: FROM,
    to,
    subject: `Papertrail: ${items.length} item${items.length === 1 ? "" : "s"} due soon`,
    html: reminderHtml(items, buildingsUrl, "View in Papertrail"),
  });
}

export async function sendClientReminder(
  to: string,
  items: ReminderItem[],
  shareUrl: string,
) {
  await client().emails.send({
    from: FROM,
    to,
    subject: `Compliance update: ${items.length} item${items.length === 1 ? "" : "s"} due soon`,
    html: reminderHtml(items, shareUrl, "View compliance summary"),
  });
}
