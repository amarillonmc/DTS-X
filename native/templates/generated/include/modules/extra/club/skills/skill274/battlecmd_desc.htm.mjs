// Generated from include/modules/extra/club/skills/skill274/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["clv"]), (await r.module("skillbase", "skill_getvalue", 274, "lvl")));
  r.assign(r.slot(s, ["f"]), (await r.module("skill274", "get_skill274_factor", r.get(s, "clv"), r.get(r.get(s, "edata"), "type"))));
  await r.write("本次攻击最终伤害增加对方总面板攻击力的<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "f")));
  await r.write("%</span>，且本次战斗中「格斗」触发概率<span class=\"yellow b\">+");
  await r.write(r.text(r.get(s, "skill274_263up")));
  await r.write("%</span>。<br>消耗<span class=\"red b\">");
  await r.write(r.text(r.get(s, "rageneed")));
  await r.write("</span>怒气");
return 1;
}
