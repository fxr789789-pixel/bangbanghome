type BrandLogoProps = {
  compact?: boolean;
  inverted?: boolean;
};

export function BrandLogo({ compact = false, inverted = false }: BrandLogoProps) {
  const textColor = inverted ? "text-white" : "text-ink";
  const subColor = inverted ? "text-white/75" : "text-mint";

  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      {!compact && (
        <div className="leading-tight">
          <p className={`text-base font-black ${textColor}`}>帮帮</p>
          <p className={`text-xs font-bold ${subColor}`}>有事找帮帮</p>
        </div>
      )}
    </div>
  );
}

export function LogoMark() {
  return (
    <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint shadow-soft">
      <svg
        aria-hidden="true"
        className="h-11 w-11"
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="3" y="3" width="66" height="66" rx="18" fill="#13B889" />
        <path
          d="M20 29c4-8 11-11 16-5 5-6 12-3 16 5"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          x="36"
          y="42"
          fill="white"
          fontFamily="Arial, 'Microsoft YaHei', sans-serif"
          fontSize="18"
          fontWeight="900"
          textAnchor="middle"
        >
          帮帮
        </text>
        <text
          x="36"
          y="54"
          fill="white"
          fontFamily="Arial, 'Microsoft YaHei', sans-serif"
          fontSize="7"
          fontWeight="800"
          textAnchor="middle"
          letterSpacing="0"
        >
          有事找帮帮
        </text>
      </svg>
    </div>
  );
}
