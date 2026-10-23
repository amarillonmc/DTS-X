// Generated from include/modules/extra/club/skills/skill274/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 274);
  r.imports(s, "skill274", "clubbase");
  r.assign(r.slot(s, ["ustate"]), (await r.module("clubbase", "skill_check_alternative_state", 274, r.get(s, "who"))));
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 274, "lvl"))));
  r.assign(r.slot(s, ["f1"]), (await r.module("skill274", "get_skill274_factor", r.get(s, "clv"), 0)));
  r.assign(r.slot(s, ["f2"]), (await r.module("skill274", "get_skill274_factor", r.get(s, "clv"), 1)));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n截拳\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>&nbsp;&nbsp;本次攻击最终伤害增加敌方(攻击力+武器效果值)的<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "f1")));
  await r.write("%</span>，<br>如果对方是NPC则为<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "f2")));
  await r.write("%</span>，（但不超过对方");
  await r.write(r.text(r.get(s, "skill274_factor_maxhp")));
  await r.write("%HP上限），<br>且本次战斗中「格斗」触发概率<span class=\"yellow b\">+");
  await r.write(r.text(r.get(s, "skill274_263up")));
  await r.write("%</span>。空手方可发动，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气<br>");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 274, "lvl"))));
  r.assign(r.slot(s, ["totlv"]), r.subtract((await r.call("count", r.get(s, "upgradecost"))), 1));
  await r.write("<span class=\"lime b\">当前级别");
  await r.write(r.text(r.get(s, "clv")));
  await r.write("/");
  await r.write(r.text(r.get(s, "totlv")));
  await r.write("</span>&nbsp;");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    await r.write("消耗<span class=\"lime b\">");
    await r.write(r.text(r.get(r.get(s, "upgradecost"), r.get(s, "clv"))));
    await r.write("</span>点技能点升至下一级");
  }
  await r.write("<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<!--这个只是一个假的按钮，实际点击的是下面那个-->");
  if (r.truth((r.truth(r.bitAnd(r.get(s, "ustate"), 2)) && r.truth((!r.truth(r.bitAnd(r.get(s, "ustate"), 4))))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" value=\"选择\">");
  } else {
    if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
      if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
        await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill274_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
      } else {
        await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
      }
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    if (r.truth(r.bitAnd(r.get(s, "ustate"), 4))) {
      await r.write("<span class=\"red b\">\r\n已获得技能「");
      await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno274"))));
      await r.write("」，无法解锁！\r\n</span>");
    } else {
      await r.write("<span class=\"yellow b\">");
      if (r.truth(r.bitAnd(r.get(s, "ustate"), 2))) {
        await r.write("请在右侧选择本技能。与技能「");
        await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "alternate_skillno274"))));
        await r.write("」互斥。\r\n<input type=\"button\" style=\"width:47px;margin-right:25px;float:right;\" onclick=\"$('mode').value='special';$('command').value='skill274_special';$('subcmd').value='upgrade';$('skillpara1').value='choose';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"选择\">");
      } else {
        await r.write("已选择。");
        await r.write(r.text(r.get(s, "unlock_lvl274")));
        await r.write("级时解锁");
      }
      await r.write("</span>");
    }
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
