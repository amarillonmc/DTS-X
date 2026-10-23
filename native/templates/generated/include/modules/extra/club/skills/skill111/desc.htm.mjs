// Generated from include/modules/extra/club/skills/skill111/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill111");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 111);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你结束睡眠时，有<span class=\"yellow b\">(睡眠秒数×理智值/5)%</span>回复<span class=\"yellow b\">1</span>点理智值；<br>有<span class=\"yellow b\">(睡眠秒数×(已损失理智值+2)/10)%</span>概率随机获得一个技能，<br>该<span class=\"cyan b\">临时</span>技能持续<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill111_tempskill_time")));
  await r.write("</span>秒<br>概率高于<span class=\"yellow b\">100%</span>时会回复多点理智值或获得多个技能\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n11级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
