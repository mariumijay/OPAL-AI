import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof LoginSchema>;
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
