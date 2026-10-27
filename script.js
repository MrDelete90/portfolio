// ---------- Dark mode ----------
const themeButton = document.getElementById("themeToggle");
themeButton.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    themeButton.textContent = "Switch to Light Mode";
  } else {
    themeButton.textContent = "Switch to Dark Mode";
  }
});

// ---------- Project search ----------
const searchInput = document.getElementById("projectSearch");
const cards = document.querySelectorAll(".project-card");
const noResults = document.getElementById("noResults");

searchInput.addEventListener("input", function () {
  const term = searchInput.value.toLowerCase().trim();
  let visible = 0;
  cards.forEach(function (card) {
    const text = card.textContent.toLowerCase() + " " + card.dataset.tech.toLowerCase();
    const match = text.includes(term);
    card.hidden = !match;
    if (match) visible++;
  });
  noResults.hidden = visible > 0;
});

// ---------- Chatbot ----------
const chatWindow = document.getElementById("chatWindow");
const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");

function addMessage(text, className) {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  chatWindow.appendChild(p);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return p;
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (message === "") return;

  addMessage(message, "user-msg");
  chatInput.value = "";
  const typing = addMessage("Typing...", "bot-msg");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    });
    if (!response.ok) throw new Error("Request failed");
    const data = await response.json();
    typing.textContent = data.reply;
  } catch (error) {
    typing.textContent = "Sorry, something went wrong. Please try again.";
    typing.classList.add("error-msg");
  }
}

chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") sendMessage();
});