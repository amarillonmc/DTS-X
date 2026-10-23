// Generated from include/modules/extra/card/skills/skill480/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 480);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n泡沫\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 480, "activated", r.get(s, "who"))))))) {
    await r.write("<span class=\"gold\">一次性技能。发动后，你的金钱数翻倍，但之后的每次探索或移动，金钱数-50。</span>");
  } else {
    await r.write("<span class=\"red b\">你已经发动了此技能，现在你每次探索或移动后，金钱数都会-50！</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.truth((await r.module("skillbase", "skill_getvalue", 480, "activated")))))) {
    await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill480_activate';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
