import * as z from "zod";

export const hospitalFormSchema = z.object({
  // Hospital Details
  name: z.string().min(3, "Full registered hospital name is required"),
  license_number: z.string().min(5, "License number is required"),
  hospital_type: z.enum(["Public", "Private", "Military", "Non-Profit"]),
  specialization: z.string().min(2, "Primary specialization is required"),
  
  // Location
  city: z.string().min(2, "City is required"),
  full_address: z.string().min(10, "Full address required for verification"),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Admin / Contact
  admin_name: z.string().min(2, "Administrator name is required"),
  designation: z.string().min(2, "Designation/Title is required"),
  contact_email: z.string().email("Valid email required"),
  contact_phone: z.string().min(10, "Valid contact number required"),
  
  // Auth
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type HospitalRegistrationValues = z.infer<typeof hospitalFormSchema>;
