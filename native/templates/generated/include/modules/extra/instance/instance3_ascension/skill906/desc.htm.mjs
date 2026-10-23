// Generated from include/modules/extra/instance/instance3_ascension/skill906/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 906);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill906_lvl"]), r.int((await r.module("skillbase", "skill_getvalue", 906, "lvl", r.get(s, "who")))));
  if (r.truth((r.compare(r.get(s, "skill906_lvl"), 1) >= 0))) {
    await r.write("受伤或受到异常状态后<span class=\"yellow b\">20</span>秒内无法去除");
    if (r.truth((r.compare(r.get(s, "skill906_lvl"), 2) >= 0))) {
      await r.write("，<br>受伤或受到异常状态时生命上限<span class=\"yellow b\">-10</span>");
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
