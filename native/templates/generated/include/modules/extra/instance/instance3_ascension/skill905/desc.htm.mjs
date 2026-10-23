// Generated from include/modules/extra/instance/instance3_ascension/skill905/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 905);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill905_lvl"]), r.int((await r.module("skillbase", "skill_getvalue", 905, "lvl", r.get(s, "who")))));
  if (r.truth((r.compare(r.get(s, "skill905_lvl"), 3) >= 0))) {
    await r.write("<span class=\"red b\">无法使用视野和记忆</span>");
  } else {
    if (r.truth((r.compare(r.get(s, "skill905_lvl"), 1) >= 0))) {
      await r.write("记忆上限<span class=\"yellow b\">-20</span>格");
      if (r.truth((r.compare(r.get(s, "skill905_lvl"), 2) >= 0))) {
        await r.write("，视野上限<span class=\"yellow b\">-4</span>格");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
