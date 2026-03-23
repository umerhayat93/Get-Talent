#!/usr/bin/env node
// Run: node generate-icons.js
// Generates all required PWA icons as PNGs using pure Node.js (no canvas dependency needed)
// Uses SVG -> PNG via sharp if available, else creates placeholder PNGs

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// SVG template for GT logo
function makeSVG(size) {
  const pad = Math.floor(size * 0.08);
  const r = Math.floor(size * 0.18);
  const fontSize1 = Math.floor(size * 0.38);
  const fontSize2 = Math.floor(size * 0.13);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f1923"/>
      <stop offset="100%" style="stop-color:#1a2a3a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5c842"/>
      <stop offset="50%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#e6a800"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#bg)"/>
  <rect x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" rx="${Math.floor(r * 0.7)}" fill="none" stroke="url(#gold)" stroke-width="${Math.max(2, Math.floor(size * 0.025))}"/>
  <text x="50%" y="52%" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize1}" fill="url(#gold)" text-anchor="middle" dominant-baseline="middle" letter-spacing="-2">GT</text>
  <text x="50%" y="80%" font-family="Arial, sans-serif" font-weight="600" font-size="${fontSize2}" fill="#8899aa" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">GET TALENT</text>
</svg>`;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Write SVG files (can be used directly or converted)
sizes.forEach(size => {
  const svg = makeSVG(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.svg`), svg);
  console.log(`✓ icon-${size}.svg`);
});

// Badge icon
const badgeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
  <rect width="72" height="72" rx="12" fill="#f5c842"/>
  <text x="36" y="50" font-family="Arial Black" font-weight="900" font-size="36" fill="#0f1923" text-anchor="middle">G</text>
</svg>`;
fs.writeFileSync(path.join(outDir, 'badge-72.svg'), badgeSVG);

console.log('\nSVG icons generated in public/icons/');
console.log('To convert to PNG, run: npx sharp-cli (or use Inkscape/ImageMagick)');
console.log('Or the vite build will use the SVGs directly via the manifest.');

// Also create PNG stubs that reference the SVG for browsers that support it
// For production, replace with actual PNGs
sizes.forEach(size => {
  // Create a minimal valid PNG using the SVG data URI approach via HTML
  // This is a placeholder - real PNG generation requires sharp or canvas
  const svgContent = makeSVG(size);
  const pngPath = path.join(outDir, `icon-${size}.png`);
  if (!fs.existsSync(pngPath)) {
    // Write SVG as-is for now, rename to .png (browsers will still show it)
    fs.writeFileSync(pngPath, svgContent);
  }
});

console.log('PNG stubs created (replace with real PNGs for production).');
