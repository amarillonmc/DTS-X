// Generated from include/modules/extra/club/skills/skill70/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 70);
  r.imports(s, "clubbase", "weapon");
  r.assign(r.slot(s, ["nowwsn"]), r.get(r.get(s, "skillinfo"), (await r.module("weapon", "get_attack_method", r.get(s, "who")))));
  r.assign(r.slot(s, ["wskillup70"]), (await r.module("skill70", "get_wskillup70", r.get(s, "who"), r.get(s, "nowwsn"))));
  r.assign(r.slot(s, ["nowskill"]), r.get(s, r.get(s, "nowwsn")));
  r.assign(r.slot(s, ["nowskillsum"]), r.add(r.get(s, "nowskill"), r.get(s, "wskillup70")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"cyan b\">称号特性</span> ");
  await r.write(r.text(r.get(r.get(s, "clubdesc_a"), "18")));
  await r.write("<br>当前增加熟练：<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "wskillup70")));
  await r.write("</span>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
