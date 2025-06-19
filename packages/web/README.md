<div align="center">

![logo](https://images.gitee.com/uploads/images/2021/0331/214909_4f34bc9b_1230427.png "屏幕截图.png")

# 摸鱼(客户端Typescript版本)

### 一款基于 Vue 和 Electron 的接口文档管理工具

[客户端下载](https://gitee.com/shuzhikai/moyu/releases) | [完整文档](https://www.yuque.com/happymoyu) | [在线体验](https://online.jobtool.cn/)

[    ![](https://img.shields.io/github/v/release/trueleaf/moyu?style=flat-square#align=left&display=inline&height=20&margin=%5Bobject%20Object%5D&originHeight=20&originWidth=94&status=done&style=none&width=94)  ](https://github.com/trueleaf/moyu/releases/latest)[    ![](https://img.shields.io/github/license/trueleaf/moyu#align=left&display=inline&height=20&margin=%5Bobject%20Object%5D&originHeight=20&originWidth=78&status=done&style=none&width=78)  ](https://github.com/trueleaf/moyu/blob/master/LICENSE)[    ![](https://img.shields.io/github/downloads/trueleaf/moyu/total#align=left&display=inline&height=20&margin=%5Bobject%20Object%5D&originHeight=20&originWidth=86&status=done&style=none&width=86)  ](https://github.com/trueleaf/moyu/releases/latest)

</div>

## 预览

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215000_bc4b9025_1230427.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215030_fcc9272e_1230427.png "屏幕截图.png")

![输入图片说明](https://images.gitee.com/uploads/images/2021/0331/215051_83e16797_1230427.png "屏幕截图.png")

## 常用

[产品介绍](https://www.yuque.com/happymoyu/as0gig/fayyy6)

[使用教程](https://www.yuque.com/happymoyu/as0gig/npr3di)

[完整文档](https://www.yuque.com/happymoyu)

[在线体验](https://online.jobtool.cn/)(由于浏览器限制，完整版功能需要下载客户端)

[客户端下载](https://gitee.com/shuzhikai/moyu/releases)

[客户端 GitHub 地址](https://github.com/trueleaf/moyu) | [服务端 GitHub 地址](https://github.com/trueleaf/moyu-server) | [客户端 Gitee 地址](https://gitee.com/shuzhikai/apiflow) | 
[服务端 Gitee 地址](https://gitee.com/shuzhikai/apiflow-server)


## 客户端部署
* Node.js 14.x 或 以上

```
git clone https://github.com/trueleaf/moyu   //国内建议：git clone https://gitee.com/shuzhikai/apiflow
cd moyu
npm install  //安装依赖，推荐使用yarn
npm run electron:build   //打包并且生成相应系统安装包(Mac、Linux、Windows)
```
> 默认情况下你不需要部署服务端就能体验客户端完整功能，我们默认将打包后程序服务端地址指向了体验服务器。如果你希望程序访问自己的服务器，可以访问 [完整部署文档](https://www.yuque.com/happymoyu/as0gig/vapwmq)

## 主要技术栈

-   Vue
-   Electron
-   Egg.js
-   ElementUI
-   MongoDB

## QQ 交流群

977506603 欢迎加入

## 主要功能

**团队协作**

-   [x] 登录，注册，修改个人信息，修改密码
-   [x] 管理员细粒度权限控制，控制到单个前端路由，单个后端接口
-   [x] 接口管理基础权限，管理员、读写权限、只读权限、
-   [x] 批量用户导入，用户禁用，用户权限更改
-   [ ] 自定义权限

**接口调试**

-   [x] 常见 GET、POST、PUT、DELETE、HEAD、OPTIONS 等请求方式
-   [x] 支持 restful 风格接口调试
-   [x] 支持查询字符串，body 传参
-   [x] 支持 form-data、x-www-form-urlencoded、json、xml、text、二进制等
-   [x] 支持自定义请求头
-   [x] 支持变量
-   [x] 支持优雅的 json 展示，支持多种 MIME 类型返回数据展示
-   [ ] 前置钩子(pre-request)
-   [ ] websocket

**左侧导航菜单**

-   [x] 支持任意层级嵌套，无接口数量限制
-   [x] 支持拖拽
-   [ ] 支持批量拖拽
-   [x] 支持鼠标右键。新增、模板新增、重命名、删除等
-   [x] 支持快捷键。eg: F2 修改文件名、Ctrl + 鼠标左键批量选中、Ctrl + 鼠标移入显示详情
-   [x] 支持批量删除
-   [x] 支持接口复制
-   [ ] 支持文件夹复制
-   [x] 支持导航菜单随 Tab 导航同步展开
-   [x] 支持导航菜单排序
-   [x] 支持根据 URL 搜索、文档名称搜索
-   [x] 支持高级筛选，操作人员、文档日期范围、最近 N 条数据、文档标签
-   [x] 支持宽度调整

**左侧导航栏快捷操作**

-   [x] 新建文件
-   [x] 新建文件夹
-   [x] 导出文档
-   [x] 生成在线链接
-   [x] 刷新导航栏数据
-   [x] 预览文档
-   [x] 导入文档
-   [x] 历史记录
-   [x] 项目配置
-   [ ] 回收站
-   [ ] 自定义快捷栏组成

**顶部 tabs 切换**

-   [x] 支持拖拽
-   [x] 支持右键菜单
-   [x] 支持显示修改状态

**接口录入**

-   [x] 支持修改缓存，防止数据未保存丢失
-   [x] 支持按模板新建单个接口，选择模板新增接口
-   [x] 支持按模板批量新增多个接口
-   [x] 支持自定义变量
-   [x] 支持 cookie 自动携带
-   [x] 支持 restful 风格路径参数
-   [x] 支持查询字符串(?id=3&name=lee)
-   [x] 支持丰富的 body 传参类型。form-data、x-www-form-urlencoded、json、xml 等
-   [x] 支持录入规则配置，允许用户根据请求方法限制传参类型(eg: 限制 post 请求只支持 json 类型传参)
-   [x] 支持任意多个返回参数展示(eg: 成功返回，失败返回)
-   [x] 支持自定义请求头
-   [x] 支持富文本备注信息填写
-   [x] 支持参数模板，常见参数保存为模板方便下次引用
-   [x] 支持 json 格式参数导入，导入参数自动带出备注信息
-   [x] 支持智能补全，参数录入后，会自动根据历史记录补全参数类型、备注、值、是否必填等信息
-   [x] 支持接口标签，用户可自定义接口标签方便管理

**录入审计**

-   [x] 从新增项目开始，所有操作(接口增删改查、新增人员、拷贝、移动、导入导出等)全部纳入审计
-   [x] 丰富的历史纪录筛查功能，直观的历史纪录展示功能
-   [x] 完整的操作信息纪录(谁在什么时间操作了什么)
-   [x] 历史纪录保存无数量限制
-   [ ] 删除数据还原
-   [ ] 接口修改回退任意版本
-   [ ] 接口任意版本数据对比

**快捷键**

-   [x] 常见操作快捷键(导出文档、导入文档、生成在线链接)
-   [x] 常见行为快捷键(新增接口、保存接口)
-   [ ] 自定义快捷键

**Mock 数据**

-   [x] 完整 Mockjs 语法
-   [x] 快速 Mock，真实服务端环境下调用，无需任何配置
-   [ ] 自定义枚举 Mock 值

**第三方导入**

-   [x] 支持追加导入和覆盖方式导入
-   [ ] 支持导入到当前项目任意文件夹内
-   [x] 项目自身文档导入
-   [x] postman 格式导入
-   [x] swagger/openapi 格式导入
-   [ ] yapi 格式导入
-   [ ] rap2 格式导入
-   [ ] Eolinker 格式导入
-   [ ] DOClever 格式导入
-   [ ] Curl 格式导入

**文档导出**

-   [x] 支持 HTML 格式导出，支持全量导出，支持任意数量导出 [快乐摸鱼离线文档.html](https://www.yuque.com/attachments/yuque/0/2021/html/612481/1620527275510-bdb8c129-8234-470c-b972-f3ad21d7285c.html?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fhtml%2F612481%2F1620527275510-bdb8c129-8234-470c-b972-f3ad21d7285c.html%22%2C%22name%22%3A%22%E5%BF%AB%E4%B9%90%E6%91%B8%E9%B1%BC%E7%A6%BB%E7%BA%BF%E6%96%87%E6%A1%A3.html%22%2C%22size%22%3A1950544%2C%22type%22%3A%22text%2Fhtml%22%2C%22ext%22%3A%22html%22%2C%22status%22%3A%22done%22%2C%22taskId%22%3A%22u16bd8c8b-2282-4ff6-bae0-0cc0357a72f%22%2C%22taskType%22%3A%22upload%22%2C%22id%22%3A%22ue9cf096c%22%2C%22card%22%3A%22file%22%7D)
-   [x] 支持 JSON 格式导出，支持全量导出，支持任意数量导出 [快乐摸鱼离线数据.json](https://www.yuque.com/attachments/yuque/0/2021/json/612481/1620527310215-971202e2-4892-40c8-a9fa-44d61a6b35c1.json?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2021%2Fjson%2F612481%2F1620527310215-971202e2-4892-40c8-a9fa-44d61a6b35c1.json%22%2C%22name%22%3A%22%E5%BF%AB%E4%B9%90%E6%91%B8%E9%B1%BC%E7%A6%BB%E7%BA%BF%E6%95%B0%E6%8D%AE.json%22%2C%22size%22%3A371868%2C%22type%22%3A%22application%2Fjson%22%2C%22ext%22%3A%22json%22%2C%22status%22%3A%22done%22%2C%22taskId%22%3A%22u3c7ba952-f957-4ea3-9942-21f80291753%22%2C%22taskType%22%3A%22upload%22%2C%22id%22%3A%22ua98dcddb%22%2C%22card%22%3A%22file%22%7D)
-   [x] 项目内自由导出，支持将当前项目(任意多个文档)导出到任意项目任意位置
-   [ ] 支持 PDF 格式导出

## License

MIT
