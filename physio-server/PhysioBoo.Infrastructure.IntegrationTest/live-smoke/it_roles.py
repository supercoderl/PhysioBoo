from it_ctx import *

owner, tenant, tok = make_staff()
ok = True
SEARCH = {'pageNumber': 1, 'pageSize': 5, 'search': '', 'sort': '', 'filter': None}

# --- authentication / permission loading
c, d = call('GET', '/api/users/me'); ok &= check('no token -> 401', c == 401, c)
c, d = call('GET', '/api/users/me', token=tok); ok &= check('/users/me with token', c == 200 and d['success'], (c, str(d)[:200]))
perms = (d or {}).get('data', {}).get('permissions') if c == 200 else None
ok &= check('profile exposes permissions', bool(perms) and len(perms) >= 270, len(perms or []))

norole = q1("insert into \"Users\"(\"Id\",\"Email\",\"Phone\",\"PasswordHash\",\"IsActive\",\"IsVerified\",\"FailedLoginAttempts\",\"TwoFactorEnabled\",\"PreferredLanguage\",\"TimeZone\",\"TenantId\",\"CreatedAt\") "
            "values (gen_random_uuid(),'norole@example.test','+8400000002','x',true,true,0,false,'en','UTC','%s',now()) returning \"Id\"" % tenant)
t2 = jwt(norole, 'norole@example.test', tenant)
c, d = call('POST', '/api/roles/search', SEARCH, token=t2); ok &= check('role-less user -> 403 on roles search', c == 403, c)
c, d = call('POST', '/api/roles/search', SEARCH, token=tok); ok &= check('staff roles search', c == 200 and d['success'], (c, str(d)[:150]))

# --- role create + permission assignment
c, d = call('POST', '/api/roles/create', {'name': 'IT Role', 'code': 'IT_ROLE', 'description': 'd', 'color': '#111111', 'icon': 'shield'}, token=tok)
ok &= check('create role', c == 201 and d['success'], (c, d))
rid = d['data'] if c == 201 else None
ok &= check('role persisted under returned id', count('select count(*) from "Roles" where "Id"=\'%s\'' % rid) == '1')


def rp_count():
    return count('select count(*) from "RolePermissions" where "RoleId"=\'%s\'' % rid)


codes = ['iam:user:read', 'iam:role:read', 'reception:booking:read']
body = lambda m: {'roleId': rid, 'permissions': m}
c, d = call('POST', '/api/roles/assign-permission-to-role', body({k: True for k in codes}), token=tok); ok &= check('assign 3 permissions', c == 200, (c, d))
ok &= check('3 RolePermissions rows persisted', rp_count() == '3')
c, d = call('GET', '/api/roles/%s/permissions' % rid, token=tok); ok &= check('GET role permissions returns 3 ids', c == 200 and len(d['data']) == 3, (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body({k: True for k in codes}), token=tok); ok &= check('re-assign is idempotent (no duplicates)', c == 200 and rp_count() == '3', (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body({'iam:user:read': False}), token=tok); ok &= check('revoke via false', c == 200 and rp_count() == '2', (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body({'iam:user:read': True}), token=tok); ok &= check('re-grant after revoke', c == 200 and rp_count() == '3', (c, d))
pid = q1('select "Id" from "Permissions" where "Code"=\'iam:role:read\'')
c, d = call('DELETE', '/api/roles/%s/permissions/%s' % (rid, pid), token=tok); ok &= check('DELETE single permission (frontend revoke path)', c in (200, 204) and rp_count() == '2', (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body({'iam:role:read': True}), token=tok); ok &= check('re-grant after DELETE', c == 200 and rp_count() == '3', (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body({'no:such:code': True}), token=tok); ok &= check('unknown code ignored, nothing added', c == 200 and rp_count() == '3', (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', body(None), token=tok); ok &= check('null permissions -> 400', c == 400, (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', {'roleId': '00000000-0000-0000-0000-000000000000', 'permissions': {}}, token=tok); ok &= check('empty role id -> 400', c == 400, (c, d))
c, d = call('POST', '/api/roles/assign-permission-to-role', {'roleId': '11111111-1111-1111-1111-111111111111', 'permissions': {'iam:user:read': True}}, token=tok)
print('INFO unknown role id ->', c, str(d)[:120])

# role update persists colour/icon
c, d = call('PATCH', '/api/roles/%s' % rid, {'name': 'IT Role 2', 'code': 'IT_ROLE', 'description': 'd2', 'color': '#abcdef', 'icon': 'star', 'isSystemRole': False, 'isActive': True, 'isPublicForRegistration': False}, token=tok)
ok &= check('update role', c in (200, 204), (c, d))
ok &= check('colour+icon persisted', q1('select "Color"||\'|\'||"Icon"||\'|\'||"Name" from "Roles" where "Id"=\'%s\'' % rid) == '#abcdef|star|IT Role 2')

# permission create + derived category + page size
c, d = call('POST', '/api/permissions', {'name': 'IT perm', 'code': 'itmod:thing:read', 'description': 'x'}, token=tok); ok &= check('create permission (fixed URL)', c == 201 and d['success'], (c, d))
c, d = call('POST', '/api/permissions/search', {'pageNumber': 1, 'pageSize': 300, 'search': '', 'sort': '', 'filter': {}}, token=tok)
items = d['data']['items'] if c == 200 else []
ok &= check('permissions search honours pageSize 300 (>100)', len(items) >= 275, len(items))
ok &= check('category derived from code', any(i['code'] == 'itmod:thing:read' and i['category'] == 'itmod' for i in items))
print('ALL OK' if ok else 'SOME FAILED')
