
from ctypes import *

psapi = windll.psapi
kernel = windll.kernel32


def EnumProcesses():
	arr = c_ulong * 256
	lpidProcess = arr()
	cb = sizeof(lpidProcess)
	cbNeeded = c_ulong()
	psapi.EnumProcesses(byref(lpidProcess), cb, byref(cbNeeded))

	nReturned = int(cbNeeded.value / sizeof(c_ulong()))

	pidProcess = [i for i in lpidProcess][:nReturned]

	print(pidProcess)



if __name__ == '__main__':
	EnumProcesses()