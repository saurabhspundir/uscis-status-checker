using System.Text.Json;
using System.Text.Json.Serialization;

namespace UscisApi;

public sealed class CaseStatusResponse
{
    [JsonPropertyName("case_status")]
    public CaseStatusDetail? CaseStatus { get; init; }

    [JsonPropertyName("message")]
    public string? Message { get; init; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? ExtensionData { get; init; }
}

public sealed class CaseStatusDetail
{
    [JsonPropertyName("receiptNumber")]
    public string? ReceiptNumber { get; init; }

    [JsonPropertyName("formType")]
    public string? FormType { get; init; }

    [JsonPropertyName("submittedDate")]
    public string? SubmittedDate { get; init; }

    [JsonPropertyName("modifiedDate")]
    public string? ModifiedDate { get; init; }

    [JsonPropertyName("current_case_status_text_en")]
    public string? CurrentStatusTextEn { get; init; }

    [JsonPropertyName("current_case_status_desc_en")]
    public string? CurrentStatusDescEn { get; init; }

    [JsonPropertyName("hist_case_status")]
    public List<HistCaseStatus> HistCaseStatus { get; init; } = [];
}

public sealed class HistCaseStatus
{
    [JsonPropertyName("date")]
    public string? Date { get; init; }

    [JsonPropertyName("completed_text_en")]
    public string? CompletedTextEn { get; init; }

    [JsonPropertyName("completed_text_es")]
    public string? CompletedTextEs { get; init; }
}
