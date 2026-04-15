/**
 * components/ui/SectionDivider.tsx
 * The 1px gradient line between sections. Capped at 600px, centered.
 */
export default function SectionDivider() {
  return (
    <div
      className="h-px max-w-[600px] mx-auto"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,128,0,0.15), transparent)',
      }}
    />
  );
}
