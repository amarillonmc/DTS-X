const names = new Set(['tmp_mixhelp', 'tmp_mixhelp_sync', 'tmp_mixhelp_overlay', 'tmp_npchelp', 'tmp_clubhelp', 'tmp_itemhelp']);
/** These six source builders write already-rendered HTML. Preserve the original
 * template pass's literal whitespace/URL formatting without interpreting data
 * as template directives or executable source. */
export function derivedHtml(source) {
  return source.replace(/([\r\n]+)\t+/gs, '$1').replace(/div>[\r\n]+<div/gs, 'div><div')
    .replace(/"(http)?[\w./:]+\?[^\"]+?&[^\"]+?"/g, value => value.replaceAll('&', '&amp;').replaceAll('&amp;amp;', '&amp;').replaceAll('\\"', '"'))
    .replace(/^\r?\n/, '');
}
export function derivedTemplatePath(name, selected = 1) {
  if (!names.has(name)) return null;
  return `gamedata/templates/${Number(selected) === 1 ? 'default' : Number(selected)}/${name}.htm`;
}
export function derivedFilePath(value) {
  if (typeof value !== 'string') return value;
  const path = value.replaceAll('\\', '/').replace(/^(?:\.\/)+/, ''), match = path.match(/^templates\/(default|\d+)\/(tmp_\w+)\.htm$/);
  return match && names.has(match[2]) ? `gamedata/${path}` : value;
}
