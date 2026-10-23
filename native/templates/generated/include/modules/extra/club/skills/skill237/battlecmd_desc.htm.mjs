// Generated from include/modules/extra/club/skills/skill237/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stunsec237"]), r.divide(r.get(s, "stuntime237"), 1000));
  await r.write("物理伤害<span class=\"yellow b\">变成0</span>，但晕眩敌人<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "stunsec237")));
  await r.write("</span>秒，且在<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "cdtime237")));
  await r.write("</span>秒内操作CD延长；消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
