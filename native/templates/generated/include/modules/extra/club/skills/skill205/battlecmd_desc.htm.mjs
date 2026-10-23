// Generated from include/modules/extra/club/skills/skill205/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("物理伤害<span class=\"yellow b\">+20%</span>，属性伤害<span class=\"yellow b\">+80%</span>，防具损坏效果<span class=\"yellow b\">×2</span>。消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
