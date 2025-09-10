import { NextResponse } from 'next/server'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://10.100.46.151:11434' })

export async function GET() {
  try {
    const prompt = `You are a healthcare assistant providing daily health tips for seniors. Focus on practical, actionable advice for medication management, wellness, and safety.

Generate a daily health tip for seniors focusing on medication adherence, general wellness, or safety.

Respond with valid JSON in this exact format: { "tip": "your tip here", "category": "category name" }

JSON:`

    const response = await ollama.generate({
      model: 'llama3',
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