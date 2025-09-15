﻿namespace PhysioBoo.Domain.Settings
{
    public sealed class MailSettings
    {
        public string DisplayName { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool EnableSSL { get; set; }
    }
}
