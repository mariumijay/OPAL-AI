import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      matchScore,
      distanceKm,
      bloodType,
      urgencyLevel,
      donationType,
      donorCity,
      hospitalCity,
      timeOfDay,
      bloodTypeRarity,
    } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `You are a medical AI prediction system 
    for OPAL-AI Pakistan donor platform.
    
    Predict the probability (0-100) that this donor will 
    successfully respond to a donation request.
    
    Factors to analyze:
    - Match Score: ${matchScore}/100
    - Distance: ${distanceKm}km away
    - Required Blood Type: ${bloodType}
    - Blood Type Rarity: ${bloodTypeRarity}
    - Urgency Level: ${urgencyLevel}
    - Donation Type: ${donationType}
    - Donor City: ${donorCity}
    - Hospital City: ${hospitalCity}
    - Time of Request: ${timeOfDay}
    
    Rules for prediction:
    - Closer distance = higher probability
    - Emergency urgency = higher response rate
    - Rare blood types (AB-, B-, O-) = lower availability
    - Higher match score = better compatibility
    - Same city = much higher probability
    
    Respond with ONLY a JSON object, nothing else:
    {
      "probability": 85,
      "confidence": "high",
      "topFactor": "Donor is only 3km away",
      "riskFactor": "Rare blood type may limit availability"
    }
    
    probability must be a number between 10 and 95.
    confidence must be: "high", "medium", or "low"
    topFactor: main reason for this prediction (max 8 words)
    riskFactor: main concern (max 8 words)`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse JSON
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const prediction = JSON.parse(cleaned);

    return NextResponse.json(prediction, { status: 200 });

  } catch (error) {
    // Fallback prediction if Gemini fails
    return NextResponse.json({
      probability: 65,
      confidence: "medium",
      topFactor: "Compatible blood type match",
      riskFactor: "Unable to analyze all factors",
    }, { status: 200 });
  }
}
