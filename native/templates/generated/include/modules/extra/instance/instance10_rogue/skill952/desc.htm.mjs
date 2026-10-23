// Generated from include/modules/extra/instance/instance10_rogue/skill952/desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill952", "sys", "clubbase");
  r.assign(r.slot(s, ["___TEMP_SKILL_ID"]), 952);
  r.assign(r.slot(s, ["skill952_itmarr"]), (await r.module("skill952", "skill952_prepare_itmarr", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill952_nowcount"]), (await r.call("sizeof", r.get(s, "skill952_itmarr"))));
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_START"), s));
  await r.write("<span>\r");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "___TEMP_SKILL_ID"))));
  await r.write("</span>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID1"), s));
  await r.write("<td class=\"skilldesc_left b3\"><span class=\"skilldesc\">\r\n当前有<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill952_nowcount")));
  await r.write("</span>个奖励道具未取出<br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill952_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill952_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<span class=\"cyan b\">");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write(" / ");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write(" / ");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("</span><br>");
      }
    }
  }
  await r.write("</span></td>\r\n<td class=\"skilldesc_right b3\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"sp_castsk952\"  value=\"取出道具\" onclick=\"$('mode').value='special';$('command').value='skill952_special';$('subcmd').value='show';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</td>");
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_MID2"), s));
  if (r.truth((!r.truth(r.get(s, "___TEMP_THIS_SKILL_ACQUIRED"))))) {
    await r.write("<span class=\"yellow b\">\r\n</span>");
  }
  (await r.include(r.template("MOD_CLUBBASE_SKILLDESC_END"), s));
return 1;
}
