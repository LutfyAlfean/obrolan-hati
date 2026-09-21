import { defineEventHandler, readBody, getQuery } from "h3";

/* ─────────────────────────────────────────────
 *  Types
 * ───────────────────────────────────────────── */
type CustomQ = { question: string; options: string[]; hint: string };
type PlayerData = {
  name: string;
  setupAnswers: Record<string, string>;   // self-answers (the "correct" answers)
  quizAnswers: Record<string, string>;     // answers about partner
  setupDone: boolean;                      // finished self-setup
  quizDone: boolean;                       // finished quiz about partner
  ready: boolean;
};
type Room = {
  code: string;
  theme: string;
  createdAt: number;
  selectedQuestions: number[];
  customQuestions: CustomQ[];
  questionOrder: number[];
  player1: PlayerData | null;
  player2: PlayerData | null;
  status: "waiting" | "setup" | "readying" | "playing" | "finished";
};

const rooms = new Map<string, Room>();

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) { if (now - room.createdAt > 3600_000) rooms.delete(code); }
}, 300_000);

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */
const presetQ: { id: number; question: string; options: string[]; hint: string }[] =
  (() => { try { return require("../../src/data/love-quiz-questions.json"); } catch { return []; } })();

function numPreset(): number { return presetQ.length; }
function totalQ(room: Room): number { return numPreset() + room.customQuestions.length; }
function allQ(room: Room): Array<{ question: string; options: string[]; hint: string }> { return [...presetQ, ...room.customQuestions]; }

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = ""; for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function shuffleArray(arr: number[]): number[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}
function getRoom(code: string): Room | null { return rooms.get(code.toUpperCase()) ?? null; }
function ok(d: Record<string, unknown>) { return { ok: true, ...d }; }
function err(m: string) { return { ok: false, error: m }; }

/* ─────────────────────────────────────────────
 *  Compute score: how many of B's setup answers
 *  did A match in their quiz answers?
 * ───────────────────────────────────────────── */
function computeScore(quizAnswers: Record<string, string>, setupAnswers: Record<string, string>, order: number[]) {
  let matches = 0;
  const details = order.map((qIdx, i) => {
    const qId = String(qIdx);
    const correct = setupAnswers[qId] || "";
    const guess = quizAnswers[qId] || "";
    const match = correct !== "" && guess === correct;
    if (match) matches++;
    return { question: i + 1, correct, guess, match };
  });
  const total = order.length;
  const score = total > 0 ? Math.round((matches / total) * 100) : 0;
  return { score, matches, total, details };
}

/* ─────────────────────────────────────────────
 *  API Handler
 * ───────────────────────────────────────────── */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const query = getQuery(event);

  // ════════════════ GET ════════════════
  if (method === "GET") {
    const action = query.action as string;

    if (action === "status") {
      const code = (query.code as string)?.toUpperCase();
      if (!code) return err("Room code required");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      return ok({
        code: room.code, theme: room.theme, status: room.status,
        selectedQuestions: room.selectedQuestions, customQuestions: room.customQuestions,
        questionOrder: room.questionOrder, totalQuestions: room.questionOrder.length || totalQ(room),
        player1: room.player1 ? { name: room.player1.name, setupDone: room.player1.setupDone, quizDone: room.player1.quizDone, ready: room.player1.ready } : null,
        player2: room.player2 ? { name: room.player2.name, setupDone: room.player2.setupDone, quizDone: room.player2.quizDone, ready: room.player2.ready } : null,
      });
    }

    if (action === "result") {
      const code = (query.code as string)?.toUpperCase();
      const player = query.player as string;
      if (!code || !player) return err("Code and player required");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      if (room.status !== "finished") return err("Quiz not finished yet");

      const p1 = room.player1!; const p2 = room.player2!;
      const order = room.questionOrder;
      const questions = allQ(room);

      // Player 1 scored by matching Player 2's setup
      const p1Score = computeScore(p1.quizAnswers, p2.setupAnswers, order);
      // Player 2 scored by matching Player 1's setup
      const p2Score = computeScore(p2.quizAnswers, p1.setupAnswers, order);

      return ok({
        player1Score: p1Score, player2Score: p2Score,
        player1Name: p1.name, player2Name: p2.name,
        questionTexts: order.map((qIdx) => questions[qIdx]?.question || ""),
        theme: room.theme,
      });
    }

    return err("Unknown action");
  }

  // ════════════════ POST ════════════════
  if (method === "POST") {
    const body = await readBody(event);
    const action = body?.action as string;

    // ── Create room ──
    if (action === "create") {
      const { name, theme, selectedQuestions, customQuestions } = body;
      if (!name?.trim()) return err("Name required");
      let code = generateCode(); while (rooms.has(code)) code = generateCode();

      const presetSel = Array.isArray(selectedQuestions) && selectedQuestions.length > 0
        ? selectedQuestions : Array.from({ length: numPreset() }, (_, i) => i);
      const customs: CustomQ[] = Array.isArray(customQuestions) ? customQuestions : [];

      const room: Room = {
        code, theme: theme || "panda", createdAt: Date.now(),
        selectedQuestions: presetSel, customQuestions: customs, questionOrder: [],
        player1: { name: name.trim(), setupAnswers: {}, quizAnswers: {}, setupDone: false, quizDone: false, ready: false },
        player2: null, status: "waiting",
      };
      rooms.set(code, room);
      return ok({ code, theme: room.theme, status: "waiting", totalQuestions: presetSel.length + customs.length });
    }

    // ── Join room ──
    if (action === "join") {
      const { code, name } = body;
      if (!code?.trim() || !name?.trim()) return err("Code and name required");
      const room = getRoom(code.trim());
      if (!room) return err("Room not found! Cek kode room-nya ya 😅");
      if (room.player2) return err("Room sudah penuh! Coba bikin room baru 😅");
      if (room.status !== "waiting") return err("Quiz sudah dimulai!");

      room.player2 = { name: name.trim(), setupAnswers: {}, quizAnswers: {}, setupDone: false, quizDone: false, ready: false };
      room.status = "setup";
      return ok({
        code: room.code, theme: room.theme, status: "setup",
        selectedQuestions: room.selectedQuestions, customQuestions: room.customQuestions,
        totalQuestions: totalQ(room),
        player1: { name: room.player1!.name }, player2: { name: room.player2.name },
      });
    }

    // ── Submit setup answers (self-answers) ──
    if (action === "setup") {
      const { code, player, answers } = body;
      if (!code || !player || !answers) return err("Missing fields");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      const p = player === "1" ? room.player1 : room.player2;
      if (!p) return err("Player not found");
      p.setupAnswers = answers;
      p.setupDone = true;

      // If both done setup → go to readying
      if (room.player1?.setupDone && room.player2?.setupDone) {
        room.status = "readying";
      }
      return ok({ setupDone: true, status: room.status });
    }

    // ── Ready up ──
    if (action === "ready") {
      const { code, player } = body;
      if (!code || !player) return err("Missing fields");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      const p = player === "1" ? room.player1 : room.player2;
      if (!p) return err("Player not found");
      p.ready = true;

      if (room.player1?.ready && room.player2?.ready) {
        // Shuffle question order and start playing
        const allIndices = [
          ...room.selectedQuestions,
          ...room.customQuestions.map((_, i) => numPreset() + i),
        ];
        room.questionOrder = shuffleArray(allIndices);
        room.status = "playing";
      }
      return ok({ ready: true, status: room.status, player1Ready: room.player1?.ready ?? false, player2Ready: room.player2?.ready ?? false });
    }

    // ── Submit quiz answer (about partner) ──
    if (action === "quiz") {
      const { code, player, questionId, answer } = body;
      if (!code || !player || questionId === undefined || !answer) return err("Missing fields");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      if (room.status !== "playing") return err("Quiz not active");
      const p = player === "1" ? room.player1 : room.player2;
      if (!p) return err("Player not found");
      p.quizAnswers[String(questionId)] = answer;
      return ok({ saved: true, totalAnswered: Object.keys(p.quizAnswers).length });
    }

    // ── Finish quiz ──
    if (action === "finish") {
      const { code, player } = body;
      if (!code || !player) return err("Missing fields");
      const room = getRoom(code);
      if (!room) return err("Room not found");
      const p = player === "1" ? room.player1 : room.player2;
      if (!p) return err("Player not found");
      p.quizDone = true;
      if (room.player1?.quizDone && room.player2?.quizDone) room.status = "finished";
      return ok({ finished: true, status: room.status });
    }
  }

  return err("Method not allowed");
});
