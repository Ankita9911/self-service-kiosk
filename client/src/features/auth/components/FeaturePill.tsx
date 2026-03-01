export function FeaturePill({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white/8 backdrop-blur-sm border border-white/12 rounded-xl px-4 py-2.5">
      <Icon className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" />
      <span className="text-[13px]">{text}</span>
    </div>
  );
}