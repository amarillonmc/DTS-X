// Generated from include/modules/extra/card/skills/skill416/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill416");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 416);
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 416, "lvl"))));
  r.assign(r.slot(s, ["skname"]), r.get(r.get(s, "paneldesc"), r.get(s, "clv")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(s, "skname")));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth(r.equal(r.get(s, "clv"), 0))) {
    await r.write("对玩家伤害<span class=\"yellow b\">-50%</span>，对NPC伤害<span class=\"yellow b\">+30%</span>。<br>");
  }
  if (r.truth(r.equal(r.get(s, "clv"), 1))) {
    await r.write("对玩家伤害<span class=\"yellow b\">+10%</span>，对NPC伤害<span class=\"yellow b\">-10%</span>。<br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
