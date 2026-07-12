import { RevealGrid } from "@/components/RevealGrid";

const STEPS: { icon: string; title: string; body: string }[] = [
  {
    icon: "💬",
    title: "Chat on WhatsApp",
    body: "Tap “Order”, send us the gift you like and who it’s for. No account or app needed.",
  },
  {
    icon: "🎨",
    title: "Personalise together",
    body: "Share names, dates, photos or colours. We confirm the design and the final price with you.",
  },
  {
    icon: "📦",
    title: "Handmade & delivered",
    body: "We handcraft your keepsake and ship it to your doorstep, ready to gift.",
  },
];

export function HowItWorks() {
  return (
    <section className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-pink-500">
          How ordering works
        </span>
        <h2 className="mt-2 editorial-display !text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.1]">
          Three simple steps
        </h2>
        <p className="mt-3 text-sm md:text-base text-secondary leading-relaxed">
          Every gift is made to order and arranged over a quick WhatsApp chat —
          no checkout, no waiting on hold.
        </p>
      </div>

      <RevealGrid className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="relative flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-white/60 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gift-accent-soft)] text-xl">
                {s.icon}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-pink-500">
                Step {i + 1}
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">{s.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{s.body}</p>
          </div>
        ))}
      </RevealGrid>
    </section>
  );
}
