import { z } from "zod/v3";

// === Shared constants ===
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt limit
export const NAME_MIN_LENGTH = 2;

// === Login schema ===
export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// === Register schema ===
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(NAME_MIN_LENGTH, `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres`),
    email: z.string().email("Correo electrónico inválido"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
      .max(PASSWORD_MAX_LENGTH, `La contraseña no puede superar ${PASSWORD_MAX_LENGTH} caracteres`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// === Server-side register schema (no confirmPassword needed) ===
export const registerServerSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, "Name is required"),
  email: z
    .string()
    .email("Invalid email format"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`),
  cedula: z
    .string()
    .length(10, "Cédula must be exactly 10 digits")
    .regex(/^\d+$/, "Cédula must contain only numbers")
    .nullable()
    .optional(),
});

export type RegisterServerValues = z.infer<typeof registerServerSchema>;
