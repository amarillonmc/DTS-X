// Generated from include/modules/extra/club/skills/skill49/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill49");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 49);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n潜能\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：本次攻击必中且物理伤害<span class=\"yellow b\">+20%</span><br>\r\n持投系武器方可发动，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<!--这个只是一个假的按钮，实际点击的是下面那个-->");
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(s, "unlockcost")) >= 0))) {
      await r.write("<input id=\"skill49_unlock_button\" type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill49_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"解锁\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"解锁\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<div class=\"yellow b\">消耗<span>");
    await r.write(r.text(r.get(s, "unlockcost")));
    await r.write("</span>点技能点解锁");
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(s, "unlockcost")) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:47px;margin-right:25px;float:right;\" onclick=\"$('mode').value='special';$('command').value='skill49_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');$('skill49_unlock_button').disabled=true;this.disabled=true;\" value=\"解锁\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:47px;margin-right:25px;float:right;\" disabled=\"true\" value=\"解锁\">");
    }
    await r.write("</div>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
