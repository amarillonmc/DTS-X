// Generated from include/modules/extra/club/skills/skill71/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill71");
  r.assign(r.slot(s, ["ragecost"]), (await r.module("skill71", "get_rage_cost71")));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 71);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n解构\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["sk71_coef"]), (r.truth(r.equal(r.get(s, "club"), 18)) ? 0.15 : 0.3));
  await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击物理伤害<span class=\"yellow b\">+20%</span>；如果成功击杀敌人，<br>你额外获得<span class=\"lime b\">(敌人等级-<span>");
  await r.write(r.text(r.get(s, "sk71_coef")));
  await r.write("</span>×你的等级)</span>点经验；消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
