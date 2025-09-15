﻿using PhysioBoo.SharedKernel.Utils;

namespace PhysioBoo.Domain.Entities
{
    public abstract class Entity
    {
        public Guid Id { get; private set; }
        public DateTimeOffset? DeletedAt { get; private set; }

        protected Entity(Guid id)
        {
            Id = id;
        }

        public void SetId(Guid id)
        {
            if (id == Guid.Empty)
            {
                throw new ArgumentException($"{nameof(id)} may not be empty");
            }

            Id = id;
        }

        public void Delete()
        {
            DeletedAt = TimeZoneHelper.GetLocalTimeNow();
        }

        public void Undelete()
        {
            DeletedAt = null;
        }
    }
}
