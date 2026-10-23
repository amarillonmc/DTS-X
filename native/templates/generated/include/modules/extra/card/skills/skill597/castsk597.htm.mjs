// Generated from include/modules/extra/card/skills/skill597/castsk597.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill597", "sys", "clubbase");
  r.assign(r.slot(s, ["skill597_itmarr"]), (await r.module("skill597", "skill597_prepare_itmarr")));
  r.assign(r.slot(s, ["skill597_nowcount"]), (await r.call("sizeof", r.get(s, "skill597_itmarr"))));
  r.assign(r.slot(s, ["skill597_size"]), (await r.module("skill597", "skill597_get_packsize")));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill597_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"skill597_empty\" name=\"skill597_empty\" value=\"\">\r\n<input type=\"hidden\" id=\"skill597_fetchout\" name=\"skill597_fetchout\" value=\"\">\r\n\r\n推车中已存放<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill597_nowcount")));
  await r.write("/");
  await r.write(r.text(r.get(s, "skill597_size")));
  await r.write("</span>个道具<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill597_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill597_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"取出\" onclick=\"$('skill597_fetchout').value='");
        await r.write(r.text(r.add(r.get(s, "i"), 1)));
        await r.write("';$('skill597_empty').value='';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"清空推车\" onclick=\"$('skill597_empty').value='1';$('skill597_fetchout').value='';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n");
return 1;
}
