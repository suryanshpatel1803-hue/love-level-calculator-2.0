const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map(); // Quiz rooms
const gameRooms = new Map(); // Live 2-Player Game Rooms

// String normalize helper
const norm = s => String(s ?? "").trim().toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const clamp = n => Math.max(1, Math.min(1000, Math.round(n)));

function squashRepeats(s) {
  return String(s || "").replace(/(.)\1{2,}/g, "$1");
}

function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function checkSimilarity(userAns, targetAns) {
  const s1 = norm(userAns);
  const s2 = norm(targetAns);
  if (!s1 || !s2) return { isMatch: false, points: -10, status: "wrong" };
  if (s1 === s2) return { isMatch: true, points: 100, status: "perfect" };

  const sq1 = squashRepeats(s1);
  const sq2 = squashRepeats(s2);
  if (sq1 === sq2) return { isMatch: true, points: 100, status: "perfect" };

  const dist = editDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);

  if (maxLen <= 5 && dist <= 2) {
    return { isMatch: true, points: dist === 1 ? 100 : 80, status: "close" };
  }
  if (s1.includes(s2) || s2.includes(s1)) {
    return { isMatch: true, points: 90, status: "close" };
  }
  const w1 = new Set(s1.split(/\s+/));
  const w2 = new Set(s2.split(/\s+/));
  let common = 0;
  w1.forEach(word => { if (w2.has(word)) common++; });
  const overlap = (2 * common) / (w1.size + w2.size);
  if (overlap >= 0.5) return { isMatch: true, points: 85, status: "close" };

  const similarityRatio = (maxLen - dist) / maxLen;
  if (similarityRatio >= 0.75) return { isMatch: true, points: 100, status: "perfect" };
  if (similarityRatio >= 0.50) return { isMatch: true, points: 50, status: "close" };

  return { isMatch: false, points: -10, status: "wrong" };
}

app.post("/api/rooms", (req, res) => {
  try {
    const creator = String(req.body.creator || "").trim().slice(0, 40);
    const answers = req.body.answers;
    const count = Math.max(5, Math.min(100, Number(req.body.count) || 10));
    if (!creator || !answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Add your name and answers first." });
    }
    const filled = Object.keys(answers).filter(k => String(answers[k] || "").trim());
    if (filled.length < count) {
      return res.status(400).json({ error: `Please fill all ${count} answers before creating the quiz!` });
    }
    const quiz = filled.slice(0, count).map(id => ({
      id: Number(id),
      question: req.body.questionsMap ? req.body.questionsMap[id] || `Question ${id}` : `Question ${id}`,
      answer: String(answers[id]).trim().slice(0, 160)
    }));
    const id = crypto.randomBytes(4).toString("hex");
    const ownerKey = crypto.randomBytes(16).toString("hex");
    rooms.set(id, { id, creator, ownerKey, quiz, createdAt: Date.now(), submissions: new Set() });
    return res.json({ id, creator, quizCount: quiz.length, ownerKey, playUrl: `/play/${id}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error creating room." });
  }
});

app.get("/api/rooms/:id", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Quiz room expired or not found. Please create a new quiz!" });
  return res.json({
    id: room.id,
    creator: room.creator,
    quizCount: room.quiz.length,
    questions: room.quiz.map(({ id, question }) => ({ id, question }))
  });
});

app.post("/api/rooms/:id/submit", (req, res) => {
  try {
    const room = rooms.get(req.params.id);
    if (!room) return res.status(404).json({ error: "Quiz room expired or not found." });
    const player = String(req.body.player || "").trim().slice(0, 40);
    const answers = req.body.answers;
    const submissionId = String(req.body.submissionId || "");
    if (!player || !answers || typeof answers !== "object" || !submissionId) {
      return res.status(400).json({ error: "Missing player name or answers." });
    }
    if (room.submissions.has(submissionId)) {
      return res.status(409).json({ error: "Already scored." });
    }
    room.submissions.add(submissionId);

    let points = 0, correct = 0;
    const details = room.quiz.map(q => {
      const userAnswer = String(answers[q.id] || "").trim();
      const match = checkSimilarity(userAnswer, q.answer);
      if (match.isMatch) correct++;
      points += match.points;
      return {
        question: q.question,
        originalAnswer: q.answer,
        userAnswer,
        correct: match.isMatch,
        status: match.status,
        points: match.points
      };
    });

    const maxPossible = room.quiz.length * 100;
    const minPossible = room.quiz.length * -10;
    const normalized = Math.round(((points - minPossible) / (maxPossible - minPossible)) * 999) + 1;
    const score = clamp(normalized);

    return res.json({ player, creator: room.creator, score, correct, total: room.quiz.length, details });
  } catch (err) {
    return res.status(500).json({ error: "Error scoring quiz." });
  }
});

// Socket.io Real-Time Tic-Tac-Toe & Connection Engine
io.on("connection", (socket) => {
  socket.on("create_couple_session", ({ playerName }) => {
    const sessionId = crypto.randomBytes(3).toString("hex").toUpperCase();
    gameRooms.set(sessionId, {
      id: sessionId,
      activeGame: "tictactoe",
      players: [{ id: socket.id, name: playerName || "Host", role: "P1" }]
    });
    socket.join(sessionId);
    socket.emit("couple_session_created", { sessionId, role: "P1" });
  });

  socket.on("join_couple_session", ({ sessionId, playerName }) => {
    const session = gameRooms.get(sessionId);
    if (!session) {
      return socket.emit("couple_error", { message: "Connection code not found! Please check the code." });
    }
    if (session.players.length >= 2) {
      return socket.emit("couple_error", { message: "This session already has 2 partners connected!" });
    }
    session.players.push({ id: socket.id, name: playerName || "Partner", role: "P2" });
    socket.join(sessionId);

    io.to(sessionId).emit("couple_session_connected", {
      sessionId,
      players: session.players.map(p => ({ name: p.name, role: p.role }))
    });
  });

  socket.on("send_game_move", ({ roomId, moveData }) => {
    socket.to(roomId).emit("receive_game_move", moveData);
  });

  socket.on("leave_couple_session", ({ sessionId }) => {
    io.to(sessionId).emit("partner_disconnected", { message: "Partner left the session." });
    gameRooms.delete(sessionId);
  });

  socket.on("disconnect", () => {
    for (const [sId, session] of gameRooms.entries()) {
      const idx = session.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        io.to(sId).emit("partner_disconnected", { message: "Partner disconnected." });
        gameRooms.delete(sId);
        break;
      }
    }
  });
});

app.get("/play/:id", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route not found" });
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Love Quiz & Tic-Tac-Toe running on http://localhost:${port}`));
