const output = document.getElementById("output");

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";

let conversation = [
  {
    role: "system",
    content: "You are Nova, a witty and slightly sarcastic AI assistant."
  }
];

function startListening() {
  recognition.start();
}

recognition.onresult = async (event) => {
  const userText = event.results[0][0].transcript;
  output.innerText = "You: " + userText;

  conversation.push({ role: "user", content: userText });

  const reply = await getAIResponse(conversation);

  conversation.push({ role: "assistant", content: reply });

  speak(reply);

  output.innerText += "\nAI: " + reply;
};

async function getAIResponse(messages) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: messages
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}
