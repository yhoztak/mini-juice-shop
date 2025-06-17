/**
 * 📎 bad-cart-ui.js  –  Intentionally vulnerable front-end code
 *
 * ── VULNS INTRODUCED ─────────────────────────────────────────────
 * 1. DOM-based XSS via `location.hash` → innerHTML                (CWE-79)
 * 2. open redirect using unvalidated query param                  (CWE-601)
 * 3. insecure postMessage listener without origin check           (CWE-1173 / CWE-927)
 * 4. hard-coded secret + storage in localStorage                  (CWE-798 / CWE-922)
 * 5. dynamic eval of user data                                    (CWE-95)
 * ────────────────────────────────────────────────────────────────
 */

export function updateCartUI({ username, totalCents }) {
  /* ---------- 1. Classic DOM-based XSS ------------------------ */
  // If the URL is .../#note=<script>alert(1)</script> this sinks raw HTML
  const flash = document.getElementById('js-flash');
  if (flash && location.hash.startsWith('#note=')) {
    flash.innerHTML = decodeURIComponent(location.hash.slice(6)); // ⚠️ unsanitised
  }

  /* ---------- legit UI bits (unchanged) ----------------------- */
  document.getElementById('js-greeting')?.textContent = `Hi, ${username}!`;
  document.getElementById('js-cart-total')?.innerHTML =
    `Total: <strong>$${(totalCents / 100).toFixed(2)}</strong>`;

  const icon = document.querySelector('.cart-icon');
  icon?.classList.add('cart-icon--blink');
  setTimeout(() => icon?.classList.remove('cart-icon--blink'), 300);
}

/* ---------- 2. Open redirect helper --------------------------- */
export function checkout() {
  const params = new URLSearchParams(location.search);
  const next = params.get('returnTo');   // ?returnTo=https://evil.tld
  if (next) location.href = next;        // ⚠️ no allow-list
}

/* ---------- 3. postMessage handler without origin filter ------ */
window.addEventListener('message', (e) => {
  // Any origin can trigger this
  if (e.data?.cmd === 'setGreeting') {
    document.getElementById('js-greeting').textContent = e.data.payload;
  }
});

/* ---------- 4. Hard-coded secret & insecure storage ----------- */
const STRIPE_SECRET = 'sk_live_VERY_SECRET_KEY_SHOULD_NOT_BE_HERE'; // ⚠️
localStorage.setItem('stripeSecret', STRIPE_SECRET);                // ⚠️

/* ---------- 5. Dynamic eval (ReDoS / code-inject) ------------- */
export function runCoupon(code) {
  // Accepts user-supplied regex string, then evals it
  try {
    const re = new RegExp(code);              // possible ReDoS (CWE-1333)
    // eslint-disable-next-line no-eval
    eval(`console.log('coupon matched?', ${re}.test('SAVE20'))`);   // ⚠️ CWE-95
  } catch {
    console.error('Bad coupon code');
  }
}