# Wielotho Nyuthe – Portfolio

Static site plus a Vercel serverless function (api/chat.js) powering a free AI chat box (Google Gemini free tier).

## Enable the AI chat
1. Get a free key at aistudio.google.com/apikey (no credit card).
2. In Vercel: Project -> Settings -> Environment Variables -> add GEMINI_API_KEY.
3. Redeploy.
Optional: set GEMINI_MODEL if you want a different model than gemini-2.5-flash.
