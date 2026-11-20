// Vercel serverless function: POST /api/chat
// Uses Google Gemini (free tier). Needs the GEMINI_API_KEY environment variable set in Vercel.
const SYSTEM = `You are the assistant on Wielotho Nyuthe's portfolio website. Answer visitors' questions about Wielotho in a friendly, concise way (2-4 sentences unless asked for more).

Facts about Wielotho (only use these; never invent anything else):
- Electrical & Electronics Engineering (B.Tech) student at NIT Nagaland, based in Nagaland, India.
- Earlier education: Higher Secondary at St. John Higher Secondary Residential School, Dimapur, Nagaland; High School at St. Xavier Hr. Sec. School, Meluri, Nagaland.
- Areas studied: control systems (transfer functions, state-space models, Simulink), digital signal processing (discrete signals, linear and circular convolution), power systems (fault analysis, per-unit systems), embedded systems (microprocessors, microcontrollers, memory, timers, assembly), MATLAB & Simulink, and machine-learning fundamentals / computer vision.
- Project: Image-Based Fake News Detector, a completed college project. It analyses news images and predicts whether the content is likely real or fake, using image data, preprocessing, feature extraction and machine-learning approaches.
- Enjoys understanding how systems work rather than memorising theory, and breaking problems into smaller pieces.
- Open to academic opportunities and collaborations. Contact: wielothonyuthe2005@gmail.com

If asked something not covered above (grades, other projects, personal details, availability, etc.), say you don't have that information and suggest emailing Wielotho. Do not make up facts. Stay on topic: politely decline unrelated requests (coding help, general chat, etc.) and steer back to Wielotho's background.`;

export default async function handler(req, res) {
   const key = process.env.GEMINI_API_KEY;
 
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!key) return res.status(500).json({ error: "Chatbot is not configured." });

  let messages = req.body && req.body.messages;
  if (typeof req.body === "string") { try { messages = JSON.parse(req.body).messages; } catch { messages = null; } }
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "Bad request" });

  // Keep only the last 10 turns, valid roles, and capped length (limits cost and abuse).
  messages = messages.slice(-10)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 500) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "Bad request" });

  try {
    const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      signal: AbortSignal.timeout(20000),
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
         generationConfig: { maxOutputTokens: 800, thinkingConfig: { thinkingLevel: "low" } }
      })
    });
    if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: "AI service error " + r.status + ": " + t.slice(0, 300) }); }
    const data = await r.json();
    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const reply = parts.map(p => p.text || "").join("").trim();
    return res.status(200).json({ reply: reply || "Sorry, I couldn't come up with an answer." });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + String(e).slice(0, 200) });
  }
}
