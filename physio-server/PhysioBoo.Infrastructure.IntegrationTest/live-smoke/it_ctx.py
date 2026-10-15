from it import *

OWNER_EMAIL = 'owner@example.test'


def q1(query):
    return sql(query).split('\n')[0]


def make_staff():
    """Owner of the registered tenant, promoted to SUPER_ADMIN so every permission policy passes."""
    owner = q1('select "Id" from "Users" where "Email"=\'%s\'' % OWNER_EMAIL)
    tenant = q1('select "TenantId" from "Users" where "Email"=\'%s\'' % OWNER_EMAIL)
    sql('insert into "UserRoles"("Id","UserId","RoleId","AssignedAt") select gen_random_uuid(),\'%s\',r."Id",now() '
        'from "Roles" r where r."Code"=\'SUPER_ADMIN\' and not exists '
        '(select 1 from "UserRoles" x where x."UserId"=\'%s\' and x."RoleId"=r."Id")' % (owner, owner))
    return owner, tenant, jwt(owner, OWNER_EMAIL, tenant)


def count(query):
    return q1(query)
