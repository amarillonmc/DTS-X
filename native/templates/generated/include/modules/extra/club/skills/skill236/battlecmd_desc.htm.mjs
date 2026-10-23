// Generated from include/modules/extra/club/skills/skill236/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stunsec236"]), r.divide(r.get(s, "stuntime236"), 1000));
  await r.write("物理伤害<span class=\"yellow b\">+60</span>，并晕眩敌人<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "stunsec236")));
  await r.write("</span>秒；消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
