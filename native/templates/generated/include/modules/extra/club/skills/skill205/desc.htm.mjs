// Generated from include/modules/extra/club/skills/skill205/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 205);
  r.imports(s, "skill205", "clubbase");
  r.assign(r.slot(s, ["ustate"]), (await r.module("clubbase", "skill_check_alternative_state", 205, r.get(s, "who"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n咆哮\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击物理伤害<span class=\"yellow b\">+20%</span>，属性伤害<span class=\"yellow b\">+80%</span>，<br>防具损坏效果<span class=\"yellow b\">×2</span>。使用射系武器方可发动，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<!--这个只是一个假的按钮，实际点击的是下面那个-->");
  if (r.truth((r.truth(r.bitAnd(r.get(s, "ustate"), 2)) && r.truth((!r.truth(r.bitAnd(r.get(s, "ustate"), 4))))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" value=\"选择\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    if (r.truth(r.bitAnd(r.get(s, "ustate"), 4))) {
      await r.write("<span class=\"red b\">\r\n已获得技能「");
      await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno205"))));
      await r.write("」，无法解锁！\r\n</span>");
    } else {
      await r.write("<span class=\"yellow b\">");
      if (r.truth(r.bitAnd(r.get(s, "ustate"), 2))) {
        await r.write("请在右侧选择本技能。与技能「");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno205"))));
        await r.write("」互斥。\r\n<input type=\"button\" style=\"width:47px;margin-right:25px;float:right;\" onclick=\"$('mode').value='special';$('command').value='skill205_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
      } else {
        await r.write("已选择。");
        await r.write(r.text(r.get(s, "unlock_lvl205")));
        await r.write("级时解锁");
      }
      await r.write("</span>");
    }
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
