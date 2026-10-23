// Generated from include/modules/extra/club/skills/skill74/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill74");
  r.assign(r.slot(s, ["ragecost"]), (await r.module("skill74", "get_rage_cost74")));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 74);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n心火\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["sk74_coef"]), (r.truth(r.equal(r.get(s, "club"), 9)) ? 2 : 1.7));
  await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击造成的最终伤害<span class=\"yellow b\">×");
  await r.write(r.text(r.get(s, "sk74_coef")));
  await r.write("</span>，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n19级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
