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

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
       "Authorization": `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`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500
      }),
    });

    const data = await groqRes.json();

    if (data.error) {
      return res.status(200).json({ reply: `Error: ${data.error.message}` });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, could not get a response.";
    res.status(200).json({ reply });

  } catch (err) {
    res.status(200).json({ reply: `Server Error: ${err.message}` });
  }
}
