// Generated from include/modules/extra/club/skills/skill237/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill237");
  r.assign(r.slot(s, ["stunsec237"]), r.divide(r.get(s, "stuntime237"), 1000));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 237);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\nEMP\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：本次攻击物理伤害<span class=\"yellow b\">变成0</span>，但晕眩敌人<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "stunsec237")));
  await r.write("</span>秒，<br>并造成敌人<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "cdtime237")));
  await r.write("</span>秒内行动CD延长。发动消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气。<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n11级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
