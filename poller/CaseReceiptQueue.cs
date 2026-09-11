using System.Collections.Concurrent;

namespace UscisApiPoller;

/// <summary>
/// Work queue shared between the poll-cycle job (producer, every N seconds) and the
/// request-dispatch job (consumer, throttled to the configured TPS).
/// </summary>
public sealed class CaseReceiptQueue
{
    private readonly ConcurrentQueue<EndpointOptions> _queue = new();

    public void EnqueueRange(IEnumerable<EndpointOptions> items)
    {
        foreach (var item in items)
        {
            _queue.Enqueue(item);
        }
    }

    public void Enqueue(EndpointOptions item) => _queue.Enqueue(item);

    public bool TryDequeue(out EndpointOptions item) => _queue.TryDequeue(out item!);

    public int Count => _queue.Count;

    /// <summary>
    /// Discards whatever is currently queued and replaces it with <paramref name="items"/>.
    /// Used instead of <see cref="EnqueueRange"/> while a rate-limit backoff is active, so
    /// repeated poll cycles don't keep piling duplicate copies of the same batch on top of
    /// requests that haven't drained yet.
    /// </summary>
    public void Reset(IEnumerable<EndpointOptions> items)
    {
        _queue.Clear();
        EnqueueRange(items);
    }
}
