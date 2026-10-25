using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using PhysioBoo.Application.Commands.Doctors;
using PhysioBoo.Application.Commands.Doctors.RemoveDoctorAvatar;
using PhysioBoo.Application.Commands.Doctors.UploadDoctorAvatar;
using PhysioBoo.Application.Interfaces;
using PhysioBoo.Domain.Entities.Core;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;
using Shouldly;
using System.Linq.Expressions;
using Xunit;

namespace PhysioBoo.Application.Test.Commands.Doctors
{
    public sealed class UploadDoctorAvatarCommandValidationTest : ValidationTestBase<UploadDoctorAvatarCommand, UploadDoctorAvatarCommandValidation>
    {
        public UploadDoctorAvatarCommandValidationTest() : base(new UploadDoctorAvatarCommandValidation()) { }

        [Fact]
        public void Should_Accept_Image_Within_Limit()
            => ShouldBeValid(new UploadDoctorAvatarCommand(Guid.NewGuid(), DoctorAvatarFixture.File(DoctorAvatarFixture.Png)));

        [Fact]
        public void Should_Reject_Empty_File()
            => ShouldHaveSingleError(new UploadDoctorAvatarCommand(Guid.NewGuid(), DoctorAvatarFixture.File(Array.Empty<byte>())), DomainErrorCodes.Doctor.EmptyAvatarFile);

        [Fact]
        public void Should_Reject_File_Over_Size_Limit()
        {
            IFormFile file = DoctorAvatarFixture.File(DoctorAvatarFixture.Png, length: DoctorAvatarStorage.MaxFileSizeBytes + 1);
            ShouldHaveSingleError(new UploadDoctorAvatarCommand(Guid.NewGuid(), file), DomainErrorCodes.Doctor.AvatarFileTooLarge);
        }

        [Fact]
        public void Should_Reject_Empty_Doctor_Id()
            => ShouldHaveSingleError(new UploadDoctorAvatarCommand(Guid.Empty, DoctorAvatarFixture.File(DoctorAvatarFixture.Png)), DomainErrorCodes.Doctor.EmptyId);
    }

    public sealed class DoctorAvatarStorageTest
    {
        [Theory]
        [InlineData("jpeg")]
        [InlineData("png")]
        [InlineData("webp")]
        public async Task Should_Detect_Supported_Images_By_Content(string kind)
        {
            byte[] bytes = kind switch { "jpeg" => DoctorAvatarFixture.Jpeg, "png" => DoctorAvatarFixture.Png, _ => DoctorAvatarFixture.WebP };

            string? type = await DoctorAvatarStorage.DetectImageTypeAsync(new MemoryStream(bytes), default);

            type.ShouldBe($"image/{kind}");
        }

        [Fact]
        public async Task Should_Reject_Executable_Renamed_As_Image()
        {
            byte[] exe = { 0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00 };

            (await DoctorAvatarStorage.DetectImageTypeAsync(new MemoryStream(exe), default)).ShouldBeNull();
        }

        [Fact]
        public async Task Should_Reject_Svg_And_Truncated_Content()
        {
            (await DoctorAvatarStorage.DetectImageTypeAsync(new MemoryStream("<svg onload=alert(1)>"u8.ToArray()), default)).ShouldBeNull();
            (await DoctorAvatarStorage.DetectImageTypeAsync(new MemoryStream(new byte[] { 0x89, 0x50 }), default)).ShouldBeNull();
        }

        [Theory]
        [InlineData("https://res.cloudinary.com/demo/image/upload/v1700000000/doctor-avatars/abc123.png", "doctor-avatars/abc123")]
        [InlineData("https://res.cloudinary.com/demo/image/upload/doctor-avatars/abc123.webp?x=1", "doctor-avatars/abc123")]
        [InlineData("https://lh3.googleusercontent.com/a/photo", null)]
        [InlineData("https://res.cloudinary.com/demo/image/upload/v1/insurance-claims/abc.png", null)]
        [InlineData("", null)]
        [InlineData(null, null)]
        public void Should_Only_Own_Avatars_Stored_In_Avatar_Folder(string? url, string? expected)
            => DoctorAvatarStorage.TryGetOwnedPublicId(url).ShouldBe(expected);
    }

    public sealed class UploadDoctorAvatarCommandHandlerTest : CommandHandlerFixtureBase
    {
        private readonly IDoctorRepository _doctorRepository = Substitute.For<IDoctorRepository>();
        private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
        private readonly ICloudinaryService _cloudinary = Substitute.For<ICloudinaryService>();
        private readonly UploadDoctorAvatarCommandHandler _handler;

        public UploadDoctorAvatarCommandHandlerTest()
        {
            _handler = new UploadDoctorAvatarCommandHandler(
                Bus, UnitOfWork, NotificationHandler, _doctorRepository, _userRepository, _cloudinary, User,
                NullLogger<UploadDoctorAvatarCommandHandler>.Instance);
        }

        [Fact]
        public async Task Should_Store_Avatar_And_Set_Url()
        {
            User user = DoctorAvatarFixture.UserWithAvatar(null);
            Returns(user);
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), DoctorAvatarStorage.Folder, Arg.Any<CancellationToken>())
                .Returns(new CloudinaryImageUpload("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png", "doctor-avatars/new"));
            UploadDoctorAvatarCommand command = new(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.Png));

            await _handler.Handle(command, default);

            command.AvatarUrl.ShouldBe("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png");
            user.ProfilePicture.ShouldBe(command.AvatarUrl);
            VerifyNoDomainNotification();
            await _userRepository.Received(1).UpdateTrackedAsync(user, Arg.Any<CancellationToken>());
            await _cloudinary.DidNotReceive().DeleteImageAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Delete_Previous_Owned_Avatar_When_Replacing()
        {
            User user = DoctorAvatarFixture.UserWithAvatar("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/old.png");
            Returns(user);
            _userRepository.ExistsAsync(Arg.Any<Expression<Func<User, bool>>>(), Arg.Any<CancellationToken>()).Returns(false);
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new CloudinaryImageUpload("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png", "doctor-avatars/new"));

            await _handler.Handle(new UploadDoctorAvatarCommand(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.Jpeg)), default);

            await _cloudinary.Received(1).DeleteImageAsync("doctor-avatars/old", Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Keep_Previous_Avatar_Still_Referenced_By_Another_User()
        {
            User user = DoctorAvatarFixture.UserWithAvatar("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/shared.png");
            Returns(user);
            _userRepository.ExistsAsync(Arg.Any<Expression<Func<User, bool>>>(), Arg.Any<CancellationToken>()).Returns(true);
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new CloudinaryImageUpload("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png", "doctor-avatars/new"));

            await _handler.Handle(new UploadDoctorAvatarCommand(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.WebP)), default);

            await _cloudinary.DidNotReceive().DeleteImageAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Not_Delete_External_Previous_Picture()
        {
            User user = DoctorAvatarFixture.UserWithAvatar("https://lh3.googleusercontent.com/a/photo");
            Returns(user);
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new CloudinaryImageUpload("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png", "doctor-avatars/new"));

            await _handler.Handle(new UploadDoctorAvatarCommand(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.Png)), default);

            await _cloudinary.DidNotReceive().DeleteImageAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Report_Not_Found_For_Doctor_Outside_Scope()
        {
            Guid id = Guid.NewGuid();
            _doctorRepository.ExistsAsync(id, Arg.Any<CancellationToken>()).Returns(false);

            await _handler.Handle(new UploadDoctorAvatarCommand(id, DoctorAvatarFixture.File(DoctorAvatarFixture.Png)), default);

            VerifyExistingNotification(ErrorCodes.ObjectNotFound, $"Doctor with id {id} doesn't exist.");
            await _cloudinary.DidNotReceive().UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
            await _userRepository.DidNotReceive().UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Reject_Non_Image_Content_Despite_Image_Content_Type()
        {
            User user = DoctorAvatarFixture.UserWithAvatar(null);
            Returns(user);
            byte[] script = "<?php system($_GET['c']); ?>"u8.ToArray();

            await _handler.Handle(new UploadDoctorAvatarCommand(user.Id, DoctorAvatarFixture.File(script, "avatar.png", "image/png")), default);

            VerifyExistingNotification(DomainErrorCodes.Doctor.UnsupportedAvatarType, "Avatar must be a JPEG, PNG or WebP image.");
            await _cloudinary.DidNotReceive().UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>());
            await _userRepository.DidNotReceive().UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Report_Storage_Failure_And_Keep_Current_Avatar()
        {
            User user = DoctorAvatarFixture.UserWithAvatar("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/old.png");
            Returns(user);
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>()).ThrowsAsync(new InvalidOperationException("boom"));

            await _handler.Handle(new UploadDoctorAvatarCommand(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.Png)), default);

            VerifyExistingNotification(DomainErrorCodes.Doctor.AvatarUploadFailed, "Avatar upload failed, please try again.");
            user.ProfilePicture.ShouldBe("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/old.png");
            await _userRepository.DidNotReceive().UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Clean_Up_Uploaded_File_When_Database_Update_Fails()
        {
            User user = DoctorAvatarFixture.UserWithAvatar(null);
            Returns(user);
            _userRepository.UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>()).ThrowsAsync(new InvalidOperationException("db down"));
            _cloudinary.UploadImageAsync(Arg.Any<Stream>(), Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(new CloudinaryImageUpload("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/new.png", "doctor-avatars/new"));
            UploadDoctorAvatarCommand command = new(user.Id, DoctorAvatarFixture.File(DoctorAvatarFixture.Png));

            await _handler.Handle(command, default);

            command.AvatarUrl.ShouldBeNull();
            await _cloudinary.Received(1).DeleteImageAsync("doctor-avatars/new", Arg.Any<CancellationToken>());
        }

        private void Returns(User user)
        {
            _doctorRepository.ExistsAsync(user.Id, Arg.Any<CancellationToken>()).Returns(true);
            _userRepository.GetByIdAsync(user.Id, Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(user);
        }
    }

    public sealed class RemoveDoctorAvatarCommandHandlerTest : CommandHandlerFixtureBase
    {
        private readonly IDoctorRepository _doctorRepository = Substitute.For<IDoctorRepository>();
        private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
        private readonly ICloudinaryService _cloudinary = Substitute.For<ICloudinaryService>();
        private readonly RemoveDoctorAvatarCommandHandler _handler;

        public RemoveDoctorAvatarCommandHandlerTest()
        {
            _handler = new RemoveDoctorAvatarCommandHandler(
                Bus, UnitOfWork, NotificationHandler, _doctorRepository, _userRepository, _cloudinary, User,
                NullLogger<RemoveDoctorAvatarCommandHandler>.Instance);
        }

        [Fact]
        public async Task Should_Clear_Avatar_And_Delete_Stored_File()
        {
            User user = DoctorAvatarFixture.UserWithAvatar("https://res.cloudinary.com/demo/image/upload/v1/doctor-avatars/old.png");
            _doctorRepository.ExistsAsync(user.Id, Arg.Any<CancellationToken>()).Returns(true);
            _userRepository.GetByIdAsync(user.Id, Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(user);
            _userRepository.ExistsAsync(Arg.Any<Expression<Func<User, bool>>>(), Arg.Any<CancellationToken>()).Returns(false);

            await _handler.Handle(new RemoveDoctorAvatarCommand(user.Id), default);

            user.ProfilePicture.ShouldBeNull();
            await _userRepository.Received(1).UpdateTrackedAsync(user, Arg.Any<CancellationToken>());
            await _cloudinary.Received(1).DeleteImageAsync("doctor-avatars/old", Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Do_Nothing_When_No_Avatar()
        {
            User user = DoctorAvatarFixture.UserWithAvatar(null);
            _doctorRepository.ExistsAsync(user.Id, Arg.Any<CancellationToken>()).Returns(true);
            _userRepository.GetByIdAsync(user.Id, Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns(user);

            await _handler.Handle(new RemoveDoctorAvatarCommand(user.Id), default);

            await _userRepository.DidNotReceive().UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
            await _cloudinary.DidNotReceive().DeleteImageAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Should_Report_Not_Found_For_Doctor_Outside_Scope()
        {
            Guid id = Guid.NewGuid();
            _doctorRepository.ExistsAsync(id, Arg.Any<CancellationToken>()).Returns(false);

            await _handler.Handle(new RemoveDoctorAvatarCommand(id), default);

            VerifyExistingNotification(ErrorCodes.ObjectNotFound, $"Doctor with id {id} doesn't exist.");
            await _userRepository.DidNotReceive().UpdateTrackedAsync(Arg.Any<User>(), Arg.Any<CancellationToken>());
        }
    }
}
