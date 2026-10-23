// Generated from include/modules/extra/card/skills/skill400/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill400");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 400);
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 400, "lvl", r.get(s, "who")))));
  r.assign(r.slot(s, ["skname"]), r.get(r.get(s, "paneldesc"), r.get(s, "clv")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(s, "skname")));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n战斗时有<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "procrate"), r.get(s, "clv"))));
  await r.write("%</span>概率发动，发动时造成的物理伤害提高<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "attgain"), r.get(s, "clv"))));
  await r.write("%</span><br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
