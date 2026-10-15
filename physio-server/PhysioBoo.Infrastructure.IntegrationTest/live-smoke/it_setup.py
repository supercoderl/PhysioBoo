from it import *
branch={'name':'Main Branch','hospitalType':0,'emergencyCapacity':5,'operationTheaters':1,'address':'1 St','city':'HCM','stateProvince':'HCM','country':'VN','accreditationBody':'MOH','insuranceAccepted':[],'languagesSupported':['en']}
body={'company':{'name':'IT Group','email':'itgroup@example.test'},'branches':[branch,{**branch,'name':'Second Branch','hospitalType':4,'emergencyCapacity':0}],'owner':{'email':'owner@example.test','phone':'+840000001','password':'Passw0rd!Passw0rd'}}
print(call('POST','/api/tenants/register',body))
