// Generated from include/modules/base/itemshop/sp_shop.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想购买什么物品？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"离开\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<br>");
  r.assign(r.slot(s, ["list"]), (await r.module("itemshop", "get_shop_tag_list")));
  if (r.truth((await r.call("is_array", r.get(s, "list"))))) {
    {
      const a0 = r.copy(r.get(s, "list"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["sid"]), k0);
        r.assign(r.slot(s, ["scmt"]), v0);
        if (r.truth(r.modulo(r.get(s, "sid"), 2))) {
          await r.write("<br>");
        }
        await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"bshop");
        await r.write(r.text(r.get(s, "sid")));
        await r.write("\" value=\"");
        await r.write(r.text(r.get(s, "scmt")));
        await r.write("\" style=\"");
        if (r.truth((r.compare((await r.call("mb_strlen", r.get(s, "scmt"))), 8) > 0))) {
          await r.write("width:160px;");
        } else {
          await r.write("width:120px;");
        }
        await r.write(" ");
        if (r.truth(r.equal(r.get(s, "sid"), 17))) {
          await r.write("background-image:url(img/backround2.gif) repeat-x");
        } else {
          if (r.truth((r.truth((r.truth((r.truth(r.equal(r.get(s, "sid"), 13)) || r.truth(r.equal(r.get(s, "sid"), 14)))) || r.truth(r.equal(r.get(s, "sid"), 15)))) || r.truth(r.equal(r.get(s, "sid"), 16))))) {
            await r.write("background-image:url(img/backround3.gif) repeat-x");
          } else {
            if (r.truth(r.equal(r.get(s, "sid"), 18))) {
              await r.write("background-image:url(img/backround9.gif) repeat-x");
            }
          }
        }
        await r.write("\" \r\nonclick=\"$('command').value='shop");
        await r.write(r.text(r.get(s, "sid")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
      }
    }
  }
return 1;
}
