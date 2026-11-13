-- Shared team CRM: any signed-in user can read and edit every contact.
-- Signed-out (anon) requests match no policy, so they can't see anything.
create policy "Signed-in users can read contacts"
  on public.contacts for select to authenticated using (true);

create policy "Signed-in users can add contacts"
  on public.contacts for insert to authenticated with check (true);

create policy "Signed-in users can edit contacts"
  on public.contacts for update to authenticated using (true) with check (true);

create policy "Signed-in users can delete contacts"
  on public.contacts for delete to authenticated using (true);
