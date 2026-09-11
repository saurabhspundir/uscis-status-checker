namespace UscisApiPoller;

/// <summary>
/// Tracks a shared "pause until" timestamp so a 429 from one dispatch tick backs off
/// every subsequent tick, instead of hammering the API again on the very next TPS slot.
/// </summary>
public sealed class RateLimitState
{
    private long _pauseUntilTicks;

    public void PauseFor(TimeSpan duration)
    {
        var pauseUntil = DateTimeOffset.UtcNow.Add(duration).UtcTicks;
        Interlocked.Exchange(ref _pauseUntilTicks, pauseUntil);
    }

    public bool IsPaused => DateTimeOffset.UtcNow.UtcTicks < Interlocked.Read(ref _pauseUntilTicks);
}
