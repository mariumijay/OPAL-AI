import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      donorBloodType,
      recipientBloodType,
      requiredOrgan,
      matchScore,
      distanceKm,
      urgencyLevel,
      donorCity,
      recipientCity,
      compatibilityPoints,
      distancePoints,
      urgencyPoints,
    } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `You are a medical AI assistant for OPAL-AI, 
    Pakistan's organ and blood donor matching platform.
    
    Analyze this donor-recipient match and explain it in 
    simple, clear English for a hospital doctor.
    Keep it under 100 words. Be professional and concise.
    
    Match Details:
    - Donor Blood Type: ${donorBloodType}
    - Recipient Blood Type: ${recipientBloodType}
    - Required: ${requiredOrgan || "Blood Donation"}
    - Match Score: ${matchScore}/100
    - Distance: ${distanceKm}km 
      (${donorCity} to ${recipientCity})
    - Urgency Level: ${urgencyLevel}
    - Score Breakdown:
      Compatibility: ${compatibilityPoints} points
      Distance: ${distancePoints} points
      Urgency: ${urgencyPoints} points
    
    Explain in exactly 3 short sentences:
    1. Why this is medically a good match
    2. What the urgency level means for timing
    3. One clear recommendation for the hospital team`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const analysis = response.text();

    return NextResponse.json({ analysis }, { status: 200 });

  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
