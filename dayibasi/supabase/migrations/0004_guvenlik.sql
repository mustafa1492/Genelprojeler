-- Güvenlik sıkılaştırma: uzunluk sınırları, işletme sınırı, KVKK için kişiyi tamamen silme.

-- 1) Uzunluk ve tutar sınırları (biri dev yazı yapıştırıp veritabanını şişiremesin)
alter table businesses     add constraint businesses_name_len  check (char_length(name) between 1 and 100);
alter table people         add constraint people_name_len      check (char_length(full_name) between 1 and 100),
                           add constraint people_phone_len     check (phone is null or char_length(phone) <= 20),
                           add constraint people_notes_len     check (notes is null or char_length(notes) <= 500),
                           add constraint people_tags_len      check (cardinality(tags) <= 30),
                           add constraint people_custom_len    check (octet_length(custom::text) <= 4000);
alter table places         add constraint places_name_len      check (char_length(name) <= 100),
                           add constraint places_custom_len    check (octet_length(custom::text) <= 4000);
alter table assets         add constraint assets_label_len     check (char_length(label) <= 30),
                           add constraint assets_capacity_ok   check (capacity is null or capacity between 1 and 100);
alter table documents      add constraint documents_title_len  check (char_length(title) <= 100),
                           add constraint documents_notes_len  check (notes is null or char_length(notes) <= 500);
alter table events         add constraint events_quantity_ok   check (quantity is null or quantity between 0 and 1000),
                           add constraint events_data_len      check (octet_length(data::text) <= 8000);
alter table ledger_entries add constraint ledger_amount_max    check (amount <= 100000000),
                           add constraint ledger_note_len      check (note is null or char_length(note) <= 300);
alter table message_templates add constraint templates_body_len check (char_length(body) <= 1000);

-- 2) İşletme açma: giriş şart, ürün adı bilinen olmalı, kişi başı en çok 3 işletme
create or replace function create_business(p_name text, p_product text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare bid uuid;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  if p_product not in ('dayibasi') then raise exception 'urun_yok'; end if;
  if (select count(*) from memberships where user_id = auth.uid() and role = 'sahip') >= 3 then
    raise exception 'isletme_siniri';
  end if;
  insert into businesses (name, product) values (trim(p_name), p_product) returning id into bid;
  insert into memberships (business_id, user_id, role) values (bid, auth.uid(), 'sahip');
  return bid;
end;
$$;

-- 3) KVKK: kişiyi ve ona ait her şeyi (avans, yoklama, işlem geçmişindeki izleri) kalıcı sil
create or replace function forget_person(p_id uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare bid uuid;
begin
  select business_id into bid from people where id = p_id;
  if bid is null then raise exception 'yok'; end if;
  if not is_member(bid) then raise exception 'izin_yok'; end if;
  delete from people where id = p_id;                       -- avans, yoklama vb. cascade ile gider
  delete from activity_log where business_id = bid and (
       row_key ->> 'id' = p_id::text
    or row_key ->> 'person_id' = p_id::text
    or old_data ->> 'person_id' = p_id::text
    or new_data ->> 'person_id' = p_id::text
    or old_data ->> 'owner_person_id' = p_id::text or new_data ->> 'owner_person_id' = p_id::text
    or old_data ->> 'driver_id' = p_id::text or new_data ->> 'driver_id' = p_id::text);
  return 'tamam';
end;
$$;
revoke execute on function forget_person(uuid) from public, anon;
grant execute on function forget_person(uuid) to authenticated;
