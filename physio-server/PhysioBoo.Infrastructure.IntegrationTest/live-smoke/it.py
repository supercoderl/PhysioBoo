import json, hmac, hashlib, base64, time, urllib.request, urllib.error, subprocess, os
BASE=os.environ.get('IT_API','http://127.0.0.1:5199')
SECRET=os.environ.get('IT_JWT_SECRET','integration-test-secret-key-0123456789-abcdefghij').encode()
PSQL=os.environ.get('PSQL','psql')
PG_PORT=os.environ.get('IT_PG_PORT','55432')
def b64(b): return base64.urlsafe_b64encode(b).rstrip(b'=').decode()
def jwt(uid,email,tenant,name='it'):
    h=b64(json.dumps({'alg':'HS256','typ':'JWT'}).encode())
    p=b64(json.dumps({'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress':email,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier':uid,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name':name,'TenantId':tenant,
      'exp':int(time.time())+7200,'iss':'it-issuer','aud':'it-audience'}).encode())
    s=b64(hmac.new(SECRET,(h+'.'+p).encode(),hashlib.sha256).digest()); return h+'.'+p+'.'+s
def call(method,path,body=None,token=None):
    req=urllib.request.Request(BASE+path,method=method,data=None if body is None else json.dumps(body).encode(),
        headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+token} if token else {})})
    try:
        r=urllib.request.urlopen(req,timeout=60); raw=r.read().decode(); code=r.status
    except urllib.error.HTTPError as e: raw=e.read().decode(); code=e.code
    try: data=json.loads(raw) if raw else None
    except Exception: data=raw[:300]
    return code,data
def sql(q):
    return subprocess.run([PSQL,'-h','127.0.0.1','-p',PG_PORT,'-U','postgres','-d','physio_it','-tAc',q],capture_output=True,text=True,timeout=60).stdout.strip()
def check(name,cond,detail=''):
    print(('PASS' if cond else 'FAIL'),name,detail if not cond else ''); return cond
