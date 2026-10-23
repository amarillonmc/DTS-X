// Generated from include/modules/extra/card/skills/skill725/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill725");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 725);
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n你销毁尸体时会得到命体回复类别的灵魂碎片，<br>并可以使用打火机强化灵魂碎片，但食用其他补给品效果<span class=\"yellow b\">-70%</span><br>");
  r.assign(r.slot(s, ["skill725var"]), (await r.module("skillbase", "skill_getvalue", 725, "choice")));
  if (r.truth(r.equal(1, r.get(s, "skill725var")))) {
    await r.write("<span class=\"yellow b\">当前不会提取灵魂碎片</span>");
  } else {
    await r.write("<span class=\"cyan b\">当前会提取灵魂碎片</span>");
  }
  await r.write("<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 2)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 2)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.equal(r.get(s, "skill725var"), r.get(s, "i")))) {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" disabled value=\"[已选择]\">");
        } else {
          await r.write("<input type=\"button\" style=\"width:70px;margin:4px\" onclick=\"$('mode').value='special';$('command').value='skill725_special';$('subcmd').value='upgrade';$('skillpara1').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
          await r.write(r.text(r.get(r.get(s, "skill725stateinfo"), r.get(s, "i"))));
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
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
