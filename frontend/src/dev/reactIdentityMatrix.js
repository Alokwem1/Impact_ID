/*
 * React Identity Matrix Diagnostic
 * ---------------------------------
 * Dynamically imports React in several forms (direct, cached, singleton wrapper)
 * and records strict equality relationships plus dispatcher object references.
 * Use window.__PRINT_REACT_ID_MATRIX__() in the browser console to inspect.
 */
/* eslint-disable no-console */

async function buildMatrix() {
  const direct1 = await import('react');
  const direct2 = await import('react'); // should be same module instance
  // Attempt to import via previously created singleton wrapper if it exists
  let singletonNS = null;
  try {
    singletonNS = await import('../reactSingleton.js');
  } catch (e) {
    // ignore if not present / moved
  }

  const reactDom = await import('react-dom');

  const dispatcher1 = direct1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher;
  const dispatcher2 = reactDom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher;

  const matrix = {
    time: new Date().toISOString(),
    versions: {
      react: direct1.version,
      'react-dom': reactDom.version || 'unknown'
    },
    equality: {
      direct1_eq_direct2: direct1 === direct2,
      direct1_eq_singleton: singletonNS ? (direct1 === singletonNS.default) : 'singleton-missing',
      direct2_eq_singleton: singletonNS ? (direct2 === singletonNS.default) : 'singleton-missing'
    },
    hookFnsEquality: singletonNS ? {
      useState: direct1.useState === singletonNS.useState,
      useEffect: direct1.useEffect === singletonNS.useEffect,
      useRef: direct1.useRef === singletonNS.useRef
    } : 'singleton-missing',
    dispatchers: {
      react_dispatcher_defined: !!dispatcher1?.current,
      reactDom_dispatcher_defined: !!dispatcher2?.current,
      same_dispatcher_object: dispatcher1 === dispatcher2,
    },
    reactKeysSample: Object.keys(direct1).slice(0, 15),
  };

  // Persist / append for historical comparison
  const store = (window.__REACT_ID_MATRIX__ = window.__REACT_ID_MATRIX__ || []);
  store.push(matrix);

  if (store.length === 1) {
    console.log('[react-id-matrix] React identity matrix captured:', matrix);
  } else {
    console.warn('[react-id-matrix] Additional capture (possible re-evaluation?)', matrix);
  }

  window.__PRINT_REACT_ID_MATRIX__ = () => {
    console.table(store.map((m, i) => ({
      i,
      time: m.time,
      react: m.versions.react,
      reactDom: m.versions['react-dom'],
      d1_eq_d2: m.equality.direct1_eq_direct2,
      d1_eq_singleton: m.equality.direct1_eq_singleton,
      dispatcher_same: m.dispatchers.same_dispatcher_object,
      dispatcher_active: m.dispatchers.react_dispatcher_defined || m.dispatchers.reactDom_dispatcher_defined
    })));
    return store;
  };
}

// Schedule after current microtask to ensure early but after initial module graph stabilizes
if (typeof window !== 'undefined') {
  Promise.resolve().then(buildMatrix);
}

export {}; // side-effect only
