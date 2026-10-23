// Generated from include/modules/extra/club/skills/skill73/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill73");
  r.assign(r.slot(s, ["ragecost"]), (await r.module("skill73", "get_rage_cost73", r.get(s, "who"))));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 73);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n必杀\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(r.get(r.get(s, "who"), "club"), 9))) {
    await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击造成物理伤害<span class=\"yellow b\">×2</span><br>消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "ragecost")));
    await r.write("</span>点怒气，<span class=\"yellow b\">集气</span>属性会额外返还<span class=\"yellow b\">15</span>点怒气");
  } else {
    await r.write("<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击造成物理伤害<span class=\"yellow b\">×2</span>，消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "ragecost")));
    await r.write("</span>点怒气");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
