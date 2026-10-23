// Generated from include/modules/extra/club/skills/skill60/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("物理伤害<span class=\"yellow b\">+x%</span><br><span class=\"yellow b\">x</span>为敌方已损失生命值百分比<br>消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
