// Lightweight bilingual (English / Tamil) dictionary and helpers.
// No routing/library dependency — consumed via the client LanguageProvider so the
// site stays free-tier friendly and avoids SSR i18n complexity.

export type Lang = "en" | "ta";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ta", label: "தமிழ்", short: "த" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.collections": "Collections",
  "nav.order": "Order",

  "hero.eyebrow": "Handcrafted with intention",
  "hero.explore": "Explore collections",
  "common.orderOnWhatsapp": "Order on WhatsApp",
  "common.continueOnWhatsapp": "Continue on WhatsApp",
  "common.back": "Back",

  "how.eyebrow": "How ordering works",
  "how.title": "Three simple steps",
  "how.subtitle":
    "Every gift is made to order and arranged over a quick WhatsApp chat — no checkout, no waiting on hold.",
  "how.step": "Step",
  "how.step1Title": "Chat on WhatsApp",
  "how.step1Body":
    "Tap “Order”, send us the gift you like and who it’s for. No account or app needed.",
  "how.step2Title": "Personalise together",
  "how.step2Body":
    "Share names, dates, photos or colours. We confirm the design and the final price with you.",
  "how.step3Title": "Handmade & delivered",
  "how.step3Body":
    "We handcraft your keepsake and ship it to your doorstep, ready to gift.",

  "order.tagline": "Tell us a little more",
  "order.occasion": "Occasion",
  "order.for": "For",
  "order.neededBy": "Needed by",
  "order.pincode": "Delivery pincode",
  "order.personalization": "Personalization (names, dates, message)",
  "order.personalizationPlaceholder": "e.g. A ♥ R, 12 Jun 2019",
  "order.quantity": "Quantity",
  "order.priceNote": "Final price confirmed on chat based on personalization.",
  "order.close": "Close",
};

const ta: Dict = {
  "nav.collections": "தொகுப்புகள்",
  "nav.order": "ஆர்டர்",

  "hero.eyebrow": "அன்புடன் கைவினையாக்கம்",
  "hero.explore": "தொகுப்புகளைப் பார்க்க",
  "common.orderOnWhatsapp": "WhatsApp-ல் ஆர்டர் செய்யுங்கள்",
  "common.continueOnWhatsapp": "WhatsApp-ல் தொடரவும்",
  "common.back": "பின்செல்",

  "how.eyebrow": "ஆர்டர் செய்வது எப்படி",
  "how.title": "மூன்று எளிய படிகள்",
  "how.subtitle":
    "ஒவ்வொரு பரிசும் உங்களுக்காகவே தயாரிக்கப்படுகிறது — ஒரு சிறிய WhatsApp அரட்டையில் ஏற்பாடு செய்யப்படுகிறது.",
  "how.step": "படி",
  "how.step1Title": "WhatsApp-ல் அரட்டை",
  "how.step1Body":
    "“ஆர்டர்” என்பதைத் தட்டி, விரும்பும் பரிசையும் யாருக்கு என்பதையும் அனுப்புங்கள். கணக்கு அல்லது ஆப் தேவையில்லை.",
  "how.step2Title": "சேர்ந்து வடிவமைப்போம்",
  "how.step2Body":
    "பெயர்கள், தேதிகள், புகைப்படங்கள் அல்லது நிறங்களைப் பகிருங்கள். வடிவமைப்பையும் இறுதி விலையையும் உறுதிசெய்வோம்.",
  "how.step3Title": "கைவினை & டெலிவரி",
  "how.step3Body":
    "உங்கள் நினைவுப் பரிசைக் கைவினையாகத் தயாரித்து உங்கள் வீட்டு வாசலுக்கு அனுப்புவோம்.",

  "order.tagline": "இன்னும் கொஞ்சம் சொல்லுங்கள்",
  "order.occasion": "நிகழ்வு",
  "order.for": "யாருக்கு",
  "order.neededBy": "எப்போது வேண்டும்",
  "order.pincode": "டெலிவரி பின்கோடு",
  "order.personalization": "தனிப்பயனாக்கம் (பெயர்கள், தேதிகள், செய்தி)",
  "order.personalizationPlaceholder": "எ.கா. A ♥ R, 12 ஜூன் 2019",
  "order.quantity": "எண்ணிக்கை",
  "order.priceNote": "தனிப்பயனாக்கத்தின் அடிப்படையில் இறுதி விலை அரட்டையில் உறுதிசெய்யப்படும்.",
  "order.close": "மூடு",
};

const DICTS: Record<Lang, Dict> = { en, ta };

export function translate(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.en[key] ?? key;
}
