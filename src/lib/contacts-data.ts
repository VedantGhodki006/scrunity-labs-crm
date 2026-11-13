import "server-only"

import { connection } from "next/server"

import type { Contact, ContactInput, Status } from "@/lib/contacts"
import { createSupabaseClient } from "@/lib/supabase"

type ContactRow = {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: Status
  value: number | string
  notes: string
  created_at: string
}

function fromRow(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    status: row.status,
    value: Number(row.value),
    notes: row.notes,
    createdAt: row.created_at,
  }
}

export function toRow(input: ContactInput) {
  return { ...input, value: input.value ? Number(input.value) : 0 }
}

export async function getContacts(): Promise<Contact[]> {
  // Contacts change at any time, so always read them at request time.
  await connection()
  const { data, error } = await createSupabaseClient()
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw new Error(`Failed to load contacts: ${error.message}`)
  return (data as ContactRow[]).map(fromRow)
}
