jsbbs
=====

yet anthor argo implementation, by ENTIRE JAVASCRIPT (from handler, template to ajax) .

结构
----

```
      jsbbs
-----------------
phpbbs(as server)
-----------------
      c实现
```


  1. phpbbs提供api接口。
  2. jsbbs通过ajax完成template，和实际数据的加载显示。
  3. 除了api提供必要的数据接口，全部使用js实现（没有中间的后台层）。

讨论
----

  1. 性能问题。
  2. 维护。
  3. 实现程度

代码结构
--------

```
  + css
  + images <-> img
  + template
    + widget
    ...
  + js
    + lib
      / argo_api.js (*)
      / handler.js  (*)
      ...
    / thinist.js  (*)
    / jsbbs.js    (*)
  / index.html
```

  1. thinish.js 是整个逻辑的框架，进行简单而必要的限定。
  2. argo_api.js 对phpbbs的api进行了callback形式的封装。
  3. jsbbs.js 是整个系统的必要模块和启动模块。
  4. index.html 描述画面的基本结构。

原型&&截图(未完成)
------------------

![版块](https://raw.github.com/argolab/jsbbs/master/screenshot/board\(unfinish\).png)

![首页](https://raw.github.com/argolab/jsbbs/master/screenshot/home\(unfinish\).png)

![用户](https://raw.github.com/argolab/jsbbs/master/screenshot/user\(unfinish\).png)

