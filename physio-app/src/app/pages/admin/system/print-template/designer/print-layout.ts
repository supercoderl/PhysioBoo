import { Orientation } from '../../../../../shared/enums/print-orientation';
import { PaperSize } from '../../../../../shared/enums/print-paper-size';

/**
 * Visual layout of a print template.
 *
 * The API stores a template version as header/body/footer HTML plus custom CSS, rendered server-side by Scriban.
 * The designer compiles this layout into those four strings and keeps the layout itself inside `bodyHtml` as a
 * base64 HTML comment, so a saved template can be reopened in the designer. Base64 has no `{{`, so Scriban passes
 * the comment through untouched and the printed page ignores it.
 */

// #region Types
export type LayoutSection = 'header' | 'body' | 'footer';
export type ElementKind =
  | 'heading' | 'text' | 'field' | 'fieldGrid' | 'table' | 'repeatTable'
  | 'image' | 'divider' | 'spacer' | 'signature' | 'pageBreak' | 'html';
export type ValueFormat = 'none' | 'upper' | 'date' | 'money';
export type Align = 'left' | 'center' | 'right';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

export interface ElementStyle {
  /** Percentage of the printable width. */
  width: number;
  align: Align;
  /** Points; null inherits the page font size. */
  fontSize: number | null;
  bold: boolean;
  italic: boolean;
  color: string;
  background: string;
  borderWidth: number;
  borderStyle: LineStyle;
  borderColor: string;
  /** Millimetres. */
  padding: number;
  marginTop: number;
  marginBottom: number;
}

export interface BoundField {
  label: string;
  key: string;
  format: ValueFormat;
}

export interface TableColumn extends BoundField {
  /** Percentage of the table width; null shares the rest equally. */
  width: number | null;
  align: Align;
}

export interface PrintElement {
  id: string;
  kind: ElementKind;
  style: ElementStyle;
  /** heading, text, signature caption. May contain {{ placeholders }}. */
  text?: string;
  /** field, signature (printed name under the line). */
  field?: BoundField;
  fieldLayout?: 'inline' | 'stacked';
  /** field label width in mm when inline. */
  labelWidth?: number;
  showLabel?: boolean;
  /** fieldGrid */
  fields?: BoundField[];
  columns?: number;
  /** table, repeatTable */
  tableColumns?: TableColumn[];
  /** table: cell text per row; cells may contain {{ placeholders }}. */
  rows?: string[][];
  /** repeatTable: path of the list in the print data, e.g. `items`. */
  collection?: string;
  showIndex?: boolean;
  headerBackground?: string;
  bordered?: boolean;
  /** image */
  imageSource?: 'url' | 'field';
  src?: string;
  imageKey?: string;
  /** image, spacer, signature: height in mm. */
  height?: number;
  /** html */
  html?: string;
}

export interface PageSettings {
  margin: { top: number; right: number; bottom: number; left: number };
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
}

export interface PrintLayout {
  version: 1;
  page: PageSettings;
  header: PrintElement[];
  body: PrintElement[];
  footer: PrintElement[];
}

export interface PaletteItem {
  kind: ElementKind;
  label: string;
  description: string;
  icon: string;
  /** Set when the item is a data field from the placeholder catalogue. */
  field?: { key: string; label: string };
}
// #endregion

// #region Constants
export const SECTIONS: LayoutSection[] = ['header', 'body', 'footer'];

export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'System sans-serif', value: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Verdana, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];

export const FORMAT_OPTIONS: { label: string; value: ValueFormat }[] = [
  { label: 'As is', value: 'none' },
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'Date (dd/MM/yyyy)', value: 'date' },
  { label: 'Money (VND)', value: 'money' },
];

export const ELEMENT_PALETTE: PaletteItem[] = [
  { kind: 'heading',     icon: 'a-large-small', label: 'Heading',        description: 'Large title text' },
  { kind: 'text',        icon: 'file-text',     label: 'Text',           description: 'Paragraph, can include data fields' },
  { kind: 'field',       icon: 'hash',          label: 'Data field',     description: 'Label with a value from the record' },
  { kind: 'fieldGrid',   icon: 'columns-3',     label: 'Field grid',     description: 'Several fields in columns' },
  { kind: 'table',       icon: 'table-2',       label: 'Table',          description: 'Fixed rows and columns' },
  { kind: 'repeatTable', icon: 'list',          label: 'Repeating table', description: 'One row per item in a list' },
  { kind: 'image',       icon: 'image',         label: 'Image / logo',   description: 'Picture from a link, file or field' },
  { kind: 'divider',     icon: 'minus',         label: 'Line',           description: 'Horizontal rule' },
  { kind: 'spacer',      icon: 'rows-2',        label: 'Spacer',         description: 'Empty vertical space' },
  { kind: 'signature',   icon: 'pencil',        label: 'Signature',      description: 'Signing line with caption' },
  { kind: 'pageBreak',   icon: 'scissors',      label: 'Page break',     description: 'Start a new printed page' },
  { kind: 'html',        icon: 'code',          label: 'Custom HTML',    description: 'Advanced: raw HTML' },
];

const PAPER_MM: Record<PaperSize, [number, number | null]> = {
  [PaperSize.A4]: [210, 297],
  [PaperSize.A5]: [148, 210],
  [PaperSize.Letter]: [215.9, 279.4],
  // Receipt rolls have no fixed length.
  [PaperSize.ThermalReceipt80mm]: [80, null],
  [PaperSize.ThermalReceipt58mm]: [58, null],
};

const LAYOUT_RE = /<!--boo-layout:v1:([A-Za-z0-9+/=]+)-->/;
const CSS_START = '/* boo-designer:start (generated by the visual designer, edits here are overwritten) */';
const CSS_END = '/* boo-designer:end */';
const KEY_RE = /^[A-Za-z_][\w]*(\.[A-Za-z_][\w]*)*$/;
// #endregion

// #region Paper
/** Width and height in mm for the paper; height is null for receipt rolls. */
export function paperMm(size: PaperSize, orientation: Orientation): { width: number; height: number | null } {
  const [w, h] = PAPER_MM[size] ?? PAPER_MM[PaperSize.A4];
  if (h !== null && orientation === Orientation.Landscape) return { width: h, height: w };
  return { width: w, height: h };
}

export function isReceipt(size: PaperSize): boolean {
  return size === PaperSize.ThermalReceipt58mm || size === PaperSize.ThermalReceipt80mm;
}
// #endregion

// #region Factories
let seq = 0;
export function newId(): string {
  return `el_${Date.now().toString(36)}_${(seq++).toString(36)}`;
}

export function defaultStyle(patch: Partial<ElementStyle> = {}): ElementStyle {
  return {
    width: 100, align: 'left', fontSize: null, bold: false, italic: false, color: '', background: '',
    borderWidth: 0, borderStyle: 'solid', borderColor: '#333333', padding: 0, marginTop: 0, marginBottom: 2,
    ...patch,
  };
}

export function emptyLayout(receipt = false): PrintLayout {
  const m = receipt ? 3 : 10;
  return {
    version: 1,
    page: {
      margin: { top: m, right: m, bottom: m, left: m },
      fontFamily: FONT_FAMILIES[0].value,
      fontSize: receipt ? 9 : 11,
      lineHeight: 1.4,
      color: '#111111',
    },
    header: [], body: [], footer: [],
  };
}

export function createElement(item: PaletteItem): PrintElement {
  const id = newId();
  switch (item.kind) {
    case 'heading':
      return { id, kind: 'heading', text: 'Document title', style: defaultStyle({ fontSize: 16, bold: true, marginBottom: 3 }) };
    case 'text':
      return { id, kind: 'text', text: 'Type your text here.', style: defaultStyle() };
    case 'field': {
      const f = item.field;
      return {
        id, kind: 'field', fieldLayout: 'inline', labelWidth: 30, showLabel: true,
        field: { label: f?.label ?? 'Label', key: f?.key ?? '', format: 'none' },
        style: defaultStyle({ marginBottom: 1 }),
      };
    }
    case 'fieldGrid':
      return {
        id, kind: 'fieldGrid', columns: 2,
        fields: [
          { label: 'Field 1', key: '', format: 'none' },
          { label: 'Field 2', key: '', format: 'none' },
        ],
        style: defaultStyle({ marginBottom: 3 }),
      };
    case 'table':
      return {
        id, kind: 'table', bordered: true, headerBackground: '#f3f4f6',
        tableColumns: [
          { label: 'Column 1', key: '', format: 'none', width: null, align: 'left' },
          { label: 'Column 2', key: '', format: 'none', width: null, align: 'left' },
        ],
        rows: [['', ''], ['', '']],
        style: defaultStyle({ marginBottom: 3 }),
      };
    case 'repeatTable':
      return {
        id, kind: 'repeatTable', bordered: true, headerBackground: '#f3f4f6', showIndex: true, collection: 'items',
        tableColumns: [
          { label: 'Item', key: 'name', format: 'none', width: null, align: 'left' },
          { label: 'Quantity', key: 'quantity', format: 'none', width: 15, align: 'right' },
        ],
        style: defaultStyle({ marginBottom: 3 }),
      };
    case 'image':
      return { id, kind: 'image', imageSource: 'url', src: '', imageKey: '', height: 20, style: defaultStyle({ width: 30 }) };
    case 'divider':
      return { id, kind: 'divider', style: defaultStyle({ borderWidth: 1, borderColor: '#9ca3af', marginTop: 2, marginBottom: 2 }) };
    case 'spacer':
      return { id, kind: 'spacer', height: 8, style: defaultStyle({ marginBottom: 0 }) };
    case 'signature':
      return {
        id, kind: 'signature', text: 'Signature', height: 18,
        field: { label: 'Name', key: '', format: 'none' },
        style: defaultStyle({ width: 40, align: 'right', marginTop: 4 }),
      };
    case 'pageBreak':
      return { id, kind: 'pageBreak', style: defaultStyle({ marginBottom: 0 }) };
    case 'html':
      return { id, kind: 'html', html: '<div></div>', style: defaultStyle() };
  }
}

/** Deep copy with fresh ids, for duplicate. */
export function cloneElement(el: PrintElement): PrintElement {
  return { ...structuredClone(el), id: newId() };
}

/** A ready-made starting point so the first experience is not a blank page. */
export function starterLayout(receipt: boolean): PrintLayout {
  const l = emptyLayout(receipt);
  const mk = (kind: ElementKind, patch: Partial<PrintElement> = {}, style: Partial<ElementStyle> = {}): PrintElement => {
    const el = createElement({ kind, label: '', description: '', icon: '' });
    return { ...el, ...patch, style: { ...el.style, ...style } };
  };
  l.header = [
    mk('text', { text: '{{ hospital.name }}' }, { fontSize: 14, bold: true, align: 'center', marginBottom: 0 }),
    mk('text', { text: '{{ hospital.address }} · {{ hospital.phone }}' }, { align: 'center', fontSize: 9, marginBottom: 1 }),
    mk('divider'),
  ];
  l.body = [
    mk('heading', { text: 'DOCUMENT TITLE' }, { align: 'center', marginTop: 2, marginBottom: 4 }),
    mk('fieldGrid', {
      columns: 2,
      fields: [
        { label: 'Patient', key: 'patient.name', format: 'none' },
        { label: 'Patient ID', key: 'patient.id', format: 'none' },
        { label: 'Age', key: 'patient.age', format: 'none' },
        { label: 'Gender', key: 'patient.gender', format: 'none' },
      ],
    }),
    mk('text', { text: 'Write the content of the document here.' }, { marginTop: 2 }),
    mk('signature', { text: 'Doctor', field: { label: 'Name', key: 'doctor.fullName', format: 'none' } }),
  ];
  l.footer = [
    mk('divider', {}, { marginTop: 4 }),
    mk('text', { text: 'Printed on {{ date }}' }, { fontSize: 8, align: 'right', color: '#6b7280' }),
  ];
  return l;
}
// #endregion

// #region Serialization
export function encodeLayout(layout: PrintLayout): string {
  const bytes = new TextEncoder().encode(JSON.stringify(layout));
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `<!--boo-layout:v1:${btoa(bin)}-->`;
}

/** The layout embedded in a saved body, or null when the template was written as plain HTML. */
export function decodeLayout(bodyHtml: string): PrintLayout | null {
  const m = LAYOUT_RE.exec(bodyHtml ?? '');
  if (!m) return null;
  try {
    const bin = atob(m[1]);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as PrintLayout;
    if (parsed?.version !== 1 || !Array.isArray(parsed.body)) return null;
    const base = emptyLayout();
    return {
      ...base, ...parsed,
      page: { ...base.page, ...parsed.page, margin: { ...base.page.margin, ...parsed.page?.margin } },
      header: parsed.header ?? [], footer: parsed.footer ?? [],
    };
  } catch {
    return null;
  }
}

/** Turns HTML written before the designer existed into Custom HTML blocks, so nothing is lost. */
export function importLegacy(headerHtml: string, bodyHtml: string, footerHtml: string, receipt: boolean): PrintLayout {
  const l = emptyLayout(receipt);
  const block = (html: string): PrintElement[] =>
    html?.trim() ? [{ id: newId(), kind: 'html', html, style: defaultStyle({ marginBottom: 0 }) }] : [];
  l.header = block(headerHtml);
  l.body = block(bodyHtml);
  l.footer = block(footerHtml);
  return l;
}

/** Custom CSS the user wrote, without the block the designer generates. */
export function userCss(customCss: string): string {
  const css = customCss ?? '';
  const start = css.indexOf(CSS_START);
  const end = css.indexOf(CSS_END);
  if (start < 0 || end < start) return css;
  return (css.slice(0, start) + css.slice(end + CSS_END.length)).trim();
}
// #endregion

// #region Compile
export interface CompileContext {
  /** `template` emits Scriban for the server; `design` emits field chips for the canvas. */
  mode: 'template' | 'design';
  labelFor?: (key: string) => string;
}

export interface CompiledTemplate {
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  customCss: string;
}

export function compileLayout(layout: PrintLayout, extraCss: string): CompiledTemplate {
  const ctx: CompileContext = { mode: 'template' };
  const section = (els: PrintElement[]) => els.map(el => renderBlock(el, ctx)).join('\n');
  const generated = [CSS_START, pageCss(layout.page), CSS_END].join('\n');
  return {
    headerHtml: section(layout.header),
    // The layout rides in the body because the body is the one part the API requires to be non-empty.
    bodyHtml: encodeLayout(layout) + '\n' + section(layout.body),
    footerHtml: section(layout.footer),
    customCss: extraCss?.trim() ? `${generated}\n${extraCss.trim()}` : generated,
  };
}

/** Wraps compiled sections the way the render endpoint does, so previews match what the server returns. */
export function documentHtml(header: string, body: string, footer: string): string {
  return `<div class="print-document"><header class="print-header">${header}</header>`
    + `<main class="print-body">${body}</main><footer class="print-footer">${footer}</footer></div>`;
}

function pageCss(p: PageSettings): string {
  const m = p.margin;
  return [
    `@page { margin: ${num(m.top)}mm ${num(m.right)}mm ${num(m.bottom)}mm ${num(m.left)}mm; }`,
    `.print-document { font-family: ${safeFont(p.fontFamily)}; font-size: ${num(p.fontSize, 11)}pt; line-height: ${num(p.lineHeight, 1.4)}; color: ${safeColor(p.color) || '#111'}; }`,
    `.print-document table { border-collapse: collapse; }`,
    `.print-document thead { display: table-header-group; }`,
    `.print-document tr, .print-document img { break-inside: avoid; page-break-inside: avoid; }`,
  ].join('\n');
}

function renderBlock(el: PrintElement, ctx: CompileContext): string {
  return `<div style="${styleString(blockStyle(el))}">${elementInner(el, ctx)}</div>`;
}

/** Inline style of an element's outer box; the canvas binds the same object so design and print agree. */
export function blockStyle(el: PrintElement): Record<string, string> {
  const s = el.style;
  const out: Record<string, string> = {
    'box-sizing': 'border-box',
    width: `${clamp(s.width, 5, 100)}%`,
    'margin-top': `${num(s.marginTop)}mm`,
    'margin-bottom': `${num(s.marginBottom)}mm`,
    'margin-left': s.align === 'left' ? '0' : 'auto',
    'margin-right': s.align === 'right' ? '0' : 'auto',
    'text-align': s.align,
  };
  if (s.fontSize) out['font-size'] = `${num(s.fontSize)}pt`;
  if (s.bold) out['font-weight'] = '700';
  if (s.italic) out['font-style'] = 'italic';
  const color = safeColor(s.color);
  if (color) out['color'] = color;
  const bg = safeColor(s.background);
  if (bg) out['background'] = bg;
  if (s.borderWidth > 0 && el.kind !== 'divider') out['border'] = `${num(s.borderWidth)}px ${lineStyle(s.borderStyle)} ${safeColor(s.borderColor) || '#333'}`;
  if (s.padding > 0) out['padding'] = `${num(s.padding)}mm`;
  if (el.kind === 'fieldGrid' || el.kind === 'signature' || el.kind === 'field') {
    out['break-inside'] = 'avoid';
    out['page-break-inside'] = 'avoid';
  }
  return out;
}

export function elementInner(el: PrintElement, ctx: CompileContext): string {
  switch (el.kind) {
    case 'heading':
    case 'text':
      return richText(el.text ?? '', ctx);

    case 'field': {
      const f = el.field ?? { label: '', key: '', format: 'none' };
      const value = valueOf(f, ctx);
      if (el.showLabel === false) return value;
      if (el.fieldLayout === 'stacked') {
        return `<div style="font-size:0.85em;opacity:0.75">${esc(f.label)}</div><div>${value}</div>`;
      }
      return `<span style="display:inline-block;min-width:${num(el.labelWidth, 30)}mm;font-weight:600">${esc(f.label)}</span>${value}`;
    }

    case 'fieldGrid': {
      const cols = clamp(el.columns ?? 2, 1, 4);
      const fields = el.fields ?? [];
      const rows: string[] = [];
      for (let i = 0; i < fields.length; i += cols) {
        const cells = fields.slice(i, i + cols).map(f =>
          `<td style="width:${(100 / cols).toFixed(2)}%;padding:0.6mm 2mm 0.6mm 0;vertical-align:top;text-align:inherit">`
          + `<span style="font-weight:600">${esc(f.label)}${f.label ? ':' : ''}</span> ${valueOf(f, ctx)}</td>`);
        while (cells.length < cols) cells.push('<td></td>');
        rows.push(`<tr>${cells.join('')}</tr>`);
      }
      return `<table style="width:100%;border-collapse:collapse"><tbody>${rows.join('')}</tbody></table>`;
    }

    case 'table': {
      const cols = el.tableColumns ?? [];
      const cell = cellStyle(el);
      const head = `<thead><tr>${cols.map(c => `<th style="${cell};${colStyle(c)};background:${safeColor(el.headerBackground) || 'transparent'};font-weight:600">${esc(c.label)}</th>`).join('')}</tr></thead>`;
      const body = (el.rows ?? []).map(r =>
        `<tr>${cols.map((c, i) => `<td style="${cell};text-align:${c.align}">${richText(r[i] ?? '', ctx)}</td>`).join('')}</tr>`).join('');
      return `<table style="width:100%;border-collapse:collapse">${head}<tbody>${body}</tbody></table>`;
    }

    case 'repeatTable': {
      const cols = el.tableColumns ?? [];
      const cell = cellStyle(el);
      const bg = safeColor(el.headerBackground) || 'transparent';
      const indexHead = el.showIndex ? `<th style="${cell};width:8%;background:${bg};text-align:center">#</th>` : '';
      const head = `<thead><tr>${indexHead}${cols.map(c => `<th style="${cell};${colStyle(c)};background:${bg};font-weight:600">${esc(c.label)}</th>`).join('')}</tr></thead>`;
      const collection = KEY_RE.test(el.collection ?? '') ? el.collection! : '';
      const rowCells = (index: string) =>
        (el.showIndex ? `<td style="${cell};text-align:center">${index}</td>` : '')
        + cols.map(c => `<td style="${cell};text-align:${c.align}">${valueOf(c, ctx, 'row.')}</td>`).join('');
      if (ctx.mode === 'design') {
        const note = `<div style="font-size:0.8em;color:#6b7280;margin-top:1mm;text-align:left">↻ Repeats for every item in ${chip(collection || 'choose a list')}</div>`;
        return `<table style="width:100%;border-collapse:collapse">${head}<tbody><tr>${rowCells('1')}</tr></tbody></table>${note}`;
      }
      if (!collection) return `<table style="width:100%;border-collapse:collapse">${head}<tbody></tbody></table>`;
      return `<table style="width:100%;border-collapse:collapse">${head}<tbody>{{ for row in ${collection} }}<tr>${rowCells('{{ for.index + 1 }}')}</tr>{{ end }}</tbody></table>`;
    }

    case 'image': {
      const h = num(el.height, 20);
      let src = '';
      if (el.imageSource === 'field') {
        if (KEY_RE.test(el.imageKey ?? '')) {
          if (ctx.mode === 'design') {
            return `<div style="display:inline-flex;align-items:center;justify-content:center;height:${h}mm;width:100%;border:1px dashed #d1d5db;color:#6b7280;font-size:9pt">Image from ${chip(label(el.imageKey!, ctx))}</div>`;
          }
          src = `{{ ${el.imageKey} }}`;
        }
      } else {
        src = safeUrl(el.src ?? '');
      }
      if (!src) {
        return ctx.mode === 'design'
          ? `<div style="display:inline-flex;align-items:center;justify-content:center;height:${h}mm;width:100%;border:1px dashed #d1d5db;color:#9ca3af;font-size:9pt">No image selected</div>`
          : '';
      }
      return `<img src="${escAttr(src)}" alt="" style="max-width:100%;height:${h}mm;object-fit:contain;display:inline-block">`;
    }

    case 'divider': {
      const s = el.style;
      return `<div style="border-top:${Math.max(1, num(s.borderWidth, 1))}px ${lineStyle(s.borderStyle)} ${safeColor(s.borderColor) || '#9ca3af'}"></div>`;
    }

    case 'spacer':
      return `<div style="height:${num(el.height, 8)}mm"></div>`;

    case 'signature': {
      const name = el.field?.key ? `<div style="font-weight:600">${valueOf(el.field, ctx)}</div>` : '';
      return `<div style="height:${num(el.height, 18)}mm"></div>`
        + `<div style="border-top:1px solid #374151;padding-top:1mm">${richText(el.text ?? '', ctx)}</div>${name}`;
    }

    case 'pageBreak':
      return ctx.mode === 'design'
        ? '<div style="border-top:2px dashed #f43f5e;text-align:center;font-size:8pt;color:#e11d48;line-height:1"><span style="position:relative;top:-0.6em;background:#fff;padding:0 2mm">Page break</span></div>'
        : '<div style="break-after:page;page-break-after:always;height:0"></div>';

    case 'html':
      return el.html ?? '';
  }
}

function cellStyle(el: PrintElement): string {
  const border = el.bordered ? `border:1px solid ${safeColor(el.style.borderColor) || '#9ca3af'}` : 'border-bottom:1px solid #e5e7eb';
  return `${border};padding:1.2mm 2mm;vertical-align:top`;
}

function colStyle(c: TableColumn): string {
  return `text-align:${c.align}${c.width ? `;width:${clamp(c.width, 1, 100)}%` : ''}`;
}

function valueOf(f: BoundField, ctx: CompileContext, prefix = ''): string {
  if (!KEY_RE.test(f.key ?? '')) return ctx.mode === 'design' ? chip('choose a field', true) : '';
  if (ctx.mode === 'design') return chip(prefix ? f.key : label(f.key, ctx));
  const path = prefix + f.key;
  switch (f.format) {
    case 'upper': return `{{ upper ${path} }}`;
    case 'date': return `{{ format_date ${path} "dd/MM/yyyy" }}`;
    case 'money': return `{{ money ${path} "VND" }}`;
    default: return `{{ ${path} }}`;
  }
}

/** Escapes user text, keeps valid `{{ key }}` placeholders and neutralises any other `{{` so Scriban cannot fail on it. */
function richText(text: string, ctx: CompileContext): string {
  const keys: string[] = [];
  return esc(text).replace(/\n/g, '<br>')
    .replace(/\{\{([^{}]*)\}\}/g, (m, inner: string) => {
      const key = inner.trim();
      if (!KEY_RE.test(key)) return m;
      keys.push(key);
      return `\u0000${keys.length - 1}\u0000`;
    })
    .replace(/\{/g, '&#123;')
    .replace(/\u0000(\d+)\u0000/g, (_, i: string) =>
      ctx.mode === 'design' ? chip(label(keys[+i], ctx)) : `{{ ${keys[+i]} }}`);
}

function label(key: string, ctx: CompileContext): string {
  return ctx.labelFor?.(key) ?? key;
}

function chip(text: string, muted = false): string {
  const colors = muted ? 'background:#f3f4f6;color:#9ca3af' : 'background:#fce7f3;color:#9d174d';
  return `<span style="${colors};border-radius:3px;padding:0 1mm;font-size:0.9em;white-space:nowrap">${esc(text)}</span>`;
}
// #endregion

// #region Client-side preview
/**
 * Fills a compiled template with sample data in the browser. Covers exactly what the designer emits —
 * `{{ path }}`, `upper`, `format_date`, `money`, and `for … in … end` loops — not general Scriban.
 */
export function renderPreview(template: string, data: Record<string, any>): string {
  const looped = template.replace(
    /\{\{\s*for\s+(\w+)\s+in\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*end\s*\}\}/g,
    (_, name: string, path: string, inner: string) => {
      const list = resolve(data, path);
      if (!Array.isArray(list)) return '';
      return list.map((item, i) => fill(inner, { ...data, [name]: item }, i)).join('');
    });
  return fill(looped, data, 0);
}

function fill(s: string, data: Record<string, any>, index: number): string {
  return s.replace(/\{\{\s*([^{}]*?)\s*\}\}/g, (_, expr: string) => {
    if (/^for\.index\s*\+\s*1$/.test(expr)) return String(index + 1);
    const fn = /^(upper|format_date|money)\s+([\w.]+)(?:\s+"([^"]*)")?$/.exec(expr);
    if (fn) {
      const v = resolve(data, fn[2]);
      if (v == null || v === '') return '';
      if (fn[1] === 'upper') return esc(String(v).toUpperCase());
      if (fn[1] === 'money') {
        const n = Number(v);
        return esc(isNaN(n) ? String(v) : `${Math.round(n).toLocaleString('en-US')} ${fn[3] || 'VND'}`);
      }
      return esc(formatDate(v, fn[3] || 'dd/MM/yyyy'));
    }
    if (/^[\w.]+$/.test(expr)) {
      const v = resolve(data, expr);
      return v == null ? '' : esc(String(v));
    }
    return '';
  });
}

function resolve(data: any, path: string): any {
  return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), data);
}

function formatDate(v: any, pattern: string): string {
  const d = new Date(v);
  if (isNaN(d.getTime()) || typeof v === 'number') return String(v);
  const pad = (n: number) => String(n).padStart(2, '0');
  return pattern
    .replace('yyyy', String(d.getFullYear())).replace('MM', pad(d.getMonth() + 1)).replace('dd', pad(d.getDate()))
    .replace('HH', pad(d.getHours())).replace('mm', pad(d.getMinutes()));
}

/** Sample rows for every repeating table, so the preview shows how a list prints. */
export function sampleCollections(layout: PrintLayout, data: Record<string, any>): void {
  for (const el of [...layout.header, ...layout.body, ...layout.footer]) {
    if (el.kind !== 'repeatTable' || !KEY_RE.test(el.collection ?? '')) continue;
    const rows = [1, 2, 3].map(i => {
      const row: Record<string, any> = {};
      for (const c of el.tableColumns ?? []) {
        if (!KEY_RE.test(c.key)) continue;
        setPath(row, c.key, c.format === 'money' ? 125000 * i : c.format === 'date' ? new Date().toISOString() : `${c.label || c.key} ${i}`);
      }
      return row;
    });
    if (!Array.isArray(resolve(data, el.collection!))) setPath(data, el.collection!, rows);
  }
}

export function setPath(target: Record<string, any>, path: string, value: any): void {
  const parts = path.split('.');
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cursor[parts[i]] !== 'object' || cursor[parts[i]] === null) cursor[parts[i]] = {};
    cursor = cursor[parts[i]];
  }
  cursor[parts[parts.length - 1]] = value;
}
// #endregion

// #region Sanitising helpers
export function isValidKey(key: string): boolean {
  return KEY_RE.test(key ?? '');
}

export function styleString(style: Record<string, string>): string {
  return Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';');
}

function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s: string): string {
  return esc(s).replace(/"/g, '&quot;');
}

function num(v: number | null | undefined, fallback = 0): number {
  const n = Number(v);
  return isFinite(n) ? Math.round(n * 100) / 100 : fallback;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num(v, max)));
}

function safeColor(c: string | undefined): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(c ?? '') ? c! : '';
}

function lineStyle(s: string): LineStyle {
  return s === 'dashed' || s === 'dotted' ? s : 'solid';
}

function safeFont(f: string): string {
  return FONT_FAMILIES.some(x => x.value === f) ? f : FONT_FAMILIES[0].value;
}

function safeUrl(u: string): string {
  const url = u.trim();
  return /^(https?:\/\/|\/|data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,)/i.test(url) ? url : '';
}
// #endregion
