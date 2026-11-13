"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ContactInput } from "@/lib/contacts"
import { ContactForm } from "./contact-form"

export function ContactDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  defaultValues?: ContactInput
  onSubmit: (data: ContactInput) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add contact" : "Edit contact"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter the contact's details. Fields marked * are required."
              : "Update the contact's details and save your changes."}
          </DialogDescription>
        </DialogHeader>
        {/* Remount per open so the form resets to the latest defaults. */}
        {open && (
          <ContactForm
            id="contact-form"
            defaultValues={defaultValues}
            onSubmit={onSubmit}
          />
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="contact-form">
            {mode === "add" ? "Add contact" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
