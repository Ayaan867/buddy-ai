import fetch from "node-fetch";

export default async function handler(req, res) {
    console.log("API route hit");   // Debug point 1

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { message } = req.body;
    console.log("Message received:", message);   // Debug point 2

    try {
        console.log("Sending request to Google API...");  // Debug point 3

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: message }] }]
                })
            }
        );

        const data = await response.json();
        console.log("Google API response:", data);   // DEBUG: THE IMPORTANT LINE

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Buddy could not respond.";

        return res.status(200).json({ reply });

    } catch (error) {
        console.log("Server Error:", error);  // Debug point 4
        return res.status(500).json({ error: "Server error" });
    }
}
