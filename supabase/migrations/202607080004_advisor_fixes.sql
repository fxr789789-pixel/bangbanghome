-- Advisor fixes after applying the BangBang schema.

do $$
begin
  if exists (select 1 from pg_proc where oid = 'public.update_updated_at_column()'::regprocedure) then
    alter function public.update_updated_at_column() set search_path = public;
  end if;

  if exists (select 1 from pg_proc where oid = 'public.handle_new_user()'::regprocedure) then
    alter function public.handle_new_user() set search_path = public, auth;
  end if;

  if exists (select 1 from pg_proc where oid = 'public.set_updated_at()'::regprocedure) then
    alter function public.set_updated_at() set search_path = public;
  end if;
end;
$$;

create index if not exists commissions_order_id_idx on public.commissions(order_id);
create index if not exists commissions_source_user_id_idx on public.commissions(source_user_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists orders_request_id_idx on public.orders(request_id);
create index if not exists payments_payer_id_idx on public.payments(payer_id);
create index if not exists reviews_reviewer_id_idx on public.reviews(reviewer_id);
create index if not exists user_consents_document_id_idx on public.user_consents(document_id);
