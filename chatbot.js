(function () {
  // Chatbot UI banana
  const chatHTML = `
    <div id="ai-chatbot" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: Arial, sans-serif;
    ">
      <!-- Chat Button -->
      <div id="chat-btn" style="
        width: 60px;
        height: 60px;
        background: #000;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">💬</div>

      <!-- Chat Box -->
      <div id="chat-box" style="
        display: none;
        width: 320px;
        height: 450px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 10px;
      ">
        <!-- Header -->
        <div style="
          background: #000;
          color: white;
          padding: 16px;
          font-weight: bold;
          font-size: 16px;
        ">🤖 AI Shopping Assistant</div>

        <!-- Messages -->
        <div id="chat-messages" style="
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          height: 320px;
          background: #f9f9f9;
        ">
          <div style="
            background: #e0e0e0;
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 8px;
            font-size: 14px;
          ">
            Assalam o Alaikum! 👋 Mujhe batao aapko kya chahiye? Jaise: "blue dress under 2000"
          </div>
        </div>

        <!-- Input -->
        <div style="
          padding: 12px;
          background: white;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
        ">
          <input id="chat-input" type="text" placeholder="Kya chahiye aapko?" style="
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            outline: none;
          "/>
          <button id="chat-send" style="
            background: #000;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          ">Send</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatHTML);

  // Chat open/close
  const chatBtn = document.getElementById("chat-btn");
  const chatBox = document.getElementById("chat-box");

  chatBtn.addEventListener("click", () => {
    if (chatBox.style.display === "none") {
      chatBox.style.display = "flex";
      chatBox.style.flexDirection = "column";
    } else {
      chatBox.style.display = "none";
    }
  });

  // Message send karna
  async function sendMessage() {
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");
    const userMessage = input.value.trim();

    if (!userMessage) return;

    // User message show karo
    messages.innerHTML += `
      <div style="
        background: #000;
        color: white;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 8px;
        font-size: 14px;
        text-align: right;
      ">${userMessage}</div>
    `;

    input.value = "";

    // Loading show karo
    messages.innerHTML += `
      <div id="loading" style="
        background: #e0e0e0;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 8px;
        font-size: 14px;
      ">⏳ Soch raha hoon...</div>
    `;

    messages.scrollTop = messages.scrollHeight;

    try {
      // Shopify products fetch karo
      const productsRes = await fetch("/products.json?limit=50");
      const productsData = await productsRes.json();
      const products = productsData.products.map((p) => ({
        name: p.title,
        price: p.variants[0].price,
        url: window.location.origin + "/products/" + p.handle,
        image: p.images[0]?.src,
      }));

      // Backend ko call karo
     const response = await fetch("https://shopify-ai-chatbot-one.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, products }),
      });

      const data = await response.json();

      // Loading hatao aur reply show karo
      document.getElementById("loading").remove();
      messages.innerHTML += `
        <div style="
          background: #e0e0e0;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          font-size: 14px;
        ">${data.reply}</div>
      `;
    } catch (error) {
      document.getElementById("loading").remove();
      messages.innerHTML += `
        <div style="
          background: #ffe0e0;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 8px;
          font-size: 14px;
        ">❌ Kuch error aya, dobara try karo!</div>
      `;
    }

    messages.scrollTop = messages.scrollHeight;
  }

  document.getElementById("chat-send").addEventListener("click", sendMessage);
  document.getElementById("chat-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
