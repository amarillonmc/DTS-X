// Generated from include/modules/extra/club/skills/skill78/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 78);
  r.imports(s, "weapon");
  r.assign(r.slot(s, ["maxkind"]), (await r.module("skill78", "get_max_skillkindname78")));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n每消耗<span class=\"lime b\">1</span>技能点，\r\n<select id=\"stselect\" name=\"stselect\">");
  if (r.truth((await r.call("is_array", r.get(s, "skilltypeinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "skilltypeinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["stkey"]), k0);
        r.assign(r.slot(s, ["stval"]), v0);
        await r.write("<option value=\"");
        await r.write(r.text(r.get(s, "stkey")));
        await r.write("\" ");
        if (r.truth(r.equal(r.get(s, "stkey"), r.get(s, "maxkind")))) {
          await r.write("selected");
        }
        await r.write(">");
        await r.write(r.text(r.get(s, "stval")));
        await r.write("熟</option>");
      }
    }
  }
  await r.write("</select>\r\n<span class=\"yellow b\">+5</span>点\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">");
  if (r.truth((r.compare(r.get(s, "skillpoint"), 1) >= 0))) {
    await r.write("<input type=\"number\" style=\"width:40px\" id=\"skill78_num\" name=\"skill78_num\" min=\"1\" max=\"");
    await r.write(r.text(r.get(s, "skillpoint")));
    await r.write("\" value=\"1\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill78_special';$('subcmd').value='upgrade';$('skillpara1').value=$('skill78_num').value;$('skillpara2').value=jQuery('#stselect').val();postCmd('gamecmd','command.php');this.disabled=true;\" value=\"使用\">");
  } else {
    await r.write("<input type=\"number\" style=\"width:40px\" disabled=\"true\" value=\"0\">\r\n<input type=\"button\" style=\"width:46px\" disabled=\"true\" value=\"使用\">");
  }
  await r.write("</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
