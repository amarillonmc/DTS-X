// Generated from include/modules/base/items/poison/poison.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"item\">\r\n<input type=\"hidden\" name=\"usemode\" value=\"poison\">\r\n<input type=\"hidden\" name=\"itmp\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"menu\">\r\n你想对什么下毒？<br>\r\n<br>");
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk1"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk1"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm1';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("\"><br>");
  }
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk2"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk2"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm2';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("\"><br>");
  }
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk3"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk3"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm3';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("\"><br>");
  }
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk4"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk4"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm4';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("\"><br>");
  }
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk5"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk5"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm5';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("\"><br>");
  }
  if (r.truth((r.truth(r.identical((await r.call("strpos", r.get(s, "itmk6"), "H")), 0)) || r.truth(r.identical((await r.call("strpos", r.get(s, "itmk6"), "P")), 0))))) {
    await r.write("<input type=\"button\" onclick=\"$('command').value='itm6';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("\"><br>");
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\" value=\"放弃\">");
return 1;
}
