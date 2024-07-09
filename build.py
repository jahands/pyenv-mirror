#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import shutil
from datetime import datetime
from urllib.parse import urlparse


DATABASE = "api/database.json"


def build_database():
    current_path = os.path.realpath(os.path.dirname(__file__))
    pyenv_path = "plugins/python-build/share/python-build"
    version_path = os.path.join(current_path, "pyenv", pyenv_path)
    database = {}
    host_set = set()
    for name in os.listdir(version_path):
        file_path = os.path.join(version_path, name)
        if os.path.isdir(file_path):
            continue
        # print("Read file " + file_path)
        with open(file_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line.startswith("install_package"):
                    continue
                for block in line.split():
                    block = block.strip('"')
                    if not block.startswith("https"):
                        continue
                    url = block
                    host = urlparse(url).netloc
                    host_set.add(host)
                    if host == "ftpmirror.gnu.org":
                        # url = url.replace("https://ftpmirror.gnu.org/", "https://mirrors.ustc.edu.cn/gnu/")
                        continue
                    elif host == "www.python.org":
                        # url = url.replace("https://www.python.org/ftp/python/", "https://registry.npmmirror.com/-/binary/python/")
                        continue
                    elif host == "pypi.python.org":
                        # todo
                        # url = url.replace("https://pypi.python.org/packages/source/", "")
                        # url = "https://pypi.tuna.tsinghua.edu.cn/simple/" + url[url.find("/")+1:]
                        continue
                    elif host == "www.openssl.org":
                        # print(url)
                        continue
                    elif host == "github.com":
                        # print(url)
                        continue
                    elif host == "www.stackless.com":
                        # print(url)
                        continue
                    elif host == "bitbucket.org":
                        # print(url)
                        continue
                    if "#" not in url:
                        continue
                    sha256 = url.rsplit("#", 1)[1]
                    database[sha256] = url
    print(host_set)
    with open(DATABASE, "w") as f:
        f.write(json.dumps(database, indent=2))


def build_file():
    pass


def main():
    repo = "https://github.com/pyenv/pyenv.git"
    cmd = "git clone --depth=1 " + repo
    os.system(cmd)
    build_database()
    build_file()
    shutil.rmtree("pyenv")


if __name__ == "__main__":
    main()
