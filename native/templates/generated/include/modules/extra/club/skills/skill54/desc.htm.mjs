// Generated from include/modules/extra/club/skills/skill54/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill54");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 54);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n圣盾\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 54, "lvl"))));
  r.assign(r.slot(s, ["totlv"]), r.subtract((await r.call("count", r.get(s, "upgradecost"))), 1));
  await r.write("你受到的所有属性伤害<span class=\"yellow b\">-");
  await r.write(r.text(r.get(r.get(s, "dmgreduction"), r.get(s, "clv"))));
  await r.write("%</span>");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    await r.write("<br>可花费<span class=\"lime b\">");
    await r.write(r.text(r.get(r.get(s, "upgradecost"), r.get(s, "clv"))));
    await r.write("</span>点技能点升级，升级后减伤提高至<span class=\"yellow b\">-");
    await r.write(r.text(r.get(r.get(s, "dmgreduction"), "1")));
    await r.write("%</span>");
  }
  await r.write("<br>\r\n</td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill54_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n8级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
