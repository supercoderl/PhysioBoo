from it_ctx import *

owner, tenant, tok = make_staff()
ok = True
S = lambda **f: {'pageNumber': 1, 'pageSize': 50, 'search': '', 'sort': '', 'filter': {'start': '', 'end': '', **f}}

# ---------------- hospitals: filters (before/after fix) ----------------
c, d = call('POST', '/api/hospitals/search', S(hospitalGroupId=None, type=None, isActive=None, hasEmergencyServices=None), token=tok)
hospitals = d['data']['items'] if c == 200 else []
ok &= check('hospital search (no filter) returns both branches', c == 200 and len(hospitals) == 2, (c, str(d)[:200]))
c, d = call('POST', '/api/hospitals/search', S(hospitalGroupId=tenant), token=tok)
ok &= check('filter hospitalGroupId=tenant -> 2', c == 200 and len(d['data']['items']) == 2, (c, str(d)[:150]))
c, d = call('POST', '/api/hospitals/search', S(hospitalGroupId='11111111-1111-1111-1111-111111111111'), token=tok)
ok &= check('filter other group -> 0', c == 200 and len(d['data']['items']) == 0, (c, str(d)[:150]))
c, d = call('POST', '/api/hospitals/search', S(type=4), token=tok)
ok &= check('filter type=Clinic -> 1 (Second Branch)', c == 200 and [h['name'] for h in d['data']['items']] == ['Second Branch'], (c, str(d)[:200]))
c, d = call('POST', '/api/hospitals/search', S(hasEmergencyServices=False), token=tok)
ok &= check('filter hasEmergencyServices=false -> 1', c == 200 and len(d['data']['items']) == 1, (c, str(d)[:150]))
c, d = call('POST', '/api/hospitals/search', S(isActive=False), token=tok)
ok &= check('filter isActive=false -> 0', c == 200 and len(d['data']['items']) == 0, (c, str(d)[:150]))
hid = hospitals[0]['id'] if hospitals else None

# ---------------- departments ----------------
dept = lambda name: {'hospitalId': hid, 'name': name, 'departmentCode': name[:3].upper(), 'description': None, 'headOfDepartment': None,
                     'floorNumber': 1, 'wing': 'A', 'phone': None, 'email': None, 'budgetAllocated': None, 'operationHours': None, 'equipmentList': None,
                     'bedCount': 0, 'isEmergency': False, 'isCriticalCare': False, 'isOutPatient': True, 'isInPatient': False}
c, d = call('POST', '/api/departments', dept('Cardiology'), token=tok)
ok &= check('create department #1', c == 201 and d['success'] and d['data'] != '00000000-0000-0000-0000-000000000000', (c, d))
d1 = d['data'] if c == 201 else None
c, d = call('POST', '/api/departments', dept('Neurology'), token=tok)
ok &= check('create department #2 (no PK collision)', c == 201 and d['success'], (c, d))
d2 = d['data'] if c == 201 else None
ok &= check('departments stored under distinct server ids', d1 and d2 and d1 != d2 and count('select count(*) from "Departments" where "Id" in (\'%s\',\'%s\')' % (d1, d2)) == '2')
c, d = call('GET', '/api/departments/%s' % d1, token=tok)
ok &= check('GET department by returned id', c == 200 and d['data'] and d['data']['name'] == 'Cardiology', (c, str(d)[:200]))
c, d = call('POST', '/api/departments/search', S(), token=tok)
ok &= check('department search lists both', c == 200 and d['data']['totalCount'] == 2, (c, str(d)[:200]))
c, d = call('POST', '/api/departments/search', {'pageNumber': 1, 'pageSize': 10, 'search': '', 'sort': 'createdAt:desc', 'filter': {'start': '', 'end': ''}}, token=tok)
ok &= check('colon-style sort accepted (createdAt:desc), newest first', c == 200 and d['data']['items'][0]['name'] == 'Neurology', (c, str(d)[:200]))
c, d = call('PATCH', '/api/departments/%s' % d1, {**dept('Cardiology2'), 'isActive': True}, token=tok)
ok &= check('update department (route id, body without id)', c in (200, 204), (c, d))
ok &= check('department rename persisted and still active', count('select "Name"||\'|\'||"IsActive"::text from "Departments" where "Id"=\'%s\'' % d1) == 'Cardiology2|true')
c, d = call('POST', '/api/departments', {**dept('X'), 'hospitalId': '00000000-0000-0000-0000-000000000000'}, token=tok)
ok &= check('department with empty hospital -> 400', c == 400, (c, d))

# ---------------- doctors ----------------
doc = {'email': 'dr.who@example.test', 'phone': '+84900000001', 'password': 'Passw0rd!Passw0rd', 'firstName': 'Who', 'lastName': 'Doctor', 'middleName': '',
       'dateOfBirth': '1985-05-05', 'gender': 0, 'bloodGroup': 1, 'maritalStatus': 0, 'nationality': 'VN', 'identificationType': None,
       'identificationNumber': None, 'identificationExpiry': None, 'emergencyContactName': None, 'emergencyContactPhone': None,
       'emergencyContactRelationship': None, 'preferredCommunication': 0, 'bio': 'bio', 'about': 'about', 'languagesSpoken': ['en', 'vi'],
       'primarySpecialtyId': None, 'medicalLicenseNumber': 'LIC-0001', 'medicalLicenseExpiry': '2035-01-01', 'medicalLicenseIssuingAuthority': 'MOH',
       'yearsOfExperience': 5, 'yearsOfPractice': 5, 'archivements': 'award', 'researchInterests': 'rehab', 'publicationsCount': 1,
       'conferencePresentations': 2, 'employmentStatus': 0, 'bankAccountDetails': None, 'panNumber': None, 'gstin': None}
c, d = call('POST', '/api/doctors', doc, token=tok)
ok &= check('create doctor (restored endpoint)', c == 201 and d['success'], (c, d))
did = d['data'] if c == 201 else None
ok &= check('doctor + user + profile rows persisted under returned id',
            did and count('select (select count(*) from "Doctors" where "Id"=\'%s\')::text||(select count(*) from "Users" where "Id"=\'%s\')::text||(select count(*) from "Profiles" where "Id"=\'%s\')::text' % (did, did, did)) == '111')
c, d = call('GET', '/api/doctors/%s' % did, token=tok)
ok &= check('GET doctor by id exposes id + userId', c == 200 and d['data'] and d['data'].get('id') == did and d['data'].get('userId') == did, (c, str(d)[:300]))
c, d = call('POST', '/api/doctors/search', S(), token=tok)
rows = d['data']['items'] if c == 200 else []
ok &= check('doctor list rows carry id (was undefined)', c == 200 and rows and all(r.get('id') for r in rows), (c, str(d)[:200]))
c, d = call('POST', '/api/doctors', doc, token=tok)
ok &= check('duplicate doctor email rejected (no duplicate record)', c in (400, 409) and count('select count(*) from "Users" where "Email"=\'dr.who@example.test\'') == '1', (c, d))
cur = call('GET', '/api/doctors/%s' % did, token=tok)[1]['data']
upd = {'bio': 'new bio', 'about': 'about', 'archivements': 'award', 'researchInterests': 'rehab', 'languagesSpoken': ['en'], 'publicationsCount': 3,
       'conferencePresentations': 2, 'yearsOfExperience': 9, 'yearsOfPractice': 5,
       'consultationFeeMin': 111, 'consultationFeeMax': 222, 'followUpFee': 33, 'emergencyConsultationFee': 44, 'homeVisitFee': 55, 'videoConsultationFee': 66,
       'consultationDuration': 30, 'bufferTime': 5, 'advanceBookingDays': 14, 'cancellationPolicy': 'p', 'isAvailableOnline': True, 'isAvailableHomeVisit': True,
       'isAvailableEmergency': False, 'bankAccountDetails': None, 'panNumber': 'PAN1', 'gstin': None, 'employmentStatus': 0}
# first set fees/availability directly so we can prove the edit payload (re-sent from the loaded record) preserves them
c, d = call('PATCH', '/api/doctors/%s' % did, upd, token=tok); ok &= check('update doctor (fees set)', c in (200, 204), (c, d))
loaded = call('GET', '/api/doctors/%s' % did, token=tok)[1]['data']
edit = {**upd, 'bio': 'edited bio', 'yearsOfExperience': 10,
        'consultationFeeMin': loaded['consultationFeeMin'], 'consultationFeeMax': loaded['consultationFeeMax'], 'followUpFee': loaded['followUpFee'],
        'emergencyConsultationFee': loaded['emergencyConsultationFee'], 'homeVisitFee': loaded['homeVisitFee'], 'videoConsultationFee': loaded['videoConsultationFee'],
        'consultationDuration': loaded['consultationDuration'], 'bufferTime': loaded['bufferTime'], 'advanceBookingDays': loaded['advanceBookingDays'],
        'cancellationPolicy': loaded['cancellationPolicy'], 'isAvailableOnline': loaded['isAvailableOnline'], 'isAvailableHomeVisit': loaded['isAvailableHomeVisit'],
        'isAvailableEmergency': loaded['isAvailableEmergency']}
c, d = call('PATCH', '/api/doctors/%s' % did, edit, token=tok); ok &= check('edit doctor (drawer payload)', c in (200, 204), (c, d))
after = call('GET', '/api/doctors/%s' % did, token=tok)[1]['data']
ok &= check('edit persisted bio/experience', after['bio'] == 'edited bio' and after['yearsOfExperience'] == 10, str(after)[:200])
ok &= check('edit preserved fees + availability', (after['consultationFeeMin'], after['consultationFeeMax'], after['videoConsultationFee'], after['isAvailableHomeVisit']) == (111, 222, 66, True), str(after)[:300])
c, d = call('DELETE', '/api/doctors/%s' % did, token=tok); ok &= check('delete doctor', c in (200, 204), (c, d))
c, d = call('GET', '/api/doctors/%s' % did, token=tok); print('INFO get after delete ->', c, str(d)[:100])

# ---------------- articles: visibility ----------------
art = lambda title, status: {'title': title, 'slug': title.lower().replace(' ', '-'), 'author': 'Staff', 'category': 0, 'tags': None, 'coverImageUrl': None,
                             'excerpt': 'e', 'content': 'c', 'status': status, 'publishDate': None, 'readTime': None}
ids = {}
for name, status in [('Pub Article', 1), ('Draft Article', 0), ('Archived Article', 2)]:
    c, d = call('POST', '/api/articles', art(name, status), token=tok)
    ids[name] = d['data'] if c == 201 else None
    ok &= check('create %s' % name, c == 201, (c, d))
st = lambda s: sql('select "Title"||\'=\'||"Status" from "Articles" where "Id"=\'%s\'' % ids[s])
print('INFO stored statuses:', [st(n) for n in ids])
pub_status = int(sql('select "Status" from "Articles" where "Id"=\'%s\'' % ids['Pub Article']))
draft_status = int(sql('select "Status" from "Articles" where "Id"=\'%s\'' % ids['Draft Article']))
arch_status = int(sql('select "Status" from "Articles" where "Id"=\'%s\'' % ids['Archived Article']))
filt = lambda **f: {'pageNumber': 1, 'pageSize': 20, 'search': '', 'sort': '', 'filter': {'start': '', 'end': '', 'category': None, 'status': None, **f}}
titles = lambda r: sorted(i['title'] for i in r[1]['data']['items'])
anon = call('POST', '/api/articles/search', filt())
ok &= check('anonymous default search -> only Published', anon[0] == 200 and titles(anon) == ['Pub Article'], titles(anon) if anon[0] == 200 else anon)
anon_d = call('POST', '/api/articles/search', filt(status=draft_status))
ok &= check('anonymous asking for Draft gets Published only (no leak)', anon_d[0] == 200 and titles(anon_d) == ['Pub Article'], titles(anon_d) if anon_d[0] == 200 else anon_d)
anon_u = call('POST', '/api/articles/search', filt(includeUnpublished=True))
ok &= check('anonymous includeUnpublished ignored', anon_u[0] == 200 and titles(anon_u) == ['Pub Article'], titles(anon_u) if anon_u[0] == 200 else anon_u)
c, d = call('GET', '/api/articles/%s' % ids['Draft Article'])
ok &= check('anonymous GET draft by id -> no data', c == 200 and not d['data'], (c, str(d)[:150]))
c, d = call('GET', '/api/articles/%s' % ids['Pub Article'])
ok &= check('anonymous GET published by id -> data', c == 200 and d['data'] and d['data']['title'] == 'Pub Article', (c, str(d)[:150]))
st_u = call('POST', '/api/articles/search', filt(includeUnpublished=True), token=tok)
ok &= check('staff includeUnpublished -> all 3', st_u[0] == 200 and len(titles(st_u)) == 3, titles(st_u) if st_u[0] == 200 else st_u)
st_d = call('POST', '/api/articles/search', filt(status=draft_status), token=tok)
ok &= check('staff Draft filter -> Draft only', st_d[0] == 200 and titles(st_d) == ['Draft Article'], titles(st_d) if st_d[0] == 200 else st_d)
c, d = call('GET', '/api/articles/%s' % ids['Draft Article'], token=tok)
ok &= check('staff GET draft by id -> data', c == 200 and d['data'] and d['data']['title'] == 'Draft Article', (c, str(d)[:150]))

# ---------------- allergies (medical record) ----------------
pat = {'userId': None, 'primaryDoctorId': None, 'referredBy': None, 'referralHospitalId': None, 'medicalHistory': None,
       'profile': {'firstName': 'Pat', 'lastName': 'Ient', 'dateOfBirth': '1990-01-01', 'gender': 0, 'bloodGroup': 1, 'maritalStatus': 0,
                   'email': 'pat@example.test', 'phone': '+84900000009'}}
pdoc = call('POST', '/api/doctors', {**doc, 'email': 'dr.two@example.test', 'phone': '+84900000002', 'medicalLicenseNumber': 'LIC-0002'}, token=tok)
pat['primaryDoctorId'] = pdoc[1]['data'] if pdoc[0] == 201 else None
c, d = call('POST', '/api/patients', pat, token=tok)
ok &= check('create patient', c == 201 and d['success'], (c, d))
pid = d['data'] if c == 201 else None
alg = {'id': '00000000-0000-0000-0000-000000000000', 'patientId': pid, 'allergenName': 'Penicillin', 'allergenType': 0, 'reactionType': 'Rash', 'severity': 1,
       'firstOccurenceDate': '2020-01-02', 'lastOccurenceDate': '2021-03-04', 'treatmentGiven': 'Antihistamine', 'notes': 'Avoid beta-lactams'}
c, d = call('POST', '/api/patientAllergies/create', alg, token=tok); print('INFO create allergy ->', c, str(d)[:160])
c, d = call('GET', '/api/medical-records/%s/allergies' % pid, token=tok)
items = d['data']['items'] if c == 200 and d['data'] else []
ok &= check('medical-record allergies returns the allergy', c == 200 and len(items) == 1, (c, str(d)[:300]))
if items:
    a = items[0]
    ok &= check('allergy JSON uses allergenName/notes/firstOccurrenceDate', a.get('allergenName') == 'Penicillin' and a.get('notes') == 'Avoid beta-lactams' and 'firstOccurrenceDate' in a, str(a))

print('ALL OK' if ok else 'SOME FAILED')
