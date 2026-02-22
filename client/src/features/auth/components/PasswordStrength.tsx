import { CheckCircle2 } from "lucide-react";

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const strength =
    score <= 1 ? "Weak" :
    score === 2 ? "Fair" :
    score === 3 ? "Good" :
    "Strong";

  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-500",
  ];

  const textColors = [
    "text-red-500",
    "text-orange-500",
    "text-yellow-600",
    "text-emerald-600",
  ];

  if (!password) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i < score ? colors[score - 1] : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`flex items-center gap-1 text-[11px] ${
                c.pass ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {c.label}
            </span>
          ))}
        </div>

        <span className={`text-[11px] ${textColors[score - 1]}`}>
          {strength}
        </span>
      </div>
    </div>
  );
}