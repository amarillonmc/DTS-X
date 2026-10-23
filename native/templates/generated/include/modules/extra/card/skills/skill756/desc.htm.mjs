// Generated from include/modules/extra/card/skills/skill756/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill756");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 756, "lvl", r.get(s, "who")))));
  r.assign(r.slot(s, ["bt"]), r.int((await r.module("skillbase", "skill_getvalue", 756, "btype", r.get(s, "who")))));
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 756);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write(r.text(r.add(r.get(s, "clv"), 5)));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当前状态为：<span class=\"yellow b\">");
  if (r.truth(((r.get(r.get(s, "skill756_buff"), r.get(s, "bt")) != null)))) {
    await r.write(r.text(r.get(r.get(s, "skill756_buff"), r.get(s, "bt"))));
  } else {
    await r.write("暂无状态");
  }
  await r.write("</span><br>\r\n每次先制攻击或受到攻击之后，切换为以下状态之一：<br>");
  await r.write(r.text((await r.call("implode", "；<br>", r.get(s, "skill756_buff")))));
  await r.write("<br>（此回复效果可超出生命上限，一次最多回复<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "skill756_recover_rate"), r.get(s, "clv"))));
  await r.write("%</span>生命上限）\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
