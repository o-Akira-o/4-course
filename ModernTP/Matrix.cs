using System;
using System.Text;
namespace Matrix
{
    public class Matrixs
    {
        private int[,] data;

        public int I { get; }
        public int J { get; }

        // Конструктор
        public Matrixs(int[,] array)
        {
            if (array == null)
                throw new ArgumentNullException(nameof(array));
            if (array.GetLength(0) == 0 || array.GetLength(1) == 0)
                throw new ArgumentException("Массив не может иметь нулевые размеры.");

            I = array.GetLength(0);
            J = array.GetLength(1);
            data = (int[,])array.Clone();
        }

        // Индексатор
        public int this[int i, int j]
        {
            get
            {
                if (i < 0 || i >= I || j < 0 || j >= J)
                    throw new IndexOutOfRangeException();
                return data[i, j];
            }
        }

        // Свойства для получения количества строк и столбцов
        public int Rows => I;
        public int Columns => J;

        // Операция сложения
        public static Matrixs operator +(Matrixs a, Matrixs b)
        {
            if (a.I != b.I || a.J != b.J)
                throw new ArgumentException("Размеры матриц должны совпадать для сложения.");

            int[,] result = new int[a.I, a.J];
            for (int i = 0; i < a.I; i++)
            {
                for (int j = 0; j < a.J; j++)
                {
                    result[i, j] = a[i, j] + b[i, j];
                }
            }
            return new Matrixs(result);
        }

        // Вычитание
        public static Matrixs operator -(Matrixs a, Matrixs b)
        {
            if (a.I != b.I || a.J != b.J)
                throw new ArgumentException("Размеры матриц должны совпадать для вычитания.");

            int[,] result = new int[a.I, a.J];
            for (int i = 0; i < a.I; i++)
            {
                for (int j = 0; j < a.J; j++)
                {
                    result[i, j] = a[i, j] - b[i, j];
                }
            }
            return new Matrixs(result);
        }

        // Умножение матриц
        public static Matrixs operator *(Matrixs a, Matrixs b)
        {
            if (a.J != b.I)
                throw new ArgumentException("Количество столбцов первой матрицы должно совпадать с количеством строк второй.");

            int[,] result = new int[a.I, b.J];

            for (int i = 0; i < a.I; i++)
            {
                for (int j = 0; j < b.J; j++)
                {
                    int sum = 0;
                    for (int k = 0; k < a.J; k++)
                    {
                        sum += a[i, k] * b[k, j];
                    }
                    result[i, j] = sum;
                }
            }

            return new Matrixs(result);
        }

        // Равенство
        public static bool operator ==(Matrixs a, Matrixs b)
        {
            if (ReferenceEquals(a, b))
                return true;
            if (ReferenceEquals(a, null) || ReferenceEquals(b, null))
                return false;
            if (a.I != b.I || a.J != b.J)
                return false;

            for (int i = 0; i < a.I; i++)
            {
                for (int j = 0; j < a.J; j++)
                {
                    if (a[i, j] != b[i, j])
                        return false;
                }
            }
            return true;
        }

        public static bool operator !=(Matrixs a, Matrixs b)
        {
            return !(a == b);
        }

        public override bool Equals(object obj)
        {
            if (obj is Matrixs other)
                return this == other;
            return false;
        }

        public override int GetHashCode()
        {
            int hash = 17;
            hash = hash * 23 + I.GetHashCode();
            hash = hash * 23 + J.GetHashCode();
            foreach (var item in data)
                hash = hash * 23 + item.GetHashCode();
            return hash;
        }

        public Matrixs Transp()
        {
            int[,] transposedData = new int[Columns, Rows];
            for (int i = 0; i < Rows; i++)
            {
                for (int j = 0; j < Columns; j++)
                {
                    transposedData[j, i] = data[i, j]; // data — исходный массив
                }
            }
            return new Matrixs(transposedData);
        }

        // Минимальный элемент
        public int Min()
        {
            int min = data[0, 0];
            for (int i = 0; i < I; i++)
            {
                for (int j = 0; j < J; j++)
                {
                    if (data[i, j] < min)
                        min = data[i, j];
                }
            }
            return min;
        }

        // ToString
        public override string ToString()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("{");
            for (int i = 0; i < I; i++)
            {
                sb.Append("{");
                for (int j = 0; j < J; j++)
                {
                    sb.Append(data[i, j]);
                    if (j < J - 1)
                        sb.Append(",");
                }
                sb.Append("}");
                if (i < I - 1)
                    sb.Append(",");
            }
            sb.Append("}");
            return sb.ToString();
        }
    }
}