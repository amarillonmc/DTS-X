// Generated from include/modules/extra/gmskills/skill1012/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 1012);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n寻真\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n权限狗技能。查看当前指定变量的值。输入时请搞清楚你在做什么。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill1012_special';$('subcmd').value='sub_page';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
