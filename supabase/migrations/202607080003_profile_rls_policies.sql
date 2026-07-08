-- RLS policies for the pre-existing profiles table.

alter table public.profiles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Public provider profiles are readable') then
    create policy "Public provider profiles are readable" on public.profiles
      for select to anon, authenticated
      using (provider_enabled = true or provider_verified = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users read own profile') then
    create policy "Users read own profile" on public.profiles
      for select to authenticated using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users update own profile') then
    create policy "Users update own profile" on public.profiles
      for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
  end if;
end;
$$;

grant select on public.profiles to anon;
grant select, update on public.profiles to authenticated;
