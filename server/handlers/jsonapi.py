'''Handler Layer'''
import datetime
import logging

LOGGER = logging.getLogger('autokpi')

'''
Assumes pre-serialized objects with type & id variables
- Children require a variable of parentType & the parentID mapped as parent
- Other related objects should be listed in a list of related with variable
   names matching the singular form of their type
'''
class JsonApiHandler(object):
	def jsonSerialize(self, data, urlroot):
		#Create Data
		obj = dict()
		obj['type'] = data['type']
		obj['id'] = data['id']
		obj['attributes'] = data
		del obj['attributes']['type']
		del obj['attributes']['id']

		#Build Self Links
		links = dict()
		if obj['id']:
			links['self'] = '{}{}/{}'.format(urlroot,obj['attributes']['route'],obj['id'])
		else:
			links['self'] = '{}{}'.format(urlroot,obj['attributes']['route'])
		del obj['attributes']['route']
		obj['links'] = links
		obj = self.jsonRelationships(obj, urlroot)
		return obj

	def jsonRelationships(self,data,urlroot):
		if 'parent' in data['attributes']:
			data = self.jsonParent(data, urlroot)
		if 'related' in data['attributes'] or 'included' in data['attributes']:
			data = self.jsonChild(data, urlroot)
		return data

	def jsonParent(self, data, urlroot):
		if data['attributes']['parent']:
			#Build Data
			pdata = dict()
			pdata['type'] = data['attributes']['parentType']
			pdata['id'] = data['attributes']['parent']

			#Build Links
			links = dict()
			links['related'] = '{}{}/{}'.format(
				urlroot,
				data['attributes']['parentType'],
				data['attributes']['parent']
				)
			links['{}s'.format(data['type'])] = data['links']['self']
			links['self'] = data['links']['self'] + '/relationships/{}'.format(data['attributes']['parentType'])

			#Add related to existing links
			data['links']['related'] = '{}/relationships'.format(
				data['links']['self'],

				)

			parent = dict()
			parent['links'] = links
			parent['data'] = pdata
			relationship = dict()
			relationship[data['attributes']['parentType']] = parent
			data['relationships'] = relationship

		del data['attributes']['parentType']
		del data['attributes']['parent']

		return data

	def jsonChild(self,data,urlroot):
		if 'relationships' in data.keys():
			relationships = data['relationships']
		else:
			relationships = dict() 
		if 'related' in data['attributes'].keys():
			for rtype in data['attributes']['related']:
				if data['attributes'][rtype]:
					robj = dict()
					if isinstance(data['attributes'][rtype], list):
						rdata = []
						for item in data['attributes'][rtype]:
							obj = dict()
							if isinstance(item,dict) and 'type' in item.keys():
								obj['type'] = item['type']
							else:
								obj['type'] =rtype
							obj['id'] = item
							rdata.append(obj)
						#Add S to relationship type for link
						reltype = rtype + 's'
					else:
						rdata = dict()
						if 'type' in rdata.keys():
							rdata['type'] = rdata['type']
						else:
							rdata['type'] =rtype
						rdata['id'] = data['attributes'][rtype]
						reltype = rtype
					robj['data'] = rdata

					links = dict()
					links['self'] = '{}{}/{}/relationships/{}'.format(
						urlroot,
						data['type'],
						data['id'],
						reltype
						)
					links['related'] = '{}{}/{}/{}'.format(
						urlroot,
						data['type'],
						data['id'],
						reltype
						)
					robj['links'] = links
					relationships[reltype] = robj
				del data['attributes'][rtype]
			del data['attributes']['related']
		
		
		if 'included' in data.keys():
			included = data['included']
		else:
			included = []
		#Add included when exists
		if 'included' in data['attributes'].keys():
			
			for itype in data['attributes']['included']:
				if data['attributes'][itype]:
					robj = dict()
					if isinstance(data['attributes'][itype], list):
						rdata = []
						for item in data['attributes'][itype]:
							obj = dict()
							if 'type' in item.keys():
								obj['type'] = item['type']
							else:
								obj['type'] = itype
							obj['id'] = item['id']
							rdata.append(obj)
						#Add S to relationship type for link
						reltype = itype + 's'
					else:
						rdata = dict()
						if 'type' in data['attributes'][itype].keys():
							rdata['type'] = data['attributes'][itype]['type']
							#del data['attributes'][itype]['type']
						else:
							rdata['type'] = itype
						rdata['id'] = data['attributes'][itype]['id']
						reltype = itype
					robj['data'] = rdata

					links = dict()
					links['self'] = '{}{}/{}/relationships/{}'.format(
						urlroot,
						data['type'],
						data['id'],
						reltype
						)
					links['related'] = '{}{}/{}/{}'.format(
						urlroot,
						data['type'],
						data['id'],
						reltype
						)
					robj['links'] = links
					relationships[reltype] = robj
				origIncluded = data['attributes'][itype]
				del data['attributes'][itype]
				if isinstance(origIncluded, list):
					for incl in origIncluded:
						if 'related' in incl.keys():
							for irtype in incl['related']:
								del incl[irtype]
							del incl['related']
						incl = self.jsonSerialize(incl, urlroot)
						if incl not in included:
							included.append(incl)
				else:
					if 'related' in origIncluded.keys():
						for irtype in origIncluded['related']:
							del origIncluded[irtype]
						del origIncluded['related']
					origIncluded = self.jsonSerialize(origIncluded, urlroot)
					if origIncluded not in included:
						included.append(origIncluded)
			del data['attributes']['included']

		related = False
		if relationships:
			data['relationships'] = relationships
			related = True
		if included:
			data['included'] = included
			related = True

		if related:
			data['links']['related'] = data['links']['self'] + '/relationships'

		return data
