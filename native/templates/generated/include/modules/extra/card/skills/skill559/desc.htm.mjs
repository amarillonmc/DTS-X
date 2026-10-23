// Generated from include/modules/extra/card/skills/skill559/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill559");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 559);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你拥有额外的合成姿势。<br>\r\n已掌握的合成表：");
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 559, "classes")))))) {
    await r.write("<br><span class=\"yellow b\">无</span>");
  } else {
    r.assign(r.slot(s, ["extmixinfo"]), (await r.module("skill559", "get_sk559_mixinfo", r.get(s, "who"))));
    r.assign(r.slot(s, ["showrecipe"]), (await r.module("skill559", "show_sk559_recipe", r.get(s, "extmixinfo"))));
    if (r.truth((await r.call("is_array", r.get(s, "showrecipe"))))) {
      {
        const a0 = r.copy(r.get(s, "showrecipe"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["v"]), v0);
          await r.write("<br><span class=\"yellow b\">");
          await r.write(r.text(r.get(s, "v")));
          await r.write("</span>");
        }
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
