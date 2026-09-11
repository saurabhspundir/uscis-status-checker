namespace UscisApiPoller;

/// <summary>
/// Builds the full set of case-status requests to poll each cycle from the fixed
/// sandbox receipt-number lists in <see cref="CaseReceiptNumbers"/>.
/// </summary>
public static class EndpointCatalog
{
    public static List<EndpointOptions> Build(string pathTemplate)
    {
        var endpoints = new List<EndpointOptions>();

        AddRange(endpoints, pathTemplate, "Bad", CaseReceiptNumbers.BadIds);
        AddRange(endpoints, pathTemplate, "WithHist", CaseReceiptNumbers.WithHistCaseStatus);
        AddRange(endpoints, pathTemplate, "WithoutHist", CaseReceiptNumbers.WithoutHistCaseStatus);
        return endpoints;
    }

    private static void AddRange(
        List<EndpointOptions> endpoints, string pathTemplate, string prefix, IReadOnlyList<string> receiptNumbers)
    {
        foreach (var receipt in receiptNumbers)
        {
            endpoints.Add(new EndpointOptions
            {
                Name = $"{prefix}-{receipt}",
                Path = string.Format(pathTemplate, receipt),
                ReceiptNumber = receipt,
            });
        }
    }
}
