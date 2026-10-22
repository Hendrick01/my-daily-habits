-- Treino de cada usuário (avaliação, treinos e exercícios próprios) num documento só.
-- Conflitos: vence a versão mais recente (updated_at).
create table public.training_plans (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null
);

alter table public.training_plans enable row level security;

create policy "treino: ver o próprio" on public.training_plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "treino: criar o próprio" on public.training_plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "treino: editar o próprio" on public.training_plans
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
