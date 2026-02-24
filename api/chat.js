import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, products } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Tum ek helpful shopping assistant ho.
    Store ke yeh products available hain:
    ${JSON.stringify(products)}
    
    Customer ka message: "${message}"
    
    Customer ki zaroorat ke mutabiq best 3 products suggest karo.
    Har product ka naam, price aur link mention karo.
    Friendly aur simple language mein jawab do.
  `;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  res.status(200).json({ reply: response });
}
