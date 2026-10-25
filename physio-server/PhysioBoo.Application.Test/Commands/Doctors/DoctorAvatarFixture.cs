using Microsoft.AspNetCore.Http;
using NSubstitute;
using PhysioBoo.Domain.Entities.Core;

namespace PhysioBoo.Application.Test.Commands.Doctors
{
    internal static class DoctorAvatarFixture
    {
        public static readonly byte[] Png = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D };
        public static readonly byte[] Jpeg = { 0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01 };
        public static readonly byte[] WebP = { (byte)'R', (byte)'I', (byte)'F', (byte)'F', 0x24, 0x00, 0x00, 0x00, (byte)'W', (byte)'E', (byte)'B', (byte)'P' };

        /// <param name="length">Reported size; defaults to the content length.</param>
        public static IFormFile File(byte[] content, string fileName = "avatar.png", string contentType = "image/png", long? length = null)
        {
            IFormFile file = Substitute.For<IFormFile>();
            file.Length.Returns(length ?? content.Length);
            file.FileName.Returns(fileName);
            file.ContentType.Returns(contentType);
            file.OpenReadStream().Returns(_ => new MemoryStream(content));
            return file;
        }

        /// <summary>A doctor's user; the doctor shares its id.</summary>
        public static User UserWithAvatar(string? profilePicture)
        {
            User user = new User(Guid.NewGuid(), "doctor@example.com", "0900000000", "hash");
            user.SetProfilePicture(profilePicture);
            return user;
        }
    }
}
