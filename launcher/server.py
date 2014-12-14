
from launcher import Launcher
import http.server
import time

IP = ''
PORT = 7202


launcher = Launcher()


class LauncherRequestHandler(http.server.BaseHTTPRequestHandler):

	def do_GET(self): 
		# print('GET')
		# print('---', self.client_address)
		# print('---', self.path)
		self.send_response(200)
		self.send_header("Content-Type", "text/plain")
		self.end_headers()
		if launcher.start_process('starcraft'):
			self.sendString("Launched starcraft succesfully")
		else:
			self.sendString('Failed to launch starcraft')


	def sendString(self, str):
		self.wfile.write(bytes(str, "UTF-8"))




def run(server=http.server.HTTPServer, handler=http.server.BaseHTTPRequestHandler):
	address = (IP, PORT)
	httpd = server(address, handler)
	print(time.asctime(), "Server starts - %s:%s" % address)
	try:
		httpd.serve_forever()
	except KeyboardInterrupt:
		pass
	httpd.server_close()
	print(time.asctime(), "Server stops - %s:%s" % address)



# not related to anything else, but whatevs
def fuzzySearch(strings, query):
	matches = [string for string in strings if re.search(".*?".join(query), strings)]
	return matches



if __name__ == '__main__':
	run(http.server.HTTPServer, LauncherRequestHandler)