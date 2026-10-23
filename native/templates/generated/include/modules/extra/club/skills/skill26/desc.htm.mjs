// Generated from include/modules/extra/club/skills/skill26/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill26");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 26);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n聚能\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 26, "lvl"))));
  if (r.truth((r.compare(r.get(s, "clv"), 1) <= 0))) {
    await r.write("<span class=\"yellow b\">战斗技</span>：消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "ragecost"), "1")));
    await r.write("</span>点怒气发动，本次攻击伤害全部视为<span class=\"red b\">火焰</span>伤害<br>\r\n可花费<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "upgradecost")));
    await r.write("</span>点技能点升级，升级后伤害变为<span class=\"red b\">灼焰</span>伤害，消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "ragecost"), "2")));
    await r.write("</span>点怒气");
  } else {
    await r.write("<span class=\"yellow b\">战斗技</span>：消耗<span class=\"yellow b\">");
    await r.write(r.text(r.get(r.get(s, "ragecost"), "2")));
    await r.write("</span>点怒气发动，本次攻击伤害全部视为<span class=\"red b\">灼焰</span>伤害<br>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.truth(r.equal(r.get(s, "clv"), 1)) && r.truth((r.compare(r.get(s, "skillpoint"), 10) >= 0))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill26_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
  } else {
    if (r.truth(r.equal(r.get(s, "clv"), 1))) {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n3级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
