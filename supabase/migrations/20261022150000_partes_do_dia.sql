-- Partes do dia: um hábito pode ser dividido em partes, cada uma com horário opcional.
alter table public.habits
  add column parts jsonb,
  add column parts_done jsonb not null default '{}';

-- Por aparelho: quais avisos receber, e quais partes já foram avisadas hoje ({ date, keys }).
alter table public.push_subscriptions
  add column summary_enabled boolean not null default true,
  add column parts_enabled boolean not null default true,
  add column parts_sent jsonb not null default '{}';
