using System.Collections.Concurrent;

namespace UscisApi;

public sealed class DailyRequestCounter
{
    private readonly ConcurrentDictionary<DateOnly, int> _counts = new();

    public bool TryIncrement(DateOnly date, int dailyLimit)
    {
        while (true)
        {
            var current = _counts.GetOrAdd(date, 0);
            if (current >= dailyLimit)
                return false;

            if (_counts.TryUpdate(date, current + 1, current))
                return true;
        }
    }

    public int GetCount(DateOnly date) =>
        _counts.TryGetValue(date, out var count) ? count : 0;
}
