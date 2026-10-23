import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { pregMatch, pregReplace } from '../native/generated/regex.mjs';

test('native game regular expressions match actual PHP 7.4 captures, offsets and replacements', async t => {
  const cases = [
    ['/^(WC|WD|WF|Y|B|C|EI|TN|G|M|V|ygo|fy|p|EA|EC)/', 'WC'],
    ['/钉$/', '全自动订书钉'], ['/钉\\[/', '钉[+5]'],
    ['/\\|.*\\|/s', 'a|甲\n乙|c|末|'], ['/\\|.*?\\|/s', 'a|甲\n乙|c|末|'],
    ['/\\<\\:comp_itmsk\\:\\>\\{([^\\{]+?)\\}/s', '^res_<:comp_itmsk:>{甲^res_<:comp_itmsk:>{乙}1}1'],
    ['/\\<\\:comp_itmsk\\:\\>\\{(.+)\\}/s', 'x<:comp_itmsk:>{a,b}1'],
    ['|<td[^>]*?skilldesc_left.*?>(.*?)<\\/td>\\s*<td[^>]*?skilldesc_right|s', '<td class="skilldesc_left">甲\n乙</td> <td class="skilldesc_right">'],
    ['/^“(.*)”$/s', '“消息\n第二行”'], ['/\\[\\+([0-9]+?)\\]/', '武器[+12]'],
    ['/(\\<\\=*|\\>\\=*|\\=\\=\\=*|\\!\\=\\=*)/s', '值>=8'],
    ['|[\\+\\-\\*\\/]|s', '1+2*3/4'], ['/★(\\d+)/s', '★12★3'],
    ['/LV\\d/s', 'LV2'], ['/a(b)?(c)?/', 'ab'], ['/a(b)?(c)?/', 'abc'],
    ['/x/', '无命中'], ['/(甲)(乙)?/', 'xx甲xx甲乙'], ['/a.*b/is', 'A\nxB'],
  ];
  const input = cases.flatMap(([pattern, subject]) => [0, 256, 512].flatMap(flags => [false, true].map(all => ({ pattern, subject, flags, all }))));
  const oracle = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', '$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $c){$m=[];$n=$c["all"]?preg_match_all($c["pattern"],$c["subject"],$m,$c["flags"]):preg_match($c["pattern"],$c["subject"],$m,$c["flags"]);$out[]=["count"=>$n,"matches"=>$m];}echo json_encode($out,JSON_UNESCAPED_UNICODE);'], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true });
  if (oracle.error?.code === 'ENOENT') { t.skip('Requires development-only PHP 7.4'); return; }
  assert.equal(oracle.status, 0, oracle.stderr);
  const expected = JSON.parse(oracle.stdout);
  for (let i = 0; i < input.length; i++) { const c = input[i]; assert.deepEqual(pregMatch(c.pattern, c.subject, c.flags, 0, c.all), expected[i], JSON.stringify(c)); }
  const replacements = cases.map(([pattern, subject]) => ({ pattern, subject, replacement: '[$1]\\1-${0}' }));
  const replaced = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', '$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $c)$out[]=preg_replace($c["pattern"],$c["replacement"],$c["subject"]);echo json_encode($out,JSON_UNESCAPED_UNICODE);'], { input: JSON.stringify(replacements), encoding: 'utf8', windowsHide: true });
  assert.equal(replaced.status, 0, replaced.stderr);
  assert.deepEqual(await Promise.all(replacements.map(c => pregReplace(c.pattern, c.replacement, c.subject))), JSON.parse(replaced.stdout));
});
