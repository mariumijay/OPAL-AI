import * as z from "zod";

export const HospitalRegistrationSchema = z.object({
  // STEP 1: Hospital Info
  hospital_name: z.string().min(3, "Full registered hospital name is required"),
  license_number: z.string().min(5, "Medical license number must be at least 5 characters"),
  hospital_type: z.union([
    z.literal("Public"),
    z.literal("Private"),
    z.literal("NGO")
  ], {
    message: "Please select a valid hospital type",
  }),
  specialization: z.array(z.string()).min(1, "Please select at least one specialization"),

  // STEP 2: Location & Contact
  city: z.string().min(2, "City is required"),
  full_address: z.string().min(5, "Complete physical address is required"),
  latitude: z.preprocess((val) => Number(val), z.number().min(-90).max(90)),
  longitude: z.preprocess((val) => Number(val), z.number().min(-180).max(180)),
  phone: z.string().regex(/^\+92[0-9]{10}$/, "Invalid format. Use +92XXXXXXXXXX"),
  emergency_contact: z.string().min(5, "Emergency contact info is required"),

  // STEP 3: Admin Account
  admin_name: z.string().min(3, "Administrator name is required"),
  designation: z.string().min(2, "Designation is required (e.g. Medical Director)"),
  email: z.string().email("Please enter a valid institutional email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string(),

  // STEP 4: Review & Consent
  confirm_accurate: z.literal(true, {
    message: "You must confirm accuracy of provided information",
  }),
  agree_terms: z.literal(true, {
    message: "Agreement to terms and verification is required",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const DonorRequestSchema = z.object({
  request_type: z.enum(["Blood", "Plasma", "Organ"]),
  blood_type: z.string().min(1, "Blood type is required"),
  organ_needed: z.string().optional(),
  urgency_level: z.enum(["Routine", "Urgent", "Emergency"]),
  search_radius_km: z.number().min(5).max(100),
  notes: z.string().optional(),
});

export type DonorRequestValues = z.infer<typeof DonorRequestSchema>;
