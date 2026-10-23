// Generated from include/modules/extra/club/skills/skill48/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill48");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 48);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n附魔\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n<span class=\"yellow b\">战斗技</span>：如果你没有下列任一属性，则随机附加一种下位攻击属性。<br>此外，攻击后在本次施加的下列属性中随机选择一种，<br>你持投系武器造成的该属性伤害永久<span class=\"yellow b\">+3%</span>(最高150%)<br>\r\n持投掷兵器方可发动，消耗<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "ragecost")));
  await r.write("</span>点怒气。目前各属性加成统计：<br>\r\n<span style=\"height:4px; display:block;\">&nbsp;</span>");
  (await r.module("skill48", "get_status_html48"));
  r.assign(r.slot(s, ["skill48var"]), (await r.module("skillbase", "skill_getvalue", 48, "choice")));
  if (r.truth(r.equal(r.get(s, "skill48var"), 1))) {
    await r.write("<span class=\"yellow b\">本技能当前默认不发动</span>。<br>");
  } else {
    await r.write("<span class=\"cyan b\">本技能当前默认发动</span>。<br>");
  }
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 2)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 2)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.equal(r.get(s, "skill48var"), r.get(s, "i")))) {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" disabled value=\"[已选择]\">");
        } else {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" onclick=\"$('mode').value='special';$('command').value='skill48_special';$('subcmd').value='upgrade';$('skillpara1').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
          await r.write(r.text(r.get(r.get(s, "skill48stateinfo"), r.get(s, "i"))));
          await r.write("\">");
        }
        if (r.truth((r.compare(r.get(s, "i"), 2) < 0))) {
          await r.write("&nbsp;&nbsp;&nbsp;");
        }
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n5级时解锁\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
