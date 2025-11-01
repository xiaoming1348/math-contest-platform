import { z } from "zod";

export const updateMeSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateMeInput = z.infer<typeof updateMeSchema>;

export default updateMeSchema;
