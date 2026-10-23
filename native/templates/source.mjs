/** Build-time translation of the source template surface. The result is an
 * intermediate syntax tree input only: neither production nor this module
 * executes PHP. Preserve the upstream replacement order and whitespace rules.
 */
const word = 'a-zA-Z_\\u007f-\\uffff';
const variable = `((\\$[${word}][a-zA-Z0-9_\\u007f-\\uffff]*)(\\[[a-zA-Z0-9_\\-."'\\[\\]$\\u007f-\\uffff]+\\])*)`;
const regex = (pattern, flags = 'gs') => new RegExp(pattern, flags);
export const addquote = value => value.replace(/\[([a-zA-Z0-9_\-.\u007f-\uffff]+)\]/gs, (_, key) => `['${key}']`).replaceAll('\\"', '"');
export const stripvtags = (expression, statement = '') => expression.replace(/<\?=(\$.+?)\?>/gs, '$1').replaceAll('\\"', '"') + statement.replaceAll('\\"', '"');
export const transamp = value => value.replaceAll('&', '&amp;').replaceAll('&amp;amp;', '&amp;').replaceAll('\\"', '"');

export function templateSource(source, { language = {}, nospace = true, fixed = undefined } = {}) {
  let template = source.replace(/([\r\n]+)\t+/gs, '$1').replace(/<!--\{(.+?)\}-->/gs, '{$1}');
  template = template.replace(/\{lang\s+(.+?)\}/gis, (_, key) => language[key] ?? `!${key}!`).replaceAll('{LF}', '<?="\\n"?>');
  template = template.replace(/\{(\$[a-zA-Z0-9_\[\]'"$.\u007f-\uffff]+)\}/gs, (_, value) => `<?=${value}?>`);
  template = template.replace(regex(variable), (_, value) => addquote(`<?=${value}?>`));
  template = template.replace(regex(`<\\?=<\\?=${variable}\\?>\\?>`), (_, value) => addquote(`<?=${value}?>`));
  template = template.replace(/\$\{(['"][a-zA-Z0-9_]*['"]\.)*<\?=(\$[a-zA-Z0-9_\[\]'"$.\u007f-\uffff]+)\?>(\.['"][a-zA-Z0-9_]*['"])*\}/gs,
    (_, before = '', value, after = '') => `<?=$[@[${before}${value}${after}]@]?>`);
  template = template.replace(/\$<\?=<\?=(\$[a-zA-Z0-9_\[\]'"$.\u007f-\uffff]+)\?>(\.['"][a-zA-Z0-9_]*['"])*\?>/gs,
    (_, value, after = '') => `<?=$[@[${value}${after}]@]?>`);
  template = template.replace(/\{<\?=\$\[@\[(.*)\]@\]\?>\}/gs, (_, value) => `<?=$[@[${value}]@]?>`);
  template = `<? if(!defined('IN_GAME')) exit('Access Denied'); ?>\n${template}`;
  template = template.replace(/[\n\r\t]*\{template\s+([a-z0-9_]+)\}[\n\r\t]*/gis, (_, name) => `\n<? include template('${name}'); ?>\n`);
  template = template.replace(/[\n\r\t]*\{template\s+(.+?)\}[\n\r\t]*/gis, (_, value) => stripvtags(`\n<? include template(${value}); ?>\n`));
  template = template.replace(/[\n\r\t]*\{eval\s+(.+?)\}[\n\r\t]*/gis, (_, value) => stripvtags(`\n<? ${value} ?>\n`));
  template = template.replace(/[\n\r\t]*\{echo\s+(.+?)\}[\n\r\t]*/gis, (_, value) => stripvtags(`\n<? echo ${value}; ?>\n`));
  template = template.replace(/[\n\r\t]*\{elseif\s+(.+?)\}[\n\r\t]*/gis, (_, value) => stripvtags(`\n<? } elseif(${value}) { ?>\n`));
  template = template.replace(/[\n\r\t]*\{else\}[\n\r\t]*/gis, '\n<? } else { ?>\n');
  for (let i = 0; i < 10; i++) {
    template = template.replace(/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\}[\n\r]*(.+?)[\n\r]*\{\/loop\}[\n\r\t]*/gis,
      (_, value, item, body) => stripvtags(`\n<? if(is_array(${value})) { foreach(${value} as ${item}) { ?>`, `\n${body}\n<? } } ?>\n`));
    template = template.replace(/[\n\r\t]*\{loop\s+(\S+)\s+(\S+)\s+(\S+)\}[\n\r\t]*(.+?)[\n\r\t]*\{\/loop\}[\n\r\t]*/gis,
      (_, value, key, item, body) => stripvtags(`\n<? if(is_array(${value})) { foreach(${value} as ${key} => ${item}) { ?>`, `\n${body}\n<? } } ?>\n`));
    template = template.replace(/[\n\r\t]*\{if\s+(.+?)\}[\n\r]*(.+?)[\n\r]*\{\/if\}[\n\r\t]*/gis,
      (_, condition, body) => stripvtags(`\n<? if(${condition}) { ?>`, `\n${body}\n<? } ?>\n`));
  }
  template = template.replaceAll('[@[', '{').replaceAll(']@]', '}');
  template = template.replace(/\{([a-zA-Z_\u007f-\uffff][a-zA-Z0-9_\u007f-\uffff]*)\}/gs, (_, constant) => `<?=${constant}?>`);
  template = template.replace(/ \?>[\n\r]*<\? /gs, ' ').replaceAll('<?', '<?php').replaceAll('<?php=', '<?php echo ');
  template = template.replace(/div>[\r\n]+<div/gs, 'div><div');
  if (nospace) template = template.replaceAll('\n<?', '<?').replaceAll('?>\n', '?>');
  template = template.replace(/"(http)?[\w./:]+\?[^\"]+?&[^\"]+?"/g, transamp);
  template = template.replace(/[\n\r\t]*\{template_fixed\s+([a-z0-9_]+)\}[\n\r\t]*/gis, (_, name) => {
    if (typeof fixed !== 'function') throw new Error(`Static template ${name} requires a build-time resolver`);
    return fixed(name).replaceAll("if(!defined('IN_GAME')) exit('Access Denied'); ", '').replaceAll('<?php ?>', '');
  });
  return template;
}
