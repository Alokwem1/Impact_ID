import React from 'react';

export default function SimpleRoutesPlaceholder() {
  return (
    <div style={{padding:'2rem', fontFamily:'system-ui,sans-serif'}}>
      <h1 style={{fontSize:'1.25rem', marginBottom:'0.5rem'}}>Simple Diagnostic Routes</h1>
      <p>This mode skips all lazy() route chunk imports to isolate a potential React dispatcher conflict.</p>
      <ul style={{marginTop:'1rem', lineHeight:1.5}}>
        <li><a href="/login">/login</a></li>
        <li><a href="/dashboard">/dashboard</a></li>
        <li><a href="/?full=1">Return to full app</a></li>
      </ul>
      <p style={{marginTop:'1rem', fontSize:'0.8rem', opacity:0.7}}>Append <code>?simple=1</code> to toggle this diagnostic.</p>
    </div>
  );
}
