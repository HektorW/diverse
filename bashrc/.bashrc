# Colors
RESET="\e[0m"
DEFAULT="\e[39m"
BLACK="\e[30m"
RED="\e[31m"
GREEN="\e[32m"
YELLOW="\e[33m"
BLUE="\e[34m"
MAGENTA="\e[35m"
CYAN="\e[36m"
LIGHT_GRAY="\e[37m"
DARK_GRAY="\e[90m"
LIGHT_RED="\e[91m"
LIGHT_GREEN="\e[92m"
LIGHT_YELLOW="\e[93m"
LIGHT_BLUE="\e[94m"
LIGHT_MAGENTA="\e[95m"
LIGHT_CYAN="\e[96m"
WHITE="\e[97m"


# Variables
workspacce=c:users/hekwal/desktop/workspacce
github=https://github.com/HektorW

# Aliases
alias gs='git status'
alias reload='source ~/.bashrc'
alias sublime='c:program\ files/sublime\ text\ 3/sublime_text.exe'
alias python27='c:python27/python.exe'
alias ll='ls -l'


# ####
# DLBi 
# ####
function vbsWork() {
	args=("$@")
	branch=${1:-$default_branch}
	grunt_options=${args[@]:1}

	echo -e "$MAGENTA~hacker engaged$RESET"
	echo -e "# Starting VBS $branch:\n  $grunt_options"

	cd $workspacce/$branch && npm install && grunt server $grunt_options
}
function valCalWork() {
	cd $workspacce/Value\ Calculator/VTC.Value_Calculator_110102528/tools
	http-server ../ & run_plovr.sh
}
default_branch=4.showroom
alias vbs='vbsWork'
alias valcal='valCalWork'



## Setup 
export PS1="$WHITE[$GREEN\u$DEFAULT@$GREEN\W$RESET]$YELLOW\n\$ $RESET"
