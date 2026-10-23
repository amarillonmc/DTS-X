// Generated from include/modules/extra/club/skills/skill228/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill228");
  r.assign(r.slot(s, ["ragecost228"]), (await r.module("skill228", "get_rage_cost228")));
  r.assign(r.slot(s, ["stunsec228"]), r.divide(r.get(s, "stuntime228"), 1000));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 228);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n神击\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击造成的最终伤害<span class=\"yellow b\">×1.6</span>，并晕眩敌人<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "stunsec228")));
  await r.write("</span>秒<br>消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost228")));
  await r.write("</span>点怒气或<span class=\"yellow b\">5</span>个技能点\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n21级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
