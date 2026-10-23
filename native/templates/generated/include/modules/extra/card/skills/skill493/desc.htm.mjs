// Generated from include/modules/extra/card/skills/skill493/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 493);
  r.imports(s, "clubbase", "skill493");
  r.assign(r.slot(s, ["skill493var"]), (await r.module("skillbase", "skill_getvalue", 493, "choice")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你可以自由选择以下1个状态。<br>\r\n当前选择：战斗中获得的熟练度、经验值和怒气全部转化为<span class=\"lime b\">");
  await r.write(r.text(r.get(r.get(s, "skill493stateinfo"), r.get(s, "skill493var"))));
  await r.write("</span>。<br>\r\n（某些技能让你额外获得的数值不受影响）<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 3)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 3)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.equal(r.get(s, "skill493var"), r.get(s, "i")))) {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" disabled value=\"[已选择]\">");
        } else {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" onclick=\"$('mode').value='special';$('command').value='skill493_special';$('subcmd').value='upgrade';$('skillpara1').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
          await r.write(r.text(r.get(r.get(s, "skill493stateinfo"), r.get(s, "i"))));
          await r.write("\">");
        }
        if (r.truth((r.compare(r.get(s, "i"), 3) < 0))) {
          await r.write("&nbsp;&nbsp;&nbsp;");
        }
      }
    }
  }
  await r.write("<br>获得经验值和怒气时，你的等级视为\r\n<br>熟练度、经验值和怒气中的最大值换算成经验值时的对应等级。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
