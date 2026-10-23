// Presentation-only colouring for skill1012's var_export display. This scanner
// emits escaped HTML; it never builds an AST, evaluates source or invokes code.
const HTML = '#000000', VALUE = '#0000BB', SYNTAX = '#007700', STRING = '#DD0000', COMMENT = '#FF8000';
const keywords = new Set(('abstract and array as break callable case catch class clone const continue declare default die do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile eval exit extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list namespace new or print private protected public require require_once return static switch throw trait try unset use var while xor yield __halt_compiler').split(' '));
const identifier = /^[a-zA-Z_\u0080-\uffff][a-zA-Z0-9_\u0080-\uffff]*/;
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\t', '    ').replaceAll(' ', '&nbsp;').replaceAll('\n', '<br />');

export function highlightValueSource(source) {
  let position = 0, color = HTML, output = '<code><span style="color: #000000">\n';
  const add = (text, next = color) => {
    if (!text) return;
    if (color !== next) { if (color !== HTML) output += '</span>'; if (next !== HTML) output += `<span style="color: ${next}">`; color = next; }
    output += escape(text);
  };
  const take = (length, next) => { const text = source.slice(position, position + length); position += length; add(text, next); };
  const variable = () => {
    const match = source.slice(position + 1).match(identifier); if (!match) return false;
    take(match[0].length + 1, VALUE);
    if (source.startsWith('->', position) && identifier.test(source.slice(position + 2))) { take(2, SYNTAX); take(source.slice(position).match(identifier)[0].length, VALUE); }
    if (source[position] === '[') { take(1, SYNTAX); while (position < source.length && source[position] !== ']') token(); if (source[position] === ']') take(1, SYNTAX); }
    return true;
  };
  function quoted(quote) {
    take(1, quote === '`' ? SYNTAX : STRING);
    while (position < source.length) {
      if (source[position] === quote) { take(1, quote === '`' ? SYNTAX : STRING); return; }
      if (source[position] === '\\') { take(Math.min(2, source.length - position), STRING); continue; }
      if (quote !== "'" && source.startsWith('${', position)) {
        take(2, SYNTAX); let depth = 1;
        while (position < source.length && depth) { if (source[position] === '{') depth++; if (source[position] === '}') depth--; token(); }
        continue;
      }
      if (quote !== "'" && source.startsWith('{$', position)) {
        take(1, SYNTAX); let depth = 1;
        while (position < source.length && depth) { if (source[position] === '{') depth++; if (source[position] === '}') depth--; token(); }
        continue;
      }
      if (quote !== "'" && source[position] === '$' && variable()) continue;
      take(1, STRING);
    }
  }
  function heredoc(match) {
    take(match[0].length, SYNTAX);
    const label = match[2] ?? match[3], nowdoc = match[1] === "'";
    const end = new RegExp(`^[\\t ]*${label}(?![a-zA-Z0-9_])`, 'm').exec(source.slice(position));
    const limit = end ? position + end.index : source.length;
    while (position < limit) {
      if (!nowdoc && source[position] === '\\') take(Math.min(2, limit - position), STRING);
      else if (!nowdoc && source[position] === '$' && variable()) continue;
      else take(1, STRING);
    }
    if (end) take(end[0].length, SYNTAX);
  }
  function token() {
    const rest = source.slice(position), char = source[position]; let match;
    if ((match = rest.match(/^[\t\n\r ]+/))) { take(match[0].length); return; }
    if (rest.startsWith('//') || char === '#') {
      const ending = rest.search(/\?>|\r?\n/), length = ending < 0 ? rest.length : ending + (rest.slice(ending, ending + 2) === '?>' ? 0 : rest[ending] === '\r' ? 2 : 1);
      take(length, COMMENT); return;
    }
    if (rest.startsWith('/*')) { const end = source.indexOf('*/', position + 2); take(end < 0 ? rest.length : end + 2 - position, COMMENT); return; }
    if ((match = rest.match(/^<<<[\t ]*(?:(["'])([a-zA-Z_]\w*)\1|([a-zA-Z_]\w*))\r?\n/))) { heredoc(match); return; }
    if (char === "'" || char === '"' || char === '`') { quoted(char); return; }
    if (char === '$' && identifier.test(rest.slice(1))) { take(rest.slice(1).match(identifier)[0].length + 1, VALUE); return; }
    if ((match = rest.match(/^(?:0x[0-9a-f_]+|0b[01_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.[\d_]+)(?:e[+-]?[\d_]+)?)/i))) { take(match[0].length, VALUE); return; }
    if ((match = rest.match(identifier))) { take(match[0].length, keywords.has(match[0].toLowerCase()) ? SYNTAX : VALUE); return; }
    take(1, SYNTAX);
  }
  let inCode = false;
  while (position < source.length) {
    if (!inCode) {
      const opening = /<\?(?:php(?=\s|$)|=)/gi; opening.lastIndex = position; const match = opening.exec(source);
      if (!match) { take(source.length - position, HTML); break; }
      take(match.index - position, HTML); take(match[0].length, VALUE); inCode = true;
    } else if (source.startsWith('?>', position)) {
      take(2 + (source.startsWith('\r\n', position + 2) ? 2 : source[position + 2] === '\n' ? 1 : 0), VALUE); inCode = false;
    } else token();
  }
  if (color !== HTML) output += '</span>\n';
  return output + '</span>\n</code>';
}
