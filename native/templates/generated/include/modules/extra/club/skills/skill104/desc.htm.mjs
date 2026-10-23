// Generated from include/modules/extra/club/skills/skill104/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill104");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 104);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">");
  r.assign(r.slot(s, ["clv"]), r.int((await r.module("skillbase", "skill_getvalue", 104, "lvl", r.get(s, "who")))));
  r.assign(r.slot(s, ["skill104_actrate"]), (await r.module("skill104", "get_skill104_actrate", r.get(s, "who"))));
  await r.write("你可以吸收至多<span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "cubemax"), r.get(s, "clv"))));
  await r.write("</span>个方块，<br>超出上限时，有<span class=\"yellow b\">85%</span>概率回收最早被吸收的方块。<br>战斗中，对每个吸收的方块有<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill104_actrate")));
  await r.write("%</span>概率视为具有其对应的攻击属性之一<br>");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    await r.write("可花费<span class=\"lime b\">");
    await r.write(r.text(r.get(r.get(s, "upgradecost"), r.get(s, "clv"))));
    await r.write("</span>点技能点升级，升级后可吸收至多<span class=\"yellow b\">5</span>个方块<br>");
  }
  r.assign(r.slot(s, ["skill104_itmarr"]), (await r.module("skill104", "skill104_prepare_itmarr", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill104_nowcount"]), (await r.call("sizeof", r.get(s, "skill104_itmarr"))));
  if (r.truth(r.get(s, "skill104_nowcount"))) {
    await r.write("当前已吸收的方块：<br>");
    if (r.truth((await r.call("is_array", r.get(s, "skill104_itmarr"))))) {
      {
        const a0 = r.copy(r.get(s, "skill104_itmarr"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["v"]), v0);
          await r.write("<span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "v"), "itm")));
          await r.write("</span> ");
        }
      }
    }
  } else {
    await r.write("<span class=\"cyan b\">当前未吸收方块</span>");
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((!r.identical(r.get(r.get(s, "upgradecost"), r.get(s, "clv")), (-r.number(1)))))) {
    if (r.truth((r.compare(r.get(s, "skillpoint"), r.get(r.get(s, "upgradecost"), r.get(s, "clv"))) >= 0))) {
      await r.write("<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill104_special';$('subcmd').value='upgrade';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"升级\">");
    } else {
      await r.write("<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"升级\">");
    }
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
