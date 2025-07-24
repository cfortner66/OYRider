require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function execPrompt(prompt) {
  console.log(`\n🤖 Gemini is generating code for:\n"${prompt}"\n`);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const filename = `generated-${Date.now()}.js`;
    const filepath = path.join(process.cwd(), filename);

    fs.writeFileSync(filepath, text);
    console.log(`✅ Code saved to ${filename}\n`);
  } catch (err) {
    console.error("❌ Error generating with Gemini:", err.message);
  }
}

module.exports = { execPrompt };
