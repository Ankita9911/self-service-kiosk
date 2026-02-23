export default function LoginBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #f97316 0%, #ea580c 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, #fb923c 0%, #f97316 50%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}