// Runtime diagnostic to detect multiple React copies or dispatcher issues.
// Collects fingerprints of React exports each time this module is evaluated.
/* eslint-disable no-console */
import * as React from "react";

if (typeof window !== "undefined") {
  const registry = (window.__REACT_DUP_CHECK__ = window.__REACT_DUP_CHECK__ || []);
  const fingerprint = {
    time: new Date().toISOString(),
    version: React.version,
    useRefType: typeof React.useRef,
    useEffectType: typeof React.useEffect,
    hasDispatcher: !!(React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current),
    symbolFragment: React.Fragment,
    keysSample: Object.keys(React).slice(0, 12),
  };
  registry.push(fingerprint);
  if (registry.length > 1) {
    console.warn("[react-dup-diagnostic] Multiple React module evaluations detected:", registry);
  } else {
    console.log("[react-dup-diagnostic] React fingerprint registered", fingerprint);
  }
  // Expose a helper for manual inspection
  window.__PRINT_REACT_FINGERPRINTS__ = () => {
    console.table(registry);
    return registry;
  };
}

export {}; // side-effect only
