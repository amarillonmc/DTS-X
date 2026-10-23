// Generated from include/modules/extra/misc/logistics/use_gameitem_recorder.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"item\">\r\n<input type=\"hidden\" name=\"usemode\" value=\"gameitemrecorder\">\r\n<input type=\"hidden\" name=\"itmp\" value=\"");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" name=\"pos\" value=\"1\">\r\n请选择你要记录的道具：<br><br>\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\"><a onclick=\"sl('menu');$('mode').value='command';\">返回</a><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth((!r.identical(r.get(s, "i"), r.get(r.get(s, "theitem"), "itmn")))) && r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i")))))))) {
          r.assign(r.slot(s, ["itmkw"]), (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itmk") + r.text(r.get(s, "i"))))))))) ? (await r.module("itemmain", "parse_itmk_words", r.get(s, (r.text("itmk") + r.text(r.get(s, "i")))), 1)) : ""));
          r.assign(r.slot(s, ["itmskw"]), (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itmsk") + r.text(r.get(s, "i"))))))))) ? (await r.module("itemmain", "parse_itmsk_words", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i")))), 1)) : ""));
          await r.write("<input type=\"radio\" name=\"command\" id=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('itm");
          await r.write(r.text(r.get(s, "i")));
          await r.write("');\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, "itmkw")));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          if (r.truth(r.get(s, "itmskw"))) {
            await r.write("/");
            await r.write(r.text(r.get(s, "itmskw")));
          }
          await r.write("</a><br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n请选择要记录到的位置：<br><br>");
  r.assign(r.slot(s, ["udata"]), (await r.call("fetch_udata_by_username", r.get(s, "name"))));
  r.assign(r.slot(s, ["s_gameitemlist"]), (await r.module("logistics", "get_showcase_gameitemlist_from_udata", r.get(s, "udata"))));
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 4)))))) {
    {
      const a1 = r.copy((await r.call("range", 1, 4)));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["j"]), v1);
        if (r.truth(((r.get(r.get(s, "s_gameitemlist"), r.get(s, "j")) != null)))) {
          r.assign(r.slot(s, ["gi"]), r.get(r.get(s, "s_gameitemlist"), r.get(s, "j")));
          r.assign(r.slot(s, ["itmkw"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "gi"), "1")))))) ? (await r.module("itemmain", "parse_itmk_words", r.get(r.get(s, "gi"), "1"), 1)) : ""));
          r.assign(r.slot(s, ["itmskw"]), (r.truth((!r.truth((!r.truth(r.get(r.get(s, "gi"), "4")))))) ? (await r.module("itemmain", "parse_itmsk_words", r.get(r.get(s, "gi"), "4"), 1)) : ""));
          await r.write("<input type=\"radio\" name=\"pos\" id=\"pos");
          await r.write(r.text(r.get(s, "j")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "j")));
          await r.write("\"><a onclick=\"sl('pos");
          await r.write(r.text(r.get(s, "j")));
          await r.write("');\">");
          await r.write(r.text(r.get(r.get(s, "gi"), "0")));
          await r.write("/");
          await r.write(r.text(r.get(s, "itmkw")));
          await r.write("/");
          await r.write(r.text(r.get(r.get(s, "gi"), "2")));
          await r.write("/");
          await r.write(r.text(r.get(r.get(s, "gi"), "3")));
          if (r.truth(r.get(s, "itmskw"))) {
            await r.write("/");
            await r.write(r.text(r.get(s, "itmskw")));
          }
          await r.write("</a><br>");
        } else {
          await r.write("<input type=\"radio\" name=\"pos\" id=\"pos");
          await r.write(r.text(r.get(s, "j")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "j")));
          await r.write("\"><a onclick=\"sl('pos");
          await r.write(r.text(r.get(s, "j")));
          await r.write("');\">无道具</a><br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
