import { NextRequest, NextResponse } from 'next/server'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://localhost:11434' })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { medications } = body
    
    const prompt = `You are a helpful healthcare assistant providing personalized health tips for seniors. Focus on medication adherence, general wellness, and safety. Always remind users to consult their healthcare provider.

Generate a personalized health tip for a senior patient. Their current medications include: ${medications?.map((med: any) => `${med.name} ${med.dosage}`).join(', ') || 'none specified'}. Focus on medication management, general wellness, or safety tips.

Respond with valid JSON in this exact format: { "tip": "your tip here", "category": "category name", "priority": "high" }

JSON:`

    const response = await ollama.generate({
      model: 'llama3.2',
      prompt: prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    })

    // Try to parse JSON from the response
    let result
    try {
      const jsonStart = response.response.indexOf('{')
      const jsonEnd = response.response.lastIndexOf('}') + 1
      const jsonStr = response.response.substring(jsonStart, jsonEnd)
      result = JSON.parse(jsonStr)
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