// Generated from include/modules/extra/club/skills/skill74/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["sk74_coef"]), (r.truth(r.equal(r.get(s, "club"), 9)) ? 2 : 1.7));
  await r.write("本次攻击最终伤害<span class=\"yellow b\">×");
  await r.write(r.text(r.get(s, "sk74_coef")));
  await r.write("</span>，消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
