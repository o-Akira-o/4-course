-- Вывести число заказов, в которых количество продуктов не более 5.
-- select count(*) as count_items from ord where amt <= 5

-- Вывести самую раннюю и самую позднюю дату заказов.
-- select min(ord_date) as earliest_date, max(ord_date) as latest_date from ord;


-- Вывести для каждого покупателя наибольший номер продукта, который он покупал.
-- select 
--     cnum as user_number,
--     max(pnum) as max_number
-- from ord
-- group by cnum

-- Вывести число уникальных продуктов, которые покупались покупателями с номерами 2003-2006. 
-- select count(distinct pnum) as product_count from ord where cnum between 2003 and 2006

-- Вывести для каждого продавца его номер и среднее количество проданных продуктов, если это количество больше, чем 6.
-- select snum, trunc(avg(amt)) as avg_amt from ord group by snum having avg(amt) > 6

-- Вывести количество заказов для всех уникальных пар продавец-покупатель, между которыми осуществлялись заказы.
-- select snum, cnum, count(*) as order_count from ord group by snum, cnum;

-- Вывести все даты, в которые в заказах участвовали не менее 2 покупателей и не менее 2 продуктов.
-- select ord_date from ord group by ord_date having count(distinct cnum) >= 2 and count(distinct pnum) >= 2;