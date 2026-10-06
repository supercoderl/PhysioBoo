using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.PrescriptionTemplates;
using PhysioBoo.Domain.Entities.Clinical;
using PhysioBoo.Domain.Enums;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.PrescriptionTemplates.CreatePrescriptionTemplate
{
    public sealed class CreatePrescriptionTemplateCommandHandler : CommandHandlerBase, IRequestHandler<CreatePrescriptionTemplateCommand>
    {
        private readonly IPrescriptionTemplateRepository _templateRepository;
        private readonly IDoctorRepository _doctorRepository;
        private readonly IMedicineRepository _medicineRepository;
        private readonly IUser _user;

        public CreatePrescriptionTemplateCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            IPrescriptionTemplateRepository templateRepository,
            IDoctorRepository doctorRepository,
            IMedicineRepository medicineRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _templateRepository = templateRepository;
            _doctorRepository = doctorRepository;
            _medicineRepository = medicineRepository;
            _user = user;
        }

        public async Task Handle(CreatePrescriptionTemplateCommand request, CancellationToken ct)
        {
            if (!await TestValidityAsync(request)) return;

            CreatePrescriptionTemplateViewModel input = request.Template;

            if (!await _doctorRepository.ExistsAsync(input.DoctorId, ct))
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"Doctor with id {input.DoctorId} doesn't exist.", ErrorCodes.ObjectNotFound));
                return;
            }

            List<Guid> medicineIds = input.Items.Select(i => i.MedicineId).Distinct().ToList();
            Dictionary<Guid, Medicine> medicines = await _medicineRepository
                .GetAllNoTracking(m => medicineIds.Contains(m.Id) && m.IsActive)
                .ToDictionaryAsync(m => m.Id, ct);

            List<Guid> unknown = medicineIds.Where(id => !medicines.ContainsKey(id)).ToList();
            if (unknown.Count > 0)
            {
                await NotifyAsync(new DomainNotification(request.MessageType, $"{unknown.Count} medication(s) are not in the active catalog.", DomainErrorCodes.PrescriptionTemplate.EmptyMedicine));
                return;
            }

            PrescriptionTemplate template = new PrescriptionTemplate(
                request.NewId,
                input.DoctorId,
                input.Name.Trim(),
                string.IsNullOrWhiteSpace(input.Description) ? null : input.Description.Trim()
            );
            template.SetTenantId(_user.GetTenantId());
            template.SetCreatedBy(_user.GetUserId());

            int sortOrder = 0;
            foreach (TemplateItemInputViewModel line in input.Items)
            {
                Dictionary<string, bool> timing = line.Timing ?? new Dictionary<string, bool>();

                PrescriptionTemplateItem item = new PrescriptionTemplateItem(
                    Guid.NewGuid(),
                    template.Id,
                    line.MedicineId,
                    line.Quantity,
                    line.Dose.Trim(),
                    line.Frequency.Trim(),
                    line.DurationDays,
                    string.IsNullOrWhiteSpace(line.Unit) ? medicines[line.MedicineId].DosageForm.ToString() : line.Unit.Trim(),
                    sortOrder++
                );
                item.SetDefaultRouteOfAdministration(string.IsNullOrWhiteSpace(line.Route) ? null : line.Route.Trim());
                item.SetTimingMorning(timing.GetValueOrDefault("morning"));
                item.SetTimingNoon(timing.GetValueOrDefault("noon"));
                item.SetTimingAfternoon(timing.GetValueOrDefault("afternoon"));
                item.SetTimingEvening(timing.GetValueOrDefault("evening"));
                item.SetIsPrn(line.Prn);
                item.SetBeforeAfterMeal(line.BeforeMeal ? BeforeAfterMeal.Before : line.AfterMeal ? BeforeAfterMeal.After : BeforeAfterMeal.None);
                item.SetTenantId(_user.GetTenantId());
                item.SetCreatedBy(_user.GetUserId());

                template.PrescriptionTemplateItems.Add(item);
            }

            _templateRepository.Add(template);
            await CommitAsync();
        }
    }
}
