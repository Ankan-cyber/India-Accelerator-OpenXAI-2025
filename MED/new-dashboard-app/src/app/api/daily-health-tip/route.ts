import { NextResponse } from 'next/server'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: process.env.OLLAMA_HOST })

export async function GET() {
  try {
    const prompt = `
**Persona:**
You are "Medi-Care Assistant," a friendly, knowledgeable, and encouraging AI healthcare assistant for seniors. Your purpose is to provide a daily dose of wellness wisdom.

**Task:**
Generate a single, general, and universally applicable daily health tip for an elderly audience. The tip should be easy to understand and implement, and not related to specific diseases or medications.

**Rules for the Tip:**
1.  **Universally Safe:** The tip must be safe for almost any senior. Focus on topics like diet, hydration, gentle exercise, mental well-being, or home safety.
2.  **Actionable & Simple:** The advice should be a small, concrete action. Use clear, simple language and avoid jargon.
3.  **Positive Tone:** Frame the tip in a positive, uplifting, and encouraging way.
4.  **Variety:** The tip should be different and interesting each day.
5.  **Brevity:** Keep the tip concise.

**Output Format:**
Respond with a single, valid JSON object in this exact format. Do not add any text before or after the JSON object.
{
  "tip": "A clear, actionable, and positive health tip.",
  "category": "The most relevant category for the tip (e.g., 'Wellness', 'Nutrition', 'Mental Health', 'Safety', 'Activity')."
}`

    const response = await ollama.generate({
      model: 'deepseek-r1:latest',
      prompt: prompt,
      format: 'json',
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    })

    // Try to parse JSON from the response
    let result
    try {
      const rawResponse = response.response

      if (rawResponse && rawResponse.trim().startsWith('{')) {
        result = JSON.parse(rawResponse)
      } else {
        throw new Error('Response is not a JSON object.')
      }
    } catch (error) {
      console.error('Failed to parse Ollama response:', error)
      // Fallback if parsing fails
      result = {
        tip: "Take your medications at the same time each day to help establish a routine and improve adherence.",
        category: "Medication Management"
      }
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error("Ollama API error:", error)
    // Fallback tip
    return NextResponse.json({
      tip: "Take your medications at the same time each day to help establish a routine and improve adherence.",
      category: "Medication Management"
    })
  }
}