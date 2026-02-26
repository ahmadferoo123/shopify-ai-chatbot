export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, collections } = req.body;

    const prompt = `You are a helpful shopping assistant for an online store.
Available collections in the store:
${JSON.stringify(collections)}

Customer message: "${message}"

Match the customer's request to the most relevant collection(s) from the list above.
Show collection name as a clickable link using HTML like: <a href="COLLECTION_URL" target="_blank">COLLECTION NAME</a>
Keep response short. Respond in English only.
If no matching collection found, say: "Sorry, no matching collection found."`;

    const geminiRes = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await geminiRes.json();
    
    // Agar error aaye toh dikhao
    if (data.error) {
      return res.status(200).json({ reply: `API Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, could not get a response.";
    res.status(200).json({ reply });

  } catch (err) {
    res.status(200).json({ reply: `Server Error: ${err.message}` });
  }
}
