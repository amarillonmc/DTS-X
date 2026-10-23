// Generated from include/modules/extra/card/skills/skill518/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 518);
  r.imports(s, "clubbase");
  r.assign(r.slot(s, ["skill518_r"]), (await r.module("skill518", "get_remaintime518", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每当你主动行动而经历1次禁区，你就获得1次回归次数。<br>\r\n只要你有回归次数，你被战斗或陷阱杀死时就能复活。<br>\r\n当前回归次数：<span class=\"");
  if (r.truth((r.compare(r.get(s, "skill518_r"), 0) > 0))) {
    await r.write("lime b");
  } else {
    await r.write("red b");
  }
  await r.write("\">");
  await r.write(r.text(r.get(s, "skill518_r")));
  await r.write("</span>次（最多累积2次）\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
