// Generated from include/modules/extra/club/skills/skill43/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill43");
  r.imports(s, "itemmain");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 43);
  r.assign(r.slot(s, ["nchoice"]), (await r.module("skillbase", "skill_getvalue", 43, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n龙胆\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n获得技能“<span class=\"yellow b\">神速</span>”或“<span class=\"yellow b\">恃勇</span>”。<br>\r\n<input type=\"button\" onclick=\"$('mode').value='special';$('command').value='skill43_special';$('subcmd').value='upgrade';$('skillpara1').value=1;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"获得技能“神速”\">\r\n<input type=\"button\" onclick=\"$('mode').value='special';$('command').value='skill43_special';$('subcmd').value='upgrade';$('skillpara1').value=2;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"获得技能“恃勇”\">\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n7级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
