'use strict';

class Parser {
  constructor(opts) {
    this.opts = Object.assign({
      // 默认分隔符
      delimiter: '-',
      // 参数没有设置值时，默认为 true，eg: --istest => {istest: true}
      defaultValue: true,
    }, opts || {});

    // 供 option() 使用
    this.optionMap = {};
  }

  /**
   * 把命令转化为可读的内容，如 option('-p', 'port', Parser.Integer) => { port: 3000 }
   * @param {String} cmd 需要转化的命令
   * @param {String|Function} [keyName] 转为对象时的 key 值，如不是String类型，则作为 fnParse 使用
   * @param {Function} fnParse 命令值转换函数，默认是 Parser.String
   */
  option(cmd, keyName, fnParse) {
    const map = this.optionMap;
    const delimiter = this.opts.delimiter;

    if (typeof cmd !== 'string') {
      throw new Error(`option(cmd, key, fn) 第一个参数，必须是字符串`);
    }

    if (!keyName || typeof keyName === 'function') {
      fnParse = keyName;
      // '--port' => 'port'
      keyName = cmd.replace(new RegExp(`^${delimiter}+`), '');
    }

    map[cmd] = {
      key: keyName,
      parse: fnParse || function(v) { return v; }
    };

    return this;
  }

  /**
   * 根据 optionMap 格式化输出内容
   * @param {Object} output 输出内容
   * @return {Object} 格式化后的结果
   */
  _formatByOptions(output) {
    const map = this.optionMap;
    const delimiter = this.opts.delimiter;

    const result = {};
    Object.keys(output).forEach(key => {
      const val = output[key];

      if (map[key]) {
        // conf = { key:String, parse: Function }
        const conf = map[key];
        result[conf.key] = conf.parse(val);
      } else {
        // '--port' => 'port'
        let newKey = key.replace(new RegExp(`^${delimiter}+`), '');
        result[newKey] = val;
      }
    });

    return result;
  }

  /**
   * 把字符串参数，转为对象
   * @param {Array} [args] 命令行参数字符串数组
   * @return {{ inner: {}, outer: {} }}
   */
  parse(args) {
    const result = {};

    if (Array.isArray(args)) {
      // @error args = ['-port', '80', '--title="this is a title"'];
      result.inner = this.argsToObj(args);
    } else {
      result.inner = this.argsToObj(process.argv.slice(2));
      try {
        // npm run test --dirname=xxx
        // list = ['run', 'taskName', param1, param2];
        let list = JSON.parse(process.env.npm_config_argv).original;
        result.outer = this.argsToObj(list.slice(2));
      }	catch (e) {
        // nothing...
      }
    }

    // 格式化输出内容
    result.inner = this._formatByOptions(result.inner);
    result.outer = this._formatByOptions(result.outer || {});

    return result;
  }

  /**
   * 把参数列表，转为对象
   * @param {Array} args 参数列表
   */
  argsToObj(args) {
    const delimiter = this.opts.delimiter;
    const defaultValue = this.opts.defaultValue;
    const valueDivivsion = '=';
    const result = {};

    let list = args.slice(0);
    let cur, next;

    // 删除引号
    // val = `"xxx"` -> val = `xxx`
    const removeQuots = (val) => {
      val = val + '';
      if (/^(['"]).*\1$/.test(val)) {
        val = val.replace(/^(['"])(.*)\1$/, '$2').trim();
      }
      return val;
    };

    do {
      cur = (list.shift() + '').trim();
      next = (list[0] || '').trim();

      // 1. cur = --xx=yyy
      // 2. cur = --xx  AND next = --yy
      // 3. cur = --xx  AND next = yy
      // 4. cur = --xx  AND next = null

      if (cur.indexOf(delimiter) == 0 && cur.indexOf(valueDivivsion) > 0) {
        // 1
        let arr = cur.split(valueDivivsion);
        let val = arr[1].trim();
        result[arr[0].trim()] = removeQuots(val);
      } else if (cur.indexOf(delimiter) == 0 && next && next.indexOf(delimiter) == 0) {
        // 2
        result[cur] = defaultValue;
      } else if (cur.indexOf(delimiter) == 0 && next && next.indexOf(delimiter) != 0) {
        // 3
        result[cur] = removeQuots(next);
        list.shift();
      } else if (cur.indexOf(delimiter) == 0 && !next) {
        // 4
        result[cur] = defaultValue;
      }
      
      if (list.length <= 0) {
        break;
      }
    } while(true);

    return result;
  }
}

// 设置类型
require('./lib/set-type')(Parser);

module.exports = Parser;

// const p = new Parser();

// console.log(
//   p.parse([
//     '--test=123', 
//     '-p', '3002', 
//     '--dotest', 
//     '--title', 'waitingForTest',
//     '--desc="遇见就不要放开啦"',
//     '--text', '"结果肯定是黄了"'
//   ])
// );

// console.log(p.parse());