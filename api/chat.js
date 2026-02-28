export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, products } = req.body;

    const prompt = `You are a friendly AI shopping assistant for an online store.

Store products available:
${JSON.stringify(products)}

Customer message: "${message}"

Instructions:
- If customer asks about products, prices, or categories - suggest matching products with clickable HTML links like: <a href="PRODUCT_URL" target="_blank">PRODUCT NAME</a> - $PRICE
- If customer greets you - greet back friendly
- If customer asks general questions - answer helpfully
- Always be friendly and helpful
- Keep responses short and clear
- Respond in English only
- Show maximum 5 products at a time`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://shopify-ai-chatbot-one.vercel.app"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `Error: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, could not get a response.";
    res.status(200).json({ reply });

  } catch (err) {
    res.status(200).json({ reply: `Server Error: ${err.message}` });
  }
}
