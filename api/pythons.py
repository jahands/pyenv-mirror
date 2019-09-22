#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import json
from http.server import BaseHTTPRequestHandler
from http.server import HTTPServer

current_path = os.path.realpath(os.path.dirname(__file__))
DB_FILE = os.path.join(current_path, "database.json")

if os.path.exists(DB_FILE):
    print("Load Database %s" % DB_FILE)
    with open(DB_FILE, "r") as f:
        content = f.read()
        database = json.loads(content.strip())
else:
    database = {}

class handler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super(handler, self).__init__(*args, **kwargs)

    def do_HEAD(self):
        if "/" not in self.path:
            self.send_response(404)
            self.end_headers()
            return
        sha256 = self.path.rsplit("/", 1)[1]
        if sha256 not in database:
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(302)
        self.send_header("Location", database[sha256])
        self.end_headers()
        return

    def do_GET(self):
        if "/" not in self.path:
            self.send_response(404)
            self.send_header("info", "No /")
            self.end_headers()
            return
        sha256 = self.path.rsplit("/", 1)[1]
        if sha256 not in database:
            self.send_response(404)
            self.send_header("info", "%s_%d" % (sha256, len(database)))
            self.end_headers()
            return
        self.send_response(302)
        self.send_header("Location", database[sha256])
        self.end_headers()
        return


def main():
    print("Listen: http://127.0.0.1:%s/pythons/" % sys.argv[1])
    HTTPServer(("127.0.0.1", int(sys.argv[1])), handler).serve_forever()

if __name__ == "__main__":
    main()

