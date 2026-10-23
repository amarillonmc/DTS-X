// Generated from include/modules/extra/club/skills/skill214/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill214");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 214);
  r.assign(r.slot(s, ["nchoice"]), (await r.module("skillbase", "skill_getvalue", 214, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n专注\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><div class=\"skilldesc\">\r\n<span style=\"text-align:left; display:inline-block;\">\r\n你可以随意于下列三个状态间切换：<br>\r\n<table>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span >");
  }
  await r.write("(1) 遇敌率提高15% ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill214_special';$('subcmd').value='upgrade';$('skillpara1').value='1';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 2))) {
    await r.write("<span >");
  }
  await r.write("(2) 无效果 ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 2))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 2))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill214_special';$('subcmd').value='upgrade';$('skillpara1').value='2';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span >");
  }
  await r.write("(3) 物品发现率提高15%  ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill214_special';$('subcmd').value='upgrade';$('skillpara1').value='3';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n</table>\r\n</span>\r\n</div></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
