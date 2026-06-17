import { Role } from "../types/role";

export class ColorUtils {
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
