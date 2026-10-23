// Generated from include/modules/extra/club/skills/skill247/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill247", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 247);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n挖坑\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 247, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("在当前地图放置<span class=\"yellow b\">2</span>个毒性陷阱，冷却时间<span class=\"cyan b\">1</span>分钟<br>\r\n陷阱效果值为你的基础攻击力乘以距上次挖坑的分钟数(最多为3)<br>\r\n你不会遭遇你设置的任何陷阱。");
  if (r.truth(r.equal(2, r.get(s, "st")))) {
    await r.write("<span class=\"yellow b\">技能冷却中，冷却时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒</span><br>");
  } else {
    if (r.truth(r.equal(3, r.get(s, "st")))) {
      await r.write("<span class=\"cyan b\">技能冷却完毕，可以使用</span><br>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill247_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
  } else {
    await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
