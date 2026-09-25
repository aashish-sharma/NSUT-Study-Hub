// WCAG Contrast calculation
function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return { r, g, b };
}

function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
          ? v / 12.92
          : Math.pow( (v + 0.055) / 1.055, 2.4 );
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function formatResult(name, bg, text, contrast) {
  const pass = contrast >= 4.5 ? "✅" : "❌";
  return `| ${name.padEnd(45)} | ${bg.padEnd(8)} | ${text.padEnd(8)} | ${contrast.toFixed(2).padEnd(6)} | ${pass} |`;
}

console.log("| Element & State                               | BG       | Text     | Ratio  | Pass |");
console.log("|-----------------------------------------------|----------|----------|--------|------|");

// LIGHT MODE - Default sections
const L_BG = "#EAF5DF";
const L_SURFACE = "#F7FBF1";
const L_BTN = "#17261C";
const L_BTN_TEXT = "#F3FAEA";
const L_BTN_HOVER = "#293D2F";

console.log(formatResult("Light Mode - Button Default", L_BTN, L_BTN_TEXT, contrastRatio(L_BTN, L_BTN_TEXT)));
console.log(formatResult("Light Mode - Button Hover", L_BTN_HOVER, L_BTN_TEXT, contrastRatio(L_BTN_HOVER, L_BTN_TEXT)));

// LIGHT MODE - Lime section
const L_LIME = "#B9F27C";
const L_LIME_BTN = "#14231A";
const L_LIME_BTN_HOVER = "#1F3628";

console.log(formatResult("Light Mode (Lime Sec) - Button Default", L_LIME_BTN, L_BTN_TEXT, contrastRatio(L_LIME_BTN, L_BTN_TEXT)));
console.log(formatResult("Light Mode (Lime Sec) - Button Hover", L_LIME_BTN_HOVER, L_BTN_TEXT, contrastRatio(L_LIME_BTN_HOVER, L_BTN_TEXT)));


// DARK MODE - Default sections
const D_BG = "#0E1610";
const D_BTN = "#B9F27C";
const D_BTN_TEXT = "#0E1610";
const D_BTN_HOVER = "#9CD562";

console.log(formatResult("Dark Mode - Button Default", D_BTN, D_BTN_TEXT, contrastRatio(D_BTN, D_BTN_TEXT)));
console.log(formatResult("Dark Mode - Button Hover", D_BTN_HOVER, D_BTN_TEXT, contrastRatio(D_BTN_HOVER, D_BTN_TEXT)));

// DARK MODE - Lime section (Same as light mode lime section)
console.log(formatResult("Dark Mode (Lime Sec) - Button Default", L_LIME_BTN, L_BTN_TEXT, contrastRatio(L_LIME_BTN, L_BTN_TEXT)));
console.log(formatResult("Dark Mode (Lime Sec) - Button Hover", L_LIME_BTN_HOVER, L_BTN_TEXT, contrastRatio(L_LIME_BTN_HOVER, L_BTN_TEXT)));

// Name Dialog Skip Button (Text Button on Surface)
const L_MUTED = "#465849";
const D_MUTED = "#A2B3A0";
const D_SURFACE = "#16211A";

console.log(formatResult("Light Mode - Dialog Skip (Default)", L_SURFACE, L_MUTED, contrastRatio(L_SURFACE, L_MUTED)));
console.log(formatResult("Dark Mode - Dialog Skip (Default)", D_SURFACE, D_MUTED, contrastRatio(D_SURFACE, D_MUTED)));
