document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("sendButton");
  const messageInput = document.getElementById("messageInput");
  const chatMessages = document.getElementById("chatMessages");
  const clearChatButton = document.getElementById("clearChatButton");
  const downloadChatButton = document.getElementById("downloadChatButton");

  sendButton.addEventListener("click", () => {
      sendMessage();
  });

  messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
          e.preventDefault();  // Prevent the default new line insertion
          sendMessage();
      }
  });

  clearChatButton.addEventListener("click", () => {
      clearChat();
  });

  downloadChatButton.addEventListener("click", () => {
      downloadChatHistory();
  });

  async function sendMessage() {
      const userMessage = messageInput.value;
      if (userMessage.trim() === "") return;

      appendMessage(userMessage, 'user');
      
      try {
          const response = await query({ question: userMessage });
          const responseMessage = response?.text || "Sorry, I didn't get that.";

          // Ensure marked is properly recognized
          if (typeof marked !== "function") {
              console.error("marked is not a function");
              appendMessage(responseMessage, 'api'); // Fallback to plain text
              return;
          }

          const formattedMessage = marked.parse(responseMessage); // Use marked.parse for version >= 4.0.0
          console.log("Formatted message: ", formattedMessage); // Debugging log
          appendMessage(formattedMessage, 'api');
          chatMessages.scrollTop = chatMessages.scrollHeight;
          saveChatSession();
      } catch (error) {
          console.error("Error fetching API response:", error);
          appendMessage("Error fetching response from the server. Please try again later.", 'api');
      }

      messageInput.value = "";
  }

  function appendMessage(message, sender) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", sender);
      messageElement.innerHTML = `<div class="message-content">${message}</div>`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function query(data) {
      try {
          const response = await fetch(
              "http://localhost:3000/api/v1/prediction", // Make sure this matches your server URL
              {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
              }
          );
          if (!response.ok) throw new Error(`Server responded with ${response.status}`);
          const result = await response.json();
          return result;
      } catch (error) {
          console.error("Error in API call:", error);
          throw error;
      }
  }

  function saveChatSession() {
      const messages = [];
      chatMessages.querySelectorAll(".message").forEach((messageElement) => {
          messages.push({
              sender: messageElement.classList.contains("user") ? "user" : "api",
              content: messageElement.querySelector(".message-content").innerHTML,
          });
      });

      localStorage.setItem("chatSession", JSON.stringify(messages));
  }

  function loadChatSession() {
      const savedSession = JSON.parse(localStorage.getItem("chatSession"));
      if (savedSession) {
          savedSession.forEach(({ sender, content }) => {
              appendMessage(content, sender);
          });
      }
      chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function clearChat() {
      chatMessages.innerHTML = "";
      localStorage.removeItem("chatSession");
  }

  function downloadChatHistory() {
      const messages = [];
      chatMessages.querySelectorAll(".message").forEach((messageElement) => {
          messages.push({
              sender: messageElement.classList.contains("user") ? "You" : "Bot",
              content: messageElement.querySelector(".message-content").innerText,
          });
      });

      const zip = new JSZip();
      const docContent = messages.map(message => `${message.sender}: ${message.content}`).join("\n\n");
      zip.file("chat_history.txt", docContent);
      zip.generateAsync({ type: "blob" }).then(content => {
          saveAs(content, "chat_history.zip");
      });
  }

  loadChatSession();
});