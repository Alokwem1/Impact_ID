// Ensures every part of the app shares the exact same React module instance.
// Avoids re-export * interop warning by explicitly enumerating exports.
import * as ReactAll from 'react';

if (typeof window !== 'undefined') {
  if (!window.__REACT_SINGLETON__) {
    window.__REACT_SINGLETON__ = ReactAll;
    console.log('[react-singleton] Registered primary React instance', ReactAll.version);
  } else if (window.__REACT_SINGLETON__ !== ReactAll) {
    console.warn('[react-singleton] React identity mismatch detected!');
    window.__REACT_SINGLETON_SECOND__ = ReactAll; // expose for inspection
  }
}

// Destructure common / documented React exports.
const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  // Some builds may include SuspenseList; guard existence
  SuspenseList,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_act,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
} = ReactAll;

export {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  SuspenseList,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_act,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
};

// Default export (common namespace form) for lines like: import React from './reactSingleton';
export default ReactAll;
