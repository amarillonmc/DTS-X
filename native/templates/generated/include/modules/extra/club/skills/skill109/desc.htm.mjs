// Generated from include/modules/extra/club/skills/skill109/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill109");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 109);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill109_rmtime"]), r.int((await r.module("skillbase", "skill_getvalue", 109, "rmtime", r.get(s, "who")))));
  await r.write("可花费<span class=\"lime b\">1</span>点技能点，并有<span class=\"yellow b\">50%</span>概率额外花费<span class=\"yellow b\">1</span>点理智值，<br>随机获得一个称号技能，该<span class=\"cyan b\">临时</span>技能持续<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill109_tempskill_time")));
  await r.write("</span>秒<br>\r\n本局游戏还可以发动<span class=\"cyan b\">");
  await r.write(r.text(r.get(s, "skill109_rmtime")));
  await r.write("/30</span>次\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.truth((r.compare(r.get(s, "skill109_rmtime"), 0) > 0)) && r.truth((r.compare(r.get(s, "skillpoint"), 1) >= 0))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill109_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
