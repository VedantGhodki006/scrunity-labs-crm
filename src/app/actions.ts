"use server"

import { refresh } from "next/cache"
import { z } from "zod"

import { contactSchema } from "@/lib/contacts"
import { toRow } from "@/lib/contacts-data"
import { createSupabaseClient } from "@/lib/supabase"

export type ActionResult = { ok: true } | { ok: false; error: string }

const idSchema = z.uuid()

// Server Actions are public POST endpoints, so every input is re-validated here.
export async function createContact(input: unknown): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: "Invalid contact details." }

  const { error } = await createSupabaseClient()
    .from("contacts")
    .insert(toRow(parsed.data))
  if (error) return { ok: false, error: error.message }

  refresh()
  return { ok: true }
}

export async function updateContact(
  id: unknown,
  input: unknown
): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id)
  const parsed = contactSchema.safeParse(input)
  if (!parsedId.success || !parsed.success) {
    return { ok: false, error: "Invalid contact details." }
  }

  const { error } = await createSupabaseClient()
    .from("contacts")
    .update(toRow(parsed.data))
    .eq("id", parsedId.data)
  if (error) return { ok: false, error: error.message }

  refresh()
  return { ok: true }
}

export async function deleteContact(id: unknown): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id)
  if (!parsedId.success) return { ok: false, error: "Invalid contact id." }

  const { error } = await createSupabaseClient()
    .from("contacts")
    .delete()
    .eq("id", parsedId.data)
  if (error) return { ok: false, error: error.message }

  refresh()
  return { ok: true }
}
