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

        public async Task<CloudinaryImageUpload> UploadImageAsync(Stream content, string folder, CancellationToken ct = default)
        {
            // The public id is generated here so a client-supplied name never reaches the storage path.
            string publicId = Guid.NewGuid().ToString("N");

            ImageUploadResult result = await _cloudinary.UploadAsync(
                new ImageUploadParams
                {
                    File = new FileDescription(publicId, content),
                    Folder = folder,
                    PublicId = publicId,
                    Overwrite = false
                },
                ct);

            if (result.Error != null || result.SecureUrl == null)
            {
                throw new InvalidOperationException($"Cloudinary Error: {result.Error?.Message ?? "no url returned"}");
            }

            return new CloudinaryImageUpload(result.SecureUrl.ToString(), result.PublicId);
        }

        public async Task DeleteImageAsync(string publicId, CancellationToken ct = default)
        {
            DeletionResult result = await _cloudinary.DestroyAsync(new DeletionParams(publicId) { ResourceType = ResourceType.Image });

            if (result.Error != null || (result.Result != "ok" && result.Result != "not found"))
            {
                throw new InvalidOperationException($"Cloudinary Error: {result.Error?.Message ?? result.Result}");
            }
        }
    }
}
