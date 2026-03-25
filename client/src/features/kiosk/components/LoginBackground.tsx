export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-44 -left-44 h-130 w-130 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(22,184,161,0.2) 0%, rgba(22,184,161,0.08) 46%, rgba(22,184,161,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-52 -right-52 h-155 w-155 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(14,159,137,0.16) 0%, rgba(14,159,137,0.06) 50%, rgba(14,159,137,0) 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#0f766e 1px, transparent 1px), linear-gradient(90deg, #0f766e 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
    </div>
  );
}
