# coding:utf-8
# Copyright 2011 litl, LLC. All Rights Reserved.
# the proxy code is from gist

import httplib
import re
import urllib
import urlparse
import os
import traceback

from flask import Flask, request, Response, url_for
from flask.helpers import send_from_directory
from werkzeug.datastructures import Headers
from werkzeug.exceptions import NotFound

app = Flask(__name__)

REALHOST = 'argo.sysu.edu.cn'
REALPORT = 80

STATIC_PATH = os.path.dirname(os.path.abspath(__file__))

def iterform(multidict):
    for key in multidict.keys():
        for value in multidict.getlist(key):
            yield (key.encode("utf8"), value.encode("utf8"))

def parse_host_port(h):
    """Parses strings in the form host[:port]"""
    host_port = h.split(":", 1)
    if len(host_port) == 1:
        return (h, 80)
    else:
        host_port[1] = int(host_port[1])
        return host_port

@app.route('/n/<path:file>', methods=['GET', 'POST'])
def n_static(file=''):
    return send_from_directory(STATIC_PATH, file)    

def proxy_request(file):

    hostname = REALHOST
    port = REALPORT

    # Whitelist a few headers to pass on
    request_headers = {}
    for h in ["Cookie", "Referer", "X-Csrf-Token", "X-Requested-With"]:
        if h in request.headers:
            request_headers[h] = request.headers[h]

    if request.query_string:
        path = "/%s?%s" % (file, request.query_string)
    else:
        path = "/" + file

    if request.method == "POST":
        form_data = list(iterform(request.form))
        form_data = urllib.urlencode(form_data)
        request_headers["Content-Length"] = len(form_data)
        request_headers["Content-Type"] = "application/x-www-form-urlencoded"
    else:
        form_data = None

    conn = httplib.HTTPConnection(hostname, port)
    conn.request(request.method, path, body=form_data, headers=request_headers)
    resp = conn.getresponse()

    # Clean up response headers for forwarding
    response_headers = Headers()
    for key, value in resp.getheaders():
        if key in ["content-length", "connection"]:
            continue

        if key == "set-cookie":
            cookies = value.split(",")
            [response_headers.add(key, c) for c in cookies]
        else:
            response_headers.add(key, value)

    contents = resp.read()

    flask_response = Response(response=contents,
                              status=resp.status,
                              headers=response_headers,
                              content_type=resp.getheader('content-type'))
    return flask_response


@app.route('/ajax/<path:file>', methods=["GET", "POST"])
def proxy_ajax(file) :
    return proxy_request('ajax/'+file)

@app.route('/bbssignal/<path:file>', methods=["POST"])
def handler_bbssignal(file):
    print file
    print request.form
    return ''

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
