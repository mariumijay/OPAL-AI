import { getServiceSupabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface EmergencyRequest {
  requestId: string;
  bloodType: string;
  organType?: string;
  requestType: "blood" | "organ" | "plasma";
  hospitalName: string;
  hospitalCity: string;
  hospitalLat: number;
  hospitalLng: number;
  urgencyLevel: "emergency";
  patientAge?: number;
  notes?: string;
}

interface DonorMatch {
  id?: string;
  donor_id?: string;
  full_name: string;
  email: string;
  blood_type: string;
  city: string;
  latitude: number;
  longitude: number;
  contact_number: string;
}

function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function generateEmergencyMessage(
  donorName: string,
  bloodType: string,
  hospitalName: string,
  hospitalCity: string,
  distanceKm: number,
  requestType: string,
  organType?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash" 
  });

  const result = await model.generateContent(`
    You are OPAL-AI, Pakistan's life-saving donor platform.
    Write an urgent but compassionate email message to a donor.
    Keep it under 120 words. Be direct and respectful.
    
    Details:
    - Donor Name: ${donorName}
    - Donor Blood Type: ${bloodType}
    - Hospital: ${hospitalName}, ${hospitalCity}
    - Distance from donor: ${distanceKm.toFixed(1)}km
    - Request Type: ${requestType}
    - Organ Needed: ${organType || "N/A"}
    
    Write ONLY the email body (no subject).
    Start with "Dear ${donorName},"
    Include:
    1. There is an emergency need matching their profile
    2. The hospital name and distance
    3. Ask them to contact the hospital immediately
    4. End with OPAL-AI signature
    
    Tone: Urgent but warm. This could save a life.
  `);

  return result.response.text();
}

export async function runEmergencyAlerts(
  request: EmergencyRequest
): Promise<{ alertsSent: number; donors: string[] }> {
  const supabase = getServiceSupabase();
  const alertsSent: string[] = [];

  try {
    // Blood type compatibility map
    const compatibleDonors: Record<string, string[]> = {
      "A+":  ["A+", "A-", "O+", "O-"],
      "A-":  ["A-", "O-"],
      "B+":  ["B+", "B-", "O+", "O-"],
      "B-":  ["B-", "O-"],
      "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      "AB-": ["A-", "B-", "AB-", "O-"],
      "O+":  ["O+", "O-"],
      "O-":  ["O-"],
    };

    const validDonorTypes = 
      compatibleDonors[request.bloodType] || [request.bloodType];

    // Fetch matching donors
    const table = request.requestType === "organ" 
      ? "organ_donors" 
      : "blood_donors";

    const { data: donors, error } = await supabase
      .from(table)
      .select("*")
      .in("blood_type", validDonorTypes)
      .eq("is_available", true);

    if (error || !donors || donors.length === 0) {
      return { alertsSent: 0, donors: [] };
    }

    // Filter by distance (max 100km) and sort closest first
    const nearbyDonors = (donors as DonorMatch[])
      .filter(d => d.latitude && d.longitude)
      .map(d => ({
        ...d,
        distanceKm: haversine(
          request.hospitalLat,
          request.hospitalLng,
          d.latitude,
          d.longitude
        ),
      }))
      .filter(d => d.distanceKm <= 100)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10); // Max 10 alerts per emergency

    // Send personalized AI email to each donor
    for (const donor of nearbyDonors) {
      try {
        const aiMessage = await generateEmergencyMessage(
          donor.full_name,
          donor.blood_type,
          request.hospitalName,
          request.hospitalCity,
          donor.distanceKm,
          request.requestType,
          request.organType
        );

        await transporter.sendMail({
          from: `"OPAL-AI Emergency" <${process.env.GMAIL_USER}>`,
          to: donor.email || process.env.GMAIL_USER, // fallback for safety
          subject: `🚨 URGENT: ${request.hospitalName} needs ${request.bloodType} ${request.requestType} donor`,
          html: `
            <div style="font-family: Inter, sans-serif; 
              max-width: 600px; margin: 0 auto; 
              background: #0a0a0a; color: #ffffff; 
              padding: 40px; border-radius: 16px;
              border: 1px solid #DC2626;">
              
              <div style="background: #DC2626; padding: 16px; 
                border-radius: 8px; margin-bottom: 24px;
                text-align: center;">
                <h1 style="color: white; margin: 0; 
                  font-size: 20px;">
                  🚨 EMERGENCY DONOR REQUEST
                </h1>
                <p style="color: rgba(255,255,255,0.8); 
                  margin: 4px 0 0; font-size: 13px;">
                  OPAL-AI Life-Saving Alert
                </p>
              </div>

              <div style="background: #111; padding: 24px; 
                border-radius: 8px; margin-bottom: 24px;
                border: 1px solid #333;">
                <p style="color: #9ca3af; margin: 0; 
                  line-height: 1.8; font-size: 14px;
                  white-space: pre-line;">
                  ${aiMessage}
                </p>
              </div>

              <div style="background: #1a1a1a; padding: 16px;
                border-radius: 8px; margin-bottom: 24px;">
                <h3 style="color: #DC2626; margin: 0 0 12px;
                  font-size: 14px; text-transform: uppercase;
                  letter-spacing: 1px;">
                  Request Details
                </h3>
                <table style="width: 100%; 
                  border-collapse: collapse;">
                  <tr>
                    <td style="color: #6b7280; padding: 6px 0;
                      font-size: 13px;">Hospital</td>
                    <td style="color: #fff; font-weight: bold;
                      font-size: 13px;">
                      ${request.hospitalName}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 6px 0;
                      font-size: 13px;">Location</td>
                    <td style="color: #fff; font-weight: bold;
                      font-size: 13px;">
                      ${request.hospitalCity}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 6px 0;
                      font-size: 13px;">Blood Type</td>
                    <td style="color: #DC2626; font-weight: bold;
                      font-size: 13px;">
                      ${request.bloodType}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 6px 0;
                      font-size: 13px;">Distance</td>
                    <td style="color: #fff; font-weight: bold;
                      font-size: 13px;">
                      ${donor.distanceKm.toFixed(1)} km away
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; padding: 6px 0;
                      font-size: 13px;">Urgency</td>
                    <td style="color: #DC2626; font-weight: bold;
                      font-size: 13px;">
                      🚨 EMERGENCY
                    </td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; 
                margin-bottom: 24px;">
                <a href="tel:${request.hospitalCity}"
                  style="background: #DC2626; color: white;
                  padding: 14px 32px; border-radius: 8px;
                  text-decoration: none; font-weight: bold;
                  font-size: 16px; display: inline-block;">
                  Contact Hospital Now
                </a>
              </div>

              <p style="color: #4b5563; font-size: 11px; 
                text-align: center; margin: 0;">
                OPAL-AI — Saving Lives Through Technology<br/>
                Lahore Garrison University FYP Project<br/>
                You are receiving this because you are a 
                registered donor matching this emergency.
              </p>
            </div>
          `,
        });

        alertsSent.push(donor.id || donor.donor_id || "unknown_id");
      } catch (emailError) {
        console.error("Failed answering to donor:", donor.email, emailError);
      }
    }

    return { alertsSent: alertsSent.length, donors: alertsSent };

  } catch (error) {
    console.error("Critical error inside emergency alerts:", error);
    return { alertsSent: 0, donors: [] };
  }
}
