import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const {
      age,
      bloodType,
      medicalConditions,
      hepatitisStatus,
      donationType,
    } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `You are a medical eligibility checker for 
    OPAL-AI Pakistan donor platform.
    
    Check if this person is eligible to donate and give advice.
    Keep response under 80 words. Be clear and helpful.
    
    Donor Profile:
    - Age: ${age}
    - Blood Type: ${bloodType}
    - Medical Conditions: ${medicalConditions || "None"}
    - Hepatitis Status: ${hepatitisStatus}
    - Donation Type: ${donationType}
    
    Respond with:
    1. Eligibility status (Eligible/Not Eligible/Conditional)
    2. One reason why
    3. One health tip for the donor`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    return NextResponse.json({ analysis }, { status: 200 });

  } catch {
    return NextResponse.json(
      { error: "Eligibility check failed" },
      { status: 500 }
    );
  }
}
