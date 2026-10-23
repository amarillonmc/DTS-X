// Generated from include/modules/extra/card/skills/skill561/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 561);
  r.assign(r.slot(s, ["spcost561"]), (await r.module("skill561", "get_spcost561", r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n    ");
  if (r.truth((await r.module("skillbase", "skill_query", 557, r.get(s, "who"))))) {
    await r.write("        <span class=\"red b\">你只有三条腿了</span>\r\n    ");
  } else {
    await r.write("        <span class=\"red b\">你只有一条腿了</span>\r\n    ");
  }
  await r.write("。你移动和探索时的体力消耗<span class=\"red b\">+");
  await r.write(r.text(r.get(s, "spcost561")));
  await r.write("</span>。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
