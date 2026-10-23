// Generated from include/modules/extra/club/skills/skill235/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill235", "sys");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 235);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n探测\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["lv"]), r.int((await r.module("skillbase", "skill_getvalue", 235, "lvl"))));
  if (r.truth(r.equal(r.get(s, "lv"), 0))) {
    await r.write("消耗<span class=\"yellow b\">1</span>个技能点，进行一次广域探测。<br>");
  } else {
    await r.write("你可以没有限制地进行广域探测。<br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" value=\"探测\" onclick=\"$('mode').value='special';$('command').value='skill235_special';$('subcmd').value='wscan';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
