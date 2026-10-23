// Generated from include/modules/extra/club/skills/skill60/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill60");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 60);
  r.assign(r.slot(s, ["ragecost"]), (await r.module("skill60", "get_rage_cost60")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n恐惧\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：本次攻击物理伤害<span class=\"yellow b\">+x%</span>，<span class=\"yellow b\">x</span>为敌方已损失生命值百分比<br>");
  if (r.truth(r.equal(r.get(s, "club"), 24))) {
    await r.write("发动消耗<span class=\"yellow b\">(50-等级)</span>点怒气，最低20点");
    if (r.truth((!r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))))) {
      await r.write("(目前为<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "ragecost")));
      await r.write("</span>点)");
    }
    await r.write("<br>");
  } else {
    await r.write("发动消耗<span class=\"yellow b\">(50-0.7*等级)</span>点怒气，最低25点");
    if (r.truth((!r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))))) {
      await r.write("(目前为<span class=\"yellow b\">");
      await r.write(r.text(r.get(s, "ragecost")));
      await r.write("</span>点)");
    }
    await r.write("<br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n12级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
