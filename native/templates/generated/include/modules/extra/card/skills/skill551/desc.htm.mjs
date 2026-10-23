// Generated from include/modules/extra/card/skills/skill551/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 551);
  r.imports(s, "map", "clubbase", "skill551");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当你在以下地点丢弃特定道具时，可以获得经验值<br>\r\n<span class=\"yellow b\">");
  if (r.truth((await r.call("is_array", r.get(s, "skill551_plslist"))))) {
    {
      const a0 = r.copy(r.get(s, "skill551_plslist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(((r.get(r.get(s, "plsinfo"), r.get(s, "i")) != null)))) {
          r.assign(r.slot(s, ["skill551_plsflag"]), 1);
          await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "i"))));
        }
      }
    }
  }
  if (r.truth((!r.truth(r.get(s, "skill551_plsflag"))))) {
    await r.write("无");
  }
  await r.write("</span>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
