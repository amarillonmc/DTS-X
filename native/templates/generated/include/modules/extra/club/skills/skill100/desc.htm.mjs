// Generated from include/modules/extra/club/skills/skill100/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 100);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n消耗所有怒气值（至少<span class=\"yellow b\">10</span>点），<br>使下一次合成产物的效果值与耐久值<span class=\"yellow b\">+(消耗怒气值/4)%</span>");
  r.assign(r.slot(s, ["skill100_rageused"]), (await r.module("skillbase", "skill_getvalue", 100, "rageused")));
  if (r.truth(r.get(s, "skill100_rageused"))) {
    await r.write("<br><span class=\"cyan b\">你的下一次合成产物将被强化</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.truth((!r.truth(r.get(s, "skill100_rageused")))) && r.truth((r.compare(r.get(s, "rage"), 10) >= 0))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill100_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n6级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
