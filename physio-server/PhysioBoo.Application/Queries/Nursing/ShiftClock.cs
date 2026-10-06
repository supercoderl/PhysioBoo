using PhysioBoo.Domain.Enums;

namespace PhysioBoo.Application.Queries.Nursing
{
    // Shifts: Day 07:00-15:00, Evening 15:00-23:00, Night 23:00-07:00.
    internal static class ShiftClock
    {
        public static ShiftCode Next(ShiftCode shift)
        {
            return shift switch
            {
                ShiftCode.Day => ShiftCode.Evening,
                ShiftCode.Evening => ShiftCode.Night,
                _ => ShiftCode.Day
            };
        }

        // A night shift runs past midnight: before noon it still belongs to the previous calendar day.
        public static DateOnly ShiftDateFor(ShiftCode shift, DateTime now)
        {
            DateTime date = shift == ShiftCode.Night && now.Hour < 12 ? now.Date.AddDays(-1) : now.Date;
            return DateOnly.FromDateTime(date);
        }
    }
}
