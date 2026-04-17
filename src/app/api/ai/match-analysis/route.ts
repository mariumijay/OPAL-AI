import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { donor, recipientType, organType, matchScore } = await req.json();

    if (!donor || !recipientType) {
      return NextResponse.json({ error: "Context incomplete: donor and recipient data required." }, { status: 400 });
    }

    const prompt = `
      You are a Clinical Transplant Specialist analyzing a potential match between a donor and a hospital request.
      
      MATCH CONTEXT:
      - Donor Name: ${donor.full_name}
      - Donor Blood Type: ${donor.blood_type}
      - Requested Organ: ${organType || "Whole Blood"}
      - Patient Blood Type: ${recipientType}
      - Match Score (Algorithm): ${matchScore}%
      - Donor Clinical Data: HIV(${donor.clinical?.hiv}), Hep(${donor.clinical?.hep}), Diabetic(${donor.clinical?.diabetes ? 'Yes' : 'No'})
      
      TASK:
      Provide a concise 3-sentence clinical analysis.
      Sentence 1: Comment on blood compatibility.
      Sentence 2: Comment on medical viability based on donor health.
      Sentence 3: Provide a summary recommendation for the surgeon.
      
      Return as plain text. Do not use markdown or emojis.
    `;

    // Generation Config for precision
    const generationConfig = {
      temperature: 0.2, // Low variance for medical consistency
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 600,
    };

    // Use a Promise race to implement timeout manually if the provider doesn't support it natively
    const analysisPromise = model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Analysis timeout")), 12000) // 12s timeout
    );

    const result: any = await Promise.race([analysisPromise, timeoutPromise]);
    
    if (!result.response) {
      throw new Error("Invalid model response");
    }

    const text = result.response.text();

    if (!text || text.trim() === "") {
      throw new Error("Empty analysis generated");
    }

    return NextResponse.json({ analysis: text });

  } catch (error: any) {
    console.error("Match Analysis AI Failure:", error);
    
    // Fallback response to ensure UI doesn't crash
    return NextResponse.json({ 
      analysis: "Clinical analysis currently unavailable. Please review raw medical parameters manually. Match prioritized based on blood type compatibility and clinical urgency.",
      isFallback: true,
      error: error.message
    });
  }
}
