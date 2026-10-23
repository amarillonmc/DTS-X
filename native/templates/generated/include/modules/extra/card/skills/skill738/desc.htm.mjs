// Generated from include/modules/extra/card/skills/skill738/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 738);
  r.assign(r.slot(s, ["nchoice"]), r.int((await r.module("skillbase", "skill_getvalue", 738, "choice"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<div style=\"text-align:left; display:inline-block;\">\r\n你可以随意于下列三个状态间切换：<br>\r\n<table>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span >");
  }
  await r.write("(1) 移动和探索消耗体力<br>减少<span class=\"yellow b\">(体力上限-400)/50</span>点 ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill738_special';$('subcmd').value='upgrade';$('skillpara1').value='1';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
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
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill738_special';$('subcmd').value='upgrade';$('skillpara1').value='2';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span >");
  }
  await r.write("(3) 移动和探索消耗体力<br>增加<span class=\"yellow b\">(体力上限/50)</span>点，<br>冷却时间<span class=\"yellow b\">-(体力上限/50)%</span> ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill738_special';$('subcmd').value='upgrade';$('skillpara1').value='3';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n</table>\r\n</div>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
