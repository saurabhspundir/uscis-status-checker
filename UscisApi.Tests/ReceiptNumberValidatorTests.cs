namespace UscisApi.Tests;

public class ReceiptNumberValidatorTests
{
    [Theory]
    [InlineData("ABC1234567890")]
    [InlineData("abc1234567890")]
    [InlineData("ZZZ0000000000")]
    [InlineData("Xyz9876543210")]
    public void IsValid_ValidReceiptNumber_ReturnsTrue(string receiptNumber)
    {
        Assert.True(ReceiptNumberValidator.IsValid(receiptNumber));
    }

    [Theory]
    [InlineData("AB1234567890")]   // only 2 letters
    [InlineData("ABCD123456789")]  // 4 letters
    [InlineData("ABC123456789")]   // 9 digits
    [InlineData("ABC12345678901")] // 11 digits
    [InlineData("1BC1234567890")]  // digit in letter position
    [InlineData("ABC123456789A")]  // letter in digit position
    [InlineData("ABC 1234567890")] // contains space
    [InlineData("ABC-1234567890")] // contains hyphen
    [InlineData("abc123456789!")]  // special character
    public void IsValid_InvalidReceiptNumber_ReturnsFalse(string receiptNumber)
    {
        Assert.False(ReceiptNumberValidator.IsValid(receiptNumber));
    }
}
