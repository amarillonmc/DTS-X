// Generated from include/modules/extra/attr/blessstone/use_blessstone.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" name=\"usemode\" value=\"blessstone\">\r\n<input type=\"hidden\" name=\"itmp\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n你想强化哪一件装备？<br>\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=\"sl('menu');$('mode').value='command';\">返回</a><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth((r.truth((await r.module("itemmain", "check_in_itmsk", "Z", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i"))))))) && r.truth(r.identical((await r.call("strpos", r.get(s, (r.text("itm") + r.text(r.get(s, "i")))), "宝石』")), false)))) && r.truth(r.identical((await r.call("strpos", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i")))), "|")), false))))) {
          await r.write("<input type=\"radio\" name=\"command\" id=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("');$('mode').value='item';\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          await r.write("</a><br>");
        }
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\" value=\"[Z]提交\">");
return 1;
}
