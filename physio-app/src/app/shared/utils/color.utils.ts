import { Role } from "../types/role.types";

export class ColorUtils {
  static readonly roleColors = [
    { label: 'Slate', value: '#64748b' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Teal', value: '#14b8a6' },
  ];

  static generateFromText(text: string): string {
    if (!text) return '#6c757d';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  }

  static roleColorFor(role: Role | string | null | undefined): string {
    if (!role) return '#64748b';
    if (typeof role === 'string') return role || '#64748b';
    return role.color || '#64748b';
  }

  /** Returns a soft (15%) background tint of the given hex color. */
  static softBg(hex: string): string {
    return `${hex}26`; // ~15% alpha in hex (0x26 ≈ 38/255)
  }
}
