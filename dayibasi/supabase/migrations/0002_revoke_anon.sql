-- Giriş yapmamış kişi (anon) bu fonksiyonları çağıramasın.
revoke execute on function public.create_business(text, text) from public, anon;
revoke execute on function public.is_member(uuid) from public, anon;
grant execute on function public.create_business(text, text) to authenticated;
grant execute on function public.is_member(uuid) to authenticated;
