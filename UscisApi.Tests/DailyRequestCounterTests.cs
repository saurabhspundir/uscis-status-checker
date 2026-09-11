namespace UscisApi.Tests;

public class DailyRequestCounterTests
{
    private static readonly DateOnly Today = new(2025, 6, 1);

    [Fact]
    public void GetCount_NoRequests_ReturnsZero()
    {
        var counter = new DailyRequestCounter();

        Assert.Equal(0, counter.GetCount(Today));
    }

    [Fact]
    public void TryIncrement_FirstRequest_ReturnsTrue()
    {
        var counter = new DailyRequestCounter();

        Assert.True(counter.TryIncrement(Today, dailyLimit: 5));
    }

    [Fact]
    public void TryIncrement_IncreasesCount()
    {
        var counter = new DailyRequestCounter();

        counter.TryIncrement(Today, dailyLimit: 10);
        counter.TryIncrement(Today, dailyLimit: 10);

        Assert.Equal(2, counter.GetCount(Today));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(10)]
    public void TryIncrement_WhenAtLimit_ReturnsFalse(int limit)
    {
        var counter = new DailyRequestCounter();

        for (var i = 0; i < limit; i++)
            counter.TryIncrement(Today, limit);

        Assert.False(counter.TryIncrement(Today, limit));
    }

    [Fact]
    public void TryIncrement_WhenAtLimit_DoesNotIncreaseCount()
    {
        var counter = new DailyRequestCounter();
        const int limit = 2;

        counter.TryIncrement(Today, limit);
        counter.TryIncrement(Today, limit);
        counter.TryIncrement(Today, limit); // over limit — should be rejected

        Assert.Equal(limit, counter.GetCount(Today));
    }

    [Fact]
    public void TryIncrement_DifferentDatesAreTrackedSeparately()
    {
        var counter = new DailyRequestCounter();
        var yesterday = Today.AddDays(-1);
        const int limit = 1;

        counter.TryIncrement(yesterday, limit); // fills yesterday to the limit

        // today should still succeed
        Assert.True(counter.TryIncrement(Today, limit));
    }

    [Fact]
    public void TryIncrement_LimitOfZero_AlwaysReturnsFalse()
    {
        var counter = new DailyRequestCounter();

        Assert.False(counter.TryIncrement(Today, dailyLimit: 0));
    }
}
