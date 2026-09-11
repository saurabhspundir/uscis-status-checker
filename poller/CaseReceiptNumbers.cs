namespace UscisApiPoller;

/// <summary>
/// Fixed test receipt numbers from the nonprod sandbox, grouped by whether their
/// case-status payload includes hist_case_status.
/// </summary>
public static class CaseReceiptNumbers
{
    public static readonly IReadOnlyList<string> WithHistCaseStatus = new[]
    {
        "EAC9999103403", "EAC9999103404", "EAC9999103405", "EAC9999103410", "EAC9999103411",
        "EAC9999103416", "EAC9999103419", "LIN9999106498", "LIN9999106499", "LIN9999106504",
        "LIN9999106505", "LIN9999106506", "SRC9999102777", "SRC9999102778", "SRC9999102779",
        "SRC9999102780", "SRC9999102781", "SRC9999102782", "SRC9999102783", "SRC9999102784",
        "SRC9999102785", "SRC9999102786", "SRC9999102787", "SRC9999132710", "SRC9999132719",
    };

    public static readonly IReadOnlyList<string> WithoutHistCaseStatus = new[]
    {
        "EAC9999103400", "EAC9999103402", "EAC9999103406", "EAC9999103407", "EAC9999103408",
        "EAC9999103409", "EAC9999103412", "EAC9999103413", "EAC9999103414", "EAC9999103415",
        "EAC9999103420", "EAC9999103421", "EAC9999103424", "EAC9999103425", "EAC9999103426",
        "EAC9999103428", "EAC9999103429", "EAC9999103431", "EAC9999103432", "LIN9999106501",
        "LIN9999106507", "SRC9999132694", "SRC9999132695", "SRC9999132706", "SRC9999132707",
    };

    /// <summary>
    /// Receipt numbers that do not exist in the sandbox (e.g. EAC9999103401 from the
    /// "Get case status -fail" bruno request), used to exercise the error-handling path.
    /// </summary>
    public static readonly IReadOnlyList<string> BadIds = new[]
    {
        "EAC9999103401", "EAC9999103119", "EAC9999103418", "EAC9999103118", "EAC9999103117","EAC999910311",
        "LIN999106507", "LIN999106506", "LIN999106505", "LIN999106504", "LIN999106503", "LIN99910650",
        "PAC9999103403"
    };
}
