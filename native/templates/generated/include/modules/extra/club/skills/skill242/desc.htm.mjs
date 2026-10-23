// Generated from include/modules/extra/club/skills/skill242/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 242);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n灵感\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["remcnt"]), r.subtract(r.get(s, "lvl"), r.int((await r.module("skillbase", "skill_getvalue", 242, "c")))));
  r.assign(r.slot(s, ["sk242id"]), r.int((await r.module("skillbase", "skill_getvalue", 242, "i"))));
  r.assign(r.slot(s, ["sk242n"]), (r.truth(r.equal(r.get(s, "sk242id"), 0)) ? "暂无" : r.get(r.get(s, "clubskillname"), r.get(s, "sk242id"))));
  await r.write("随机获得一个其他称号的技能，每次升级可以获得一次改变的机会<br>\r\n目前还可改变<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "remcnt")));
  await r.write("</span>次，当前你获得的技能是<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "sk242n")));
  await r.write("</span>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "remcnt"), 0) > 0))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill242_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"改变\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"改变\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n7级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
