import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

export async function callLLM(prompt) {
  // 🧪 TEST MODE — NO EXTERNAL CALLS
  if (process.env.NODE_ENV === "test") {
    return JSON.stringify({
      job_id: "JOB001",
      recommended_trucks: [
        {
          operator_id: "OP1",
          truck_id: "T1",
          final_price: 30000,
          rank: 1,
          delivery_feasibility: "HIGH",
          reasoning: "Lowest price with minimal route deviation"
        }
      ]
    });
  }

  // 🚀 PRODUCTION MODE — REAL HUGGING FACE CALL
  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${process.env.HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0,
          max_new_tokens: 700,
          return_full_text: false
        }
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data[0].generated_text;
}