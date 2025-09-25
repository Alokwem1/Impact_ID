import React, { useState, useEffect } from 'react';

// Ultra-minimal component to validate React hooks dispatcher
export default function BasicApp() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{fontFamily:'system-ui,sans-serif',padding:'2rem'}}>
      <h1>Basic App Diagnostic</h1>
      <p>Counter ticking proves hooks dispatcher is alive: {n}</p>
      <p>
        Query params:
        <code>?basic=1</code> (this view), <code>?minimal=1</code> (static), default full app (no params).
      </p>
    </div>
  );
}
