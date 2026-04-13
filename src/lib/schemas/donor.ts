import * as z from "zod";

export const donorFormSchema = z.object({
  // Step 1
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  donationType: z.enum(["Blood Donation Only", "Organ Donation Only", "Both"], { message: "Please select a donation type." }),

  // Step 2
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  age: z.coerce.number().min(18, "You must be 18 or older to donate.").max(100, "Invalid age."),
  gender: z.enum(["Male", "Female", "Other"], { message: "Please select a gender." }),
  city: z.string().min(2, "City is required."),
  contactNumber: z.string().min(10, "Contact number must be valid."),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, "CNIC must be in 00000-0000000-0 format."),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),

  // Step 3 (Blood Context)
  bloodType: z.string().min(1, "Blood type is required."),
  hepStatus: z.enum(["Negative", "Positive"], { message: "Hepatitis status is required." }),
  medicalConditions: z.string().optional(),

  // Step 3 (Organ Context - conditionally refined)
  organsWilling: z.array(z.string()).optional(),
  hivStatus: z.enum(["Negative", "Positive"]).optional(),
  diabetes: z.enum(["Yes", "No"]).optional(),
  smoker: z.enum(["Yes", "No"]).optional(),
  medications: z.string().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  donorStatus: z.enum(["Living", "Posthumous"]).optional(),

  // Step 4
  donatingItems: z.array(z.string()).optional(),
  nextOfKinName: z.string().optional(),
  nextOfKinContact: z.string().optional(),
  consent: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Blood Donation Logic
  if (data.donationType === "Blood Donation Only" || data.donationType === "Both") {
    if (!data.donatingItems || data.donatingItems.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select at least one blood product to donate.", path: ["donatingItems"] });
    }
  }

  // Organ Donation Logic
  if (data.donationType === "Organ Donation Only" || data.donationType === "Both") {
    if (!data.organsWilling || data.organsWilling.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select at least one organ.", path: ["organsWilling"] });
    }
    if (!data.hivStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "HIV status is required.", path: ["hivStatus"] });
    if (!data.diabetes) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Diabetes status is required.", path: ["diabetes"] });
    if (!data.smoker) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Smoker status is required.", path: ["smoker"] });
    if (!data.height || data.height < 100 || data.height > 250) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Height must be 100-250cm.", path: ["height"] });
    if (!data.weight || data.weight < 30 || data.weight > 300) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Weight must be 30-300kg.", path: ["weight"] });
    if (!data.donorStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Donor status is required.", path: ["donorStatus"] });
    if (!data.nextOfKinName || data.nextOfKinName.trim().length < 2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Next of kin name is required.", path: ["nextOfKinName"] });
    if (!data.nextOfKinContact || data.nextOfKinContact.trim().length < 10) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid contact required.", path: ["nextOfKinContact"] });
    if (data.consent !== true) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "You must legally consent.", path: ["consent"] });
  }
});

export type DonorFormValues = z.infer<typeof donorFormSchema>;
