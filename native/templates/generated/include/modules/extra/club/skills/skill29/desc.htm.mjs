// Generated from include/modules/extra/club/skills/skill29/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 29);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n生命\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每消耗<span class=\"lime b\">1</span>技能点，\r\n生命上限<span class=\"yellow b\">+6</span>点\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "skillpoint"), 1) >= 0))) {
    await r.write("<input type=\"number\" style=\"width:40px\" id=\"skill29_num\" name=\"skill29_num\" min=\"1\" max=\"");
    await r.write(r.text(r.get(s, "skillpoint")));
    await r.write("\" value=\"1\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill29_special';$('subcmd').value='upgrade';$('skillpara1').value=$('skill29_num').value;postCmd('gamecmd','command.php');this.disabled=true;\" value=\"使用\">");
  } else {
    await r.write("<input type=\"number\" style=\"width:40px\" disabled=\"true\" value=\"0\">\r\n<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"使用\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
