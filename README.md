# Pyenv-Mirror: the pyenv's unofficial Python archives mirror

Pyenv is a simple and powerfull python version and environment management tool. Unfortuanlly python source files download speed is very slow in china during the installion of python with pyenv, so I create this mirror to speedup the download. 

## Usage

```
export PYTHON_BUILD_MIRROR_URL="https://pyenv-mirror.vercel.app/api/pythons/"
```

## Detail

### Mirror List

|Origin|Mirror|
|---|---|
|https://www.python.org/ftp/python/|https://registry.npmmirror.com/binary.html?path=python/|
|https://ftpmirror.gnu.org/|https://mirrors.ustc.edu.cn/gnu/|

### Deploy

This site is deployed on [vercel](https://vercel.com/).

### Url Route

Pyenv download url is `${PYTHON_BUILD_MIRROR_URL}/$checksum`, and will redirect to `/api/pythons?/$checksum`. So all the request url can be handled to the python serverless function file `/api/pythons.py`.

### Build Your Own Site

1. Glone this repository to local.
2. Run `python build.py` to build local database to `/local/database.json`.
3. run `now .` to deploy to now.sh platform and define the alias domain.

## TODO

Some urls may still slow:

* pypi.python.org
* www.openssl.org
* www.stackless.com
* bitbucket.org

## Thanks

Thanks to all the mirror and service provider.

## History

Update at 2024-02-03.

Report [Issue](https://github.com/S0urceC0der/pyenv-mirror/issues/new) if new python is not avaliable.

# 中文文档

pyenv 是一个强大的 Python 版本和虚拟环境管理工具，但是在国内使用时会经常遇到下载 Python 源码包速度特别慢的问题。虽然之前有一个镜像地址可以提高速度，但是该镜像的 Python 版本长久未更新缺少很多新版源码，因此使用了一个新的方式来实现镜像加速功能。

## 使用方法

```
export PYTHON_BUILD_MIRROR_URL="https://pyenv-mirror.vercel.app/api/pythons"
```

## 实现流程

### 镜像方案

|原始 URL |镜像 URL|
|---|---|
|https://www.python.org/ftp/python/|https://registry.npmmirror.com/binary.html?path=python/|
|https://ftpmirror.gnu.org/|https://mirrors.ustc.edu.cn/gnu/|

### 部署环境

镜像网站托管在了[vercel](https://vercel.com/)上，利用了该网站提供的免费资源，因为整个过程只存在跳转信息，因此应该能够长久使用。

### 网站路由

Pyenv 的下载地址内容为 `${PYTHON_BUILD_MIRROR_URL}/$checksum`，而 Now.sh 的 Serverless 函数只能一个文件对应一个路由，因此将该网址路由为 `/api/pythons?/$checksum`，使得所有的请求都能由 `/api/pythons.py` 负责处理，这也是为什么 PYTHON_BUILD_MIRROR_URL 内容的最后一个 `?` 是必须的。

### 自建流程

1. 克隆本仓库
2. 运行 `python buid.py` 会自动下载 pyenv 仓库并提取其中的源码网址，生成跳转数据库 `/api/database.json`
3. 运行 `now .` 接部署到 Now.sh 并自定义域名方便访问。

## TODO

仍然有一些可能下载速度慢的域名还需要处理：

* pypi.python.org
* www.openssl.org
* www.stackless.com
* bitbucket.org

## 致谢

感谢提供国内镜像的各大网站

## 更新历史

2024-02-03 更新

如果有文件没有被镜像而下载过慢，请提[Issue](https://github.com/S0urceC0der/pyenv-mirror/issues/new)。
