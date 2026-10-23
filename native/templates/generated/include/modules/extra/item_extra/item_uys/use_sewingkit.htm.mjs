// Generated from include/modules/extra/item_extra/item_uys/use_sewingkit.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"item\">\r\n<input type=\"hidden\" name=\"usemode\" value=\"sewingkit\">\r\n<input type=\"hidden\" name=\"itmp\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n请选择你打算强化的防具：<br><br>\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=\"sl('menu');\">返回</a><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.identical(0, (await r.call("strpos", r.get(s, (r.text("itmk") + r.text(r.get(s, "i")))), "D"))))) {
          await r.write("<input type=\"radio\" name=\"command\" id=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("');\">");
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
  await r.write("<br><br>\r\n要强化的次数：\r\n<input type=\"number\" name=\"sknum\" style=\"width:60px\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itms")));
  await r.write("\" min=\"1\" max=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itms")));
  await r.write("\">\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
