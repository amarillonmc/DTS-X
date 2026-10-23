// Generated from include/modules/extra/club/skills/skill223/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill223");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 223);
  r.assign(r.slot(s, ["skill223_cnt"]), r.int((await r.module("skill223", "get_remaintime223"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n暗杀\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span><span class=\"red b\">&nbsp;&nbsp;限定技&nbsp;本局还可发动<span>");
  await r.write(r.text(r.get(s, "skill223_cnt")));
  await r.write("</span>/2次</span><br>本次攻击必中，最终伤害提高<span class=\"yellow b\">");
  if (r.truth(r.equal(r.get(s, "card"), 5))) {
    await r.write("100%");
  } else {
    await r.write("50%");
  }
  await r.write("</span>，<br>对方每有一处致伤或异常状态伤害再提高<span class=\"yellow b\">50%</span>。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n20级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
