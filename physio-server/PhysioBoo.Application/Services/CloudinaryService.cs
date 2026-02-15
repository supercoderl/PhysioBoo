using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using PhysioBoo.Application.Interfaces;

namespace PhysioBoo.Application.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(
            Cloudinary cloudinary
        )
        {
            _cloudinary = cloudinary;
        }

        public async Task RemoveTagAsync(string publicId, string tag)
        {
            TagParams parameters = new TagParams
            {
                Command = TagCommand.Remove,
                Tag = tag,
                PublicIds = new List<string> { publicId }
            };

            TagResult result = await _cloudinary.TagAsync(parameters);

            if (result.Error != null)
            {
                throw new Exception($"Cloudinary Error: {result.Error.Message}");
            }
        }
    }
}
