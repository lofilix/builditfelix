/**
 * components/layout/Footer.tsx
 */
export default function Footer() {
  return (
    <footer
      className="text-center px-10 pt-[30px] pb-[40px]"
      style={{ borderTop: '1px solid rgba(255,128,0,0.06)' }}
    >
      <p className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--orange)' }}>builditfelix</span>
        {' · '}
        Built with <span style={{ color: 'var(--orange)' }}>♥</span>
        {' '}and too much coffee · Lix © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
