// MinimalApp.jsx
// Diagnostic minimal React tree to isolate hook dispatcher issues.
import React from "react";

export default function MinimalApp() {
  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding:'2rem'}}>
      <h1 style={{fontSize:'1.5rem', marginBottom:'0.5rem'}}>Minimal App Diagnostic</h1>
      <p>If this screen renders without hook errors, the issue lies inside the full App composition.</p>
      <p>Append <code>?minimal=1</code> to the URL anytime to return here.</p>
    </div>
  );
}
