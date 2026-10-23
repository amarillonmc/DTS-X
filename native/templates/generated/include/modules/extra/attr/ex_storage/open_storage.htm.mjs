// Generated from include/modules/extra/attr/ex_storage/open_storage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"storage\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"pos\" name=\"pos\" value=\"0\">\r\n<input type=\"hidden\" id=\"storage_sendin\" name=\"storage_sendin\" value=\"\">\r\n<input type=\"hidden\" id=\"storage_fetchout\" name=\"storage_fetchout\" value=\"\">\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<br>\r\n<br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]))))) {
    {
      const a0 = r.copy(r.array([[r.APPEND, "wep"], [r.APPEND, "arb"], [r.APPEND, "arh"], [r.APPEND, "ara"], [r.APPEND, "arf"], [r.APPEND, "art"]]));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["ipos"]), v0);
        if (r.truth((await r.module("itemmain", "check_in_itmsk", "^st", r.get(s, (r.text(r.get(s, "ipos")) + r.text("sk"))))))) {
          r.assign(r.slot(s, ["storage_itmarr"]), (await r.module("ex_storage", "get_item_storage", r.get(s, (r.text(r.get(s, "ipos")) + r.text("sk"))))));
          r.assign(r.slot(s, ["stcount"]), (await r.call("sizeof", r.get(s, "storage_itmarr"))));
          r.assign(r.slot(s, ["vol"]), r.int((await r.module("itemmain", "check_in_itmsk", "^vol", r.get(s, (r.text(r.get(s, "ipos")) + r.text("sk")))))));
          await r.write("<span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "sdata"), r.get(s, "ipos"))));
          await r.write("</span>中已存放 <span class=\"yellow b\">");
          await r.write(r.text(r.get(s, "stcount")));
          await r.write("/");
          await r.write(r.text(r.get(s, "vol")));
          await r.write("</span> 个道具<br>");
          if (r.truth((await r.call("is_array", r.get(s, "storage_itmarr"))))) {
            {
              const a1 = r.copy(r.get(s, "storage_itmarr"));
              for (const [k1, v1] of r.entries(a1)) {
              r.assign(r.slot(s, ["i"]), k1);
                r.assign(r.slot(s, ["v"]), v1);
                await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"取出\" onclick=\"$('storage_fetchout').value='");
                await r.write(r.text(r.add(r.get(s, "i"), 1)));
                await r.write("';$('storage_sendin').value='';$('pos').value='");
                await r.write(r.text(r.get(s, "ipos")));
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
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("<br><br>");
  if (r.truth((await r.call("is_array", r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]))))) {
    {
      const a2 = r.copy(r.array([[r.APPEND, 1], [r.APPEND, 2], [r.APPEND, 3], [r.APPEND, 4], [r.APPEND, 5], [r.APPEND, 6]]));
      for (const [k2, v2] of r.entries(a2)) {
        r.assign(r.slot(s, ["i"]), v2);
        if (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))))))) {
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"存入\" onclick=\"$('storage_fetchout').value='';$('storage_sendin').value='");
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
