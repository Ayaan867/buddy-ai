// Note: Vercel's Node.js runtime has 'fetch' built-in, 
// so you often don't need to import 'node-fetch' if your Vercel
// deployment uses a recent Node.js version (like 18+).
// However, including the import is safest if you added it to package.json.
// If you are using Node 18 or higher, you can remove the next line:
// import fetch from "node-fetch";

export default async function handler(req, res) {
  // 1. Method Check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Extract Message from Body
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing 'message' in request body." });
  }

  // 3. Define the Correct API Endpoint (v1)
  const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
    process.env.GOOGLE_API_KEY;

  // 4. API Request Logic
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Crucial: Ensure the structure matches the v1/generateContent spec
        contents: [
          {
            role: "user", // Explicitly set role for safety
            parts: [{ text: message }],
          },
        ],
        // Safety: Add a generation config to prevent errors on simple requests
        config: {
            maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();

    // 5. Handle API Errors (e.g., 400s or 500s from Google)
    if (data.error) {
        // Log the full error to Vercel console for debugging
        console.error("Google API Error:", JSON.stringify(data.error)); 
        return res.status(data.error.code || 500).json({ 
            error: data.error.message,
            detail: "Error from Google API (Check Vercel logs for full error)."
        });
    }

    // 6. Extract the Reply
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No valid response from AI. Check the response format.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
