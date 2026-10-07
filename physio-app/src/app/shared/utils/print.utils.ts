/**
 * Client-side printing for reports and labels. The document is rendered into a hidden iframe and
 * handed to the browser's print dialog, where "Save as PDF" produces the PDF export.
 */

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** A simple bordered table; cells are escaped. */
export function htmlTable(headers: string[], rows: unknown[][]): string {
  if (!rows.length) return '<p class="muted">None recorded.</p>';
  const head = headers.map(h => `<th>${escapeHtml(h)}</th>`).join('');
  const body = rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

const BASE_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; color: #111827; margin: 24px; font-size: 12px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 20px 0 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .muted { color: #6b7280; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  th { background: #f9fafb; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 24px; }
  @page { margin: 14mm; }
`;

/** Prints `bodyHtml` (already escaped where needed) as a standalone document. */
export function printHtmlDocument(title: string, bodyHtml: string, extraStyles = ''): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
    <style>${BASE_STYLES}${extraStyles}</style></head><body>${bodyHtml}
    <p class="muted" style="margin-top:24px">Printed ${escapeHtml(new Date().toLocaleString())}</p></body></html>`);
  doc.close();

  const win = iframe.contentWindow!;
  const cleanup = () => setTimeout(() => iframe.remove(), 500);
  win.onafterprint = cleanup;
  // Let images/SVG lay out before printing.
  setTimeout(() => { win.focus(); win.print(); setTimeout(cleanup, 60_000); }, 150);
}
