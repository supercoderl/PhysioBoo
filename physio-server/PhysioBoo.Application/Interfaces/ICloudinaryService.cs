namespace PhysioBoo.Application.Interfaces
{
    public interface ICloudinaryService
    {
        /// <summary>
        /// Remove the tag (e.g., “temporary”) from the image to prevent it from being accidentally deleted by a job.
        /// </summary>
        public Task RemoveTagAsync(string publicId, string tag);
    }
}
