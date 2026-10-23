// Generated from include/modules/extra/club/skills/skill246/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill246", "sys", "bufficons");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 246);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n隐身\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 246, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("发动后敌人将无法发现你，效果持续<span class=\"yellow b\">45</span>秒或直到你主动攻击<br>\r\n这次攻击无法使用战斗技，但命中率将增加<span class=\"yellow b\">30</span>%<br>");
  if (r.truth(r.equal(1, r.get(s, "st")))) {
    await r.write("<span class=\"yellow b\">技能发动中！持续时间还剩<span>");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒</span><br>");
  } else {
    if (r.truth(r.equal(2, r.get(s, "st")))) {
      await r.write("<span class=\"red b\">技能生效时间已结束</span><br>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth(r.equal(3, r.get(s, "st")))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill246_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" value=\"发动\">");
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
