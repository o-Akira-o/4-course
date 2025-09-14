-- Лаба 2 - вариант 4

-- Вывести названия городов покупателей, которые начинаются на букву y или заканчиваются на букву k.
-- select city from cust where lower(city) like 'y%' or lower(city) like '%k';
-- Вывести названия продуктов, в которых присутствует буква p, отсортированные в алфавитном порядке.
-- select name from prod where lower(name) like '%p%' order by name asc;

-- Вывести в нижнем регистре все имена из таблицы покупателей, имеющие длину не более 6 символов. В каждом имени удалить последние две буквы, имена должны быть выведены по обратном алфавитному порядке.
-- select lower(left(name, length(name) - 2)) from cust where length(name) <= 6 order by name desc

-- Вывести в одном столбце комиссионные продавцов, соединенные с символом «%» и именем в нижнем регистре, в формате: ‘dns: 0.14%’, только для тех продавцов, чье имя содержит подстроку ‘in’.
-- select concat(lower(name), ': ', comm,'%') from sal where name like '%in%'


-- Вывести часовой пояс, в котором выполняется лабораторная (смещение часов относительно Гринвича).
-- select current_timestamp as current_time,
--   extract(timezone_hour from current_timestamp) as timezone_offset_hours

-- Вывести для каждой уникальной даты заказа запись. состоящую из трех столбцов: день в формате «dd», месяц в формате «mm», год в формате «yy».
-- select 
--   distinct TO_CHAR(ord_date, 'dd') as day,
--   TO_CHAR(ord_date, 'mm') as month, 
--   TO_CHAR(ord_date, 'yy') as year
-- from ord;


-- Вывести города продуктов, начинающиеся с буквы o или содержащие пробелы.
-- select * from prod where city ~ '^[oO]' or city ~ '\s'; 

-- Вывести названия продуктов, в которых содержится буква e в любом регистре и на любом месте, кроме последнего.
-- select * from prod where city ~ '.*[eE].*[^eE]$';