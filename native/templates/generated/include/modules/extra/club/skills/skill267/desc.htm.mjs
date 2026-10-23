// Generated from include/modules/extra/club/skills/skill267/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 267);
  r.imports(s, "skill267");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n代偿\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["skill267denovar"]), (await r.module("skill267", "get_skill267deno", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill267numevar"]), (await r.module("skill267", "get_skill267nume", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill267maxvar"]), (await r.module("skill267", "get_skill267max", r.get(s, "who"))));
  r.assign(r.slot(s, ["gotmhp"]), (await r.module("skillbase", "skill_getvalue", 267, "gotmhp", r.get(s, "who"))));
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 267, "lvl"))));
  await r.write("你在战斗中每失去<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill267denovar")));
  await r.write("</span>点生命，战斗后生命上限就<span class=\"cyan b\">+");
  await r.write(r.text(r.get(s, "skill267numevar")));
  await r.write("</span>。存活方有效。<br>");
  if (r.truth((r.compare(r.get(s, "gotmhp"), r.get(s, "skill267maxvar")) < 0))) {
    await r.write("你本局已经获得了<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "gotmhp")));
    await r.write("</span>/<span class=\"lime b\">");
    await r.write(r.text(r.get(s, "skill267maxvar")));
    await r.write("</span>点生命上限。<br>");
  } else {
    if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
      await r.write("你本局已经获得了<span class=\"lime b\">");
      await r.write(r.text(r.get(s, "gotmhp")));
      await r.write("</span>点生命上限，请提升技能等级。<br>");
    } else {
      await r.write("你本局已经获得了<span class=\"lime b\">");
      await r.write(r.text(r.get(s, "gotmhp")));
      await r.write("</span>点生命上限，不能再触发此技能了。<br>");
    }
  }
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
  await r.write("<br>\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill267_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n9级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
