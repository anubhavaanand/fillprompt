// Renders brand images from SVG: the default social share image, the touch icon,
// the Ko-fi QR for the donate page, and the Ko-fi profile and cover images.
// Run: node scripts/og.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import QRCode from 'qrcode';

const KOFI = 'https://ko-fi.com/mwrazzuwan';
const INK = '#151412';
const PAPER = '#f3f0e8';
const MARK = '#ffd83d';
const SANS = 'Arial, Helvetica, sans-serif';
const MONO = "Consolas, 'Courier New', monospace";

// The bracket mark, drawn on a 32-unit grid.
const mark = (stroke) => `<rect x="12.5" y="11" width="7" height="10" fill="${MARK}"/>
  <path d="M12 6.5H7.5v19H12M20 6.5h4.5v19H20" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="square"/>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  <rect width="1200" height="14" fill="${INK}"/>
  <g transform="translate(80 84) scale(2.6)">${mark(INK)}</g>
  <text x="178" y="143" font-family="${SANS}" font-weight="800" font-size="46" fill="${INK}">mytemplate.my</text>
  <text x="80" y="310" font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-4" fill="${INK}">AI prompts,</text>
  <rect x="72" y="342" width="770" height="128" fill="${MARK}"/>
  <text x="80" y="440" font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-4" fill="${INK}">ready to copy.</text>
  <text x="80" y="548" font-family="${MONO}" font-size="30" letter-spacing="3" fill="#625d54">FREE · NO ACCOUNT · IMAGES · TEXT · AGENT SKILLS</text>
</svg>`;

// Ko-fi profile picture: the mark on ink, with room for a circular crop.
const profile = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="${INK}"/>
  <g transform="translate(160 160) scale(15)">${mark(PAPER)}</g>
</svg>`;

// Ko-fi cover: the content sits in the middle band so it survives cropping on narrow screens.
const cover = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="600" viewBox="0 0 1800 600">
  <rect width="1800" height="600" fill="${PAPER}"/>
  <rect width="1800" height="16" fill="${INK}"/>
  <rect y="584" width="1800" height="16" fill="${INK}"/>
  <g transform="translate(470 204) scale(6)">${mark(INK)}</g>
  <text x="690" y="318" font-family="${SANS}" font-weight="800" font-size="104" letter-spacing="-4" fill="${INK}">mytemplate.my</text>
  <rect x="686" y="352" width="490" height="58" fill="${MARK}"/>
  <text x="698" y="394" font-family="${MONO}" font-size="30" letter-spacing="2" fill="${INK}">AI PROMPTS, READY TO COPY</text>
</svg>`;

mkdirSync('brand', { recursive: true });
await sharp(Buffer.from(og)).png().toFile('public/og.png');
await sharp('public/favicon.svg', { density: 400 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(profile)).png().toFile('brand/kofi-profile.png');
await sharp(Buffer.from(cover)).jpeg({ quality: 90 }).toFile('brand/kofi-cover.jpg');
writeFileSync(
  'public/donate/qr-kofi.svg',
  await QRCode.toString(KOFI, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: INK, light: '#ffffff' } }),
);
console.log('wrote og.png, apple-touch-icon.png, donate/qr-kofi.svg, brand/kofi-profile.png, brand/kofi-cover.jpg');
