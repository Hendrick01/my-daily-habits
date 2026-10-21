-- Hábitos sincronizados entre aparelhos: uma linha por hábito.
-- Conflitos: vence a edição mais recente (updated_at). Excluir marca deleted = true,
-- para a exclusão chegar aos outros aparelhos.
create table public.habits (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (char_length(id) <= 100),
  title text not null check (char_length(title) between 1 and 200),
  goal text check (char_length(goal) <= 200),
  emoji text check (char_length(emoji) <= 16),
  schedule jsonb not null default '{"type": "daily"}',
  completed_dates text[] not null default '{}',
  deleted boolean not null default false,
  updated_at timestamptz not null,
  primary key (user_id, id)
);

alter table public.habits enable row level security;

create policy "habits: ver os próprios" on public.habits
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "habits: criar os próprios" on public.habits
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "habits: editar os próprios" on public.habits
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Um registro por aparelho que pediu lembrete (inscrição de Web Push).
create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  remind_at time not null default '20:00',
  timezone text not null default 'America/Sao_Paulo',
  last_sent_on date,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "push: ver os próprios" on public.push_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "push: criar os próprios" on public.push_subscriptions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "push: editar os próprios" on public.push_subscriptions
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "push: apagar os próprios" on public.push_subscriptions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- A cada 5 minutos, chama a função que envia os lembretes do horário.
-- O segredo fica no Vault (criado fora das migrações, para não ir para o Git).
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'send-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://mobrirbihyyxsnmqcsrj.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminders_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);
