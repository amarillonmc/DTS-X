// Generated from include/modules/extra/club/skills/skill35/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill35");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 35);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n猛击\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 35, "lvl"))));
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
  await r.write("<br>\r\n持殴系武器战斗时<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "proc_rate")));
  await r.write("%</span>几率触发，触发则物理伤害增加<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "attgain"), r.get(s, "clv"))));
  await r.write("%</span>，<br>且晕眩敌人<span class=\"cyan b\">");
  await r.write(r.text(r.get(r.get(s, "sk35_stuntime"), r.get(s, "clv"))));
  await r.write("</span>秒。晕眩状态下敌人无法进行任何行动或战斗。<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill35_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
