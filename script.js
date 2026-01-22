const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const doneBtn = document.getElementById("doneBtn");
const stopBtn = document.getElementById("stopBtn");
const timerDisplay = document.getElementById("timerDisplay");
const timeSelect = document.getElementById("timeSelect");

let timer = null;
let remaining = 0;
let isRunning = false;

/* ===== 音：呼吸みたいな区切り音 ===== */
function playSoftSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.value = 880; // ← 前の優しい高さのまま

  // 音量カーブ（呼吸を長く）
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.08); // ふわっと立ち上がる
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1); // ← 余韻を長く

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.15);
}


/* ===== 保存 ===== */
function saveState() {
  localStorage.setItem("now_one_task", taskInput.value);
  localStorage.setItem("now_one_remaining", remaining);
  localStorage.setItem("now_one_running", isRunning);
  localStorage.setItem(
    "now_one_mode",
    document.querySelector('input[name="mode"]:checked').value
  );
}

/* ===== 復元 ===== */
function loadState() {
  const savedTask = localStorage.getItem("now_one_task");
  const savedRemaining = localStorage.getItem("now_one_remaining");
  const savedRunning = localStorage.getItem("now_one_running");
  const savedMode = localStorage.getItem("now_one_mode");

  if (savedTask) taskInput.value = savedTask;
  if (savedRemaining) remaining = Number(savedRemaining);
  if (savedMode) {
    document.querySelector(
      `input[name="mode"][value="${savedMode}"]`
    ).checked = true;
  }

  isRunning = savedRunning === "true";

  if (isRunning && remaining > 0) {
    updateTimer();
    startTimer();
  }

  syncUI();
}

/* ===== UI同期（超重要） ===== */
function syncUI() {
  if (isRunning) {
    startBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");
    timerDisplay.classList.remove("hidden");
    taskInput.disabled = true;
  } else {
    startBtn.classList.remove("hidden");
    stopBtn.classList.add("hidden");
    taskInput.disabled = false;
  }
}

/* ===== タイマー表示 ===== */
function updateTimer() {
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timerDisplay.textContent =
    `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/* ===== タイマー開始 ===== */
function startTimer() {
  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    remaining--;
    updateTimer();
    saveState();

    if (remaining <= 0) {
      clearInterval(timer);
      isRunning = false;
      playSoftSound();
      resetAll();
    }
  }, 1000);
}

/* ===== 完了時のみ完全リセット ===== */
function resetAll() {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  remaining = 0;

  taskInput.value = "";
  timerDisplay.textContent = "00:00";
  timerDisplay.classList.add("hidden");

  localStorage.clear();
  syncUI();
}

/* ===== イベント ===== */

// はじめる
startBtn.addEventListener("click", () => {
  if (!taskInput.value.trim()) return;

  const mode = document.querySelector('input[name="mode"]:checked').value;

  if (mode === "timer") {
    remaining = Number(timeSelect.value) * 60;
    updateTimer();
    isRunning = true;
    startTimer();
  }

  saveState();
  syncUI();
});

// ストップ（途中停止）
stopBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  isRunning = false;
  saveState();
  syncUI();
});

// 完了（いつでも）
doneBtn.addEventListener("click", () => {
  playSoftSound();
  resetAll();
});

/* ===== 初期化 ===== */
loadState();
updateTimer();
