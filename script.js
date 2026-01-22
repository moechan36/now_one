const taskInput = document.getElementById("taskInput");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const doneBtn = document.getElementById("doneBtn");
const timerDisplay = document.getElementById("timerDisplay");
const timeSelect = document.getElementById("timeSelect");

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const historyList = document.getElementById("historyList");

let timer = null;
let remaining = 0;
let isRunning = false;
let currentStartTime = null;

/* ===== やさしい音 ===== */
function playSoftSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const now = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.value = 880;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 1.15);
}

/* ===== 履歴 ===== */
function saveHistory(task, start, end) {
  const history = JSON.parse(localStorage.getItem("now_one_history")) || [];

  history.unshift({
    task,
    start,
    end,
    duration: end - start
  });

  localStorage.setItem(
    "now_one_history",
    JSON.stringify(history.slice(0, 20))
  );
}

function formatDuration(ms) {
  const min = Math.round(ms / 60000);
  return `${min}分`;
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("now_one_history")) || [];
  historyList.innerHTML = "";

  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.task}　${formatDuration(item.duration)}`;
    historyList.appendChild(li);
  });
}

/* ===== UI ===== */
function updateTimer() {
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timerDisplay.textContent =
    `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

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

/* ===== タイマー ===== */
function startTimer() {
  timer = setInterval(() => {
    remaining--;
    updateTimer();

    if (remaining <= 0) {
      clearInterval(timer);
      finishTask();
    }
  }, 1000);
}

function finishTask() {
  isRunning = false;
  playSoftSound();

  if (currentStartTime) {
    saveHistory(taskInput.value, currentStartTime, Date.now());
  }

  resetAll();
}

/* ===== リセット ===== */
function resetAll() {
  clearInterval(timer);
  timer = null;
  remaining = 0;
  currentStartTime = null;

  taskInput.value = "";
  timerDisplay.classList.add("hidden");

  syncUI();
}

/* ===== イベント ===== */

// はじめる
startBtn.addEventListener("click", () => {
  if (!taskInput.value.trim()) return;

  const mode = document.querySelector('input[name="mode"]:checked').value;
  currentStartTime = Date.now();

  if (mode === "timer") {
    remaining = Number(timeSelect.value) * 60;
    updateTimer();
    isRunning = true;
    startTimer();
  }

  syncUI();
});

// ストップ
stopBtn.addEventListener("click", () => {
  clearInterval(timer);
  isRunning = false;
  syncUI();
});

// おわった
doneBtn.addEventListener("click", () => {
  if (currentStartTime) {
    saveHistory(taskInput.value, currentStartTime, Date.now());
  }
  playSoftSound();
  resetAll();
});

// ハンバーガーメニュー（開閉）
menuBtn.addEventListener("click", () => {
  const isHidden = menu.classList.contains("hidden");

  if (isHidden) {
    menu.classList.remove("hidden");
    renderHistory();
  } else {
    menu.classList.add("hidden");
  }
});
