import { NextRequest, NextResponse } from 'next/server'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: process.env.OLLAMA_HOST })

interface Medication {
  name: string
  dosage: string
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      // The body is likely empty or not valid JSON
      console.log('Request body is empty or invalid, proceeding with default prompt.');
      body = { medications: [] };
    }

    const { medications } = body

    const prompt = `
**Persona:**
You are "Medi-Care Assistant," a cautious, empathetic, and knowledgeable AI healthcare assistant for seniors. Your primary goal is to provide safe, practical, and encouraging health tips. You are not a doctor and you must never replace professional medical advice.

**User Profile:**
- An elderly individual.
- Their current medications are: ${
      medications?.map((med: Medication) => `${med.name} ${med.dosage}`).join(', ') || 'none specified'
    }.

**Task:**
Generate a single, personalized health tip based on the user's medication list. The tip must be highly relevant to the provided medications, focusing on potential interactions, management strategies, or general wellness that complements their treatment.

**Rules for the Tip:**
1.  **Safety First:** The tip must be safe and general. Avoid making specific claims about medication efficacy or side effects unless they are very common and public knowledge.
2.  **Actionable:** The user should be able to easily act on the tip.
3.  **Tone:** The tone should be positive, encouraging, and respectful. Not alarming.
4.  **Clarity:** Use simple, clear language. Avoid medical jargon.
5.  **Crucial Caveat:** ALWAYS include a sentence reminding the user to consult their doctor or pharmacist.
6.  **No Diagnosis:** Do not diagnose or speculate on the user's condition.

**Output Format:**
Respond with a single, valid JSON object in this exact format. Do not add any text before or after the JSON object.
{
  "tip": "A clear, actionable health tip, including the reminder to consult a healthcare provider.",
  "category": "The most relevant category for the tip (e.g., 'Medication Management', 'Drug-Food Interaction', 'General Wellness', 'Safety').",
  "priority": "A priority level ('high', 'medium', 'low') based on the tip's importance."
}`

    const response = await ollama.generate({
      model: 'deepseek-r1:latest',
      prompt: prompt,
      format: 'json', // Ensure JSON output
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    })

    // Try to parse JSON from the response
    let result
    try {
      result = JSON.parse(response.response)
    } catch (error) {
      console.error('Failed to parse Ollama response:', error)
      // Fallback if parsing fails
      result = {
        tip: "Remember to take your medications with a full glass of water. This helps with absorption and reduces the risk of stomach irritation.",
        category: "Medication Safety",
        priority: "high"
      }
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Ollama API error:", error)
    // Fallback tip if Ollama fails
    return NextResponse.json({
      tip: "Remember to take your medications with a full glass of water. This helps with absorption and reduces the risk of stomach irritation.",
      category: "Medication Safety",
      priority: "high"
    })
  }
}
