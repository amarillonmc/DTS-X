// Generated from include/modules/extra/card/skills/skill595/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["skill595_stunsec"]), r.divide(r.get(s, "skill595_stuntime"), 1000));
  r.assign(r.slot(s, ["skill595_phydmg"]), r.add(100, r.get(s, "skill595_phydmg_gain")));
  await r.write("造成<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill595_phydmg")));
  await r.write("%</span>物理伤害，概率使敌人晕眩<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill595_stunsec")));
  await r.write("</span>秒/头部受伤/经验值增加/全系熟练度增加。消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
