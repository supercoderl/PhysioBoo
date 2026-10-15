from it_ctx import *
import uuid

owner, tenant, tok = make_staff()
ok = True
other = q1("select \"Id\" from \"Users\" where \"Email\"='norole@example.test'")
sql("insert into \"UserRoles\"(\"Id\",\"UserId\",\"RoleId\",\"AssignedAt\") select gen_random_uuid(),'%s',r.\"Id\",now() from \"Roles\" r where r.\"Code\"='ADMIN'" % other)
c, d = call('POST', '/api/conversations/direct', {'userId': other}, token=tok)
ok &= check('open direct conversation (user transaction inside execution strategy)', c in (200, 201) and d and d.get('success'), (c, str(d)[:300]))
cid = d['data'] if c in (200, 201) and d else None
c, d = call('POST', '/api/conversations/direct', {'userId': other}, token=tok)
ok &= check('opening it again returns the same conversation (no duplicate)', c in (200, 201) and d and d.get('data') == cid and count('select count(*) from "Conversations"') == '1', (c, str(d)[:200]))
mid = str(uuid.uuid4())
c, d = call('POST', '/api/conversations/%s/messages' % cid, {'id': mid, 'content': 'hello'}, token=tok)
ok &= check('send message', c in (200, 201) and d and d.get('success'), (c, str(d)[:300]))
ok &= check('message persisted', count('select count(*) from "ConversationMessages" where "Id"=\'%s\'' % mid) == '1')
c, d = call('POST', '/api/conversations/%s/messages' % cid, {'id': mid, 'content': 'hello'}, token=tok)
print('INFO resend same id ->', c, str(d)[:120])
c, d = call('GET', '/api/conversations/%s/messages' % cid, token=tok)
ok &= check('read messages back', c == 200 and d and d.get('success'), (c, str(d)[:200]))
print('ALL OK' if ok else 'SOME FAILED')
