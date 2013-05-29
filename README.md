jsbbs v0.1
==========

jsbbs是一个支持[jsbbs api](https://github.com/argolab/jsbbs/wiki/jsbbs-api-v0.1) 的纯javascript实现。它被设计为可扩展的，通用的，易于修改的bbs应用。可扩展意味着核心的部分不需要改变，而通过插件和模块化机制就可以完成特殊的功能。通用的意味着可以方便为各种行业，各种场合使用。易于修改的意味着他易于维护，保持简单的直观。目前，他被用来做[逸仙时空](http://argo.sysu.edu.cn)的新版引擎。

在jsbbs0.1中，界面严重依赖具体的环境，但在2.0中将会逐步移除逸仙时空相关的界面。而相应的功能通过自定义功能和扩展模块来完成，并考虑加入国际化和模块管理和主题支持。

Feature
--------

  * 使用jsbbs api，只要支持该api都可以直接部署上线
  * 彻底的前后端分离，后台只提供json api
  * 纯静态文件，localStorage实现的template缓存
  * 基于frame的页面组织，灵活而轻量级地组织复杂的页面
  * 支持主题和国际化(todo)
  * 模块管理(todo)
  * 路由(todo)

安装与运行
----------

### 测试和开发环境

`server.py` 里面包括一个flask实现的代理服务器和静态文件服务器，
可以作为开发用环境。对api的请求将会通过对 `http://argo.sysu.edu.cn`
的实际调用来完成。

```bash
git clone https://github.com/argolab/jsbbs.git
cd jsbbs
sudo pip install flask # 安装python的flask
python server.py
```

访问 `localhost:5000/n/index.html` 即可。
ps：全部的操作都会真正应用到 `http://argo.sysu.edu.cn` 中。

### 搭建完整环境

#### 1. 搭建后台服务器，提供api接口

jsbbs使用 jsbbs api v0.1 作为api接口，如果需要在本地部署，
需要先部署相关api实现。我们后台使用phpbbs来完成，而且是开源的。
如果有需要，欢迎跟我们索取。

#### 2. 配置路由

api接口应该部署到 `http://hostname/ajax/` 下面，
而jsbbs的静态文件应该部署到 `http://hostname/n/` 下面。

#### 3. 运行

访问 `http://hostname/n/index.html` 。

框架与编码
----------

### 为什么自造框架，而且为什么不使用 MVC ?

对于jsbbs而言，没有前端和后台可言。jsbbs的目标是实现 `彻底的前端和后端分离` ，
或者说 `数据与展示分离` 。在实际的场景中，jsbbs和后台通过json来传输数据，
后台除了相应相应的业务，没有任何的html操作。全部的展示，
都将在浏览器完成。换而言之，jsbbs实际上作为一个web app在进行。
jsbbs的逻辑将会非常复杂，而且将会有大量的javascript实现。
所以，框架的目标之一既是对程序进行良好的组织，使其易于维护。

而不使用MVC，则是希望保持jsbbs如网页般的 `直观` 和 `简单` 。在jsbbs的逻辑中，
更多的是琐碎的一个个的页面，而复杂的交互并不是瓶颈所在。成品中，
jsbbs应该是易于修改的，易于修改的。

### 框架：`$MOD` , `$G` 和 `frame`

$MOD是一个有相似的功能的函数的集合。比起一些语言中的模块，它更为轻量级。
比起对象和类，它更为灵活。事实上，他的功能类似于命名空间，但并不是为了消除同名而使用。
全部的代码都组织在 $MOD 中。

全部的全局变量组织在 $G 变量中。而且需要先声明才能使用。

一个frame描述当前的运行环境。frame包括自己配置，处理函数，初始化方法，等等。

```
index.html -> jsbbs.js -> 路由当前相应的frame -> 处理页面
    -> 发生事件 -> 调用frame内的处理函数 -> 等待下一个事件 -> ...
    -> 切换frame -> 路由到相应的frame -> 继续处理页面 -> ...
```

全部的远程的数据全部都通过 $api 这个 $MOD 来完成。一般来说，在 $api 获得json数据后，
使用 template 渲染然后插入到dom中。

框架的代码包括在 `thinist.js` 和 `frame.js` 中。
包装template的代码也包括在`frame.js`中，api的实现则在 `lib/argo_api.js` 中。

### 启动代码和frame的实现

开始的时候，会先判断当前用户是否登录，然后设置 $G.authed 和 $G.authed.u
然后，刷新userbox 。然后，根据路由刷新frame。

启动的代码包括 `jsbbs.js`, `userbox.js` 。

具体的frame的实现在 `handler.js` 中。为了方便，全部的url通过 `url.js` 来生成。

还有一些需要用到，分布在 `lib/` 下面。

### css和html

template文件默认放置在 `template/` 下面，目前使用了 `bootstrap` 作为前端框架。
此外，还引用了一个 `argo.css` 作为全局的css文件。

示例：添加一个Hello,World 页面
------------------------------

### 1. 添加html文件

```html
<div class="cell main-cell cell-loose">
     <h1>Hello, World!</h1>
     {{if $G.authed }}
     <p>Welcome, dear ${ userid }</p>
</div>
```

保存到 `template/hello.html` 中。

### 2. 添加到handler中

在 `lib/handler.js` 中增加这些js代码：

```javascript
    declare_frame({
        mark: 'hello',
        enter: function(kwargs){
            var userid = kwargs.userid;
            if(!userid) userid = $G.authed.u.userid;
            render_template('hello', {userid: userid});
        }
    });
```

### 3. 访问

访问 `http://localhost:5000/n/index.html#!hello` 即可访问到。
可以通过  `http://localhost:5000/n/index.html#!hello?userid=youid` 来显示 `youid` 哟。

如何贡献？
----------

  * 关注github的issues，帮忙修复bug或者开发todo，提交pull request
  * 参与到jsbbs2.0的讨论，帮助从jsbbs0.1到jsbbs2.0的实现和设计
  * 提出新的feature或增加功能，提交pull request
  * 重构那些你觉得丑陋无比的代码

尤其关注jsbbs2.0的讨论，实现和设计的讨论，并参与其中。

欢迎联系。
