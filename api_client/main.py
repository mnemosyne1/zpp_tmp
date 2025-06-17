# https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
# https://developer.ebay.com/my/api_test_tool?index=0&env=production
# https://ir.ebaystatic.com/pictures/aw/pics/categorychanges/2023/US_New_Structure_May2023.pdf

import datetime
import os
import sys
import requests
import json
import argparse
from bs4 import BeautifulSoup
from ebay_oauth.oauthclient.oauth2api import oauth2api
from ebay_oauth.oauthclient.credentialutil import credentialutil
from ebay_oauth.oauthclient.model.model import environment


def parse_description(desc):
	soup = BeautifulSoup(desc, 'html.parser')
	for br in soup.find_all('br'):
		br.replace_with('\n')
	t = soup.get_text()
	t2 = '\n'.join(line for line in t.splitlines() if line.strip())
	return t2


def get_token():
	app_scopes = ['https://api.ebay.com/oauth/api_scope']
	config_path = os.path.join(os.path.split(__file__)[0], 'ebay-config.yaml')
	credentialutil.load(config_path)
	oauth2api_inst = oauth2api()
	app_token = oauth2api_inst.get_application_token(environment.PRODUCTION, app_scopes)
	if app_token.error is not None or app_token.access_token is None:
		print('Something went wrong:\n', app_token)
		exit(1)
	return app_token.access_token


parser = argparse.ArgumentParser()
parser.add_argument('category_id', help="eBay ID of category to be fetched")
args = parser.parse_args()
url = f'https://api.ebay.com/buy/browse/v1/item_summary/search?category_ids={args.category_id}&limit=200&offset=0'
token = get_token()
path = os.path.dirname(os.path.abspath(__file__))
filename = 'data.json'
file_path = os.path.join(path, filename)
NUM_RETRIES = 20
TIMEOUT = 3.1
WANTED_FIELDS = [  # fields of item info which we want to store
	'itemId',
	'title',
	'shortDescription',
	'categoryPath',
	'condition',
	'conditionDescription',
	'itemLocation',
	'brand',
	'localizedAspects',
	'itemWebUrl',
	'description',
	'price'
]

headers = {
	"Authorization": f"Bearer {token}",
	"X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
	"Content-Type": "application/json"
}

try:
	with open(file_path, 'r') as infile:
		res = json.load(infile)
except FileNotFoundError:
	res = {'items': []}
seen_ids = {d['itemId']: i for i, d in enumerate(res['items'])}
db_size = len(res['items'])
print(f'Size of database: {db_size}')

try:
	response = requests.get(url, headers=headers, timeout=TIMEOUT)
	while response.status_code == 200:
		received = response.json()
		for item in received['itemSummaries']:
			print(datetime.datetime.now(), db_size, file=sys.stderr)
			item_url = item['itemHref']
			for i in range(NUM_RETRIES):
				try:
					response = requests.get(item_url, headers=headers, timeout=TIMEOUT)
					break
				except Exception as e:
					print(e)
					if i == NUM_RETRIES - 1:
						raise e
			if response.status_code == 200:
				received_item = response.json()
				if 'description' in received_item.keys():
					received_item['description'] = parse_description(received_item['description'])
				tiny_item = {key: received_item[key] for key in WANTED_FIELDS if key in received_item}
				if tiny_item['itemId'] in seen_ids:
					res['items'][seen_ids[tiny_item['itemId']]] = tiny_item
				else:
					res['items'].append(tiny_item)
					seen_ids[tiny_item['itemId']] = db_size
					db_size += 1
			else:
				print(response.text)
				break
		url = received['next']
		for i in range(NUM_RETRIES):
			try:
				response = requests.get(url, headers=headers, timeout=TIMEOUT)
				break
			except Exception as e:
				print(e)
				if i == NUM_RETRIES - 1:
					raise e
except (KeyError, TimeoutError, ConnectionError, Exception) as err:  # koniec wyników
	print(err)

print('Next url: ', url)

with open(file_path, 'w') as outfile:
	json.dump(res, outfile, indent=2)
