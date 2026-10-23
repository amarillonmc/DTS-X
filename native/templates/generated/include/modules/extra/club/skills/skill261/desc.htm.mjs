// Generated from include/modules/extra/club/skills/skill261/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill261", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 261);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n决战\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 261, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("殴熟翻倍，但每次移动或探索将减少<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill261_wploss")));
  await r.write("</span>点殴熟<br>\r\n技能“<span class=\"yellow b\">格斗</span>”的减伤概率增加<span class=\"yellow b\">15%</span><br>");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("<span class=\"red b\">你已经没有回头路了</span><br>");
  } else {
    await r.write("<span class=\"yellow b\">只能发动一次</span><br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n19级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
