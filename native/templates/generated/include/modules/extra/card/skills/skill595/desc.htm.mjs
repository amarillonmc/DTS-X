// Generated from include/modules/extra/card/skills/skill595/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill595");
  r.assign(r.slot(s, ["skill595_stunsec"]), r.divide(r.get(s, "skill595_stuntime"), 1000));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 595);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;物理伤害<span class=\"yellow b\">+");
  await r.write(r.text(r.get(s, "skill595_phydmg_gain")));
  await r.write("%</span>，并使对手概率获得以下若干项：晕眩<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill595_stunsec")));
  await r.write("</span>秒/<br>头部受伤/经验值增加/全系熟练度增加。消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n10级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
