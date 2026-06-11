export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html, body { overflow: auto !important; }`}</style>
      {children}
    </>
  );
}
