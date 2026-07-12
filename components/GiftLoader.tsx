// Cute centered animated gift used as the Suspense fallback across routes.
// Pure inline SVG + CSS (no network/gif) so it paints instantly.
export function GiftLoader({ label = "Wrapping up…" }: { label?: string }) {
  return (
    <div className="gift-loader">
      <div className="gift-loader-inner">
        <svg
          className="gift-loader-svg"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
        >
          {/* bow */}
          <g className="gift-loader-bow">
            <path
              d="M60 34c-6-14-26-14-26-2 0 8 14 10 26 2Z"
              fill="#f472b6"
              stroke="#db2777"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M60 34c6-14 26-14 26-2 0 8-14 10-26 2Z"
              fill="#f472b6"
              stroke="#db2777"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="34" r="5" fill="#ec4899" stroke="#db2777" strokeWidth="2" />
          </g>

          {/* box lid */}
          <rect x="26" y="40" width="68" height="18" rx="4" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
          {/* box body */}
          <rect x="32" y="56" width="56" height="48" rx="4" fill="#fce7f3" stroke="#db2777" strokeWidth="2" />
          {/* ribbon vertical */}
          <rect x="55" y="40" width="10" height="64" fill="#f9a8d4" stroke="#db2777" strokeWidth="2" />
        </svg>

        {/* floating sparkles */}
        <span className="gift-loader-spark gift-loader-spark--1">✦</span>
        <span className="gift-loader-spark gift-loader-spark--2">✦</span>
        <span className="gift-loader-spark gift-loader-spark--3">✦</span>

        <p className="gift-loader-text">{label}</p>
      </div>
    </div>
  );
}
