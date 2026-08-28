const FLAG_CODES: Record<string, string> = {
  in: "in",
  us: "us",
  arab: "sa",
  id: "id",
  sg: "sg",
  tr: "tr",
  kr: "kr",
  uk: "gb",
};

const FLAG_WIDTH = 28;
const FLAG_HEIGHT = 20;

type SketchFlagProps = {
  id: string;
};

export function SketchFlag({ id }: SketchFlagProps) {
  const code = FLAG_CODES[id] ?? id;
  const src = `https://flagcdn.com/w80/${code}.png`;

  return (
    <g>
      <defs>
        <clipPath id={`flag-clip-${id}`}>
          <rect width={FLAG_WIDTH} height={FLAG_HEIGHT} rx="2.5" />
        </clipPath>
      </defs>
      <rect
        width={FLAG_WIDTH}
        height={FLAG_HEIGHT}
        rx="2.5"
        className="fill-background stroke-foreground/20"
        strokeWidth="0.5"
      />
      <image
        href={src}
        width={FLAG_WIDTH}
        height={FLAG_HEIGHT}
        clipPath={`url(#flag-clip-${id})`}
        preserveAspectRatio="xMidYMid slice"
      />
    </g>
  );
}
