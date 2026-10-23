// Generated from include/modules/extra/card/skills/skill744/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill744");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 744);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 744, "lvl", r.get(s, "who")))));
  r.assign(r.slot(s, ["exflag744"]), r.int((await r.module("skillbase", "skill_getvalue", 744, "exflag", r.get(s, "who")))));
  if (r.truth(r.get(s, "exflag744"))) {
    await r.write("任何玩家触发你埋设的陷阱或因为此技能效果触发陷阱且受到伤害后，");
  } else {
    await r.write("任何玩家触发你埋设的陷阱且受到伤害后，");
  }
  await r.write("<br>有<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "sk744_actrate"), r.get(s, "clv"))));
  await r.write("%</span>几率再触发同地点的一个陷阱\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
