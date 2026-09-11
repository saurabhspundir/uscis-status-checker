using System.Text.RegularExpressions;

namespace UscisApi;

public static partial class ReceiptNumberValidator
{
    public static bool IsValid(string receiptNumber) =>
        ReceiptNumberPattern().IsMatch(receiptNumber);

    [GeneratedRegex(@"^[A-Za-z]{3}[0-9]{10}$")]
    private static partial Regex ReceiptNumberPattern();
}
