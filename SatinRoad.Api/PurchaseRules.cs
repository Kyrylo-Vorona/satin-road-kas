namespace SatinRoad.Api;

public static class PurchaseRules
{
    public const int RequiredPreviousOrders = 10;

    public static bool IsDiscountEligible(int previousOrdersCount)
    {
        return previousOrdersCount >= RequiredPreviousOrders;
    }

    public static int CalculateFinalPrice(int price, int previousOrdersCount)
    {
        return IsDiscountEligible(previousOrdersCount)
            ? (int)(price * 0.8m)
            : price;
    }
}
