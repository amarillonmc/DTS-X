// Generated from include/modules/extra/card/skills/skill731/castsk731.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill731", "itemmain");
  (await r.module("skill731", "skill731_refresh_prices"));
  r.assign(r.slot(s, ["skill731_prices"]), r.get(r.get(s, "gamevars"), "skill731_prices"));
  r.assign(r.slot(s, ["skill731_stocks"]), r.get(r.get(s, "gamevars"), "skill731_stocks"));
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill731_special\">\r\n<input type=\"hidden\" id=\"skill731_bitmn\" name=\"skill731_bitmn\" value=\"\">\r\n<input type=\"hidden\" id=\"skill731_sitmn\" name=\"skill731_sitmn\" value=\"\">\r\n<input type=\"hidden\" id=\"skill731_bnum\" name=\"skill731_bnum\" value=\"1\">\r\n<input type=\"hidden\" id=\"skill731_snum\" name=\"skill731_snum\" value=\"1\">\r\n欢迎来到欺货市场！你可以买入或卖出以下道具：<br><br>\r\n<table>\r\n<tbody>");
  if (r.truth((await r.call("is_array", r.get(s, "skill731_itemlist"))))) {
    {
      const a0 = r.copy(r.get(s, "skill731_itemlist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        r.assign(r.slot(s, ["k"]), r.add(r.get(s, "i"), 1));
        if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "skill731_trends"), r.get(s, "i")))))))) {
          r.assign(r.slot(s, ["trends"]), (r.truth((r.compare(r.get(r.get(s, "skill731_trends"), r.get(s, "i")), 0) > 0)) ? "<span class=\"red b\">↑</span>" : (r.truth((r.compare(r.get(r.get(s, "skill731_trends"), r.get(s, "i")), 0) < 0)) ? "<span class=\"lime b\">↓</span>" : "")));
        } else {
          r.assign(r.slot(s, ["trends"]), "");
        }
        await r.write("<tr>\r\n<td style=\"width:90px\">\r\n<input type=\"number\" id=\"num");
        await r.write(r.text(r.get(s, "k")));
        await r.write("\" style=\"width:85px\" value=\"1\" min=\"1\"><br>\r\n<input type=\"button\" style=\"width:40px\" value=\"购买\" onclick=\"$('skill731_bitmn').value='");
        await r.write(r.text(r.get(s, "k")));
        await r.write("';$('skill731_sitmn').value='';$('skill731_bnum').value=$('num");
        await r.write(r.text(r.get(s, "k")));
        await r.write("').value;postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" style=\"width:40px\" value=\"卖出\" onclick=\"$('skill731_sitmn').value='");
        await r.write(r.text(r.get(s, "k")));
        await r.write("';$('skill731_bitmn').value='';$('skill731_snum').value=$('num");
        await r.write(r.text(r.get(s, "k")));
        await r.write("').value;postCmd('gamecmd','command.php');this.disabled=true;\">\r\n</td>\r\n<td>\r");
        await r.write(r.text(r.get(r.get(s, "v"), "0")));
        await r.write("/");
        await r.write(r.text((await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "v"), "1")))));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "2")));
        await r.write("/");
        await r.write(r.text(r.get(r.get(s, "v"), "3")));
        await r.write("/价:");
        await r.write(r.text(r.get(r.get(s, "skill731_prices"), r.get(s, "i"))));
        await r.write(r.text(r.get(s, "trends")));
        await r.write("/剩:");
        await r.write(r.text(r.get(r.get(s, "skill731_stocks"), r.get(s, "i"))));
        await r.write("</td>\r\n</tr>");
      }
    }
  }
  await r.write("<tr>\r\n<td style=\"width:90px\">\r\n<span style=\"font-size:6px\">注：卖出会扣除10%的手续费。</span>\r\n</td>\r\n<td style=\"text-align: center;\">\r\n<span class=\"yellow b\" title=\"");
  await r.write(r.text((await r.module("skill731", "skill731_show_record"))));
  await r.write("\">最近10次交易记录</span>\r\n</td>\r\n</tr>\r\n</tbody>\r\n</table>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
