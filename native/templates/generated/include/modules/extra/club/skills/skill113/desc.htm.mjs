// Generated from include/modules/extra/club/skills/skill113/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 113);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill113_skill_count"]), (await r.module("skill113", "skill113_get_skill_count", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill113_rate"]), r.multiply(3, r.get(s, "skill113_skill_count")));
  await r.write("你每有一个技能，物穿/属穿属性生效率增加<span class=\"yellow b\">3%</span>，敌人的<br>减半防御属性、抹消属性和控伤属性的失效率增加<span class=\"yellow b\">3%</span><br>当前增加<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill113_rate")));
  await r.write("%</span>（共<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill113_skill_count")));
  await r.write("</span>个有效技能）\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n20级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
