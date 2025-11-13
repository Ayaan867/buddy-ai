import fetch from "node-fetch";

export default async function handler(req, res) {
  console.log("API route hit");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  console.log("Message received:", message);

  try {
    console.log("Sending request to Google API...");

    const url =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
      process.env.GOOGLE_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    });

    const data = await response.json();
    console.log("🔥 FULL Google API response:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 👉 NEW Gemini response structure
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output_text ||
      data?.text ||
      "AI returned no text";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
