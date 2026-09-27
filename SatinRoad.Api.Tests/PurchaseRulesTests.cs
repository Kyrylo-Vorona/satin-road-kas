namespace SatinRoad.Api.Tests;

public class PurchaseRulesTests
{
    [Theory]
    [InlineData(0, false)]
    [InlineData(9, false)]
    [InlineData(10, true)]
    [InlineData(11, true)]
    public void IsDiscountEligible_UsesTenPreviousOrdersAsThreshold(
        int previousOrdersCount,
        bool expected)
    {
        var actual = PurchaseRules.IsDiscountEligible(previousOrdersCount);

        Assert.Equal(expected, actual);
    }

    [Theory]
    [InlineData(100, 9, 100)]
    [InlineData(100, 10, 80)]
    [InlineData(99, 10, 79)]
    public void CalculateFinalPrice_AppliesTwentyPercentDiscountWhenEligible(
        int price,
        int previousOrdersCount,
        int expected)
    {
        var actual = PurchaseRules.CalculateFinalPrice(price, previousOrdersCount);

        Assert.Equal(expected, actual);
    }
}
