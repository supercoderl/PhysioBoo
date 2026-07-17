import { Orientation } from "../enums/print-orientation";
import { PaperSize } from "../enums/print-paper-size";

export interface PrintTemplate {
  id: string;
  name: string;
  code: string;
  module: string;
  documentType: string;
  isSystemDefault: boolean;
  isActive: boolean;
  currentVersionId: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface PrintTemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  paperSize: PaperSize;
  orientation: Orientation;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  customCss: string;
  createdAt?: string;
}

export interface PrintTemplateDetail extends PrintTemplate {
  currentVersion: PrintTemplateVersion;
}

export interface PrintTemplateFilter {
  start: string;
  end: string;
  module?: string | null;
  documentType?: string | null;
  isActive?: boolean | null;
}

export interface PlaceholderField {
  key: string;
  label: string;
  example?: string;
}

export interface PlaceholderGroup {
  group: string;
  fields: PlaceholderField[];
}

export interface PrintRenderRequest {
  templateCode?: string;
  templateId?: string;
  data: Record<string, any>;
}

export interface PrintRenderResult {
  html: string;
  paperSize: PaperSize;
  orientation: Orientation;
  customCss: string;
}
