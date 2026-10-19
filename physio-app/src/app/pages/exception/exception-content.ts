/** Error codes that have their own page. 401 never shows a page: it redirects to login. */
export type ExceptionCode = '404' | '403' | '500' | '503' | 'network';

export interface ExceptionContent {
  eyebrow: string;
  icon: string;
  /** Icon colour inside the tile. */
  tone: string;
  title: string;
  desc: string;
  /** Extra line under the description, explaining whose problem it is. */
  hint?: { icon: string; text: string };
  /** Shows "Try again" as the primary action; "Back to homepage" becomes secondary. */
  retry?: { failTitle: string; failBody: string };
  /** Adds "Contact us" as the secondary action. */
  contact?: boolean;
  /** Adds the "Or go straight to" links (Find a doctor, Explore clinics). */
  links?: boolean;
}

export const EXCEPTION_CONTENT: Record<ExceptionCode, ExceptionContent> = {
  '404': {
    eyebrow: '404 ERROR',
    icon: 'search-x',
    tone: '#9F1239',
    title: 'We couldn’t find this page',
    desc: 'The page may have moved, or the link may be incorrect. Let’s help you find what you need.',
    links: true,
  },
  '403': {
    eyebrow: '403 ERROR',
    icon: 'lock',
    tone: '#9F1239',
    title: 'You don’t have access to this page',
    desc: 'This page may require additional permissions. You can return to the homepage or continue exploring PhysioBoo.',
    contact: true,
  },
  '500': {
    eyebrow: '500 ERROR',
    icon: 'circle-alert',
    tone: '#B42318',
    title: 'Something went wrong',
    desc: 'We’re sorry, but this page couldn’t be displayed right now. Please try again.',
    retry: {
      failTitle: 'It’s still not working',
      failBody: 'Trying again won’t always fix this. Please come back later.',
    },
  },
  '503': {
    eyebrow: '503 ERROR',
    icon: 'circle-pause',
    tone: '#8A5300',
    title: 'We’re temporarily unavailable',
    desc: 'This service isn’t available right now. Please try again in a little while.',
    hint: { icon: 'server', text: 'The problem is on our side, not with your device or internet connection.' },
    retry: {
      failTitle: 'Still unavailable',
      failBody: 'We don’t have a time for when it will be back. Please try again later.',
    },
  },
  network: {
    eyebrow: 'CONNECTION PROBLEM',
    icon: 'wifi-off',
    tone: '#55434B',
    title: 'We couldn’t connect',
    desc: 'Please check your connection and try again.',
    hint: { icon: 'smartphone', text: 'Your device may be offline, or the connection dropped. PhysioBoo itself may be working normally.' },
    retry: {
      failTitle: 'Still can’t connect',
      failBody: 'Check that Wi-Fi or mobile data is on, then try again.',
    },
  },
};

export function isExceptionCode(code: string | null | undefined): code is ExceptionCode {
  return !!code && Object.prototype.hasOwnProperty.call(EXCEPTION_CONTENT, code);
}
