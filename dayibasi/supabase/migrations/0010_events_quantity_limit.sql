-- events.quantity: dayıbaşında kişi sayısı, çiftçi defterinde gelir tutarı (TL) ve verim (kg). 1000 sınırı gelir/verimi reddediyordu.
alter table events drop constraint if exists events_quantity_ok;
alter table events add constraint events_quantity_ok check (quantity is null or quantity between 0 and 100000000);
