// Generated from include/modules/extra/club/skills/skill226/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 226);
  r.imports(s, "skill226", "clubbase");
  r.assign(r.slot(s, ["ustate"]), (await r.module("clubbase", "skill_check_alternative_state", 226, r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n神智\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你在战斗中获得的经验值<span class=\"yellow b\">+1</span>。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<!--这个只是一个假的按钮，实际点击的是下面那个-->");
  if (r.truth((r.truth(r.bitAnd(r.get(s, "ustate"), 2)) && r.truth((!r.truth(r.bitAnd(r.get(s, "ustate"), 4))))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" value=\"选择\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    if (r.truth(r.bitAnd(r.get(s, "ustate"), 4))) {
      await r.write("<span class=\"red b\">\r\n已获得技能「");
      await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno226"))));
      await r.write("」，无法解锁！\r\n</span>");
    } else {
      await r.write("<span class=\"yellow b\">");
      if (r.truth(r.bitAnd(r.get(s, "ustate"), 2))) {
        await r.write("请在右侧选择本技能。与技能「");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno226"))));
        await r.write("」互斥。\r\n<input type=\"button\" style=\"width:47px;margin-right:25px;float:right;\" onclick=\"$('mode').value='special';$('command').value='skill226_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
      } else {
        await r.write("已选择。");
        await r.write(r.text(r.get(s, "unlock_lvl226")));
        await r.write("级时解锁");
      }
      await r.write("</span>");
    }
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
