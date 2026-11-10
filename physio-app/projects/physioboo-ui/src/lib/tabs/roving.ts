export interface BooChoice<T = string> {
  value: T;
  label: string;
  /** Icon name for `physio-icon`. */
  icon?: string;
  /** Small count shown after the label. */
  count?: number | null;
  disabled?: boolean;
  /** Tailwind background class for a small status dot before the label. */
  dot?: string;
  /** Separator drawn before this item (`stat` tabs): a thin rule between groups, or an arrow between steps. */
  divider?: 'line' | 'arrow';
  /** Unit read out after the count by screen readers, e.g. "leads" (`stat` tabs). */
  countUnit?: string;
}

/**
 * Arrow/Home/End keyboard handling shared by the tab strip and the segmented control: moves between enabled items,
 * wrapping at the ends. Returns the index to select, or null when the key is not a navigation key.
 */
export function nextEnabledIndex<T>(items: readonly BooChoice<T>[], from: number, key: string): number | null {
  const n = items.length;
  if (!n) return null;
  const enabled = (i: number) => !items[i].disabled;
  const step = (dir: 1 | -1): number | null => {
    for (let k = 1; k <= n; k++) {
      const i = (((from + dir * k) % n) + n) % n;
      if (enabled(i)) return i;
    }
    return null;
  };
  switch (key) {
    case 'ArrowRight': case 'ArrowDown': return step(1);
    case 'ArrowLeft': case 'ArrowUp': return step(-1);
    case 'Home': { for (let i = 0; i < n; i++) if (enabled(i)) return i; return null; }
    case 'End': { for (let i = n - 1; i >= 0; i--) if (enabled(i)) return i; return null; }
    default: return null;
  }
}
