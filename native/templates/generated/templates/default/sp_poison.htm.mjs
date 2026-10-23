// Generated from templates/default/sp_poison.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想检查什么？<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=sl('menu'); href=\"javascript:void(0);\" >返回</a><br><br>");
  if (r.truth((r.truth(r.get(s, "itms1")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk1"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk1"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp1\" value=\"chkp1\"><a onclick=sl('chkp1'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write(" </a><br>");
  }
  if (r.truth((r.truth(r.get(s, "itms2")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk2"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk2"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp2\" value=\"chkp2\"><a onclick=sl('chkp2'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write(" </a><br>");
  }
  if (r.truth((r.truth(r.get(s, "itms3")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk3"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk3"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp3\" value=\"chkp3\"><a onclick=sl('chkp3'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write(" </a><br>");
  }
  if (r.truth((r.truth(r.get(s, "itms4")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk4"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk4"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp4\" value=\"chkp4\"><a onclick=sl('chkp4'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write(" </a><br>");
  }
  if (r.truth((r.truth(r.get(s, "itms5")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk5"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk5"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp5\" value=\"chkp5\"><a onclick=sl('chkp5'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write(" </a><br>");
  }
  if (r.truth((r.truth(r.get(s, "itms6")) && r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk6"), "P")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk6"), "H")), 0))))))) {
    await r.write("<input type=\"radio\" name=\"command\" id=\"chkp6\" value=\"chkp6\"><a onclick=sl('chkp6'); href=\"javascript:void(0);\" >");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write(" </a><br>");
  }
  await r.write("<br><br>\r\n\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
