using Microsoft.ApplicationInsights;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Matrix;
[TestClass]
public class MatrixUnitTests
{
    private Matrixs m1;
    private Matrixs m2;

    [TestInitialize]
    public void Setup()
    {
        int[,] arr1 = { { 1, 2, 3 }, { 4, 5, 6 } };
        int[,] arr2 = { { 7, 8, 9 }, { 10, 11, 12 } };
        m1 = new Matrixs(arr1);
        m2 = new Matrixs(arr2);
    }

    [TestMethod]
    public void Constructor_ShouldInitializeMatrix()
    {
        Assert.AreEqual(2, m1.Rows);
        Assert.AreEqual(3, m1.Columns);
        Assert.AreEqual(1, m1[0, 0]);
        Assert.AreEqual(6, m1[1, 2]);
    }

    [TestMethod]
    public void Addition_ShouldReturnCorrectResult()
    {
        var result = m1 + m2;
        Assert.AreEqual(2, result.Rows);
        Assert.AreEqual(3, result.Columns);
        Assert.AreEqual(8, result[0, 0]);
        Assert.AreEqual(18, result[1, 2]);
    }

    [TestMethod]
    public void Subtraction_ShouldReturnCorrectResult()
    {
        var result = m2 - m1;
        Assert.AreEqual(2, result.Rows);
        Assert.AreEqual(3, result.Columns);
        Assert.AreEqual(6, result[0, 0]);
        Assert.AreEqual(6, result[1, 2]);
    }

    

    [TestMethod]
    public void Min_ShouldReturnMinimumElement()
    {
        Assert.AreEqual(1, m1.Min());
        int[,] arr3 = { { -1, 2 }, { 3, -4 } };
        var m3 = new Matrixs(arr3);
        Assert.AreEqual(-4, m3.Min());
    }

    [TestMethod]
    public void Equality_ShouldWorkCorrectly()
    {
        int[,] arr4 = { { 1, 2, 3 }, { 4, 5, 6 } };
        var m4 = new Matrixs(arr4);
        Assert.IsTrue(m1 == m4);
        var m5 = new Matrixs(arr4);
        Assert.IsTrue(m4 == m5);
        Assert.IsFalse(m1 == m2);
    }

    [TestMethod]
    public void Multiplication_ShouldReturnCorrectResult()
    {
        int[,] arrA = { { 1, 2 }, { 3, 4 } };
        int[,] arrB = { { 5, 6 }, { 7, 8 } };
        var a = new Matrixs(arrA);
        var b = new Matrixs(arrB);
        var result = a * b;
        Assert.AreEqual(2, result.Rows);
        Assert.AreEqual(2, result.Columns);
        Assert.AreEqual(19, result[0, 0]);
        Assert.AreEqual(22, result[0, 1]);
        Assert.AreEqual(43, result[1, 0]);
        Assert.AreEqual(50, result[1, 1]);
    }

    [TestMethod]
    public void ToString_ShouldReturnCorrectFormat()
    {
        string str = m1.ToString();
        Assert.AreEqual("{{1,2,3},{4,5,6}}", str);
    }
}