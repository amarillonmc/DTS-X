// Generated from include/modules/extra/club/skills/example_club_skill_module/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), r.constant("在这里写上你的技能编号"));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n在这里写上你的技能名称\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n在这里写上你的技能描述，注意排版\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n在这里写上你的技能的操作（如果有）\r\n例如");
  if (r.truth((r.compare(r.get(s, "skillpoint"), 1) >= 0))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill12_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"治疗\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"治疗\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n在这里写上还没有获得这个技能时的提示（例如需要等级XX级之类）\r\n建议如果有多条要求，做成动态提示（满足一条去掉一条），如果是有获得进度的技能亦可显示进度\r\n建议在技能模块里写一个函数返回没有获得技能时的提示，然后这里用eval功能调用它\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
