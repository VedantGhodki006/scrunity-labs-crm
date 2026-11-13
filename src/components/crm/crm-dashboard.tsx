"use client"

import { startTransition, useOptimistic, useState } from "react"
import {
  LogOutIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createContact, deleteContact, updateContact } from "@/app/actions"
import { signOut } from "@/app/auth/actions"
import {
  STATUS_LABELS,
  STATUSES,
  toContactInput,
  type Contact,
  type ContactInput,
  type Status,
} from "@/lib/contacts"
import { ContactDialog } from "./contact-dialog"

const STATUS_VARIANTS: Record<
  Status,
  "default" | "secondary" | "outline" | "destructive"
> = {
  lead: "outline",
  prospect: "secondary",
  customer: "default",
  churned: "destructive",
}

const filterItems = [
  { value: "all", label: "All statuses" },
  ...STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
]

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

type OptimisticChange =
  | { type: "upsert"; contact: Contact }
  | { type: "delete"; id: string }

// Placeholder rows shown before the database has assigned a real id.
const PENDING_PREFIX = "pending-"

function applyChange(contacts: Contact[], change: OptimisticChange) {
  if (change.type === "delete") return contacts.filter((c) => c.id !== change.id)
  const exists = contacts.some((c) => c.id === change.contact.id)
  return exists
    ? contacts.map((c) => (c.id === change.contact.id ? change.contact : c))
    : [change.contact, ...contacts]
}

export function CrmDashboard({
  contacts: serverContacts,
  userEmail,
}: {
  contacts: Contact[]
  userEmail: string
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  // Restores the form after a failed save so nothing typed is lost.
  const [draft, setDraft] = useState<ContactInput | undefined>(undefined)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  // Supabase round trips take a second or two, so the UI updates immediately
  // and reconciles with the server result once the action finishes.
  const [contacts, addOptimistic] = useOptimistic(serverContacts, applyChange)

  const q = query.trim().toLowerCase()
  const filtered = contacts.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      (!q ||
        [c.name, c.email, c.company, c.phone, c.notes].some((v) =>
          v.toLowerCase().includes(q)
        ))
  )

  const pipeline = contacts
    .filter((c) => c.status === "lead" || c.status === "prospect")
    .reduce((sum, c) => sum + c.value, 0)
  const won = contacts
    .filter((c) => c.status === "customer")
    .reduce((sum, c) => sum + c.value, 0)
  const customers = contacts.filter((c) => c.status === "customer").length

  const stats = [
    { label: "Total contacts", value: contacts.length.toString() },
    { label: "Customers", value: customers.toString() },
    { label: "Open pipeline", value: currency.format(pipeline) },
    { label: "Won revenue", value: currency.format(won) },
  ]

  function openAdd() {
    setEditing(null)
    setDraft(undefined)
    setDialogOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditing(contact)
    setDraft(undefined)
    setDialogOpen(true)
  }

  function handleSubmit(data: ContactInput) {
    const target = editing
    setDialogOpen(false)
    startTransition(async () => {
      addOptimistic({
        type: "upsert",
        contact: {
          ...data,
          id: target?.id ?? `${PENDING_PREFIX}${crypto.randomUUID()}`,
          value: data.value ? Number(data.value) : 0,
          createdAt: target?.createdAt ?? new Date().toISOString(),
        },
      })
      const result = target
        ? await updateContact(target.id, data)
        : await createContact(data)
      if (!result.ok) {
        toast.error(`Couldn't save contact: ${result.error}`)
        setEditing(target)
        setDraft(data)
        setDialogOpen(true)
        return
      }
      toast.success(target ? `Updated ${data.name}` : `Added ${data.name}`)
    })
  }

  function confirmDelete() {
    if (!deleting) return
    const contact = deleting
    setDeleting(null)
    startTransition(async () => {
      addOptimistic({ type: "delete", id: contact.id })
      const result = await deleteContact(contact.id)
      if (!result.ok) {
        toast.error(`Couldn't delete contact: ${result.error}`)
        return
      }
      toast.success(`Deleted ${contact.name}`)
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your leads, prospects and customers in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd}>
            <PlusIcon data-icon="inline-start" />
            Add contact
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Account menu" />
              }
            >
              <UserIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="truncate">{userEmail}</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => startTransition(() => signOut())}>
                <LogOutIcon />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All contacts</CardTitle>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <InputGroup className="sm:w-64">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search contacts…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search contacts"
              />
            </InputGroup>
            <Select
              items={filterItems}
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <UsersIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {contacts.length === 0 ? "No contacts yet" : "No matches"}
                </EmptyTitle>
                <EmptyDescription>
                  {contacts.length === 0
                    ? "Add your first contact to start building your pipeline."
                    : "Try a different search term or status filter."}
                </EmptyDescription>
              </EmptyHeader>
              {contacts.length === 0 && (
                <EmptyContent>
                  <Button onClick={openAdd}>
                    <PlusIcon data-icon="inline-start" />
                    Add contact
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes / next step</TableHead>
                  <TableHead className="text-right">Deal value</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={
                      contact.id.startsWith(PENDING_PREFIX) ? "opacity-60" : undefined
                    }
                  >
                    <TableCell>
                      <div className="font-medium">{contact.name}</div>
                      {contact.email && (
                        <div className="text-muted-foreground">{contact.email}</div>
                      )}
                    </TableCell>
                    <TableCell>{contact.company || "—"}</TableCell>
                    <TableCell>{contact.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[contact.status]}>
                        {STATUS_LABELS[contact.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs min-w-48 whitespace-normal">
                      {contact.notes ? (
                        // Long notes are clamped; hover shows the full text.
                        <p className="line-clamp-2" title={contact.notes}>
                          {contact.notes}
                        </p>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {contact.value ? currency.format(contact.value) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {dateFormat.format(new Date(contact.createdAt))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${contact.name}`}
                              disabled={contact.id.startsWith(PENDING_PREFIX)}
                            />
                          }
                        >
                          <MoreHorizontalIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(contact)}>
                            <PencilIcon />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleting(contact)}
                          >
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editing ? "edit" : "add"}
        defaultValues={draft ?? (editing ? toContactInput(editing) : undefined)}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the contact and its notes. This can&apos;t
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
