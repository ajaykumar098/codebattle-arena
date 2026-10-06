// WCAG 2.1 Relative Luminance and Contrast Ratio Calculator
// Dependency-free, Node.js

function relativeLuminance(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Apply sRGB to linear RGB transformation
  const toLinear = (c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);

  // Calculate relative luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(hex1, hex2) {
  const L1 = relativeLuminance(hex1);
  const L2 = relativeLuminance(hex2);

  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Define palette
const palette = {
  ground: '#0a0a0a',
  surface: '#121212',
  border: '#6b7280', // Gray-500 equivalent for 3:1 contrast
  textPrimary: '#e5e5e5',
  textSecondary: '#a1a1aa',
  accent: '#f59e0b',
  accentMuted: '#b45309',
  success: '#10b981',
  error: '#f43f5e',
  // TLE/Running will use a neutral tone - let's define it
  neutral: '#8b5cf6', // violet (will adjust if contrast fails)
};

// Define all text/background pairs to check
const textPairs = [
  { name: 'Text primary on ground', text: palette.textPrimary, bg: palette.ground, min: 4.5 },
  { name: 'Text primary on surface', text: palette.textPrimary, bg: palette.surface, min: 4.5 },
  { name: 'Text secondary on ground', text: palette.textSecondary, bg: palette.ground, min: 4.5 },
  { name: 'Text secondary on surface', text: palette.textSecondary, bg: palette.surface, min: 4.5 },
  { name: 'Accent on ground', text: palette.accent, bg: palette.ground, min: 3.0 },
  { name: 'Accent on surface', text: palette.accent, bg: palette.surface, min: 3.0 },
  { name: 'Accent muted on ground', text: palette.accentMuted, bg: palette.ground, min: 3.0 },
  { name: 'Accent muted on surface', text: palette.accentMuted, bg: palette.surface, min: 3.0 },
  { name: 'Success on ground', text: palette.success, bg: palette.ground, min: 3.0 },
  { name: 'Success on surface', text: palette.success, bg: palette.surface, min: 3.0 },
  { name: 'Error on ground', text: palette.error, bg: palette.ground, min: 3.0 },
  { name: 'Error on surface', text: palette.error, bg: palette.surface, min: 3.0 },
  { name: 'Neutral on ground', text: palette.neutral, bg: palette.ground, min: 3.0 },
  { name: 'Neutral on surface', text: palette.neutral, bg: palette.surface, min: 3.0 },
  { name: 'Ground on accent (text on amber bg)', text: palette.ground, bg: palette.accent, min: 4.5 },
];

// Define border/background pairs (UI components need 3:1)
const borderPairs = [
  { name: 'Border on ground', border: palette.border, bg: palette.ground, min: 3.0 },
  { name: 'Border on surface', border: palette.border, bg: palette.surface, min: 3.0 },
  { name: 'Accent on ground (focus ring)', border: palette.accent, bg: palette.ground, min: 3.0 },
  { name: 'Accent on surface (focus ring)', border: palette.accent, bg: palette.surface, min: 3.0 },
];

console.log('='.repeat(80));
console.log('WCAG Contrast Ratio Analysis');
console.log('='.repeat(80));
console.log('');

console.log('TEXT ON BACKGROUND (4.5:1 for normal text, 3:1 for large text/components)');
console.log('-'.repeat(80));
textPairs.forEach(pair => {
  const ratio = contrastRatio(pair.text, pair.bg);
  const pass = ratio >= pair.min ? 'PASS' : 'FAIL';
  console.log(`${pair.name.padEnd(40)} ${ratio.toFixed(2).padStart(6)}:1  ${pass}`);
});

console.log('');
console.log('BORDER ON BACKGROUND (3:1 for UI components)');
console.log('-'.repeat(80));
borderPairs.forEach(pair => {
  const ratio = contrastRatio(pair.border, pair.bg);
  const pass = ratio >= pair.min ? 'PASS' : 'FAIL';
  console.log(`${pair.name.padEnd(40)} ${ratio.toFixed(2).padStart(6)}:1  ${pass}`);
});

console.log('');
console.log('='.repeat(80));
