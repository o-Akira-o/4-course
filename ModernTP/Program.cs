using System;
using Matrix;
class Program
{
    static void Main()
    {
        int[,] arr1 = { { 1, 2, 3 }, { 4, 5, 6 } };
        int[,] arr2 = { { 7, 8, 9 }, { 10, 11, 12 } };

        Matrixs m1 = new Matrixs(arr1);
        Matrixs m2 = new Matrixs(arr2);

        Console.WriteLine("Matrix 1: " + m1);
        Console.WriteLine("Matrix 2: " + m2);

        // Сложение
        var sum = m1 + m2;
        Console.WriteLine("Sum: " + sum);

        // Вычитание
        var diff = m2 - m1;
        Console.WriteLine("Difference: " + diff);

        // Транспонирование
        var transposed = m1.Transp();
        Console.WriteLine("Transposed Matrix 1: " + transposed);

        // Минимальный элемент
        Console.WriteLine("Min element in Matrix 1: " + m1.Min());

        // Умножение матриц
        var matA = new Matrixs(new int[,] { { 1, 2 }, { 3, 4 } });
        var matB = new Matrixs(new int[,] { { 5, 6 }, { 7, 8 } });
        var product = matA * matB;
        Console.WriteLine("Product of matA and matB: " + product);

        // Проверка равенства
        Console.WriteLine("matA == matB? " + (matA == matB));
        var matC = new Matrixs(new int[,] { { 1, 2 }, { 3, 4 } });
        Console.WriteLine("matA == matC? " + (matA == matC));

        // Получение элемента [i,j]
        Console.WriteLine("Element [0,1] in Matrix 1: " + m1[0, 1]);

        // Размеры матрицы
        Console.WriteLine("Matrix 1 rows: " + m1.Rows);
        Console.WriteLine("Matrix 1 columns: " + m1.Columns);
    }
}