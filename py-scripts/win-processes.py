#! /usr/bin/env python3

"""
Does some things
"""

from ctypes import *

psapi = windll.psapi
kernel = windll.kernel32


def enum_processes():
    """
    Iterates processes
    """
    arr = c_ulong * 256
    lpid_process = arr()
    cb_size = sizeof(lpid_process)
    cb_needed = c_ulong()
    psapi.EnumProcesses(byref(lpid_process), cb_size, byref(cb_needed))

    n_returned = int(cb_needed.value / sizeof(c_ulong()))

    pid_process = [i for i in lpid_process][:n_returned]

    print(pid_process)



if __name__ == '__main__':
    enum_processes()
