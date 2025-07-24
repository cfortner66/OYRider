require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GEMINI_API_KEY;
const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const headers = {
  'Content-Type': 'application/json',
};

const requestBody = {
  contents: [
    {
      parts: [
        { text: "Say hello from OYDeveloper!" }
      ]
    }
  ]
};

axios.post(endpoint, requestBody, { headers })
  .then(response => {
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("✅ Gemini replied:", reply);
  })
  .catch(error => {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
  });
