using System.Text.RegularExpressions;

namespace PhysioBoo.Application.Queries.Sessions
{
    /// <summary>Turns a User-Agent header into a short device and browser label. Best effort, no external database.</summary>
    public static partial class UserAgentParser
    {
        public static (string Device, string Browser) Parse(string? userAgent)
        {
            if (string.IsNullOrWhiteSpace(userAgent)) return ("Unknown device", "Unknown browser");

            string device =
                userAgent.Contains("iPhone") ? "iPhone" :
                userAgent.Contains("iPad") ? "iPad" :
                userAgent.Contains("Android") ? (userAgent.Contains("Mobile") ? "Android phone" : "Android tablet") :
                userAgent.Contains("Windows") ? "Windows PC" :
                userAgent.Contains("Macintosh") || userAgent.Contains("Mac OS") ? "Mac" :
                userAgent.Contains("CrOS") ? "Chromebook" :
                userAgent.Contains("Linux") ? "Linux PC" :
                "Unknown device";

            // Order matters: Edge and Opera also contain "Chrome"; Chrome also contains "Safari".
            string browser =
                Version(userAgent, "Edg") is { } edge ? $"Edge {edge}" :
                Version(userAgent, "OPR") is { } opera ? $"Opera {opera}" :
                Version(userAgent, "Firefox") is { } firefox ? $"Firefox {firefox}" :
                Version(userAgent, "Chrome") is { } chrome ? $"Chrome {chrome}" :
                Version(userAgent, "CriOS") is { } chromeIos ? $"Chrome {chromeIos}" :
                userAgent.Contains("Safari") && Version(userAgent, "Version") is { } safari ? $"Safari {safari}" :
                userAgent.Contains("PostmanRuntime") ? "Postman" :
                "Unknown browser";

            return (device, browser);
        }

        private static string? Version(string userAgent, string token)
        {
            Match m = Regex.Match(userAgent, $@"{Regex.Escape(token)}/(\d+)");
            return m.Success ? m.Groups[1].Value : null;
        }
    }
}
