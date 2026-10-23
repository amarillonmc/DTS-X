// Generated from include/modules/extra/card/skills/skill534/castsk534.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill534", "sys", "clubbase");
  r.assign(r.slot(s, ["skill534_itmarr"]), (await r.module("skill534", "skill534_prepare_itmarr")));
  r.assign(r.slot(s, ["skill534_nowcount"]), (await r.call("sizeof", r.get(s, "skill534_itmarr"))));
  r.assign(r.slot(s, ["skill534_size"]), (await r.module("skill534", "skill534_get_packsize")));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill534_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"skill534_sendin\" name=\"skill534_sendin\" value=\"\">\r\n<input type=\"hidden\" id=\"skill534_fetchout\" name=\"skill534_fetchout\" value=\"\">\r\n当前异次元中已存放 <span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "skill534_nowcount")));
  await r.write("/");
  await r.write(r.text(r.get(s, "skill534_size")));
  await r.write("</span> 个道具<br>\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill534_itmarr"))))) {
    {
      const a0 = r.copy(r.get(s, "skill534_itmarr"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"取出\" onclick=\"$('skill534_fetchout').value='");
        await r.write(r.text(r.add(r.get(s, "i"), 1)));
        await r.write("';$('skill534_sendin').value='';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
        await r.write(r.text(r.get(r.get(s, "v"), "itm")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itme")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "itms")));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br><br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]))))) {
    {
      const a1 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), v1);
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))))))) {
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"存入\" onclick=\"$('skill534_fetchout').value='';$('skill534_sendin').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">\r");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("<br>");
return 1;
}
