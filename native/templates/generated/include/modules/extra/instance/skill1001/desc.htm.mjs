// Generated from include/modules/extra/instance/skill1001/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 1001);
  r.assign(r.slot(s, ["___TEMP_SKILL_VAR_1001"]), (await r.module("skillbase", "skill_getvalue", 1001, "skillup")));
  r.imports(s, "weapon");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r\n空降\r\n</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n一次性技能。选择\r\n<select id=\"skill1001sl\" name=\"skill1001sl\">");
  if (r.truth((await r.call("is_array", r.get(s, "skilltypeinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "skilltypeinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["stkey"]), k0);
        r.assign(r.slot(s, ["stval"]), v0);
        await r.write("<option value=\"");
        await r.write(r.text(r.get(s, "stkey")));
        await r.write("\">");
        await r.write(r.text(r.get(s, "stval")));
        await r.write("系</option>");
      }
    }
  }
  await r.write("</select>\r\n获得<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "___TEMP_SKILL_VAR_1001")));
  await r.write("</span>点熟练度。\r\n</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" style=\"width:46px\" onclick=\"$('mode').value='special';$('command').value='skill1001_special';$('subcmd').value=jQuery('#skill1001sl  option:selected').val();postCmd('gamecmd','command.php');this.disabled=true;\" value=\"发动\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
