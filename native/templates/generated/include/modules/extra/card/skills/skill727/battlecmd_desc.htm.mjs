// Generated from include/modules/extra/card/skills/skill727/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("本次攻击最终伤害<span class=\"yellow b\">+10%</span>，“<span class=\"yellow b\">晶环</span>”生效概率永久<span class=\"yellow b\">+5%</span>，消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
