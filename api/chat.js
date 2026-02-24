export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, products } = req.body;

  const prompt = `You are a helpful shopping assistant for an online store.
Available products in the store:
${JSON.stringify(products)}

Customer message: "${message}"

Based on the customer's request, suggest the best matching products from the list above.
For each product mention: Name, Price, and Link.
If no matching products found, say so politely.
Keep response short and helpful. Respond in English only.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, could not get a response.";

  res.status(200).json({ reply });
}
