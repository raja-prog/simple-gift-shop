const ITEMS = [
  "HANDCRAFTED",
  "PERSONALISED",
  "MADE WITH LOVE",
  "RESIN ART",
  "CUSTOM ORDERS",
  "FROZEN MEMORIES",
];

export function Marquee() {
  // Duplicate the list so the scroll loops seamlessly.
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-band" aria-hidden="true">
      <div className="marquee-track">
        {loop.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
