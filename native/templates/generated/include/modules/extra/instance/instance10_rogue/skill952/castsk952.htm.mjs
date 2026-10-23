// Generated from include/modules/extra/instance/instance10_rogue/skill952/castsk952.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill952", "sys", "clubbase");
  r.assign(r.slot(s, ["skill952_itmarr"]), (await r.module("skill952", "skill952_prepare_itmarr")));
  r.assign(r.slot(s, ["skill952_nowcount"]), (await r.call("sizeof", r.get(s, "skill952_itmarr"))));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill952_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"skill952_fetchout\" name=\"skill952_fetchout\" value=\"\">\r\n当前有<span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill952_nowcount")));
  await r.write("</span>个奖励道具未取出<br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill952_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill952_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"取出\" onclick=\"$('skill952_fetchout').value='");
        await r.write(r.text(r.add(r.get(s, "i"), 1)));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br><span class=\"red b\">注意奖励道具最多存放30个，请及时取出。</span><br><br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
