export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, collections } = req.body;
    const msg = message.toLowerCase();

    const matched = collections.filter((c) => {
      const name = c.name.toLowerCase();
      const words = msg.split(" ");
      return words.some((word) => name.includes(word) && word.length > 2);
    });

    let reply = "";

    if (matched.length > 0) {
      reply = "Here are the matching collections for you:<br><br>";
      matched.forEach((c) => {
        reply += `👉 <a href="${c.url}" target="_blank" style="color:#000;font-weight:bold;">${c.name}</a><br>`;
      });
    } else {
      reply = "Sorry, no matching collection found. Please try different keywords!";
    }

    res.status(200).json({ reply });

  } catch (err) {
    res.status(200).json({ reply: `Server Error: ${err.message}` });
  }
}
