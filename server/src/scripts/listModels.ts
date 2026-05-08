import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function listModels() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const models = await groq.models.list();
  console.log(JSON.stringify(models.data.map((model) => model.id), null, 2));
}

listModels();
