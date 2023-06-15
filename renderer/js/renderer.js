const form = document.getElementById("form_sentence");
const sentenceFormed = document.getElementById("sentence_formed");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const sentence = formData.get("sentence");

    if (sentence.trim() === "") {
      alertMessage("error", "Please enter a valid sentence!");
      return;
    }
    if (sentence.length < 5) {
      alertMessage("error", "Sentence must be at least 5 characters long!");
      return;
    }

    const response = await window.axios.openAI(sentence);

    const userMessage = createMessage("user", sentence);
    const aiMessage = createMessage("ai", response.choices[0].text);

    sentenceFormed.appendChild(userMessage);
    sentenceFormed.appendChild(aiMessage);

    // Scroll to the bottom of the chat container
    sentenceFormed.scrollTop = sentenceFormed.scrollHeight;

    // Clear the input field
    form.reset();
  });
}

function createMessage(sender, text) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const message = document.createElement("div");
  message.classList.add("message");
  message.classList.add(sender === "ai" ? "ai-message" : "user-message");

  const senderLabel = document.createElement("span");
  senderLabel.classList.add("sender-label");
  senderLabel.textContent = sender === "ai" ? "Coeus: " : " ";

  const messageText = document.createElement("span");
  messageText.classList.add("message-text");

  message.appendChild(senderLabel);
  message.appendChild(messageText);

  if (sender === "ai") {
    const typingText = "Typing...";
    const typingSpeed = 100; // Speed of typing in milliseconds

    let currentText = "";
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      currentText += typingText[currentIndex];
      messageText.textContent = currentText;
      currentIndex++;

      if (currentIndex >= typingText.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          messageText.textContent = text;
        }, 1000); // Delay before displaying the actual AI response
      }
    }, typingSpeed);
  } else {
    messageText.textContent = text;
  }

  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  updateTimestamp(timestamp);

  message.appendChild(timestamp);

  messageContainer.appendChild(message);

  return messageContainer;
}

function updateTimestamp(timestampElement) {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const timestamp = `${date}, ${time}`;
  timestampElement.textContent = timestamp;

  setTimeout(() => {
    updateTimestamp(timestampElement);
  }, 1000); // Update the timestamp every second
}

const messages = document.querySelectorAll(".message");
messages.forEach((message) => {
  const timestamp = document.createElement("div");
  timestamp.classList.add("timestamp");
  updateTimestamp(timestamp);

  message.appendChild(timestamp);
});

function alertMessage(status, sentence) {
  window.Toastify.showToast({
    text: sentence,
    duration: 3000,
    stopOnFocus: true,
    style: {
      textAlign: "center",
      background: status == "error" ? "red" : "green",
      color: "white",
      padding: "5px",
      marginTop: "2px",
    },
  });
}
