-- Bucket de Storage para los archivos adjuntos de pedidos
-- (tabla archivos_pedido.url_storage). Ver 52_SUPABASE_SCHEMA.md.
-- Privado: solo accesible para el usuario autenticado (V1 mono-usuario),
-- igual que el resto de las políticas RLS de este proyecto.

insert into storage.buckets (id, name, public)
values ('archivos-pedido', 'archivos-pedido', false);

create policy "usuario_autenticado_select" on storage.objects
  for select using (bucket_id = 'archivos-pedido' and auth.role() = 'authenticated');

create policy "usuario_autenticado_insert" on storage.objects
  for insert with check (bucket_id = 'archivos-pedido' and auth.role() = 'authenticated');

create policy "usuario_autenticado_update" on storage.objects
  for update using (bucket_id = 'archivos-pedido' and auth.role() = 'authenticated')
  with check (bucket_id = 'archivos-pedido' and auth.role() = 'authenticated');

create policy "usuario_autenticado_delete" on storage.objects
  for delete using (bucket_id = 'archivos-pedido' and auth.role() = 'authenticated');
