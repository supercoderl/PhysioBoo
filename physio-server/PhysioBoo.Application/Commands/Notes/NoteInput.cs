using PhysioBoo.Application.ViewModels.Notes;
using PhysioBoo.Domain.Errors;

namespace PhysioBoo.Application.Commands.Notes
{
    // Rules and clean-up shared by creating and updating a note.
    internal static class NoteInput
    {
        public const int MaxLabels = 10;
        public const int MaxChecklistItems = 50;

        public static void AddRules<T>(AbstractValidator<T> validator, Func<T, SaveNoteViewModel> input)
        {
            validator.RuleFor(c => input(c).Title)
                .MaximumLength(200).WithErrorCode(DomainErrorCodes.Note.TextExceedsMaxLength).WithMessage("Title may not exceed 200 characters.")
                .When(c => input(c).Title != null);

            validator.RuleFor(c => input(c).Content)
                .MaximumLength(10000).WithErrorCode(DomainErrorCodes.Note.TextExceedsMaxLength).WithMessage("Content may not exceed 10000 characters.")
                .When(c => input(c).Content != null);

            validator.RuleFor(c => c)
                .Must(c => HasAnyContent(input(c)))
                .WithErrorCode(DomainErrorCodes.Note.EmptyContent).WithMessage("A note needs a title, some content or a checklist item.");

            validator.RuleFor(c => input(c).Labels!.Count)
                .LessThanOrEqualTo(MaxLabels).WithErrorCode(DomainErrorCodes.Note.TooManyLabels).WithMessage($"A note can have at most {MaxLabels} labels.")
                .When(c => input(c).Labels != null);

            validator.RuleForEach(c => input(c).Labels)
                .MaximumLength(30).WithErrorCode(DomainErrorCodes.Note.TextExceedsMaxLength).WithMessage("A label may not exceed 30 characters.")
                .When(c => input(c).Labels != null);

            validator.RuleFor(c => input(c).Checklist!.Count)
                .LessThanOrEqualTo(MaxChecklistItems).WithErrorCode(DomainErrorCodes.Note.TooManyItems).WithMessage($"A checklist can have at most {MaxChecklistItems} items.")
                .When(c => input(c).Checklist != null);

            validator.RuleForEach(c => input(c).Checklist)
                .Must(i => i.Text == null || i.Text.Length <= 200)
                .WithErrorCode(DomainErrorCodes.Note.TextExceedsMaxLength).WithMessage("A checklist item may not exceed 200 characters.")
                .When(c => input(c).Checklist != null);
        }

        public static List<string> CleanLabels(IEnumerable<string>? labels)
        {
            return (labels ?? Enumerable.Empty<string>())
                .Select(l => l?.Trim() ?? string.Empty)
                .Where(l => l.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        public static List<NoteChecklistItemViewModel> CleanChecklist(IEnumerable<NoteChecklistItemViewModel>? items)
        {
            return (items ?? Enumerable.Empty<NoteChecklistItemViewModel>())
                .Where(i => !string.IsNullOrWhiteSpace(i.Text))
                .Select(i => new NoteChecklistItemViewModel(i.Text.Trim(), i.Done))
                .ToList();
        }

        public static string? CleanTitle(string? title)
        {
            return string.IsNullOrWhiteSpace(title) ? null : title.Trim();
        }

        private static bool HasAnyContent(SaveNoteViewModel input)
        {
            return !string.IsNullOrWhiteSpace(input.Title)
                || !string.IsNullOrWhiteSpace(input.Content)
                || (input.Checklist ?? new()).Any(i => !string.IsNullOrWhiteSpace(i.Text));
        }
    }
}
