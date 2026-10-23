
function showAppModal({ icon = "💗", title = "", desc = "", defaultValue = "", isPrompt = true, onConfirm = null }) {
  const overlay = $("customModalOverlay");
  const iconEl = $("modalIcon");
  const titleEl = $("modalTitle");
  const descEl = $("modalDesc");
  const inputWrap = $("modalInputContainer");
  const inputField = $("modalInputField");
  const cancelBtn = $("modalCancelBtn");
  const confirmBtn = $("modalConfirmBtn");

  iconEl.textContent = icon;
  titleEl.textContent = title;
  descEl.textContent = desc;

  if (isPrompt) {
    inputWrap.classList.remove("hidden");
    inputField.value = defaultValue;
    cancelBtn.classList.remove("hidden");
    setTimeout(() => inputField.focus(), 100);
  } else {
    inputWrap.classList.add("hidden");
    cancelBtn.classList.add("hidden");
  }

  overlay.classList.remove("hidden");

  const cleanup = () => {
    overlay.classList.add("hidden");
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  confirmBtn.onclick = () => {
    const val = inputField.value.trim();
    cleanup();
    if (onConfirm) onConfirm(val);
  };

  cancelBtn.onclick = () => {
    cleanup();
  };

  inputField.onkeydown = (e) => {
    if (e.key === "Enter") {
      confirmBtn.click();
    } else if (e.key === "Escape") {
      cancelBtn.click();
    }
  };
}

function appPrompt(title, desc, defVal, callback) {
  showAppModal({ icon: "🔗", title, desc, defaultValue: defVal, isPrompt: true, onConfirm: callback });
}

function appAlert(title, desc, icon = "💖") {
  showAppModal({ icon, title, desc, isPrompt: false });
}

const $ = id => document.getElementById(id);
const state = { questions: [], answers: {}, roomId: null };

const bank = [
  "What is my favourite food?", "What is my favourite colour?", "What is my favourite movie?",
  "What song reminds me of us?", "Where did we first meet?", "What was my first impression of you?",
  "What is my favourite snack?", "What drink do I usually order?", "What is my dream travel destination?",
  "What is my favourite season?", "What makes me laugh the most?", "What is my biggest pet peeve?",
  "What is my comfort food?", "What nickname do I love the most from you?", "What is my favourite ice-cream flavour?",
  "What is my favourite hobby or passion?", "What is one thing that instantly cheers me up?", "What time do I usually go to sleep?",
  "What is my favourite festival or holiday?", "What is my go-to outfit colour?", "What is my favourite fruit?",
  "What is my dream job or career goal?", "What is my favourite way to spend a weekend?", "What is my favourite weather?",
  "What is one thing I am most afraid of?", "What is my most used app on my phone?", "What is my favourite childhood memory?",
  "What is one major thing on my bucket list?", "What is my idea of a perfect romantic date?", "What is my favourite flower?",
  "What is the first thing I noticed about you?", "What helps me feel most loved and cared for?", "What is my favourite dessert or sweet?",
  "What is my ideal lazy Sunday like?", "Where is one place I desperately want to visit with you?", "What is my favourite animal or pet?",
  "What is my most frequently used emoji?", "What is one goal I am currently working toward?", "What is my favourite breakfast meal?",
  "What is one little habit of mine you find cute or funny?", "What is my favourite clothing style or aesthetic?",
  "What is my love language (words, gifts, touch, time)?", "What is my favourite late-night snack?", "What is my biggest insecurity or fear in life?",
  "What kind of music relaxes me the most?", "What was our best date or memory together so far?", "What was the first gift I ever gave you (or you gave me)?",
  "What makes me really angry or frustrated?", "What is my favourite chocolate or sweet treat?", "If we could adopt any pet right now, what would I pick?",
  "What is my shoe size?", "Who is my favourite actor or celebrity?", "What is my favourite romantic movie of all time?",
  "Am I a morning person or a night owl?", "Do I prefer mountains, beaches, or quiet forests?", "What is my favourite fast food joint or street food?",
  "What is one thing I cannot leave the house without?", "What is my favourite thing about your personality?", "What is my favourite feature of yours?",
  "How do I like my tea or coffee prepared?", "What is one secret talent or quirky habit I have?", "What is my favourite board game or video game?",
  "What is my favourite pizza topping?", "If we won a lottery today, what is the first thing I would buy?", "What is one song I never get tired of listening to?",
  "What is my favourite perfume or scent?", "How do I react when I get super nervous or stressed?", "What is my favourite series or TV show?",
  "Do I prefer watching movies at home or in the theatre?", "What is my favourite photo of us together?", "What is one bad habit I am trying to quit?",
  "What is my favourite memory of our phone calls or chats?", "What is my zodiac sign?", "What is my birth date?",
  "What is the best surprise I ever gave you or received?", "What is my favourite childhood cartoon or show?", "Do I prefer texting, voice calls, or video calls?",
  "What is my go-to comfort drink when I am tired?", "What is one thing that always makes me blush?", "What is my favourite romantic gesture or surprise?",
  "What makes me feel truly appreciated?", "What is one thing you do that melts my heart instantly?", "What is my favourite memory from our early talking stage?",
  "What is one topic I can talk about for hours without stopping?", "Am I more emotional or more logical in tough situations?",
  "What is my favourite flavour of chips or crisps?", "If we lived together tomorrow, what chore would I gladly do?", "What is my favourite childhood nickname given by family?",
  "What is one dish I make really well (or would love to learn)?", "What is my dream car or vehicle?", "Do I prefer planned surprises or spontaneous adventures?",
  "What is my favourite thing to do when it rains?", "What is my favourite song to sing along to loudly?", "What was the exact moment I realized I fell for you?",
  "What is one promise I always want us to keep?", "What is my favourite thing about hugging you?", "What is our song or melody that feels like home?",
  "What is my dream honeymoon destination?", "What is one thing that makes our bond unique and special?", "How much do I love you (in your words)?"
];

const heartSymbols = ["💋", "💖", "💕", "❤️", "💗"];
function initFloatingHearts() {
  const container = $("bgHearts");
  if (!container) return;
  for (let i = 0; i < 22; i++) {
    const el = document.createElement("span");
    el.className = "float-heart";
    el.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    el.style.left = `${Math.random() * 100}vw`;
    el.style.fontSize = `${32 + Math.random() * 32}px`;
    el.style.animationDuration = `${8 + Math.random() * 8}s`;
    el.style.animationDelay = `${Math.random() * 7}s`;
    container.appendChild(el);
  }
}
initFloatingHearts();

let lastPop = 0;
function spawnCursorHeart(x, y) {
  const now = Date.now();
  if (now - lastPop < 120) return;
  lastPop = now;
  const heart = document.createElement("div");
  heart.className = "cursor-heart";
  heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  const dx = (Math.random() - 0.5) * 55;
  const dy = -25 - Math.random() * 45;
  const rot = (Math.random() - 0.5) * 60;
  heart.style.setProperty("--dx", `${dx}px`);
  heart.style.setProperty("--dy", `${dy}px`);
  heart.style.setProperty("--rot", `${rot}deg`);
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1500);
}
window.addEventListener("mousemove", e => spawnCursorHeart(e.clientX, e.clientY));
window.addEventListener("touchmove", e => {
  if (e.touches.length > 0) spawnCursorHeart(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

const views = ["home", "share", "play", "result", "arcadeModeSelect", "onlineConnectPage", "gamePage"];

function navTo(targetView, push = true) {
  views.forEach(id => {
    const el = $(id);
    if (el) el.classList.toggle("hidden", id !== targetView);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (push) {
    history.pushState({ view: targetView }, "", targetView === "home" ? "/" : `#${targetView}`);
  }
}

window.addEventListener("popstate", (e) => {
  if (e.state && e.state.view) {
    navTo(e.state.view, false);
  } else {
    const hash = location.hash.replace("#", "");
    if (views.includes(hash)) {
      navTo(hash, false);
    } else {
      navTo("home", false);
    }
  }
});

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const bankWithIds = bank.map((q, idx) => ({ id: idx + 1, question: q }));
let shuffledBank = shuffleArray(bankWithIds);

function renderFields() {
  const count = Number($("count").value);
  const root = $("answerFields");
  root.innerHTML = "";
  const selectedQuestions = shuffledBank.slice(0, count);
  selectedQuestions.forEach((q, i) => {
    const label = document.createElement("label");
    label.innerHTML = `<span>${i + 1}. ${escapeHtml(q.question)}</span>`;
    const input = document.createElement("input");
    input.maxLength = 160;
    input.dataset.qid = String(q.id);
    input.dataset.qtext = q.question;
    input.placeholder = "Your answer here…";
    label.appendChild(input);
    root.appendChild(label);
  });
  $("requiredInfo").textContent = `Please fill all ${count} answers below. Your partner will try to guess them!`;
}
$("count").addEventListener("change", renderFields);
renderFields();

$("createBtn").addEventListener("click", async () => {
  const creator = $("creator").value.trim();
  if (!creator) { alert("Enter your name first 💗"); return; }
  const count = Number($("count").value);
  const answers = {};
  const questionsMap = {};
  let filledCount = 0;
  document.querySelectorAll("[data-qid]").forEach(el => {
    const val = el.value.trim();
    if (val) {
      answers[el.dataset.qid] = val;
      questionsMap[el.dataset.qid] = el.dataset.qtext;
      filledCount++;
    }
  });
  if (filledCount < count) {
    alert(`Please fill all ${count} questions! (Currently filled: ${filledCount}/${count})`);
    return;
  }
  $("createBtn").disabled = true;
  $("createBtn").textContent = "Creating your quiz…";
  try {
    const r = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creator, answers, count, questionsMap })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Could not create quiz");
    state.roomId = data.id;
    const url = location.origin + data.playUrl;
    $("shareUrl").value = url;
    $("goPlay").onclick = () => loadQuiz(data.id);
    navTo("share");
  } catch (e) {
    alert(e.message);
  } finally {
    $("createBtn").disabled = false;
    $("createBtn").textContent = "Create our private quiz 💗";
  }
});

$("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("shareUrl").value);
    $("copyBtn").textContent = "Copied ✓";
  } catch {
    $("shareUrl").select();
    document.execCommand("copy");
    $("copyBtn").textContent = "Copied ✓";
  }
});

async function loadQuiz(id) {
  try {
    const r = await fetch(`/api/rooms/${encodeURIComponent(id)}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Could not load quiz");
    state.roomId = id;
    state.questions = data.questions;
    state.answers = {};
    $("playTitle").textContent = `${data.creator} wants to see how well you know them 💗`;
    $("progress").textContent = `${data.questions.length} questions · Answer honestly!`;
    const root = $("questions");
    root.innerHTML = "";
    data.questions.forEach((q, i) => {
      const wrap = document.createElement("div");
      wrap.className = "question";
      const label = document.createElement("label");
      label.innerHTML = `<span class="qnum">QUESTION ${i + 1}</span><br>${escapeHtml(q.question)}`;
      const input = document.createElement("input");
      input.maxLength = 160;
      input.placeholder = "Your answer…";
      input.dataset.answerId = q.id;
      wrap.append(label, input);
      root.appendChild(wrap);
    });
    navTo("play");
  } catch (e) {
    alert(e.message);
  }
}

$("submitBtn").addEventListener("click", async () => {
  const player = $("player").value.trim();
  if (!player) { alert("Add your name first 💕"); return; }
  const answers = {};
  document.querySelectorAll("[data-answer-id]").forEach(el => answers[el.dataset.answerId] = el.value.trim());
  $("submitBtn").disabled = true;
  try {
    const r = await fetch(`/api/rooms/${state.roomId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, answers, submissionId: crypto.randomUUID() })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Could not score quiz");
    $("score").textContent = data.score;
    $("correct").textContent = data.correct;
    $("wrong").textContent = data.total - data.correct;

    let title = "A sweet start 💗", msg = "Every couple has more to discover about each other.";
    if (data.score >= 900) { title = "Soulmate-level memory 💞"; msg = "You remember so many little details about your person!"; }
    else if (data.score >= 700) { title = "Lovebirds in sync 💖"; msg = "You know your person really well."; }
    else if (data.score >= 450) { title = "Growing closer 🌷"; msg = "A lovely chance to learn more about each other."; }
    else { title = "More memories to make 💌"; msg = "Ask each other these questions and discover new things together."; }

    $("resultTitle").textContent = title;
    $("resultText").textContent = msg;
    $("review").innerHTML = "";
    data.details.forEach((d, i) => {
      const el = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `${i + 1}. ${d.question}`;
      const compBox = document.createElement("div");
      compBox.className = "compare-box";
      let statusBadge = "";
      if (d.status === "perfect") statusBadge = `<div class="status-badge status-perfect">💗 Perfect Match</div>`;
      else if (d.status === "close") statusBadge = `<div class="status-badge status-close">💕 Almost There!</div>`;
      else statusBadge = `<div class="status-badge status-wrong">💔 Did Not Match</div>`;

      compBox.innerHTML = `
        ${statusBadge}
        <div class="ans-grid">
          <div class="ans-card creator-ans">
            <span class="ans-label">${escapeHtml(data.creator)}'s Answer:</span>
            <span class="ans-val">${escapeHtml(d.originalAnswer || "(Empty)")}</span>
          </div>
          <div class="ans-card player-ans">
            <span class="ans-label">${escapeHtml(data.player)}'s Answer:</span>
            <span class="ans-val">${escapeHtml(d.userAnswer || "(No answer)")}</span>
          </div>
        </div>
      `;
      el.append(summary, compBox);
      $("review").appendChild(el);
    });
    navTo("result");
  } catch (e) {
    alert(e.message);
  } finally {
    $("submitBtn").disabled = false;
  }
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* --- TIC-TAC-TOE & SOCKET MULTIPLAYER ENGINE --- */
let socket = null;
let currentGameMode = "local"; // "local" | "online"
let onlineRoomId = null;
let myPlayerRole = "P1";
let isOnlineConnected = false;

function initSocketConnection() {
  if (socket) return;
  try {
    socket = io();
    socket.on("couple_session_created", ({ sessionId, role }) => {
      onlineRoomId = sessionId;
      myPlayerRole = role || "P1";
      $("connStepSelect").classList.add("hidden");
      $("connStepWaiting").classList.remove("hidden");
      $("displayCoupleSessionCode").textContent = sessionId;
      $("coupleShareUrl").value = `${location.origin}/#couple-session-${sessionId}`;
    });

    socket.on("couple_session_connected", ({ sessionId }) => {
      onlineRoomId = sessionId;
      isOnlineConnected = true;
      if (!myPlayerRole) myPlayerRole = "P2";
      appAlert("Partner Connected! 🎉", "Both devices linked! Starting Tic-Tac-Toe...", "🟢");
      openGameScreen("online");
    });

    socket.on("receive_game_move", (moveData) => {
      if (window.handleRemoteTTTMove) window.handleRemoteTTTMove(moveData);
    });

    socket.on("couple_error", ({ message }) => {
      alert(message);
    });

    socket.on("partner_disconnected", ({ message }) => {
      alert(message);
      navTo("arcadeModeSelect");
    });
  } catch (err) {
    console.error("Socket error:", err);
  }
}

function openGameScreen(mode) {
  currentGameMode = mode;
  if (mode === "online") {
    initSocketConnection();
    if (!isOnlineConnected) {
      navTo("onlineConnectPage");
      return;
    }
  }
  navTo("gamePage");
  initTicTacToe($("activeGameContainer"));
}

function createGlobalCoupleSession() {
  initSocketConnection();
  appPrompt("Start Session", "Enter your name:", "Host", (name) => {
    socket.emit("create_couple_session", { playerName: name || "Host" });
  });
}

function joinGlobalCoupleSession() {
  initSocketConnection();
  const code = $("inputCoupleCode").value.trim().toUpperCase();
  if (!code) {
    appAlert("Code Required", "Please enter connection code!", "⚠️");
    return;
  }
  appPrompt("Join Session", "Enter your name:", "Partner", (name) => {
    myPlayerRole = "P2";
    socket.emit("join_couple_session", { sessionId: code, playerName: name || "Partner" });
  });
}

function copyCoupleLink() {
  const url = $("coupleShareUrl").value;
  navigator.clipboard.writeText(url).then(() => {
    $("copyCoupleLinkBtn").textContent = "Copied ✓";
    setTimeout(() => $("copyCoupleLinkBtn").textContent = "Copy Link", 2000);
  });
}

function broadcastMove(moveData) {
  if (currentGameMode === "online" && isOnlineConnected && socket && onlineRoomId) {
    socket.emit("send_game_move", { roomId: onlineRoomId, moveData });
  }
}

/* Tic-Tac-Toe Logic */
let tttBoard = Array(9).fill("");
let tttTurn = "❤️";
let tttWinner = null;

function initTicTacToe(container) {
  tttBoard = Array(9).fill("");
  tttTurn = "❤️";
  tttWinner = null;

  function renderTTT() {
    const isMyTurnOnline = currentGameMode !== "online" || !isOnlineConnected || (myPlayerRole === "P1" && tttTurn === "❤️") || (myPlayerRole === "P2" && tttTurn === "💋");
    container.innerHTML = `
      <div style="font-size:16px;color:#ff85a2;font-weight:700;margin-bottom:12px;text-align:center;">
        ${tttWinner ? (tttWinner === "Tie" ? "It's a Sweet Tie! 💕" : `Winner: ${tttWinner} 🎉`) : `Turn: ${tttTurn}`}
        ${currentGameMode === 'online' ? (isMyTurnOnline ? " <span style='color:#34d399;'>(Your Turn)</span>" : " <span style='color:#f87171;'>(Partner's Turn)</span>") : ""}
      </div>
      <div class="ttt-grid" id="tttGrid"></div>
      <button class="primary" id="btnResetTTT" style="max-width:180px;margin:14px auto 0;padding:8px 16px;">Play Again</button>
    `;

    const grid = $("tttGrid");
    tttBoard.forEach((val, i) => {
      const cell = document.createElement("div");
      cell.className = "ttt-cell";
      cell.textContent = val;
      cell.onclick = () => {
        if (currentGameMode === "online" && !isMyTurnOnline) { alert("Wait for partner's turn! ⏳"); return; }
        if (!tttBoard[i] && !tttWinner) {
          tttBoard[i] = tttTurn;
          checkTTTWinner();
          tttTurn = tttTurn === "❤️" ? "💋" : "❤️";
          broadcastMove({ board: tttBoard, turn: tttTurn, winner: tttWinner });
          renderTTT();
        }
      };
      grid.appendChild(cell);
    });

    $("btnResetTTT").onclick = () => {
      tttBoard = Array(9).fill("");
      tttTurn = "❤️";
      tttWinner = null;
      broadcastMove({ board: tttBoard, turn: tttTurn, winner: tttWinner });
      renderTTT();
    };
  }

  function checkTTTWinner() {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a,b,c] of lines) {
      if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
        if (!tttWinner) {
          tttWinner = tttBoard[a];
          appAlert("Winner! 🎉", `Player ${tttWinner} has won the game!`, "🏆");
        }
        return;
      }
    }
    if (!tttBoard.includes("") && !tttWinner) {
      tttWinner = "Tie";
      appAlert("It's a Tie! 🤝", "Great match! Try again.", "⚖️");
    }
  }

  window.handleRemoteTTTMove = (data) => {
    tttBoard = data.board;
    tttTurn = data.turn;
    tttWinner = data.winner;
    renderTTT();
  };

  renderTTT();
}

window.addEventListener("DOMContentLoaded", () => {
  const pathParts = location.pathname.split("/");
  if (pathParts[1] === "play" && pathParts[2]) {
    loadQuiz(pathParts[2]);
  }
  const hash = location.hash;
  if (hash.startsWith("#couple-session-")) {
    const code = hash.replace("#couple-session-", "");
    navTo("onlineConnectPage");
    setTimeout(() => {
      $("inputCoupleCode").value = code;
      joinGlobalCoupleSession();
    }, 500);
  }
});
