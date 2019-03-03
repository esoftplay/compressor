
function starts_with(a, b) {
  return a.substr(0, b.length) === b
};
function trim_leading_comments(a) {
  a = a.replace(/^(\s*\/\/[^\n]*\n)+/, '');
  a = a.replace(/^\s+/, '');
  return a
};
function unpacker_filter(a) {
  stripped_source = trim_leading_comments(a);
  if (starts_with(stripped_source.toLowerCase().replace(/ +/g, ''), 'eval(function(p,a,c,k')) {
    try {
      eval('var unpacked_source = ' + stripped_source.substring(4) + ';');
      return unpacker_filter(unpacked_source)
    } catch(error) {
      a = '// uncompress: unpacking failed\n' + a
    }
  }
  return a
};
function js_beautify(l, m) {
  var n, output, token_text, last_type, last_text, last_word, current_mode, modes, indent_string;
  var o, wordchar, punct, parser_pos, line_starters, in_case, digits;
  var p, token_type, do_block_just_closed, var_line, var_line_tainted, if_line_flag;
  var q;
  m = m || {};
  var r = m.indent_size || 4;
  var s = m.indent_char || ' ';
  var u = typeof m.preserve_newlines === 'undefined' ? true : m.preserve_newlines;
  var v = m.indent_level || 0;
  var w = m.space_after_anon_function === 'undefined' ? false : m.space_after_anon_function;
  function trim_output() {
    while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string)) {
      output.pop()
    }
  };
  function print_newline(a) {
    a = typeof a === 'undefined' ? true : a;
    if_line_flag = false;
    trim_output();
    if (!output.length) {
      return
    }
    if (output[output.length - 1] !== "\n" || !a) {
      output.push("\n")
    }
    for (var i = 0; i < q; i += 1) {
      output.push(indent_string)
    }
  };
  function print_space() {
    var a = ' ';
    if (output.length) {
      a = output[output.length - 1]
    }
    if (a !== ' ' && a !== '\n' && a !== indent_string) {
      output.push(' ')
    }
  };
  function print_token() {
    output.push(token_text)
  };
  function indent() {
    q += 1
  };
  function unindent() {
    if (q) {
      q -= 1
    }
  };
  function remove_indent() {
    if (output.length && output[output.length - 1] === indent_string) {
      output.pop()
    }
  };
  function set_mode(a) {
    modes.push(current_mode);
    current_mode = a
  };
  function restore_mode() {
    do_block_just_closed = current_mode === 'DO_BLOCK';
    current_mode = modes.pop()
  };
  function in_array(a, b) {
    for (var i = 0; i < b.length; i += 1) {
      if (b[i] === a) {
        return true
      }
    }
    return false
  };
  function is_ternary_op() {
    var a = 0,
    colon_count = 0;
    for (var i = output.length - 1; i >= 0; i--) {
      switch (output[i]) {
      case ':':
        if (a === 0) {
          colon_count++
        }
        break;
      case '?':
        if (a === 0) {
          if (colon_count === 0) {
            return true
          } else {
            colon_count--
          }
        }
        break;
      case '{':
        if (a === 0) {
          return false
        }
        a--;
        break;
      case '(':
      case '[':
        a--;
        break;
      case ')':
      case ']':
      case '}':
        a++;
        break
      }
    }
  };
  function get_next_token() {
    var a = 0;
    if (parser_pos >= n.length) {
      return ['', 'TK_EOF']
    }
    var c = n.charAt(parser_pos);
    parser_pos += 1;
    while (in_array(c, o)) {
      if (parser_pos >= n.length) {
        return ['', 'TK_EOF']
      }
      if (c === "\n") {
        a += 1
      }
      c = n.charAt(parser_pos);
      parser_pos += 1
    }
    var b = false;
    if (u) {
      if (a > 1) {
        for (var i = 0; i < 2; i += 1) {
          print_newline(i === 0)
        }
      }
      b = (a === 1)
    }
    if (in_array(c, wordchar)) {
      if (parser_pos < n.length) {
        while (in_array(n.charAt(parser_pos), wordchar)) {
          c += n.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos === n.length) {
            break
          }
        }
      }
      if (parser_pos !== n.length && c.match(/^[0-9]+[Ee]$/) && (n.charAt(parser_pos) === '-' || n.charAt(parser_pos) === '+')) {
        var d = n.charAt(parser_pos);
        parser_pos += 1;
        var t = get_next_token(parser_pos);
        c += d + t[0];
        return [c, 'TK_WORD']
      }
      if (c === 'in') {
        return [c, 'TK_OPERATOR']
      }
      if (b && last_type !== 'TK_OPERATOR' && !if_line_flag) {
        print_newline()
      }
      return [c, 'TK_WORD']
    }
    if (c === '(' || c === '[') {
      return [c, 'TK_START_EXPR']
    }
    if (c === ')' || c === ']') {
      return [c, 'TK_END_EXPR']
    }
    if (c === '{') {
      return [c, 'TK_START_BLOCK']
    }
    if (c === '}') {
      return [c, 'TK_END_BLOCK']
    }
    if (c === ';') {
      return [c, 'TK_SEMICOLON']
    }
    if (c === '/') {
      var e = '';
      if (n.charAt(parser_pos) === '*') {
        parser_pos += 1;
        if (parser_pos < n.length) {
          while (! (n.charAt(parser_pos) === '*' && n.charAt(parser_pos + 1) && n.charAt(parser_pos + 1) === '/') && parser_pos < n.length) {
            e += n.charAt(parser_pos);
            parser_pos += 1;
            if (parser_pos >= n.length) {
              break
            }
          }
        }
        parser_pos += 2;
        return ['/*' + e + '*/', 'TK_BLOCK_COMMENT']
      }
      if (n.charAt(parser_pos) === '/') {
        e = c;
        while (n.charAt(parser_pos) !== "\x0d" && n.charAt(parser_pos) !== "\x0a") {
          e += n.charAt(parser_pos);
          parser_pos += 1;
          if (parser_pos >= n.length) {
            break
          }
        }
        parser_pos += 1;
        if (b) {
          print_newline()
        }
        return [e, 'TK_COMMENT']
      }
    }
    if (c === "'" || c === '"' || (c === '/' && ((last_type === 'TK_WORD' && last_text === 'return') || (last_type === 'TK_START_EXPR' || last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EOF' || last_type === 'TK_SEMICOLON')))) {
      var f = c;
      var g = false;
      var h = c;
      if (parser_pos < n.length) {
        if (f === '/') {
          var j = false;
          while (g || j || n.charAt(parser_pos) !== f) {
            h += n.charAt(parser_pos);
            if (!g) {
              g = n.charAt(parser_pos) === '\\';
              if (n.charAt(parser_pos) === '[') {
                j = true
              } else if (n.charAt(parser_pos) === ']') {
                j = false
              }
            } else {
              g = false
            }
            parser_pos += 1;
            if (parser_pos >= n.length) {
              return [h, 'TK_STRING']
            }
          }
        } else {
          while (g || n.charAt(parser_pos) !== f) {
            h += n.charAt(parser_pos);
            if (!g) {
              g = n.charAt(parser_pos) === '\\'
            } else {
              g = false
            }
            parser_pos += 1;
            if (parser_pos >= n.length) {
              return [h, 'TK_STRING']
            }
          }
        }
      }
      parser_pos += 1;
      h += f;
      if (f === '/') {
        while (parser_pos < n.length && in_array(n.charAt(parser_pos), wordchar)) {
          h += n.charAt(parser_pos);
          parser_pos += 1
        }
      }
      return [h, 'TK_STRING']
    }
    if (c === '#') {
      var k = '#';
      if (parser_pos < n.length && in_array(n.charAt(parser_pos), digits)) {
        do {
          c = n.charAt(parser_pos);
          k += c;
          parser_pos += 1
        } while (parser_pos < n.length && c !== '#' && c !== '=');
        if (c === '#') {
          return [k, 'TK_WORD']
        } else {
          return [k, 'TK_OPERATOR']
        }
      }
    }
    if (c === '<' && n.substring(parser_pos - 1, parser_pos + 3) === '<!--') {
      parser_pos += 3;
      return ['<!--', 'TK_COMMENT']
    }
    if (c === '-' && n.substring(parser_pos - 1, parser_pos + 2) === '-->') {
      parser_pos += 2;
      if (b) {
        print_newline()
      }
      return ['-->', 'TK_COMMENT']
    }
    if (in_array(c, punct)) {
      while (parser_pos < n.length && in_array(c + n.charAt(parser_pos), punct)) {
        c += n.charAt(parser_pos);
        parser_pos += 1;
        if (parser_pos >= n.length) {
          break
        }
      }
      return [c, 'TK_OPERATOR']
    }
    return [c, 'TK_UNKNOWN']
  };
  indent_string = '';
  while (r > 0) {
    indent_string += s;
    r -= 1
  }
  q = v;
  n = l;
  last_word = '';
  last_type = 'TK_START_EXPR';
  last_text = '';
  output = [];
  do_block_just_closed = false;
  var_line = false;
  var_line_tainted = false;
  o = "\n\r\t ".split('');
  wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
  digits = '0123456789'.split('');
  punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |= ::'.split(' ');
  line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');
  current_mode = 'BLOCK';
  modes = [current_mode];
  parser_pos = 0;
  in_case = false;
  while (true) {
    var t = get_next_token(parser_pos);
    token_text = t[0];
    token_type = t[1];
    if (token_type === 'TK_EOF') {
      break
    }
    switch (token_type) {
    case 'TK_START_EXPR':
      var_line = false;
      if (token_text === '[') {
        if (current_mode === '[EXPRESSION]') {
          print_newline();
          output.push(indent_string)
        }
      }
      if (token_text === '[') {
        set_mode('[EXPRESSION]')
      } else {
        set_mode('(EXPRESSION)')
      }
      if (last_text === ';' || last_type === 'TK_START_BLOCK') {
        print_newline()
      } else if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR') {} else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
        print_space()
      } else if (last_word === 'function') {
        if (w) {
          print_space()
        }
      } else if (in_array(last_word, line_starters)) {
        print_space()
      }
      print_token();
      break;
    case 'TK_END_EXPR':
      restore_mode();
      print_token();
      break;
    case 'TK_START_BLOCK':
      if (last_word === 'do') {
        set_mode('DO_BLOCK')
      } else {
        set_mode('BLOCK')
      }
      if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
        if (last_type === 'TK_START_BLOCK') {
          print_newline()
        } else {
          print_space()
        }
      }
      print_token();
      indent();
      break;
    case 'TK_END_BLOCK':
      if (last_type === 'TK_START_BLOCK') {
        trim_output();
        unindent()
      } else {
        unindent();
        print_newline()
      }
      print_token();
      restore_mode();
      break;
    case 'TK_WORD':
      if (do_block_just_closed) {
        print_space();
        print_token();
        print_space();
        do_block_just_closed = false;
        break
      }
      if (token_text === 'case' || token_text === 'default') {
        if (last_text === ':') {
          remove_indent()
        } else {
          unindent();
          print_newline();
          indent()
        }
        print_token();
        in_case = true;
        break
      }
      p = 'NONE';
      if (last_type === 'TK_END_BLOCK') {
        if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
          p = 'NEWLINE'
        } else {
          p = 'SPACE';
          print_space()
        }
      } else if (last_type === 'TK_SEMICOLON' && (current_mode === 'BLOCK' || current_mode === 'DO_BLOCK')) {
        p = 'NEWLINE'
      } else if (last_type === 'TK_SEMICOLON' && (current_mode === '[EXPRESSION]' || current_mode === '(EXPRESSION)')) {
        p = 'SPACE'
      } else if (last_type === 'TK_STRING') {
        p = 'NEWLINE'
      } else if (last_type === 'TK_WORD') {
        p = 'SPACE'
      } else if (last_type === 'TK_START_BLOCK') {
        p = 'NEWLINE'
      } else if (last_type === 'TK_END_EXPR') {
        print_space();
        p = 'NEWLINE'
      }
      if (last_type !== 'TK_END_BLOCK' && in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
        print_newline()
      } else if (in_array(token_text, line_starters) || p === 'NEWLINE') {
        if (last_text === 'else') {
          print_space()
        } else if ((last_type === 'TK_START_EXPR' || last_text === '=' || last_text === ',') && token_text === 'function') {} else if (last_text === 'return' || last_text === 'throw') {
          print_space()
        } else if (last_type !== 'TK_END_EXPR') {
          if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
            if (token_text === 'if' && last_word === 'else') {
              print_space()
            } else {
              print_newline()
            }
          }
        } else { if (in_array(token_text, line_starters) && last_text !== ')') {
            print_newline()
          }
        }
      } else if (p === 'SPACE') {
        print_space()
      }
      print_token();
      last_word = token_text;
      if (token_text === 'var') {
        var_line = true;
        var_line_tainted = false
      }
      if (token_text === 'if' || token_text === 'else') {
        if_line_flag = true
      }
      break;
    case 'TK_SEMICOLON':
      print_token();
      var_line = false;
      break;
    case 'TK_STRING':
      if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK' || last_type === 'TK_SEMICOLON') {
        print_newline()
      } else if (last_type === 'TK_WORD') {
        print_space()
      }
      print_token();
      break;
    case 'TK_OPERATOR':
      var x = true;
      var y = true;
      if (var_line && token_text !== ',') {
        var_line_tainted = true;
        if (token_text === ':') {
          var_line = false
        }
      }
      if (var_line && token_text === ',' && (current_mode === '[EXPRESSION]' || current_mode === '(EXPRESSION)')) {
        var_line_tainted = false
      }
      if (token_text === ':' && in_case) {
        print_token();
        print_newline();
        in_case = false;
        break
      }
      if (token_text === '::') {
        print_token();
        break
      }
      if (token_text === ',') {
        if (var_line) {
          if (var_line_tainted) {
            print_token();
            print_newline();
            var_line_tainted = false
          } else {
            print_token();
            print_space()
          }
        } else if (last_type === 'TK_END_BLOCK') {
          print_token();
          print_newline()
        } else { if (current_mode === 'BLOCK') {
            print_token();
            print_newline()
          } else {
            print_token();
            print_space()
          }
        }
        break
      } else if (token_text === '--' || token_text === '++') {
        if (last_text === ';') {
          if (current_mode === 'BLOCK') {
            print_newline();
            x = true;
            y = false
          } else {
            x = true;
            y = false
          }
        } else { if (last_text === '{') {
            print_newline()
          }
          x = false;
          y = false
        }
      } else if ((token_text === '!' || token_text === '+' || token_text === '-') && (last_text === 'return' || last_text === 'case')) {
        x = true;
        y = false
      } else if ((token_text === '!' || token_text === '+' || token_text === '-') && last_type === 'TK_START_EXPR') {
        x = false;
        y = false
      } else if (last_type === 'TK_OPERATOR') {
        x = false;
        y = false
      } else if (last_type === 'TK_END_EXPR') {
        x = true;
        y = true
      } else if (token_text === '.') {
        x = false;
        y = false
      } else if (token_text === ':') {
        if (is_ternary_op()) {
          x = true
        } else {
          x = false
        }
      }
      if (x) {
        print_space()
      }
      print_token();
      if (y) {
        print_space()
      }
      break;
    case 'TK_BLOCK_COMMENT':
      print_newline();
      print_token();
      print_newline();
      break;
    case 'TK_COMMENT':
      print_space();
      print_token();
      print_newline();
      break;
    case 'TK_UNKNOWN':
      print_token();
      break
    }
    last_type = token_type;
    last_text = token_text
  }
  return output.join('').replace(/\n+$/, '')
};

module.exports = (input, config=0, filename="") => {
	var options = {
      indent_size: 2,
      indent_char: " ",
      preserve_newlines: true,
      space_after_anon_function: true
    };
  if (typeof config == "object") {
  	options = config;
  }
	out = js_beautify(unpacker_filter(input), options);
	return out;
};
