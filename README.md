# 背景
常需要从运行命令中，获取参数，现有的工具，不能很好的区分`npm scripts`与命令行间的参数，所以才有了这个项目。

参考如下场景:
```javascript
// package.json
{
  "scripts": {
    "server": "node index.js --server=3005 --open=index.html"
  }
}
```
假设在 `package.json` 中，配置了 `npm run server` 命令，能快速启动服务器，并且打开页面 `index.html`。

在控制台，我们这样调用:
```text
npm run server --staticDirname=xxx
```
其中 `--dirname=xxx` 是决定服务器运行时，静态资源路径来源的。

这时候，我们 `process.argv` 中，获取到的，只有:
```javascript
console.log(process.argv); // => [node.exe, index.js, '--server=3005', '--open=index.html']
```

其中的 `--dirname=xxx` 去哪呢？此项目，解决的，就是这个问题。

# API
本项目，把 `package.json` 中 `scripts` 自带的参数，称为 `inner参数`，命令行中，自己输入的参数，称为 `outer参数`。 

例子:
```javascript
const Parser = require('process-argv-parser');
const parser = new Parser();

// 定义参数值的转换方法，否则，默认都是字符串 或 Boolean 值
// -d xxx => { dirname: 'xxx' }
// --server=1000 => { server: 1000 }
// -o index.html => { open: 'index.html' }
parser
  .option('-d', 'dirname', Parser.String)
  .option('--server', parserInt)
  .option('-o', 'open');

const data = parser.parse(/* void 0  或 数组: ['--server=3005', '--open', 'index.html']*/);

// 如果是 npm run xxx --param1=xx 则会在 outer 中体现
// 否则，都在 inner 中，获取参数
console.log(data); // argv => { inner: {}, outer: {} }
```