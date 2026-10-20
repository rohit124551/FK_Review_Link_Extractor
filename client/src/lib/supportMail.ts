/**
 * Support email helper for Flipkart Review Finder
 * Recipient: developer@rohitkumarranjan.in
 */

export const SUPPORT_EMAIL = 'developer@rohitkumarranjan.in';

export interface SupportMailOptions {
  incidentId?: string;
  reportId?: string;
  errorMessage?: string;
  status?: string;
  url?: string;
  customSubject?: string;
  customMessage?: string;
}

export function buildSupportEmailContent(options: SupportMailOptions = {}) {
  const isError = Boolean(options.incidentId || options.errorMessage || options.status);

  let subject = options.customSubject;
  if (!subject) {
    if (options.incidentId) {
      subject = `[Flipkart Review Finder] Error Report - Incident ${options.incidentId}`;
    } else if (isError) {
      subject = `[Flipkart Review Finder] Error Assistance Request`;
    } else {
      subject = `[Flipkart Review Finder] Support & Feedback`;
    }
  }

  let body = `Hello Rohit,\n\nI am contacting you regarding the Flipkart Review Finder.\n\n`;

  if (isError) {
    body += `─────────────────────────────────────────\n`;
    body += `INCIDENT DIAGNOSTICS & TELEMETRY\n`;
    if (options.incidentId) body += `Incident Reference: ${options.incidentId}\n`;
    if (options.reportId) body += `Bug Report Reference: ${options.reportId}\n`;
    if (options.status) body += `Status: ${options.status}\n`;
    if (options.errorMessage) body += `Reported Error: ${options.errorMessage}\n`;
    if (options.url) body += `Flipkart URL: ${options.url}\n`;
    body += `Timestamp: ${new Date().toISOString()}\n`;
    if (typeof navigator !== 'undefined') {
      body += `Platform: ${navigator.userAgent}\n`;
    }
    body += `─────────────────────────────────────────\n\n`;
    body += `What I was trying to do / Additional context:\n`;
    if (options.customMessage) {
      body += `${options.customMessage}\n\n`;
    } else {
      body += `(Please add any extra details or steps to reproduce here)\n\n`;
    }
  } else {
    if (options.url) {
      body += `Target Product URL: ${options.url}\n`;
    }
    body += `Timestamp: ${new Date().toISOString()}\n\n`;
    body += `Inquiry / Feedback:\n`;
    if (options.customMessage) {
      body += `${options.customMessage}\n\n`;
    } else {
      body += `(Type your message here)\n\n`;
    }
  }

  body += `Best regards,\n`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${encodedSubject}&body=${encodedBody}`;
  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;

  return {
    recipient: SUPPORT_EMAIL,
    subject,
    body,
    gmailUrl,
    mailtoUrl,
  };
}

/**
 * Open Gmail web compose in a new tab with prefilled subject and body.
 * Falls back to mailto: if popup is blocked or requested.
 */
export function openSupportEmail(options: SupportMailOptions = {}, preferDesktopClient: boolean = false) {
  const { gmailUrl, mailtoUrl } = buildSupportEmailContent(options);

  if (preferDesktopClient) {
    window.location.href = mailtoUrl;
    return;
  }

  // Open Gmail web compose in new tab
  const win = window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    // Popup was blocked, trigger standard mailto
    window.location.href = mailtoUrl;
  }
}
