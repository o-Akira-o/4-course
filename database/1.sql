-- Задание по лабе 1
-- insert into sal (snum,name,comm,city) values (3006,'Astra',0.16,'Innopolis'), (3007,'RedSoft',0.13,'Moscow')  
-- delete from sal where snum = 3007
-- alter table ord add column ord_date date;
-- update ord set ord_date = '2025-09-01'
-- update ord set ord_date = '2024-12-31' where pnum = 1002;

-- Задание по варианту - бригада 4

-- Вывести все строки из таблицы Заказов, для которых номер продукта равен 1001.
-- select * from ord where pnum = 1005 -- первое

-- Вывести записи о продавцах с комиссионными ниже 0.14 со столбцами в следующем порядке: city, name, snum, comm.
-- select rating, name, cnum, city from cust where rating >= 150 -- второе

-- Вывести без повторений номера всех продавцов, которые продавали товары покупателям с номерами больше 2004.
-- select distinct pnum from ord where snum > 3003 - третье

-- Вывести данные о всех покупателях с рейтингом меньше или равным 200, если они не находятся в Москве.
-- select * from prod where weight > 100 and city != 'Saint Petersburg' - четвертое


-- Вывести тремя различными способами все заказы продуктов с номерами 1002, 1003, 1004.
-- select * from ord where snum in (3002, 3003, 3004); - пятое
-- select * from ord where snum = 3002 or snum = 3003 or snum = 3004;
-- select * from ord where snum between 3002 and 3004;