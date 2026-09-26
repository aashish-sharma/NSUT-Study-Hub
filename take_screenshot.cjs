const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1024, height: 768 },
    headless: true,
  });
  const page = await browser.newPage();

  // ── DARK MODE (default for this app) ──────────────────────────────
  await page.goto('http://localhost:5173/subject/mathematics-1', { waitUntil: 'networkidle0', timeout: 15000 });

  // Scroll down a bit so the Syllabus section with its link row is visible
  await page.evaluate(() => window.scrollBy(0, 300));
  await new Promise(r => setTimeout(r, 300));

  // Screenshot: unchecked state (dark)
  await page.screenshot({ path: 'd:\\NSUT WEBSITE\\ss_dark_unchecked.png' });

  // Click the first done-toggle button to check it
  const btns = await page.$$('button[aria-label="Mark as done"]');
  if (btns.length > 0) {
    await btns[0].click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Screenshot: checked state (dark)
  await page.screenshot({ path: 'd:\\NSUT WEBSITE\\ss_dark_checked.png' });

  // ── LIGHT MODE ────────────────────────────────────────────────────
  // Toggle theme by clicking the theme button (moon/sun icon in header)
  const themeBtn = await page.$('button[aria-label*="theme"], button[aria-label*="Theme"], button[aria-label*="mode"], button[aria-label*="Mode"]');
  if (themeBtn) {
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  } else {
    // Fallback: set data-theme to light directly
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await new Promise(r => setTimeout(r, 500));
  }

  // Screenshot: checked state (light)
  await page.screenshot({ path: 'd:\\NSUT WEBSITE\\ss_light_checked.png' });

  // Uncheck it
  const btns2 = await page.$$('button[aria-label="Mark as undone"]');
  if (btns2.length > 0) {
    await btns2[0].click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Screenshot: unchecked state (light)
  await page.screenshot({ path: 'd:\\NSUT WEBSITE\\ss_light_unchecked.png' });

  await browser.close();
  console.log("All 4 screenshots saved.");
})();
