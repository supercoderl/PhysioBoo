namespace PhysioBoo.Application.Commands.Doctors
{
    /// <summary>
    /// Rules shared by the doctor avatar commands: where avatars live, what is accepted, and which stored urls we own.
    /// </summary>
    public static class DoctorAvatarStorage
    {
        public const string Folder = "doctor-avatars";
        public const long MaxFileSizeBytes = 5 * 1024 * 1024;

        /// <summary>
        /// Identifies the image by its leading bytes (never by file name or the client-sent content type).
        /// Returns null when the content is not a JPEG, PNG or WebP image.
        /// </summary>
        public static async Task<string?> DetectImageTypeAsync(Stream stream, CancellationToken ct)
        {
            byte[] header = new byte[12];
            int read = 0;
            while (read < header.Length)
            {
                int n = await stream.ReadAsync(header.AsMemory(read, header.Length - read), ct);
                if (n == 0) break;
                read += n;
            }

            if (read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF) return "image/jpeg";
            if (read >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A) return "image/png";
            if (read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') return "image/webp";

            return null;
        }

        /// <summary>
        /// Returns the Cloudinary public id (<c>doctor-avatars/xxxx</c>) when the url points at an avatar we stored,
        /// otherwise null (e.g. an external OAuth picture, which must never be deleted from storage).
        /// </summary>
        public static string? TryGetOwnedPublicId(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;

            int start = url.IndexOf($"/{Folder}/", StringComparison.Ordinal);
            if (start < 0 || !url.Contains("cloudinary.com", StringComparison.OrdinalIgnoreCase)) return null;

            string path = url[(start + 1)..];
            int query = path.IndexOfAny(new[] { '?', '#' });
            if (query >= 0) path = path[..query];

            int dot = path.LastIndexOf('.');
            if (dot > Folder.Length) path = path[..dot];

            return path.Length > Folder.Length + 1 ? path : null;
        }
    }
}
