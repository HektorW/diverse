
import string
import json
import itertools

from ctypes import windll
from os import path
from subprocess import call
from collections import defaultdict


SCAN_FILE = 'scan.json'

DIR_LEADS = [
	'program files',
	'program files (x86)',
	'games',
	'starcraft 2',
	'starcraft ii'
]


def read_scan_file():
	data = defaultdict(lambda: None)

	if path.isfile(SCAN_FILE):

		with open(SCAN_FILE, 'r') as f:
			try:
				data = json.load(f)
			except e: #ValueError
				print("Invalid JSON: ", e)
				pass

	return data


def get_drives():
	DRIVE_FIXED = 3
	drives = []
	for letter in string.ascii_uppercase:
		drive = '%s:/' % letter
		if windll.kernel32.GetDriveTypeW(drive) is DRIVE_FIXED:
			drives.append(drive)
	return drives


def scan(file_name, leads=DIR_LEADS):
	drives = get_drives()
	for drive in drives:
		for lead in leads:
			dirn = path.join(drive, lead)
			print(dirn, path.isdir(dirn))


scan('starcraft')