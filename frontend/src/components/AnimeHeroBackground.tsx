export default function AnimeHeroBackground() {
    return (
        <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#12071f" />
                    <stop offset="45%" stopColor="#1c0f33" />
                    <stop offset="100%" stopColor="#2a0e3d" />
                </linearGradient>
                <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="cityFar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#241436" />
                    <stop offset="100%" stopColor="#150a24" />
                </linearGradient>
                <linearGradient id="cityNear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a0d2b" />
                    <stop offset="100%" stopColor="#0c0614" />
                </linearGradient>
                <linearGradient id="fadeBottom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0a0f" stopOpacity="0" />
                    <stop offset="100%" stopColor="#0a0a0f" stopOpacity="1" />
                </linearGradient>
            </defs>

            {/* Sky */}
            <rect width="1600" height="900" fill="url(#skyGrad)" />

            {/* Stars */}
            {Array.from({ length: 60 }).map((_, i) => {
                const x = (i * 137.5) % 1600;
                const y = (i * 79.3) % 420;
                const r = (i % 3) * 0.5 + 0.6;
                return <circle key={i} cx={x} cy={y} r={r} fill="#e9d5ff" opacity={0.5} />;
            })}

            {/* Moon glow */}
            <circle cx="1180" cy="220" r="260" fill="url(#moonGlow)" />
            <circle cx="1180" cy="220" r="70" fill="#f5e9ff" opacity="0.9" />

            {/* Far skyline */}
            <g fill="url(#cityFar)">
                <rect x="0" y="520" width="90" height="260" />
                <rect x="100" y="470" width="60" height="310" />
                <rect x="170" y="540" width="110" height="240" />
                <rect x="300" y="490" width="70" height="290" />
                <rect x="390" y="560" width="130" height="220" />
                <rect x="540" y="500" width="80" height="280" />
                <rect x="640" y="545" width="100" height="235" />
                <rect x="760" y="480" width="65" height="300" />
                <rect x="850" y="530" width="120" height="250" />
                <rect x="990" y="500" width="75" height="280" />
                <rect x="1080" y="555" width="95" height="225" />
                <rect x="1290" y="500" width="90" height="280" />
                <rect x="1400" y="540" width="110" height="240" />
                <rect x="1530" y="480" width="70" height="300" />
            </g>

            {/* Near skyline with lit windows */}
            <g>
                {[
                    { x: 40, y: 620, w: 130, h: 200 },
                    { x: 190, y: 560, w: 90, h: 260 },
                    { x: 300, y: 640, w: 150, h: 180 },
                    { x: 470, y: 580, w: 100, h: 240 },
                    { x: 600, y: 660, w: 170, h: 160 },
                    { x: 800, y: 590, w: 110, h: 230 },
                    { x: 930, y: 650, w: 140, h: 170 },
                    { x: 1100, y: 600, w: 95, h: 220 },
                    { x: 1220, y: 660, w: 160, h: 160 },
                    { x: 1410, y: 580, w: 120, h: 240 },
                ].map((b, i) => (
                    <g key={i}>
                        <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#cityNear)" />
                        {Array.from({ length: Math.floor((b.w * b.h) / 900) }).map((_, wi) => {
                            const cols = Math.max(2, Math.floor(b.w / 14));
                            const cx = b.x + 6 + (wi % cols) * 14;
                            const cy = b.y + 8 + Math.floor(wi / cols) * 18;
                            if (cy > b.y + b.h - 8) return null;
                            const lit = (i * 7 + wi * 3) % 5 === 0;
                            return (
                                <rect
                                    key={wi}
                                    x={cx}
                                    y={cy}
                                    width="6"
                                    height="9"
                                    fill={lit ? "#e879f9" : "#3b1f57"}
                                    opacity={lit ? 0.85 : 0.35}
                                />
                            );
                        })}
                    </g>
                ))}
            </g>

            {/* Character silhouette (headphones anime girl, simplified) */}
            <g transform="translate(1180,560)" opacity="0.9">
                <ellipse cx="0" cy="120" rx="220" ry="180" fill="#0e0618" opacity="0.55" />
                <path
                    d="M -70 260 C -90 140 -60 40 0 10 C 60 40 90 140 70 260 Z"
                    fill="#160a24"
                />
                <circle cx="0" cy="-10" r="95" fill="#1a0d2b" />
                <path
                    d="M -95 -10 C -110 -110 -40 -170 0 -170 C 55 -170 115 -110 95 -10 C 90 60 60 90 0 95 C -60 90 -90 60 -95 -10 Z"
                    fill="#20112f"
                />
                <path
                    d="M -95 -20 C -140 10 -150 90 -110 150 C -95 100 -100 40 -95 -20 Z"
                    fill="#20112f"
                />
                <circle cx="-95" cy="-5" r="26" fill="#2a1640" />
                <circle cx="95" cy="-5" r="26" fill="#2a1640" />
                <rect x="-108" y="-30" width="12" height="55" rx="6" fill="#2a1640" />
                <rect x="96" y="-30" width="12" height="55" rx="6" fill="#2a1640" />
            </g>

            {/* Bottom fade to match page background */}
            <rect width="1600" height="900" fill="url(#fadeBottom)" />
        </svg>
    );
}