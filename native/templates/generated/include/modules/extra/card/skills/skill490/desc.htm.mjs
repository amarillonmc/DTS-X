// Generated from include/modules/extra/card/skills/skill490/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 490);
  r.imports(s, "sys", "skill490", "bufficons");
  r.assign(r.slot(s, ["skill490_nextuse"]), r.int((await r.module("skillbase", "skill_getvalue", 490, "nextuse"))));
  r.assign(r.slot(s, ["skill490_cd_left"]), r.subtract(r.get(s, "skill490_nextuse"), r.get(s, "now")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n空想\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["st"]), (await r.module("bufficons", "bufficons_check_buff_state", 490, r.get(s, "who"))));
  r.assign(r.slot(s, ["rm"]), r.subtract(r.get(s, "tmp_totsec"), r.get(s, "tmp_nowsec")));
  await r.write("支付体力到");
  await r.write(r.text(r.get(s, "skill490_minsp")));
  await r.write("，获得1个类别、效果、耐久和属性皆随机的<br><span class=\"cyan b\">「空想道具」</span>，其效和耐合计值不超过支付的体力。");
  if (r.truth((r.compare(r.get(s, "st"), 2) <= 0))) {
    await r.write("<br><span class=\"cyan b\">技能冷却中，冷却时间还剩<span class=\"yellow b\">");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>秒。</span><br>");
  } else {
    if (r.truth((r.compare(r.get(s, "sp"), r.get(s, "skill490_minsp")) > 0))) {
      await r.write("<br>你可以支付<span class=\"yellow b\">");
      await r.write(r.text(r.subtract(r.get(s, "sp"), r.get(s, "skill490_minsp"))));
      await r.write("</span>点体力来发动本技能");
    } else {
      await r.write("<br><span class=\"red b\">你当前体力过少，无法发动技能！</span>");
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n<input type=\"button\" value=\"发动\" onclick=\"$('mode').value='special';$('command').value='skill490_special';$('subcmd').value='activate';postCmd('gamecmd','command.php',this);\" ");
    if (r.truth((r.compare(r.get(s, "st"), 2) <= 0))) {
      await r.write("disabled");
    }
    await r.write(" />\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
