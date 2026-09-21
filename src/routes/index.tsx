import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Languages, RefreshCw, Sparkles, Sparkle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import questionData from "@/data/questions.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iaayan love — Kartu Obrolan Hati" },
      { name: "description", content: "Mainkan kartu Truth or Dare dan Deep Talk untuk percakapan yang lebih dekat dan berkesan." },
      { property: "og:title", content: "iaayan love — Kartu Obrolan Hati" },
      { property: "og:description", content: "Mainkan kartu Truth or Dare dan Deep Talk untuk percakapan yang lebih dekat dan berkesan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Language = "id" | "en";
type Category = keyof typeof questionData;
type CardType = "truth" | "dare";

const categories: Array<{ key: Category; label: { id: string; en: string }; color: string; mark: string }> = [
  { key: "pacar", label: { id: "Pacar", en: "Couples" }, color: "bg-category-pacar", mark: "♡" },
  { key: "pdkt", label: { id: "PDKT", en: "Crush" }, color: "bg-category-pdkt", mark: "✦" },
  { key: "teman", label: { id: "Teman", en: "Friends" }, color: "bg-category-teman", mark: "☻" },
  { key: "pasutri", label: { id: "Pasutri", en: "Married" }, color: "bg-category-pasutri", mark: "∞" },
  { key: "keluarga", label: { id: "Keluarga", en: "Family" }, color: "bg-category-keluarga", mark: "⌂" },
  { key: "mantan", label: { id: "Mantan", en: "Exes" }, color: "bg-category-mantan", mark: "↝" },
];

const copy = {
  id: {
    subtitle: "Kartu Truth or Dare & Deep Talk",
    intro: "Pilih edisi yang paling pas untuk obrolan kalian.",
    choose: "Pilih Edisimu",
    start: "Mulai Bermain",
    back: "Kembali ke Menu",
    next: "Kartu Selanjutnya",
    change: "Ganti Kartu",
    truth: "Jujur",
    dare: "Tantangan",
    tap: "Ketuk kartu untuk membalik",
    question: "Pertanyaan untuk kamu",
    challenge: "Tantangan untuk kamu",
  },
  en: {
    subtitle: "Truth or Dare & Deep Talk Cards",
    intro: "Choose the edition that fits your conversation.",
    choose: "Choose Your Edition",
    start: "Start Playing",
    back: "Back to Menu",
    next: "Next Card",
    change: "Shuffle Card",
    truth: "Truth",
    dare: "Dare",
    tap: "Tap the card to flip",
    question: "A question for you",
    challenge: "A challenge for you",
  },
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-primary no-underline hover:no-underline">
      <span className={`${compact ? "h-7 w-7" : "h-11 w-11"} grid place-items-center rounded-full border border-gold bg-card shadow-sm`}>
        <Heart className={compact ? "size-3.5 fill-current" : "size-5 fill-current"} strokeWidth={1.5} />
      </span>
      <span className={`${compact ? "text-lg" : "text-2xl"} font-display font-semibold`}>iaayan love</span>
    </Link>
  );
}

function Index() {
  const [language, setLanguage] = useState<Language>("id");
  const [selected, setSelected] = useState<Category>("pacar");
  const [playing, setPlaying] = useState(false);
  const [type, setType] = useState<CardType>("truth");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const t = copy[language];

  const entries = questionData[selected][type];
  const card = entries[cardIndex % entries.length] ?? { id: "Mari mulai obrolannya.", en: "Let's start the conversation." };
  const reverseType: CardType = type === "truth" ? "dare" : "truth";
  const reverseEntries = questionData[selected][reverseType];
  const reverseCard = reverseEntries[cardIndex % reverseEntries.length] ?? { id: "Berikan tantangan terbaikmu.", en: "Give your best challenge." };
  const activeCategory = useMemo(
    () => categories.find((item) => item.key === selected) ?? { key: "pacar" as Category, label: { id: "Pacar", en: "Couples" }, color: "bg-category-pacar", mark: "♡" },
    [selected],
  );

  const nextCard = () => {
    setFlipped(false);
    setCardIndex((current) => (current + 1) % entries.length);
  };

  const shuffleCard = () => {
    setFlipped(false);
    setType((current) => (current === "truth" ? "dare" : "truth"));
    setCardIndex((current) => current + 1);
  };

  if (playing) {
    return (
      <main className="love-pattern relative min-h-dvh overflow-hidden bg-background px-4 pb-8 pt-4 sm:px-8 sm:py-7">
        <header className="mx-auto flex max-w-5xl items-center justify-between">
          <Button variant="quiet" onClick={() => setPlaying(false)} className="-ml-2 px-2 sm:px-3" aria-label={t.back}>
            <ArrowLeft /> <span className="hidden sm:inline">{t.back}</span>
          </Button>
          <Brand compact />
          <div className="flex items-center gap-2">
            <Link
              to="/love-quiz"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-pink-200 bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600 shadow-sm transition-all hover:bg-pink-100 no-underline"
            >
              <Sparkle className="size-3" /> Tes Sayang
            </Link>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
        </header>

        <section className="mx-auto flex max-w-5xl flex-col items-center pt-4 sm:pt-9">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className={`h-3 w-3 rounded-full ${activeCategory.color}`} />
            {activeCategory.label[language]}
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg border border-border bg-card/60 p-1 shadow-sm" aria-label="Card type">
            {(["truth", "dare"] as CardType[]).map((item) => (
              <Button
                key={item}
                variant={type === item ? "love" : "quiet"}
                size="sm"
                onClick={() => { setType(item); setCardIndex(0); setFlipped(false); }}
                className="min-w-28"
              >
                {item === "truth" ? t.truth : t.dare}
              </Button>
            ))}
          </div>

          <div className="card-perspective w-full max-w-[320px] sm:max-w-[350px]">
            <Button
              variant="bare"
              onClick={() => setFlipped((value) => !value)}
              aria-label={t.tap}
              className="block h-auto w-full bg-transparent p-0 shadow-none hover:bg-transparent"
            >
              <div className={`preserve-3d relative aspect-[5/7] w-full transition-transform duration-700 ${flipped ? "rotate-y-180" : ""}`}>
                <CardFace front language={language} type={type} prompt={card[language]} label={type === "truth" ? t.question : t.challenge} />
                <CardFace language={language} type={reverseType} prompt={reverseCard[language]} label={reverseType === "truth" ? t.question : t.challenge} />
              </div>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{t.tap}</p>

          <div className="mt-5 flex w-full max-w-[320px] gap-2 sm:max-w-[350px] sm:gap-3">
            <Button variant="soft" size="xl" className="flex-1 px-3" onClick={shuffleCard}>
              <RefreshCw /> {t.change}
            </Button>
            <Button variant="love" size="xl" className="flex-1 px-3" onClick={nextCard}>
              {t.next} <Sparkles />
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="love-pattern min-h-dvh bg-background px-4 pb-10 pt-4 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <Brand compact />
          <div className="flex items-center gap-2">
            <Link
              to="/love-quiz"
              className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 shadow-sm transition-all hover:bg-pink-100 hover:scale-105 no-underline"
            >
              <Sparkle className="size-3.5" /> Tes Sayang 💕
            </Link>
            <LanguageToggle language={language} setLanguage={setLanguage} />
          </div>
        </header>

        <section className="mx-auto max-w-2xl pb-6 pt-8 text-center sm:pb-10 sm:pt-16">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-gold bg-card shadow-[0_12px_38px_var(--shadow-love)]">
            <Heart className="size-9 fill-primary text-primary" strokeWidth={1.25} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">Obrolan Hati</p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-primary sm:text-7xl">iaayan love</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t.subtitle}</p>
        </section>

        <section className="mx-auto max-w-3xl">
          <div className="mb-5 text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground">{t.choose}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {categories.map((category) => {
              const active = selected === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setSelected(category.key)}
                  aria-pressed={active}
                  className={`group relative flex flex-col items-center justify-center overflow-visible border bg-card py-4 px-2 min-h-[80px] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md rounded-xl ${active ? "border-gold ring-2 ring-gold/30" : "border-border"}`}
                >
                  <span className={`absolute inset-x-0 top-0 h-2 rounded-t-xl ${category.color}`} />
                  <span className={`mb-2 grid h-10 w-10 shrink-0 place-items-center rounded-full ${category.color} text-lg sm:text-xl text-foreground transition-transform group-hover:scale-110`}>{category.mark}</span>
                  <span className="font-display text-[13px] sm:text-sm font-bold text-center leading-tight text-foreground">{category.label[language]}</span>
                  {active && <span className="absolute right-2 top-3 h-2 w-2 rounded-full bg-gold" />}
                </button>
              );
            })}
          </div>

          <Button variant="love" size="xl" className="mx-auto mt-7 flex w-full max-w-sm" onClick={() => { setPlaying(true); setCardIndex(0); setFlipped(false); }}>
            <Heart className="fill-current" /> {t.start}
          </Button>
        </section>

        <footer className="pb-6 pt-12 text-center text-xs text-muted-foreground">
          <p>Dibuat untuk percakapan yang lebih dekat ♡</p>
          <p className="mt-2">© loveiaayan18062026</p>
        </footer>
      </div>
    </main>
  );
}

function LanguageToggle({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card/70 p-1 shadow-sm">
      <Languages className="ml-1 size-4 text-gold" />
      <Button variant={language === "id" ? "love" : "quiet"} size="sm" onClick={() => setLanguage("id")} aria-label="Bahasa Indonesia">ID</Button>
      <Button variant={language === "en" ? "love" : "quiet"} size="sm" onClick={() => setLanguage("en")} aria-label="English">EN</Button>
    </div>
  );
}

function CardFace({ front = false, language, type, prompt, label }: { front?: boolean; language: Language; type: CardType; prompt: string; label: string }) {
  return (
    <div className={`backface-hidden absolute inset-0 flex flex-col rounded-[22px] border border-gold bg-card p-3 shadow-[0_22px_55px_var(--shadow-love)] ${front ? "" : "rotate-y-180"}`}>
      <div className="flex h-full flex-col rounded-[15px] border border-gold/55 px-7 py-6">
        <div className="flex items-center justify-between">
          <Brand compact />
          <span className="font-display text-lg text-gold">{type === "truth" ? "T" : "D"}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center">
          <Heart className="mb-5 size-6 text-gold" strokeWidth={1.25} />
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{label}</p>
          <p className="whitespace-normal text-center font-display text-[1.45rem] font-medium leading-[1.45] text-foreground">“{prompt}”</p>
        </div>
        <div className="flex items-center justify-center gap-3 text-gold-soft">
          <span className="h-px w-10 bg-gold-soft" /><Heart className="size-3 fill-current" /><span className="h-px w-10 bg-gold-soft" />
        </div>
        <p className="mt-3 text-center text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{language === "id" ? "dari hati ke hati" : "heart to heart"}</p>
      </div>
    </div>
  );
}