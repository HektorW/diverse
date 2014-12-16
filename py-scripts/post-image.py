
import base64
import http.client
import urllib.parse
import threading


IP = 'localhost'
PORT = '54465'


content_types = {
  'form': 'application/x-www-form-urlencoded; charset=UTF-8'
}
  

def send_image(ip, port, image_data, index):
  params = {
    '': base64.b64encode(image_data)
  }
  headers = {
    'Content-Type': content_types['form']
  }

  conn = http.client.HTTPConnection(IP, PORT)
  conn.request('POST', '/api/face/detect', urllib.parse.urlencode(params), headers)
  response = conn.getresponse()
  print(response.status, response.reason, index)
  print(response.read())
  conn.close()


def send(img):
  with open(img, 'rb') as image_file:
    image_data = image_file.read()
    for i in range(20):
      t = threading.Thread(target=send_image, args=(PORT, IP, image_data, i))
      t.start()

send('champage.jpg')