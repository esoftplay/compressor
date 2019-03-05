const beautify_js = require("./beautify_js");

function style_html(h, j, k, l) {
  var m, multi_parser;
  function m() {
    this.pos = 0;
    this.token = '';
    this.current_mode = 'CONTENT';
    this.tags = {
      parent: 'parent1',
      parentcount: 1,
      parent1: ''
    };
    this.tag_type = '';
    this.token_text = this.last_token = this.last_text = this.token_type = '';
    this.Utils = {
      whitespace: "\n\r\t ".split(''),
      single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','),
      extra_liners: 'head,body,/html'.split(','),
      in_array: function (a, b) {
        for (var i = 0; i < b.length; i++) {
          if (a === b[i]) {
            return true
          }
        }
        return false
      }
    };
    this.get_content = function () {
      var a = '';
      var b = [];
      var c = false;
      while (this.input.charAt(this.pos) !== '<') {
        if (this.pos >= this.input.length) {
          return b.length ? b.join('') : ['', 'TK_EOF']
        }
        a = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;
        if (this.Utils.in_array(a, this.Utils.whitespace)) {
          if (b.length) {
            c = true
          }
          this.line_char_count--;
          continue
        } else if (c) {
          if (this.line_char_count >= this.max_char) {
            b.push('\n');
            for (var i = 0; i < this.indent_level; i++) {
              b.push(this.indent_string)
            }
            this.line_char_count = 0
          } else {
            b.push(' ');
            this.line_char_count++
          }
          c = false
        }
        b.push(a)
      }
      return b.length ? b.join('') : ''
    };
    this.get_script = function () {
      var a = '';
      var b = [];
      var c = new RegExp('\<\/script' + '\>', 'igm');
      c.lastIndex = this.pos;
      var d = c.exec(this.input);
      var e = d ? d.index : this.input.length;
      while (this.pos < e) {
        if (this.pos >= this.input.length) {
          return b.length ? b.join('') : ['', 'TK_EOF']
        }
        a = this.input.charAt(this.pos);
        this.pos++;
        b.push(a)
      }
      return b.length ? b.join('') : ''
    };
    this.record_tag = function (a) {
      if (this.tags[a + 'count']) {
        this.tags[a + 'count']++;
        this.tags[a + this.tags
          [a + 'count']] = this.indent_level
      } else {
        this.tags[a + 'count'] = 1;
        this.tags[a + this.tags
          [a + 'count']] = this.indent_level
      }
      this.tags[a + this.tags
        [a + 'count'] + 'parent'] = this.tags.parent;
      this.tags.parent = a + this.tags[a + 'count']
    };
    this.retrieve_tag = function (a) {
      if (this.tags[a + 'count']) {
        var b = this.tags.parent;
        while (b) {
          if (a + this.tags[a + 'count'] === b) {
            break
          }
          b = this.tags[b + 'parent']
        }
        if (b) {
          this.indent_level = this.tags[a + this.tags
            [a + 'count']];
          this.tags.parent = this.tags[b + 'parent']
        }
        delete this.tags[a + this.tags
          [a + 'count'] + 'parent'];
        delete this.tags[a + this.tags
          [a + 'count']];
        if (this.tags[a + 'count'] == 1) {
          delete this.tags[a + 'count']
        } else {
          this.tags[a + 'count']--
        }
      }
    };
    this.get_tag = function () {
      var a = '';
      var b = [];
      var c = false;
      do {
        if (this.pos >= this.input.length) {
          return b.length ? b.join('') : ['', 'TK_EOF']
        }
        a = this.input.charAt(this.pos);
        this.pos++;
        this.line_char_count++;
        if (this.Utils.in_array(a, this.Utils.whitespace)) {
          c = true;
          this.line_char_count--;
          continue
        }
        if (a === "'" || a === '"') {
          if (!b[1] || b[1] !== '!') {
            a += this.get_unformatted(a);
            c = true
          }
        }
        if (a === '=') {
          c = false
        }
        if (b.length && b[b.length - 1] !== '=' && a !== '>' && c) {
          if (this.line_char_count >= this.max_char) {
            this.print_newline(false, b);
            this.line_char_count = 0
          } else {
            b.push(' ');
            this.line_char_count++
          }
          c = false
        }
        b.push(a)
      } while (a !== '>');
      var d = b.join('');
      var e;
      if (d.indexOf(' ') != -1) {
        e = d.indexOf(' ')
      } else {
        e = d.indexOf('>')
      }
      var f = d.substring(1, e).toLowerCase();
      if (d.charAt(d.length - 2) === '/' || this.Utils.in_array(f, this.Utils.single_token)) {
        this.tag_type = 'SINGLE'
      } else if (f === 'script') {
        this.record_tag(f);
        this.tag_type = 'SCRIPT'
      } else if (f === 'style') {
        this.record_tag(f);
        this.tag_type = 'STYLE'
      } else if (f.charAt(0) === '!') {
        if (f.indexOf('[if') != -1) {
          if (d.indexOf('!IE') != -1) {
            var g = this.get_unformatted('-->', d);
            b.push(g)
          }
          this.tag_type = 'START'
        } else if (f.indexOf('[endif') != -1) {
          this.tag_type = 'END';
          this.unindent()
        } else if (f.indexOf('[cdata[') != -1) {
          var g = this.get_unformatted(']]>', d);
          b.push(g);
          this.tag_type = 'SINGLE'
        } else {
          var g = this.get_unformatted('-->', d);
          b.push(g);
          this.tag_type = 'SINGLE'
        }
      } else { if (f.charAt(0) === '/') {
          this.retrieve_tag(f.substring(1));
          this.tag_type = 'END'
        } else {
          this.record_tag(f);
          this.tag_type = 'START'
        }
        if (this.Utils.in_array(f, this.Utils.extra_liners)) {
          this.print_newline(true, this.output)
        }
      }
      return b.join('')
    };
    this.get_unformatted = function (a, b) {
      if (b && b.indexOf(a) != -1) {
        return ''
      }
      var c = '';
      var d = '';
      var e = true;
      do {
        c = this.input.charAt(this.pos);
        this.pos++;
        if (this.Utils.in_array(c, this.Utils.whitespace)) {
          if (!e) {
            this.line_char_count--;
            continue
          }
          if (c === '\n' || c === '\r') {
            d += '\n';
            for (var i = 0; i < this.indent_level; i++) {
              d += this.indent_string
            }
            e = false;
            this.line_char_count = 0;
            continue
          }
        }
        d += c;
        this.line_char_count++;
        e = true
      } while (d.indexOf(a) == -1);
      return d
    };
    this.get_token = function () {
      var a;
      if (this.last_token === 'TK_TAG_SCRIPT') {
        var b = this.get_script();
        if (typeof b !== 'string') {
          return b
        }
        a = beautify_js(b).replace(/\n/gm, "\n"+"\t".repeat(this.indent_level));
        return [a, 'TK_CONTENT']
      }
      if (this.current_mode === 'CONTENT') {
        a = this.get_content();
        if (typeof a !== 'string') {
          return a
        } else {
          return [a, 'TK_CONTENT']
        }
      }
      if (this.current_mode === 'TAG') {
        a = this.get_tag();
        if (typeof a !== 'string') {
          return a
        } else {
          var c = 'TK_TAG_' + this.tag_type;
          return [a, c]
        }
      }
    };
    this.printer = function (c, d, e, f) {
      this.input = c || '';
      this.output = [];
      this.indent_character = d || ' ';
      this.indent_string = '';
      this.indent_size = e || 2;
      this.indent_level = 0;
      this.max_char = f || 70;
      this.line_char_count = 0;
      for (var i = 0; i < this.indent_size; i++) {
        this.indent_string += this.indent_character
      }
      this.print_newline = function (a, b) {
        this.line_char_count = 0;
        if (!b || !b.length) {
          return
        }
        if (!a) {
          while (this.Utils.in_array(b[b.length - 1], this.Utils.whitespace)) {
            b.pop()
          }
        }
        b.push('\n');
        for (var i = 0; i < this.indent_level; i++) {
          b.push(this.indent_string)
        }
      };
      this.print_token = function (a) {
        this.output.push(a)
      };
      this.indent = function () {
        this.indent_level++
      };
      this.unindent = function () {
        if (this.indent_level > 0) {
          this.indent_level--
        }
      }
    };
    return this
  };
  multi_parser = new m();
  multi_parser.printer(h, k, j);
  var tmp_new_line = true;
  while (true) {
    var t = multi_parser.get_token();
    multi_parser.token_text = t[0];
    multi_parser.token_type = t[1];
    if (multi_parser.token_type === 'TK_EOF') {
      break
    }
    switch (multi_parser.token_type) {
    case 'TK_TAG_START':
    case 'TK_TAG_SCRIPT':
    case 'TK_TAG_STYLE':
      multi_parser.print_newline(false, multi_parser.output);
      multi_parser.print_token(multi_parser.token_text.replace(/[\r\n\s]+/g, " "));
      multi_parser.indent();
      multi_parser.current_mode = 'CONTENT';
      break;
    case 'TK_TAG_END':
      if (tmp_new_line) {
        if (/<\/script/i.test(multi_parser.token_text) && !multi_parser.last_text) {
          tmp_new_line = true;
        }else{
          multi_parser.print_newline(true, multi_parser.output);
        }
      }else{
        tmp_new_line = true;
      }
      multi_parser.print_token(multi_parser.token_text);
      multi_parser.current_mode = 'CONTENT';
      break;
    case 'TK_TAG_SINGLE':
      multi_parser.print_newline(false, multi_parser.output);
      multi_parser.print_token(multi_parser.token_text.replace(/[\r\n\s]+/g, " "));
      multi_parser.current_mode = 'CONTENT';
      break;
    case 'TK_CONTENT':
      if (multi_parser.token_text !== '') {
        if (multi_parser.token_text.length > 80 || /[<>]/.test(multi_parser.token_text)) {
          multi_parser.print_newline(false, multi_parser.output);
        }else{
          if (!/<\//.test(multi_parser.last_text)) {
            tmp_new_line = false;
          }
        }
        multi_parser.print_token(multi_parser.token_text)
      }
      multi_parser.current_mode = 'TAG';
      break
    }
    multi_parser.last_token = multi_parser.token_type;
    multi_parser.last_text = multi_parser.token_text
  }
  return multi_parser.output.join('');
};
module.exports = (input, type=0, filename="") => {
  out = style_html(input, tabsize=2, space=" ", 80);
  return out;
};
