import React, { useEffect, useRef, useState } from 'react';

/**
 * A11yInspector (Development Only)
 * Hotkey: Ctrl + Alt + A (toggles overlay)
 * Scans DOM for common accessibility issues and visually highlights them.
 * Issues Detected:
 *  - Interactive elements without accessible name (button, a[href], input[type!=hidden], textarea)
 *  - Images without alt attribute
 *  - Empty headings or skipped heading levels
 *  - Elements with role=button but missing tabindex
 */
export default function A11yInspector() {
  const [enabled, setEnabled] = useState(false);
  const [issues, setIssues] = useState([]);
  const overlaysRef = useRef([]);
  const observerRef = useRef(null);
  const lastHeadingLevelRef = useRef(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return; // Safety guard

    const handler = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearOverlays();
      setIssues([]);
      if (observerRef.current) observerRef.current.disconnect();
      return;
    }

    scan();
    observerRef.current = new MutationObserver(() => {
      // Debounce low-cost re-scan
      if (scan._pending) return;
      scan._pending = true;
      requestAnimationFrame(() => { scan(); scan._pending = false; });
    });
    observerRef.current.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      clearOverlays();
    };
  }, [enabled]);

  const clearOverlays = () => {
    overlaysRef.current.forEach(el => el.remove());
    overlaysRef.current = [];
  };

  const addOverlay = (target, msg, severity='warn') => {
    const rect = target.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    const overlay = document.createElement('div');
    overlay.className = 'a11y-inspector-overlay';
    overlay.style.cssText = `
      position: fixed; 
      top:${rect.top + window.scrollY}px; 
      left:${rect.left + window.scrollX}px; 
      width:${rect.width}px; 
      height:${rect.height}px; 
      border:2px solid ${severity==='error' ? '#dc2626' : '#f59e0b'}; 
      background: rgba(255,255,255,0.03); 
      backdrop-filter: blur(1px); 
      z-index: 99998; 
      pointer-events:none; 
      box-sizing:border-box; 
    `;
    const label = document.createElement('div');
    label.style.cssText = `
      position:absolute; 
      top:-1.5rem; 
      left:0; 
      background:${severity==='error' ? '#dc2626' : '#f59e0b'}; 
      color:#fff; 
      font-size:11px; 
      padding:2px 6px; 
      border-radius:4px; 
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      white-space:nowrap; 
      box-shadow:0 2px 4px rgba(0,0,0,0.2);
    `;
    label.textContent = msg;
    overlay.appendChild(label);
    document.body.appendChild(overlay);
    overlaysRef.current.push(overlay);
  };

  const getAccessibleName = (el) => {
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').trim();
    if (el.getAttribute('aria-labelledby')) {
      const ref = document.getElementById(el.getAttribute('aria-labelledby'));
      if (ref) return ref.textContent.trim();
    }
    if (el.tagName === 'IMG' && el.alt) return el.alt.trim();
    const text = (el.textContent || '').trim();
    return text;
  };

  const scan = () => {
    clearOverlays();
    const found = [];
    lastHeadingLevelRef.current = null;

    // Interactive elements missing name
    const interactive = Array.from(document.querySelectorAll('button, a[href], input:not([type=hidden]), textarea, [role=button]'));
    interactive.forEach(el => {
      const name = getAccessibleName(el);
      if (!name) {
        found.push({ type: 'interactive-no-name', el });
        addOverlay(el, 'No accessible name', 'error');
      }
      if (el.getAttribute('role') === 'button' && !el.hasAttribute('tabindex')) {
        found.push({ type: 'role-button-missing-tabindex', el });
        addOverlay(el, 'role=button needs tabindex', 'warn');
      }
    });

    // Images without alt
    const images = Array.from(document.querySelectorAll('img'));
    images.forEach(img => {
      if (!img.hasAttribute('alt') || img.getAttribute('alt') === '') {
        found.push({ type: 'image-missing-alt', el: img });
        addOverlay(img, 'img missing alt', 'error');
      }
    });

    // Headings issues (empty or skipped levels)
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    headings.forEach(h => {
      const level = parseInt(h.tagName.substring(1), 10);
      if (!h.textContent.trim()) {
        found.push({ type: 'empty-heading', el: h });
        addOverlay(h, 'Empty heading', 'warn');
      }
      const last = lastHeadingLevelRef.current;
      if (last && level - last > 1) {
        found.push({ type: 'skipped-heading-level', el: h, detail: { last, level } });
        addOverlay(h, `Skipped from h${last} to h${level}`, 'warn');
      }
      lastHeadingLevelRef.current = level;
    });

    setIssues(found);
    logSummary(found);
  };

  const logSummary = (found) => {
    // eslint-disable-next-line no-console
    console.group('%cA11y Inspector Report', 'background:#2563eb;color:#fff;padding:2px 6px;border-radius:4px;');
    const counts = found.reduce((acc, i) => { acc[i.type] = (acc[i.type]||0)+1; return acc; }, {});
    Object.entries(counts).forEach(([k,v]) => console.log(`${k}: %c${v}`, 'font-weight:bold')); // eslint-disable-line no-console
    if (!found.length) console.log('%cNo issues detected in current viewport.', 'color:#16a34a;font-weight:bold;'); // eslint-disable-line no-console
    console.log('Hint: Toggle with Ctrl+Alt+A'); // eslint-disable-line no-console
    console.groupEnd();
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 99999, fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
      <button
        type="button"
        onClick={() => setEnabled(e => !e)}
        style={{
          background: enabled ? '#dc2626' : '#2563eb',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
        aria-pressed={enabled}
      >
        {enabled ? 'Disable A11y Inspector' : 'Enable A11y Inspector'} (Ctrl+Alt+A)
      </button>
      {enabled && (
        <div style={{ marginTop: 6, background: '#111827', color: '#f9fafb', padding: '6px 10px', borderRadius: 8, maxWidth: 260, lineHeight: 1.3 }}>
          <strong style={{ display: 'block', marginBottom: 4 }}>Issues: {issues.length}</strong>
          <div style={{ fontSize: 11, opacity: 0.85 }}>
            Highlights: missing names, alt text, empty or skipped headings
          </div>
        </div>
      )}
    </div>
  );
}
