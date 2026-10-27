import { z } from 'zod';

/**
 * Form schema: one source of truth for validation and the inferred type.
 * `categories` is a comma-separated string here; parseCategories turns it
 * into string[] when the form is submitted.
 */
export const promptFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  body: z.string().trim().min(1, 'Body is required'),
  categories: z.string(),
});

export type PromptFormValues = z.infer<typeof promptFormSchema>;
