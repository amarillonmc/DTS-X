// Generated from include/modules/extra/misc/smartmix/itemmix.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" id=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"menu\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"hidden\" id=\"subcmd2\" name=\"subcmd2\" value=\"\">");
  if (r.truth((await r.module("smartmix", "is_lastmix_allowed")))) {
    r.list([r.slot(s, ["lastlist"]), r.slot(s, ["lastres"])], (await r.module("smartmix", "get_lastmix")));
    if (r.truth((!r.truth((!r.truth(r.get(s, "lastlist"))))))) {
      await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"c\" value=\"[C]重复上次操作\" onclick=\"$('command').value='itemmix';$('subcmd').value='lastmix';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<span>上次产物：<span class=\"yellow b\">");
      await r.write(r.text(r.get(r.get(r.get(s, "lastres"), "result"), "0")));
      await r.write("</span></span><br>");
    }
  }
  await r.write("<br>");
  if (r.truth(r.get(s, "itms1"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm1\" name=\"mitm1\" value=\"1\"><a onclick=\"$('mitm1').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm1"), "查公式"))));
    await r.write("</div>");
  }
  if (r.truth(r.get(s, "itms2"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm2\" name=\"mitm2\" value=\"1\"><a onclick=\"$('mitm2').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm2"), "查公式"))));
    await r.write("</div>");
  }
  if (r.truth(r.get(s, "itms3"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm3\" name=\"mitm3\" value=\"1\"><a onclick=\"$('mitm3').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm3"), "查公式"))));
    await r.write("</div>");
  }
  if (r.truth(r.get(s, "itms4"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm4\" name=\"mitm4\" value=\"1\"><a onclick=\"$('mitm4').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm4"), "查公式"))));
    await r.write("</div>");
  }
  if (r.truth(r.get(s, "itms5"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm5\" name=\"mitm5\" value=\"1\"><a onclick=\"$('mitm5').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm5"), "查公式"))));
    await r.write("</div>");
  }
  if (r.truth(r.get(s, "itms6"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm6\" name=\"mitm6\" value=\"1\"><a onclick=\"$('mitm6').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("</a>&nbsp;&nbsp;&nbsp;");
    await r.write(r.text((await r.module("smartmix", "parse_smartmix_recipelink", r.get(s, "itm6"), "查公式"))));
    await r.write("</div>");
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"$('command').value='itemmix';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]放弃\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
