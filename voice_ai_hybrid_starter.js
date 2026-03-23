// README.md

/*
VOICE AI HYBRID STARTER

Runs in browser (no installs) but can switch to local models later.

SETUP:
1. Create a GitHub repo
2. Add these files
3. Open index.html OR deploy with GitHub Pages

NOTE: Replace YOUR_API_KEY in services/llm/openai.js
*/


// =========================
// index.html
// =========================

<!DOCTYPE html>
<html>
<head>
  <title>Voice AI Hybrid</title>
</head>
<body>
  <h1>Voice AI Hybrid</h1>
  <button onclick="start()">🎤 Talk</button>
  <pre id="log"></pre>

  <script type="module" src="app.js"></script>
</body>
</html>


// =========================
// config.js
// =========================

export const CONFIG = {
  stt: "web",        // "web" | "local"
  llm: "openai",    // "openai" | "ollama"
  tts: "web"        // "web" | "local"
};


// =========================
// memory/memory.js
// =========================

export class Memory {
  constructor() {
    this.messages = [
      {
        role: "system",
        content: "You are Nova, a witty, slightly sarcastic AI assistant. Keep responses short."
      }
    ];
  }

  addUser(text) {
    this.messages.push({ role: "user", content: text });
  }

  addAI(text) {
    this.messages.push({ role: "assistant", content: text });
  }

  get() {
    return this.messages.slice(-10);
  }
}


// =========================
// services/stt/web.js
// =========================

export function createWebSTT(onResult) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  return {
    start: () => recognition.start()
  };
}


// =========================
// services/llm/openai.js
// =========================

export async function chatOpenAI(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}


// =========================
// services/llm/ollama.js
// =========================

export async function chatOllama(messages) {
  const res = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      messages
    })
  });

  const data = await res.json();
  return data.message.content;
}


// =========================
// services/tts/web.js
// =========================

export function speakWeb(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}


// =========================
// app.js
// =========================

import { CONFIG } from "./config.js";
import { Memory } from "./memory/memory.js";
import { createWebSTT } from "./services/stt/web.js";
import { chatOpenAI } from "./services/llm/openai.js";
import { chatOllama } from "./services/llm/ollama.js";
import { speakWeb } from "./services/tts/web.js";

const log = document.getElementById("log");
const memory = new Memory();

const llm = CONFIG.llm === "openai" ? chatOpenAI : chatOllama;
const tts = speakWeb;

function write(text) {
  log.textContent += text + "\n";
}

const stt = createWebSTT(async (text) => {
  write("You: " + text);

  memory.addUser(text);

  const reply = await llm(memory.get());

  memory.addAI(reply);

  write("AI: " + reply);

  tts(reply);
});

window.start = () => {
  write("Listening...");
  stt.start();
};
