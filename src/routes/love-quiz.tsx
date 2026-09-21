import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Heart, Sparkles, RotateCcw, Share2, Trophy, Copy, Check,
  Users, Loader2, Clock, Shuffle, ListChecks, Zap, Plus, Trash2, Pencil,
  Target, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import quizQuestions from "@/data/love-quiz-questions.json";

export const Route = createFileRoute("/love-quiz")({
  head: () => ({ meta: [{ title: "Tes Seberapa Sayang Pacarmu — iaayan love" }, { name: "description", content: "Uji seberapa sayang pasanganmu!" }] }),
  component: LoveQuiz,
});

/* ──────── Types ──────── */
type Theme = { id: string; name: string; emoji: string; bg: string; cardBg: string; accent: string; text: string; pattern: string; btnGrad: string; ring: string; shadow: string; resultBg: string };
type Phase = "lobby" | "config" | "setup" | "waiting" | "readying" | "quiz" | "computing" | "result";
type CustomQ = { question: string; options: string[]; hint: string };
type QItem = { question: string; options: string[]; hint: string };
type SessionData = { phase: Phase; roomCode: string; myName: string; partnerName: string; myPlayer: "1" | "2"; themeId: string; questionOrder: number[]; currentQ: number; answers: Record<string, string>; };
const SK = "lq_session";
function saveS(d: Partial<SessionData>) { try { const e = loadS(); localStorage.setItem(SK, JSON.stringify({ ...e, ...d })); } catch {} }
function loadS(): SessionData | null { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
function clearS() { try { localStorage.removeItem(SK); } catch {} }

/* ──────── Themes ──────── */
const themes: Theme[] = [
  { id: "panda", name: "Panda Lucu", emoji: "🐼", bg: "from-green-50 via-white to-green-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-green-700", text: "text-green-900", pattern: "bg-[radial-gradient(circle,rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700", ring: "ring-green-400", shadow: "shadow-green-200/60", resultBg: "from-green-400 via-emerald-500 to-teal-500" },
  { id: "whale", name: "Paus Bahagia", emoji: "🐋", bg: "from-sky-50 via-white to-blue-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-sky-700", text: "text-sky-900", pattern: "bg-[radial-gradient(circle,rgba(56,189,248,0.12)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700", ring: "ring-sky-400", shadow: "shadow-sky-200/60", resultBg: "from-sky-400 via-blue-500 to-indigo-500" },
  { id: "unicorn", name: "Unicorn Ajaib", emoji: "🦄", bg: "from-purple-50 via-pink-50 to-violet-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-purple-700", text: "text-purple-900", pattern: "bg-[radial-gradient(circle,rgba(168,85,247,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600", ring: "ring-purple-400", shadow: "shadow-purple-200/60", resultBg: "from-purple-400 via-fuchsia-500 to-pink-500" },
  { id: "cat", name: "Kucing Imut", emoji: "🐱", bg: "from-orange-50 via-amber-50 to-yellow-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-orange-700", text: "text-orange-900", pattern: "bg-[radial-gradient(circle,rgba(251,146,60,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600", ring: "ring-orange-400", shadow: "shadow-orange-200/60", resultBg: "from-orange-400 via-amber-500 to-yellow-500" },
  { id: "bunny", name: "Kelinci Lompat", emoji: "🐰", bg: "from-pink-50 via-rose-50 to-red-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-pink-700", text: "text-pink-900", pattern: "bg-[radial-gradient(circle,rgba(244,114,182,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600", ring: "ring-pink-400", shadow: "shadow-pink-200/60", resultBg: "from-pink-400 via-rose-500 to-red-400" },
  { id: "penguin", name: "Penguin Kompak", emoji: "🐧", bg: "from-slate-50 via-blue-50 to-sky-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-slate-700", text: "text-slate-900", pattern: "bg-[radial-gradient(circle,rgba(100,116,139,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-slate-500 to-sky-600 hover:from-slate-600 hover:to-sky-700", ring: "ring-slate-400", shadow: "shadow-slate-200/60", resultBg: "from-slate-400 via-sky-500 to-blue-500" },
  { id: "bear", name: "Beruang Hangat", emoji: "🧸", bg: "from-amber-50 via-yellow-50 to-orange-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-amber-700", text: "text-amber-900", pattern: "bg-[radial-gradient(circle,rgba(245,158,11,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600", ring: "ring-amber-400", shadow: "shadow-amber-200/60", resultBg: "from-amber-400 via-orange-500 to-red-400" },
  { id: "starfish", name: "Bintang Laut", emoji: "⭐", bg: "from-teal-50 via-emerald-50 to-cyan-100", cardBg: "bg-white/90 backdrop-blur", accent: "text-teal-700", text: "text-teal-900", pattern: "bg-[radial-gradient(circle,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:18px_18px]", btnGrad: "bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600", ring: "ring-teal-400", shadow: "shadow-teal-200/60", resultBg: "from-teal-400 via-emerald-500 to-cyan-500" },
];
function getTheme(id: string): Theme { return themes.find((t) => t.id === id) ?? themes[0]; }

function getScoreDescription(p: number) {
  if (p >= 90) return { label: "💖 Kamu Tau Banget!", desc: "Wah! Kamu bener-benar hafal semua tentang pasanganmu! Saldo sayang kalian penuh banget! Pacarmu pasti ngerasa paling dicintai sedunia! 🥰", animation: "hearts" };
  if (p >= 75) return { label: "💕 Sangat Perhatian!", desc: "Kamu kompak banget sama pasangan! Masih ada beberapa yang belum kamu tahu, tapi overall udah sweet parah! 😍", animation: "stars" };
  if (p >= 60) return { label: "💗 Lumayan Kenal!", desc: "Lumayan nih! Tapi masih ada beberapa yang salah. Kayaknya perlu lebih attention to detail deh! 😄", animation: "confetti" };
  if (p >= 40) return { label: "💘 Perlu Usaha!", desc: "Hmm... ada beberapa hal yang belum kamu tahu tentang pasanganmu. Tapi nggak apa-apa, yang penting udah berusaha! 😅", animation: "sparkle" };
  if (p >= 20) return { label: "💔 Kurang Perhatian!", desc: "Kayaknya kamu perlu lebih perhatian nih! Coba deh ajak ngobrol lebih sering dan dengerin ceritanya! 😬", animation: "sweat" };
  return { label: "😢 Aduh...", desc: "Sepertinya kamu perlu belajar banyak tentang pasanganmu! Yang penting udah mau coba, sekarang waktunya lebih peka ya! 🙏", animation: "cry" };
}

function FloatingEmojis({ theme }: { theme: Theme }) {
  const emojis = useMemo(() => { const b = [theme.emoji, "💖", "💕", "✨", "💗", "💝", "🥰", "😍"]; return Array.from({ length: 18 }, (_, i) => ({ id: i, emoji: b[i % b.length], left: Math.random() * 100, delay: Math.random() * 6, dur: 4 + Math.random() * 6, size: 16 + Math.random() * 18 })); }, [theme.emoji]);
  return (<div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>{emojis.map((e) => (<span key={e.id} className="absolute opacity-20 animate-float-up" style={{ left: `${e.left}%`, bottom: "-40px", fontSize: `${e.size}px`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }}>{e.emoji}</span>))}</div>);
}

function ResultAnimation({ type }: { type: string }) {
  const c: Record<string, { n: number; cls: string; em: string[]; s: () => React.CSSProperties }> = {
    hearts: { n: 30, cls: "animate-heart-fall", em: ["💖"], s: () => ({ left: `${Math.random() * 100}%`, top: "-40px", fontSize: `${20 + Math.random() * 24}px`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s` }) },
    stars: { n: 25, cls: "animate-star-spin", em: ["✨"], s: () => ({ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, fontSize: `${18 + Math.random() * 20}px`, animationDelay: `${Math.random() * 2}s` }) },
    confetti: { n: 40, cls: "animate-confetti-fall", em: ["🎉", "🎊", "✨", "💖", "🌟"], s: () => ({ left: `${Math.random() * 100}%`, top: "-20px", fontSize: `${14 + Math.random() * 14}px`, animationDelay: `${Math.random() * 1.5}s`, animationDuration: `${2 + Math.random() * 2}s` }) },
    sparkle: { n: 20, cls: "animate-sparkle-pulse", em: ["✨"], s: () => ({ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, fontSize: `${16 + Math.random() * 16}px`, animationDelay: `${Math.random() * 2}s` }) },
    sweat: { n: 15, cls: "animate-sweat-drop", em: ["😅"], s: () => ({ left: `${Math.random() * 100}%`, top: "-20px", fontSize: `${18 + Math.random() * 16}px`, animationDelay: `${Math.random() * 2}s` }) },
    cry: { n: 12, cls: "animate-cry-drop", em: ["💧"], s: () => ({ left: `${Math.random() * 100}%`, top: "-20px", fontSize: `${20 + Math.random() * 16}px`, animationDelay: `${Math.random() * 2}s` }) },
  };
  const cfg = c[type]; if (!cfg) return null;
  return (<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>{Array.from({ length: cfg.n }, (_, i) => (<span key={i} className={`absolute ${cfg.cls}`} style={cfg.s()}>{cfg.em[i % cfg.em.length]}</span>))}</div>);
}

async function api(action: string, data: Record<string, unknown> = {}) {
  if (action.startsWith("get:")) { const p = new URLSearchParams({ action: action.slice(4), ...data } as Record<string, string>); return (await fetch(`/api/room?${p}`)).json(); }
  return (await fetch("/api/room", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...data }) })).json();
}

/* ══════════════════════════════════════════════ */
function LoveQuiz() {
  const sv = useMemo(() => loadS(), []);
  const restorable = sv && ["setup", "waiting", "readying", "quiz"].includes(sv.phase);

  const [phase, setPhase] = useState<Phase>(restorable ? sv.phase : "lobby");
  const [selTheme, setSelTheme] = useState(sv?.themeId || "panda");
  const theme = getTheme(selTheme);
  const [roomCode, setRoomCode] = useState(sv?.roomCode || "");
  const [myName, setMyName] = useState(sv?.myName || "");
  const [partnerName, setPartnerName] = useState(sv?.partnerName || "");
  const [myPlayer, setMyPlayer] = useState<"1" | "2">(sv?.myPlayer || "1");
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [error, setError] = useState("");

  const [selectedQ, setSelectedQ] = useState<number[]>(Array.from({ length: quizQuestions.length }, (_, i) => i));
  const [customQs, setCustomQs] = useState<CustomQ[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [nqText, setNqText] = useState("");
  const [nqOpts, setNqOpts] = useState(["", "", "", ""]);
  const [nqHint, setNqHint] = useState("");

  const [qOrder, setQOrder] = useState<number[]>(sv?.questionOrder || []);
  const [curQ, setCurQ] = useState(sv?.currentQ || 0);
  const [answers, setAnswers] = useState<Record<string, string>>(sv?.answers || {});
  const [iAmReady, setIAmReady] = useState(false);
  const [partnerReady, setPartnerReady] = useState(false);
  const [partnerSetupDone, setPartnerSetupDone] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [resultDesc, setResultDesc] = useState({ label: "", desc: "", animation: "" });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalQ = qOrder.length;

  useEffect(() => { return () => { if (pollRef.current) clearInterval(pollRef.current); }; }, []);

  // Persist — clear session when finished or in lobby/result
  useEffect(() => {
    if (phase === "result" || phase === "lobby" || phase === "config") {
      clearS();
    } else {
      saveS({ phase, roomCode, myName, partnerName, myPlayer, themeId: selTheme, questionOrder: qOrder, currentQ: curQ, answers });
    }
  }, [phase, roomCode, myName, partnerName, myPlayer, selTheme, qOrder, curQ, answers]);

  // Restore polling
  useEffect(() => {
    if (!sv || !sv.roomCode) return;
    if (sv.phase === "waiting" && sv.myPlayer === "1") {
      pollRef.current = setInterval(async () => { try { const s = await api("get:status", { code: sv.roomCode }); if (s.ok && s.status === "setup") { if (pollRef.current) clearInterval(pollRef.current); setPartnerName(s.player2?.name || ""); setPhase("setup"); } } catch {} }, 2000);
    }
    if (sv.phase === "setup") {
      // Restore qOrder from server if empty
      (async () => { try { const s = await api("get:status", { code: sv.roomCode }); if (s.ok) {
        if (!sv.questionOrder || sv.questionOrder.length === 0) {
          const nP = quizQuestions.length;
          const selIdx = s.selectedQuestions || Array.from({ length: nP }, (_: any, i: number) => i);
          const customs = s.customQuestions || [];
          setQOrder([...selIdx, ...customs.map((_: any, i: number) => nP + i)]);
        }
      } } catch {} })();
      const p = setInterval(async () => { try { const s = await api("get:status", { code: sv.roomCode }); if (s.ok) { if (s.status === "readying" || s.status === "playing") { clearInterval(p); if (s.questionOrder && s.questionOrder.length > 0) setQOrder(s.questionOrder); setPhase(s.status === "playing" ? "quiz" : "readying"); } } } catch {} }, 2000);
    }
    if (sv.phase === "readying") {
      const p = setInterval(async () => { try { const s = await api("get:status", { code: sv.roomCode }); if (s.ok) { setPartnerReady(s.player2?.ready ?? false); if (s.status === "playing") { clearInterval(p); setQOrder(s.questionOrder || []); setCurQ(0); setPhase("quiz"); } } } catch {} }, 2000);
    }
  }, []);

  // Poll partner setup status
  useEffect(() => {
    if (phase !== "setup") return;
    const p = setInterval(async () => {
      try { const s = await api("get:status", { code: roomCode }); if (s.ok) { setPartnerSetupDone(!!((myPlayer === "1" ? s.player2 : s.player1)?.setupDone)); } } catch {}
    }, 2000);
    return () => clearInterval(p);
  }, [phase, roomCode, myPlayer]);

  /* ── Handlers ── */
  const handleGoConfig = useCallback(() => { if (myName.trim()) setPhase("config"); }, [myName]);

  const handleCreate = useCallback(async () => {
    if (!myName.trim() || (selectedQ.length === 0 && customQs.length === 0)) return; setError("");
    try {
      // Build local question order for setup phase
      const nP = quizQuestions.length;
      const localOrder = [...selectedQ, ...customQs.map((_, i) => nP + i)];
      setQOrder(localOrder); setCurQ(0); setAnswers({});

      const res = await api("create", { name: myName.trim(), theme: selTheme, selectedQuestions: selectedQ, customQuestions: customQs });
      if (!res.ok) { setError(res.error); return; }
      setRoomCode(res.code); setMyPlayer("1"); setPhase("setup");
      pollRef.current = setInterval(async () => { try { const s = await api("get:status", { code: res.code }); if (s.ok && (s.status === "setup" || s.status === "readying")) { if (pollRef.current) clearInterval(pollRef.current); setPartnerName(s.player2?.name || ""); setPhase("setup"); } } catch {} }, 2000);
    } catch { setError("Gagal membuat room!"); }
  }, [myName, selTheme, selectedQ, customQs]);

  const handleJoin = useCallback(async () => {
    if (!joinCode.trim() || !joinName.trim()) return; setError("");
    try {
      const sr = await api("get:status", { code: joinCode.trim() });
      if (!sr.ok) { setError(sr.error); return; }
      setSelTheme(sr.theme || "panda");
      const res = await api("join", { code: joinCode.trim().toUpperCase(), name: joinName.trim() });
      if (!res.ok) { setError(res.error); return; }
      setRoomCode(res.code); setMyName(joinName.trim()); setPartnerName(res.player1?.name || ""); setMyPlayer("2");
      // Build local question order for setup phase
      const nP = quizQuestions.length;
      const selIdx = res.selectedQuestions || Array.from({ length: nP }, (_, i) => i);
      const customs = res.customQuestions || [];
      const localOrder = [...selIdx, ...customs.map((_: any, i: number) => nP + i)];
      setQOrder(localOrder); setCurQ(0); setAnswers({});
      setPhase("setup");
    } catch { setError("Gagal join room!"); }
  }, [joinCode, joinName]);

  const handleFinishSetup = useCallback(async () => {
    if (Object.keys(answers).length === 0) return;
    try {
      const res = await api("setup", { code: roomCode, player: myPlayer, answers });
      if (res.ok) {
        if (res.status === "readying") { setPhase("readying"); }
        else { /* still waiting for partner */ }
      }
    } catch {}
  }, [roomCode, myPlayer, answers]);

  const handleReady = useCallback(async () => {
    setIAmReady(true);
    try {
      const res = await api("ready", { code: roomCode, player: myPlayer });
      if (res.ok) {
        setPartnerReady(res.player2Ready || false);
        if (res.status === "playing") {
          const s = await api("get:status", { code: roomCode });
          if (s.ok && s.questionOrder) setQOrder(s.questionOrder);
          setCurQ(0); setAnswers({}); setPhase("quiz");
        }
      }
    } catch {}
  }, [roomCode, myPlayer]);

  useEffect(() => {
    if (phase !== "readying") return;
    const p = setInterval(async () => { try { const s = await api("get:status", { code: roomCode }); if (s.ok) { setPartnerReady(s.player2?.ready ?? false); if (s.status === "playing") { clearInterval(p); setQOrder(s.questionOrder || []); setCurQ(0); setAnswers({}); setPhase("quiz"); } } } catch {} }, 2000);
    return () => clearInterval(p);
  }, [phase, roomCode]);

  const handleQuizAnswer = useCallback(async (qId: number, answer: string) => {
    const na = { ...answers, [String(qId)]: answer }; setAnswers(na);
    try { await api("quiz", { code: roomCode, player: myPlayer, questionId: qId, answer }); } catch {}
    if (curQ < totalQ - 1) { setCurQ((p) => p + 1); }
    else {
      try { await api("finish", { code: roomCode, player: myPlayer }); } catch {}
      setPhase("computing");
      const rp = setInterval(async () => { try { const s = await api("get:status", { code: roomCode }); if (s.ok && s.status === "finished") { clearInterval(rp); const r = await api("get:result", { code: roomCode, player: myPlayer }); if (r.ok) { setResult(r); const sc = myPlayer === "1" ? r.player1Score.score : r.player2Score.score; setResultDesc(getScoreDescription(sc)); setTimeout(() => setPhase("result"), 2500); } } } catch {} }, 2000);
    }
  }, [answers, curQ, roomCode, myPlayer, totalQ]);

  const handleRestart = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current); clearS();
    setPhase("lobby"); setRoomCode(""); setMyName(""); setPartnerName(""); setJoinCode(""); setJoinName("");
    setAnswers({}); setCurQ(0); setResult(null); setResultDesc({ label: "", desc: "", animation: "" });
    setError(""); setCopied(false); setIAmReady(false); setPartnerReady(false);
    setSelectedQ(Array.from({ length: quizQuestions.length }, (_, i) => i)); setQOrder([]); setCustomQs([]);
  }, []);

  const addCQ = () => {
    if (!nqText.trim() || nqOpts.filter((o) => o.trim()).length < 2) return;
    setCustomQs((p) => [...p, { question: nqText.trim(), options: nqOpts.filter((o) => o.trim()), hint: nqHint.trim() || "Pikirkan baik-baik! 🤔" }]);
    setNqText(""); setNqOpts(["", "", "", ""]); setNqHint(""); setShowCreate(false);
  };

  const toggleQ = (i: number) => setSelectedQ((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const nPreset = quizQuestions.length;
  const totalAll = nPreset + customQs.length;
  const getQ = (idx: number): QItem => idx < nPreset ? quizQuestions[idx] : customQs[idx - nPreset];
  const curQData = qOrder[curQ] !== undefined ? getQ(qOrder[curQ]) : null;
  const setupDoneCount = Object.keys(answers).length;

  /* ══════════ LOBBY ══════════ */
  if (phase === "lobby") {
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} relative`}>
        <FloatingEmojis theme={theme} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-10 pt-6 sm:px-8 sm:py-10">
          <header className="flex items-center justify-between mb-6"><Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Kembali</Link><span className="text-3xl">💕</span></header>
          <section className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-white/80 shadow-lg mb-4 animate-bounce-gentle"><span className="text-4xl">💑</span></div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-pink-700 mb-2 animate-fade-in-up">Tes Seberapa Sayang</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">Set jawaban benar tentang dirimu, lalu pasanganmu menjawab tentang kamu! 📱💕</p>
          </section>
          <section className="mb-8">
            <h2 className="text-center font-display text-lg font-semibold text-foreground mb-3">Pilih Tema</h2>
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {themes.map((t, i) => (<button key={t.id} onClick={() => setSelTheme(t.id)} className={`flex-col gap-1 h-auto py-3 px-2 rounded-xl border-2 transition-all duration-300 animate-theme-pop flex items-center justify-center ${selTheme === t.id ? `border-current ${t.accent} ${t.cardBg} ring-2 ${t.ring} ${t.shadow} shadow-lg scale-110` : "border-border bg-card/70 hover:scale-105 hover:shadow-md"}`} style={{ animationDelay: `${i * 60}ms` }}><span className="text-2xl transition-transform duration-300 hover:rotate-12 hover:scale-125">{t.emoji}</span><span className={`text-[10px] font-semibold leading-tight ${selTheme === t.id ? t.accent : ""}`}>{t.name}</span></button>))}
            </div>
          </section>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-5 sm:p-7 shadow-xl ${theme.shadow} mb-4 animate-slide-up`}>
            <div className="flex items-center gap-3 mb-4"><div className="grid size-10 place-items-center rounded-full bg-pink-100 animate-wiggle"><Users className="size-5 text-pink-600" /></div><div><h3 className="font-display text-lg font-bold">Buat Room Baru</h3><p className="text-xs text-muted-foreground">Buat room & atur pertanyaan</p></div></div>
            <input type="text" value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Nama kamu..." className={`w-full rounded-xl border-2 border-input bg-white/80 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${theme.ring} transition-all`} maxLength={20} />
            <Button onClick={handleGoConfig} disabled={!myName.trim()} className={`w-full mt-4 ${theme.btnGrad} text-white py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}><Sparkles className="size-5" /> Lanjutkan</Button>
          </div>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-5 sm:p-7 shadow-xl ${theme.shadow} animate-slide-up`} style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-3 mb-4"><div className="grid size-10 place-items-center rounded-full bg-purple-100 animate-wiggle"><Sparkles className="size-5 text-purple-600" /></div><div><h3 className="font-display text-lg font-bold">Join Room</h3><p className="text-xs text-muted-foreground">Masuk pakai kode room</p></div></div>
            <div className="space-y-3">
              <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Kode Room (6 huruf)..." className={`w-full rounded-xl border-2 border-input bg-white/80 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${theme.ring} font-mono text-center text-lg tracking-[0.3em] uppercase`} maxLength={6} />
              <input type="text" value={joinName} onChange={(e) => setJoinName(e.target.value)} placeholder="Nama kamu..." className={`w-full rounded-xl border-2 border-input bg-white/80 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${theme.ring} transition-all`} maxLength={20} />
            </div>
            <Button onClick={handleJoin} disabled={!joinCode.trim() || !joinName.trim()} className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"><Heart className="size-5 fill-current" /> Join Room</Button>
          </div>
          {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center text-sm text-red-600 animate-shake">{error}</div>}
        </div>
      </main>
    );
  }

  /* ══════════ CONFIG (creator picks questions + creates custom) ══════════ */
  if (phase === "config") {
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} relative`}>
        <FloatingEmojis theme={theme} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-10 pt-6 sm:px-8 sm:py-10">
          <header className="flex items-center justify-between mb-6"><Button variant="quiet" onClick={() => setPhase("lobby")} className="px-2"><ArrowLeft /> Kembali</Button><span className="text-2xl">{theme.emoji}</span></header>
          <section className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-white/80 shadow-lg mb-3 animate-wiggle"><ListChecks className="size-8 text-pink-600" /></div>
            <h2 className={`font-display text-2xl sm:text-3xl font-bold ${theme.text} mb-1`}>Atur Pertanyaan</h2>
            <p className="text-muted-foreground text-sm">Pilih template atau buat pertanyaanmu sendiri!</p>
          </section>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-4 sm:p-6 shadow-xl ${theme.shadow} mb-4`}>
            <div className="flex gap-2 mb-3">
              <Button onClick={() => setSelectedQ(Array.from({ length: nPreset }, (_, i) => i))} variant="soft" size="sm" className="flex-1 text-xs"><Check className="size-3" /> Pilih Semua</Button>
              <Button onClick={() => setSelectedQ([])} variant="soft" size="sm" className="flex-1 text-xs">Hapus Semua</Button>
              <Button onClick={() => setSelectedQ(Array.from({ length: nPreset }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, 10))} variant="soft" size="sm" className="flex-1 text-xs"><Shuffle className="size-3" /> Acak 10</Button>
            </div>
            <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 mb-4">
              {quizQuestions.map((q, i) => { const c = selectedQ.includes(i); return (<button key={q.id} onClick={() => toggleQ(i)} className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${c ? `border-current ${theme.accent} bg-white/80 shadow-sm` : "border-border bg-white/40 hover:bg-white/60"}`}><span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-all ${c ? "border-current bg-current text-white" : "border-border"}`}>{c && <Check className="size-3" />}</span><div className="min-w-0 flex-1"><span className="text-[10px] font-mono text-muted-foreground">Q{i + 1}</span><p className="text-sm font-medium leading-snug">{q.question}</p></div></button>); })}
            </div>
            {customQs.length > 0 && (<div className="mb-3"><p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Pencil className="size-3" /> Buatanmu ({customQs.length})</p><div className="space-y-2">{customQs.map((cq, i) => (<div key={i} className="flex items-start gap-2 p-3 rounded-xl border-2 border-pink-300 bg-pink-50/50"><div className="min-w-0 flex-1"><p className="text-sm font-medium leading-snug">{cq.question}</p><p className="text-[10px] text-muted-foreground mt-0.5">Opsi: {cq.options.join(", ")}</p></div><button onClick={() => setCustomQs((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-1"><Trash2 className="size-4" /></button></div>))}</div></div>)}
            {!showCreate ? (
              <button onClick={() => setShowCreate(true)} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-pink-300 text-pink-600 text-sm font-semibold hover:bg-pink-50 transition-all"><Plus className="size-4" /> Buat Pertanyaan Sendiri</button>
            ) : (
              <div className="p-4 rounded-xl border-2 border-pink-300 bg-pink-50/50 space-y-3">
                <p className="text-xs font-semibold text-pink-700 flex items-center gap-1"><Pencil className="size-3" /> Pertanyaan Baru</p>
                <input type="text" value={nqText} onChange={(e) => setNqText(e.target.value)} placeholder="Tulis pertanyaan..." className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-pink-400" />
                <div className="grid grid-cols-2 gap-2">{nqOpts.map((o, oi) => (<input key={oi} type="text" value={o} onChange={(e) => { const no = [...nqOpts]; no[oi] = e.target.value; setNqOpts(no); }} placeholder={`Opsi ${oi + 1}${oi < 2 ? " *" : ""}`} className="rounded-lg border border-pink-200 bg-white px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-pink-400" />))}</div>
                <input type="text" value={nqHint} onChange={(e) => setNqHint(e.target.value)} placeholder="Hint (opsional)" className="w-full rounded-lg border border-pink-200 bg-white px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-pink-400" />
                <div className="flex gap-2">
                  <Button onClick={addCQ} disabled={!nqText.trim() || nqOpts.filter((o) => o.trim()).length < 2} className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-xs py-2 rounded-lg disabled:opacity-50"><Check className="size-3" /> Simpan</Button>
                  <Button onClick={() => { setShowCreate(false); setNqText(""); setNqOpts(["", "", "", ""]); setNqHint(""); }} variant="soft" className="flex-1 text-xs py-2">Batal</Button>
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleCreate} disabled={selectedQ.length === 0 && customQs.length === 0} className={`w-full ${theme.btnGrad} text-white py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}><Sparkles className="size-5" /> Buat Room ({selectedQ.length + customQs.length} soal)</Button>
        </div>
      </main>
    );
  }

  /* ══════════ SETUP (answer about YOURSELF) ══════════ */
  if (phase === "setup" && curQData) {
    const q = curQData;
    const progress = totalQ > 0 ? ((curQ + 1) / totalQ) * 100 : 0;
    const qId = qOrder[curQ];
    const setupDone = Object.keys(answers).length >= totalQ;
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} relative`}>
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-8 pt-6 sm:px-8 sm:py-8">
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">{theme.emoji}</span><span className={`text-sm font-semibold ${theme.accent}`}>{myName}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/60 rounded-full px-3 py-1"><Target className="size-3" /> {curQ + 1}/{totalQ}</div>
          </header>
          <div className="flex items-center justify-center mb-3"><span className="text-[10px] font-mono text-muted-foreground bg-white/40 rounded-full px-3 py-0.5 tracking-wider">SETUP: Isi jawaban tentang dirimu ✍️</span></div>
          <div className="w-full h-2.5 bg-white/50 rounded-full mb-5 overflow-hidden"><div className={`h-full bg-gradient-to-r ${theme.resultBg} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} /></div>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-5 sm:p-7 shadow-xl ${theme.shadow} animate-slide-up`}>
            <div className="text-center mb-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${theme.accent} bg-white/60 mb-3`}>Soal {curQ + 1}</span>
              <h3 className={`font-display text-xl sm:text-2xl font-bold ${theme.text} mb-2`}>{q.question}</h3>
              <p className="text-xs text-muted-foreground italic">💡 Pilih jawaban yang BENAR tentang dirimu!</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              {q.options.map((opt) => {
                const selected = answers[String(qId)] === opt;
                return (<button key={opt} onClick={() => { const na = { ...answers, [String(qId)]: opt }; setAnswers(na); if (curQ < totalQ - 1) setCurQ((p) => p + 1); }}
                  className={`text-sm py-3 px-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-left font-medium ${selected ? `border-current ${theme.accent} bg-white shadow-md ring-2 ${theme.ring}` : "border-input bg-white/70 hover:bg-white hover:border-current"}`}>
                  {selected && <span className="mr-1">✓</span>}{opt}
                </button>);
              })}
            </div>
          </div>
          {setupDone && (
            <Button onClick={handleFinishSetup} className={`w-full mt-5 ${theme.btnGrad} text-white py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-slow`}>
              <Check className="size-5" /> Selesai Setup! 🎉
            </Button>
          )}
          {!setupDone && curQ === 0 && <p className="text-center text-xs text-muted-foreground mt-4">✍️ Isi semua pertanyaan tentang dirimu dulu ya!</p>}
        </div>
      </main>
    );
  }

  /* ══════════ WAITING ══════════ */
  if (phase === "waiting") {
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} flex items-center justify-center relative`}>
        <FloatingEmojis theme={theme} />
        <div className="relative z-10 text-center px-4 max-w-md">
          <div className="inline-flex items-center justify-center size-24 rounded-full bg-white/80 shadow-lg mb-6 animate-bounce-gentle"><span className="text-5xl">{theme.emoji}</span></div>
          <h2 className={`font-display text-2xl sm:text-3xl font-bold ${theme.text} mb-3`}>Room Dibuat! 🎉</h2>
          <p className="text-muted-foreground text-sm mb-6">Kirim kode ini ke pasanganmu:</p>
          <div className={`${theme.cardBg} rounded-2xl border border-white/60 p-6 shadow-xl ${theme.shadow}`}>
            <p className="font-mono text-4xl sm:text-5xl font-bold tracking-[0.25em] text-foreground mb-4 select-all">{roomCode}</p>
            <Button onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} variant="soft" className="w-full">{copied ? <><Check className="size-4" /> Tersalin!</> : <><Copy className="size-4" /> Salin Kode</>}</Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-sm"><Loader2 className="size-4 animate-spin" /> Menunggu pasangan join...</div>
          <Button variant="quiet" onClick={handleRestart} className="mt-6"><ArrowLeft /> Batalkan</Button>
        </div>
      </main>
    );
  }

  /* ══════════ READying ══════════ */
  if (phase === "readying") {
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} flex items-center justify-center relative`}>
        <FloatingEmojis theme={theme} />
        <div className="relative z-10 text-center px-4 max-w-md">
          <div className="inline-flex items-center justify-center size-24 rounded-full bg-white/80 shadow-lg mb-6 animate-bounce-gentle"><span className="text-5xl">🤝</span></div>
          <h2 className={`font-display text-2xl sm:text-3xl font-bold ${theme.text} mb-3`}>Siap-siap! 🎮</h2>
          <p className="text-muted-foreground text-sm mb-6">Kedua pemain sudah mengisi jawaban! Klik SIAP untuk mulai quiz!</p>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-6 shadow-xl ${theme.shadow} mb-6`}>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(["1", "2"] as const).map((p) => { const isMe = myPlayer === p; const r = isMe ? iAmReady : partnerReady; const nm = isMe ? myName : partnerName; return (
                <div key={p} className={`p-4 rounded-2xl border-2 transition-all duration-500 ${r ? "border-green-400 bg-green-50 shadow-green-200/60 shadow-lg" : "border-border bg-white/40"}`}>
                  <div className="text-3xl mb-2">{isMe ? "🙋" : "💑"}</div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">{nm || "..."}</p>
                  <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${r ? "text-green-600" : "text-muted-foreground"}`}>{r ? <><Check className="size-4" /> Siap!</> : <><Clock className="size-4" /> Belum...</>}</div>
                </div>
              ); })}
            </div>
            {!iAmReady ? (
              <Button onClick={handleReady} className={`w-full ${theme.btnGrad} text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-slow`}><Zap className="size-5" /> SIAP!</Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm py-4"><Loader2 className="size-4 animate-spin" /> Menunggu pasangan...</div>
            )}
          </div>
          <Button variant="quiet" onClick={handleRestart} className="text-xs"><ArrowLeft /> Batalkan</Button>
        </div>
      </main>
    );
  }

  /* ══════════ QUIZ (answer about PARTNER) ══════════ */
  if (phase === "quiz" && curQData) {
    const q = curQData;
    const progress = totalQ > 0 ? ((curQ + 1) / totalQ) * 100 : 0;
    const qId = qOrder[curQ];
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} relative`}>
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-8 pt-6 sm:px-8 sm:py-8">
          <header className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><span className="text-lg">{theme.emoji}</span><span className={`text-sm font-semibold ${theme.accent}`}>{myName}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/60 rounded-full px-3 py-1"><Brain className="size-3" /> {curQ + 1}/{totalQ}</div>
          </header>
          <div className="flex items-center justify-center mb-3"><span className="text-[10px] font-mono text-muted-foreground bg-white/40 rounded-full px-3 py-0.5 tracking-wider">QUIZ: Jawab tentang {partnerName || "pasangan"} 🧠</span></div>
          <div className="w-full h-2.5 bg-white/50 rounded-full mb-5 overflow-hidden"><div className={`h-full bg-gradient-to-r ${theme.resultBg} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} /></div>
          <div className={`${theme.cardBg} rounded-3xl border border-white/60 p-5 sm:p-7 shadow-xl ${theme.shadow} animate-slide-up`}>
            <div className="text-center mb-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${theme.accent} bg-white/60 mb-3`}>Soal {curQ + 1}</span>
              <h3 className={`font-display text-xl sm:text-2xl font-bold ${theme.text} mb-2`}>{q.question}</h3>
              <p className="text-xs text-muted-foreground italic">🧠 Menurutmu, apa jawaban {partnerName || "pasangan"}?</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-5">
              {q.options.map((opt) => (<button key={opt} onClick={() => handleQuizAnswer(qId, opt)} className={`text-sm py-3 px-3 rounded-xl border-2 border-input bg-white/70 hover:bg-white hover:border-current transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] text-left ${theme.accent} font-medium`}>{opt}</button>))}
            </div>
          </div>
          {curQ === 0 && <p className="text-center text-xs text-muted-foreground mt-4">🧠 Coba tebak jawaban {partnerName || "pasangan"} tentang dirinya!</p>}
        </div>
      </main>
    );
  }

  /* ══════════ COMPUTING ══════════ */
  if (phase === "computing") {
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} flex items-center justify-center relative`}>
        <div className="relative z-10 text-center px-4">
          <div className="animate-spin-slow text-6xl mb-4">{theme.emoji}</div>
          <h2 className={`font-display text-2xl sm:text-3xl font-bold ${theme.text} mb-2`}>Menghitung Skor...</h2>
          <p className="text-muted-foreground text-sm">Tunggu {partnerName || "pasangan"} selesai dulu ya! ⏳</p>
          <div className="flex justify-center gap-1 mt-4">{[0, 1, 2].map((i) => (<span key={i} className="size-3 rounded-full animate-bounce" style={{ backgroundColor: "var(--primary)", animationDelay: `${i * 0.15}s` }} />))}</div>
        </div>
      </main>
    );
  }

  /* ══════════ RESULT ══════════ */
  if (phase === "result" && result) {
    const myScore = myPlayer === "1" ? result.player1Score : result.player2Score;
    const partnerScoreData = myPlayer === "1" ? result.player2Score : result.player1Score;
    const desc = getScoreDescription(myScore.score);
    return (
      <main className={`min-h-dvh bg-gradient-to-br ${theme.bg} ${theme.pattern} relative overflow-hidden`}>
        <ResultAnimation type={desc.animation} /><FloatingEmojis theme={theme} />
        <div className="relative z-10 mx-auto max-w-lg px-4 pb-10 pt-6 sm:px-8 sm:py-10">
          <header className="flex items-center justify-between mb-6">
            <Button variant="quiet" onClick={handleRestart} className="px-2"><ArrowLeft /> Menu Awal</Button>
            <span className="text-2xl">{theme.emoji}</span>
          </header>
          <section className={`${theme.cardBg} rounded-3xl border border-white/60 p-6 sm:p-8 shadow-xl ${theme.shadow} text-center animate-slide-up`}>
            <div className="inline-flex items-center justify-center size-20 sm:size-24 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-lg mb-4 animate-pop-in"><Trophy className="size-10 sm:size-12 text-white" /></div>
            <div className="relative inline-flex items-center justify-center size-36 sm:size-40 my-4">
              <svg className="size-36 sm:size-40 -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="url(#sg)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(myScore.score / 100) * 440} 440`} className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--primary)" /><stop offset="100%" stopColor="#f472b6" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className={`font-display text-3xl sm:text-4xl font-bold ${theme.text}`}>{myScore.score}%</span><span className="text-[10px] sm:text-xs text-muted-foreground">Skor Kamu</span></div>
            </div>
            <h2 className={`font-display text-xl sm:text-3xl font-bold ${theme.text} mb-2 animate-fade-in-up`}>{desc.label}</h2>
            <p className="text-sm text-muted-foreground mb-2">{result.player1Name} & {result.player2Name}</p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
              <span>🧑 Kamu: <strong>{myScore.score}%</strong> ({myScore.matches}/{myScore.total})</span>
              <span>💑 {partnerName || "Partner"}: <strong>{partnerScoreData.score}%</strong> ({partnerScoreData.matches}/{partnerScoreData.total})</span>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 mb-5 text-left"><p className="text-sm text-foreground leading-relaxed">{desc.desc}</p></div>
            <div className="bg-white/60 rounded-2xl p-4 mb-5 text-left">
              <h3 className={`text-sm font-semibold ${theme.accent} mb-3`}>📋 Jawabanmu tentang {partnerName || "pasangan"}:</h3>
              <div className="space-y-2">{myScore.details.map((d: any, i: number) => (<div key={i} className="flex items-start gap-2 text-xs"><span className="mt-0.5">{d.match ? "✅" : "❌"}</span><div className="min-w-0 flex-1"><span className="text-muted-foreground">Q{i + 1}</span> <span className="font-medium">{result.questionTexts[i]}</span><br/><span className="text-green-600">Benar: {d.correct || "-"}</span> · <span className={d.match ? "text-green-600" : "text-red-500"}>Jawabmu: {d.guess || "-"}</span></div></div>))}</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRestart} className={`flex-1 ${theme.btnGrad} text-white py-3 rounded-xl font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]`}><RotateCcw className="size-4" /> Main Lagi</Button>
              <Button onClick={() => { const t = `💖 Tes Seberapa Sayang Pacarmu 💖\n\n${result.player1Name} & ${result.player2Name}\n\nSkor Kamu: ${myScore.score}% ${desc.label}\nSkor Partner: ${partnerScoreData.score}%\n\n${desc.desc}\n\nDibuat di iaayan love 💕`; if (navigator.share) navigator.share({ title: "Tes Sayang Pacar", text: t }); else { navigator.clipboard.writeText(t); alert("📋 Hasil sudah disalin!"); } }} variant="soft" className="flex-1 py-3 rounded-xl font-semibold"><Share2 className="size-4" /> Bagikan</Button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return null;
}
