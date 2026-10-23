// Generated from templates/default/winner.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<script type=\"text/javascript\" src=\"include/javascript/replay.20231107.js\"></script>\r\n<span class=\"subtitle\">历史优胜者");
  if (r.truth((await r.call("room_check_subroom", r.get(s, "room_prefix"))))) {
    if (r.truth(r.equal((await r.call("room_prefix_kind", r.get(s, "room_prefix"))), "n"))) {
      await r.write("&nbsp;-&nbsp;新手区");
    } else {
      if (r.truth(r.equal((await r.call("room_prefix_kind", r.get(s, "room_prefix"))), "s"))) {
        await r.write("&nbsp;-&nbsp;房间区");
      }
    }
  } else {
    await r.write("&nbsp;-&nbsp;标准区");
  }
  await r.write("</span>\r\n<div style=\"position:relative\">\r\n<div id=\"loading\"></div>");
  if (r.truth(r.equal(r.get(s, "command"), "info"))) {
    (await r.include(r.template("winnerinfo"), s));
  } else {
    if (r.truth(r.equal(r.get(s, "command"), "news"))) {
      await r.write("<form method=\"post\" name=\"info\" action=\"winner.php\">\r\n<input type=\"submit\" value=\"返回优胜列表\">\r\n<div align=\"left\">\r");
      await r.write(r.text(r.get(s, "hnewsinfo")));
      await r.write("</div>\r\n<input type=\"submit\" value=\"返回优胜列表\">\r\n</form>");
    } else {
      (await r.include(r.template("winnerlist"), s));
    }
  }
  await r.write("</div>");
  (await r.include(r.template("footer"), s));
return 1;
}
