// Generated from include/modules/extra/card/skills/skill728/castsk728.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill728_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk728\">\r\n“喵，可以把任意数量的金钱放进来喵。投入的金钱有一半概率<span class=\"yellow b\">翻倍</span>，也有一半概率<span class=\"red b\">消失</span>喵。”<br><br>\r\n请输入要投入的金钱：<br>\r\n<input type=\"number\" name=\"skill728_cost\" style=\"width:120px\" value=\"1\" min=\"1\" max=\"");
  await r.write(r.text(r.get(s, "money")));
  await r.write("\">\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
