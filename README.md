# Pyenv-Mirror: the pyenv's unofficial Python archives mirror

pyenv is a powerful Python version and virtual environment management tool. However, when used in mainland China, it often encounters slow download speeds for Python source code packages. Although there was a mirror address that could speed up the download, the Python version on that mirror has not been updated for a long time and lacks many new version source codes, which cannot fully meet users' needs. Therefore, we have adopted a new method in this repository to implement mirror acceleration function.

## Usage

```
export PYTHON_BUILD_MIRROR_URL="https://pyenv-mirror.now.sh/api/pythons?"
```

## Detail

### Mirror List

|Origin|Mirror|
|---|---|
|https://www.python.org/ftp/python/|https://npm.taobao.org/mirrors/python/|
|https://ftpmirror.gnu.org/|https://mirrors.ustc.edu.cn/gnu/|

### Deploy

We have hosted the mirror website on [Now.sh](https://zeit.co/home) and utilized the free resources provided by the website. As the entire process only involves redirect information, it is expected to be stable for the long term.

### Url Route

The download address link of Python in Pyenv is ${PYTHON_BUILD_MIRROR_URL}/$checksum, but Now.sh's serverless function can only map one file to one route. Therefore, we routed the URL as /api/pythons?/$checksum to allow the /api/pythons.py file to handle all requests. This is also why the last ? in the PYTHON_BUILD_MIRROR_URL content is necessary.

### Build Your Own Site

1. Please use Git to clone this repository to your local machine.
2. Running the command python build.py will automatically download the Pyenv repository, extract the source code URLs, and generate the redirection database /api/database.json.
3. Running the command now . will deploy the application to Now.sh and allow custom domain for easy access.


## TODO

Some urls may still slow:

* pypi.python.org
* www.openssl.org
* www.stackless.com
* bitbucket.org

## Thanks

We appreciate the mirror services provided by various websites in China.

## History

Update at 2023-02-20.

Report [Issue](https://github.com/S0urceC0der/pyenv-mirror/issues/new) if new python is not avaliable.

# 中文文档

pyenv 是一个强大的 Python 版本和虚拟环境管理工具，但是在国内使用时会经常遇到下载 Python 源码包速度特别慢的问题。虽然之前有一个镜像地址可以提高速度，但是该镜像的 Python 版本长久未更新缺少很多新版源码，因此使用了一个新的方式来实现镜像加速功能。

## 使用方法

```
export PYTHON_BUILD_MIRROR_URL="https://pyenv-mirror.now.sh/api/pythons?"
```

## 实现流程

### 镜像方案

|原始 URL |镜像 URL|
|---|---|
|https://www.python.org/ftp/python/|https://npm.taobao.org/mirrors/python/|
|https://ftpmirror.gnu.org/|https://mirrors.ustc.edu.cn/gnu/|

### 部署环境

镜像网站托管在了[Now.sh](https://zeit.co/home)上，利用了该网站提供的免费资源，因为整个过程只存在跳转信息，因此应该能够长久使用。

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

感谢提供国内镜像的各大网站。

## 更新历史

2023-02-20 更新

如果有文件没有被镜像而下载过慢，请提[Issue](https://github.com/S0urceC0der/pyenv-mirror/issues/new)。
