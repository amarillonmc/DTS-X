// Generated from include/modules/base/itemmix/itemmix/itemmix.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" name=\"command\" id=\"command\" value=\"menu\">\r\n<br>");
  if (r.truth(r.get(s, "itms1"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm1\" name=\"mitm1\" value=\"1\"><a onclick=\"$('mitm1').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("</a></div>");
  }
  if (r.truth(r.get(s, "itms2"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm2\" name=\"mitm2\" value=\"1\"><a onclick=\"$('mitm2').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("</a></div>");
  }
  if (r.truth(r.get(s, "itms3"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm3\" name=\"mitm3\" value=\"1\"><a onclick=\"$('mitm3').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("</a></div>");
  }
  if (r.truth(r.get(s, "itms4"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm4\" name=\"mitm4\" value=\"1\"><a onclick=\"$('mitm4').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("</a></div>");
  }
  if (r.truth(r.get(s, "itms5"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm5\" name=\"mitm5\" value=\"1\"><a onclick=\"$('mitm5').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("</a></div>");
  }
  if (r.truth(r.get(s, "itms6"))) {
    await r.write("<div class=\"slitmsingle\"><input type=\"checkbox\" id=\"mitm6\" name=\"mitm6\" value=\"1\"><a onclick=\"$('mitm6').click();\" href=\"javascript:void(0);\">");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("</a></div>");
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"$('command').value='itemmix';postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]放弃\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
