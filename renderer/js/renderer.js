const form = document.getElementById("form_sentence");
const sentenceFormed = document.getElementById("sentence_formed");

// Load conversation from local storage on page load
window.addEventListener("load", loadConversationFromLocalStorage);

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

    const userMessage = createMessage("user", sentence);
    sentenceFormed.appendChild(userMessage);

    const aiTypingMessage = createMessage("ai", "", true);
    sentenceFormed.appendChild(aiTypingMessage);

    const response = await window.axios.openAI(sentence);

    // Remove the typing message and add the actual AI response
    sentenceFormed.removeChild(aiTypingMessage);
    const aiMessage = createMessage("ai", response.choices[0].text);
    sentenceFormed.appendChild(aiMessage);

    // Save conversation in local storage
    saveConversationToLocalStorage();

    // Scroll to the bottom of the chat container
    sentenceFormed.scrollTop = sentenceFormed.scrollHeight;

    // Clear the input field
    form.reset();
  });
}

function createMessage(sender, text, isTyping = false) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const message = document.createElement("div");
  message.classList.add("message");
  message.classList.add(sender === "ai" ? "ai-message" : "user-message");

  if (sender === "ai") {
    message.classList.add("ai-message-separate"); // Add class for AI message separation
  }

  const senderLabel = document.createElement("span");
  senderLabel.classList.add("sender-label");
  senderLabel.textContent = sender === "ai" ? "Coeus: " : "User: ";

  const messageText = document.createElement("span");
  messageText.classList.add("message-text");

  message.appendChild(senderLabel);
  message.appendChild(messageText);

  if (isTyping) {
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

function saveConversationToLocalStorage() {
  const conversation = [];
  const messageContainers =
    sentenceFormed.querySelectorAll(".message-container");

  messageContainers.forEach((container) => {
    const sender = container.querySelector(".sender-label").textContent;
    const messageText = container.querySelector(".message-text").textContent;

    conversation.push({
      sender,
      messageText,
    });
  });

  localStorage.setItem("conversation", JSON.stringify(conversation));
}

function loadConversationFromLocalStorage() {
  const savedConversation = localStorage.getItem("conversation");

  if (savedConversation) {
    const conversation = JSON.parse(savedConversation);

    conversation.forEach((message) => {
      const sender = message.sender.includes("Coeus") ? "ai" : "user";
      const text = message.messageText;

      const messageElement = createMessage(sender, text);
      sentenceFormed.appendChild(messageElement);
    });

    // Scroll to the bottom of the chat container
    sentenceFormed.scrollTop = sentenceFormed.scrollHeight;
  }
}
