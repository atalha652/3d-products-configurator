export interface SvgAsset {
  id: string;
  label: string;
  svg: string;
}

export interface StickerAsset {
  id: string;
  label: string;
  value: string;
}

const svg = (content: string, viewBox = '0 0 200 200') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`;

export const IMAGE_ASSETS: SvgAsset[] = [
  {
    id: 'sunset',
    label: 'Sunset',
    svg: svg(`
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fb7185"/><stop offset="1" stop-color="#fbbf24"/></linearGradient></defs>
      <rect width="200" height="200" rx="24" fill="url(#sky)"/>
      <circle cx="100" cy="82" r="34" fill="#fff7ed"/>
      <path d="M0 135L48 94l35 31 28-22 89 55v42H0z" fill="#7c2d12" opacity=".72"/>
      <path d="M0 162c34-15 64-15 100 0s67 15 100 0v38H0z" fill="#431407"/>
    `)
  },
  {
    id: 'mountains',
    label: 'Mountains',
    svg: svg(`
      <rect width="200" height="200" rx="24" fill="#dbeafe"/>
      <circle cx="150" cy="48" r="25" fill="#fef3c7"/>
      <path d="M-10 176L63 63l44 67 25-35 78 105H-10z" fill="#334155"/>
      <path d="M38 101l25-38 20 31-13-5-8 12-9-12zM112 123l20-28 21 29-12-5-9 10-8-10z" fill="#f8fafc"/>
      <path d="M0 165c38-16 73-7 101 4 31 13 61 13 99-2v33H0z" fill="#166534"/>
    `)
  },
  {
    id: 'botanical',
    label: 'Botanical',
    svg: svg(`
      <rect width="200" height="200" rx="24" fill="#f0fdf4"/>
      <path d="M99 180C96 118 101 67 133 28M101 143c-23-18-36-39-39-65M110 107c25-14 41-35 48-62" fill="none" stroke="#166534" stroke-width="8" stroke-linecap="round"/>
      <ellipse cx="66" cy="71" rx="24" ry="37" transform="rotate(-37 66 71)" fill="#4ade80"/>
      <ellipse cx="143" cy="42" rx="24" ry="37" transform="rotate(40 143 42)" fill="#22c55e"/>
      <ellipse cx="144" cy="91" rx="21" ry="34" transform="rotate(53 144 91)" fill="#86efac"/>
      <ellipse cx="78" cy="127" rx="21" ry="34" transform="rotate(-47 78 127)" fill="#16a34a"/>
    `)
  },
  {
    id: 'retro-wave',
    label: 'Retro',
    svg: svg(`
      <rect width="200" height="200" rx="24" fill="#312e81"/>
      <circle cx="100" cy="85" r="46" fill="#fb7185"/>
      <path d="M54 75h92M55 90h90M62 105h76" stroke="#312e81" stroke-width="7"/>
      <path d="M0 143l45-38 34 29 26-19 32 25 26-18 37 29v49H0z" fill="#111827"/>
      <path d="M0 160h200M25 145L5 200M65 138l-8 62M105 128v72M145 139l9 61M180 144l20 48" stroke="#a78bfa" stroke-width="3"/>
    `)
  }
];

export const ICON_ASSETS: SvgAsset[] = [
  {
    id: 'heart',
    label: 'Heart',
    svg: svg('<path d="M100 172S22 127 22 72c0-37 47-55 78-18 31-37 78-19 78 18 0 55-78 100-78 100z" fill="#ef4444"/>')
  },
  {
    id: 'star',
    label: 'Star',
    svg: svg('<path d="M100 14l26 54 60 9-43 42 10 60-53-28-53 28 10-60-43-42 60-9z" fill="#f59e0b"/>')
  },
  {
    id: 'lightning',
    label: 'Bolt',
    svg: svg('<path d="M112 10L35 116h55l-8 74 83-113h-57z" fill="#facc15" stroke="#a16207" stroke-width="6" stroke-linejoin="round"/>')
  },
  {
    id: 'smile',
    label: 'Smile',
    svg: svg('<circle cx="100" cy="100" r="84" fill="#fde047"/><circle cx="70" cy="78" r="10" fill="#111827"/><circle cx="130" cy="78" r="10" fill="#111827"/><path d="M55 116c13 42 77 42 90 0" fill="none" stroke="#111827" stroke-width="10" stroke-linecap="round"/>')
  },
  {
    id: 'crown',
    label: 'Crown',
    svg: svg('<path d="M25 63l43 34 32-67 32 67 43-34-17 99H42z" fill="#fbbf24" stroke="#92400e" stroke-width="6" stroke-linejoin="round"/><circle cx="100" cy="30" r="10" fill="#fb7185"/>')
  },
  {
    id: 'peace',
    label: 'Peace',
    svg: svg('<circle cx="100" cy="100" r="78" fill="none" stroke="#8b5cf6" stroke-width="14"/><path d="M100 23v154M100 105l-55 48M100 105l55 48" fill="none" stroke="#8b5cf6" stroke-width="14" stroke-linecap="round"/>')
  }
];

export const STICKER_ASSETS: StickerAsset[] = [
  { id: 'fire', label: 'Fire', value: '🔥' },
  { id: 'rocket', label: 'Rocket', value: '🚀' },
  { id: 'rainbow', label: 'Rainbow', value: '🌈' },
  { id: 'sunflower', label: 'Flower', value: '🌻' },
  { id: 'sparkles', label: 'Sparkles', value: '✨' },
  { id: 'cool', label: 'Cool', value: '😎' },
  { id: 'butterfly', label: 'Butterfly', value: '🦋' },
  { id: 'pizza', label: 'Pizza', value: '🍕' }
];
