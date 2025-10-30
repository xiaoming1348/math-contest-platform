import { z } from "zod";
import type { Role } from "@prisma/client";

export const AllowedNewRoles: Readonly<Role[]> = [
  "TEACHER",
  "STUDENT",
] as const;

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  role: z
    .custom<Role>((val) => typeof val === "string", {
      message: "Invalid role",
    })
    .refine(
      (val) => (AllowedNewRoles as readonly string[]).includes(val as string),
      {
        message: "Role must be TEACHER or STUDENT",
      }
    ) as z.ZodType<Role>,
  tempPassword: z.string().min(8).max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export default createUserSchema;
