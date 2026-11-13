import { z } from "zod"

export const STATUSES = ["lead", "prospect", "customer", "churned"] as const
export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  lead: "Lead",
  prospect: "Prospect",
  customer: "Customer",
  churned: "Churned",
}

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  // Optional, but must be a valid address when given.
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Enter a valid email address."
    ),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s()-]*$/, "Phone can only contain digits, spaces, + ( ) -."),
  company: z.string().trim(),
  status: z.enum(STATUSES),
  value: z
    .string()
    .trim()
    .regex(/^\d*(\.\d{0,2})?$/, "Enter a valid amount."),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer."),
})

export type ContactInput = z.infer<typeof contactSchema>

export type Contact = Omit<ContactInput, "value"> & {
  id: string
  value: number
  createdAt: string
}

export function toContactInput(contact: Contact): ContactInput {
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    status: contact.status,
    value: contact.value ? String(contact.value) : "",
    notes: contact.notes,
  }
}
