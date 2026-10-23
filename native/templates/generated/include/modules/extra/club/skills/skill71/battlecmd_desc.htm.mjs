// Generated from include/modules/extra/club/skills/skill71/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["sk71_expgain"]), (await r.module("skill71", "calculate_skill71_expgain", r.get(s, "sdata"), r.get(s, "edata"), 1)));
  await r.write("本次攻击物理伤害<span class=\"yellow b\">+20%</span>，如击杀敌人则额外获得<span class=\"lime b\">");
  await r.write(r.text(r.get(s, "sk71_expgain")));
  await r.write("</span>点经验；消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
