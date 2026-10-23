// Generated from include/modules/extra/club/skills/skill41/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 41);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n基础攻击力<span class=\"yellow b\">+10%</span>，每次攻击<span class=\"yellow b\">50%</span>几率基础攻击<span class=\"yellow b\">+1</span>点<br>\r\n受射程内攻击时<span class=\"yellow b\">65%</span>几率触发，触发则反击\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">");
    if (r.truth((await r.module("skillbase", "skill_query", 43)))) {
      await r.write("通过技能“龙胆”解锁");
    }
    await r.write("</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
