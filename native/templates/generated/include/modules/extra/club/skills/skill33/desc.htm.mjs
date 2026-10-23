// Generated from include/modules/extra/club/skills/skill33/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill33");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 33);
  r.assign(r.slot(s, ["nchoice"]), (await r.module("skillbase", "skill_getvalue", 33, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n应变\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=b3><div style=\"margin-top:8px; margin-bottom:8px;\">\r\n<span style=\"text-align:left; display:inline-block;\">\r\n设你从“<span class=\"yellow b\">格挡</span>”技能中获得了<span class=\"yellow b\">x</span>点额外防御。<br>\r\n你可以随意于下列三个状态间切换：<br>\r\n<table>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span >");
  }
  await r.write("(1) 防御力再次增加<span class=\"yellow b\">x</span>点，武器效果视为降低<span class=\"yellow b\">0.7x</span>点 ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 1))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill33_special';$('subcmd').value='upgrade';$('skillpara1').value='1';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
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
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill33_special';$('subcmd').value='upgrade';$('skillpara1').value='2';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n<tr><td>\r\n&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span >");
  }
  await r.write("(3) 武器效果视为增加<span class=\"yellow b\">0.7x</span>点，防御力降低<span class=\"yellow b\">x</span>点  ");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("</span>");
  }
  await r.write("</td><td>");
  if (r.truth(r.equal(r.get(s, "nchoice"), 3))) {
    await r.write("<span class=\"lime b\">[当前选择]</span>");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill33_special';$('subcmd').value='upgrade';$('skillpara1').value='3';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
  }
  await r.write("</td></tr>\r\n</table>\r\n属性伤害不受这个技能影响。\r\n</span>\r\n</div></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
