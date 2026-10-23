// Generated from templates/default/cmd_interface.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table border=\"0\" width=\"310\" height=\"560\" cellspacing=\"0\" cellpadding=\"0\" >\r\n<tr>\r\n<td height=\"20\" class=\"b1\">\r\n<div>\r\n<span class=\"yellow b\" id=\"pls\">");
  await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "pls"))));
  await r.write("</span>【<span class=\"red b\">剩余：<span id=\"anum\">");
  await r.write(r.text((await r.module("player", "get_alivenum_for_display"))));
  await r.write("</span>人</span>】\r\n</div>\r\n</td>\r\n</tr>\r\n<tr>\r\n<td valign=\"top\" class=\"b3\" style=\"position:relative;\">\r\n<div id=\"cmd_container\" class=\"gscroll\" style=\"min-height:570px; max-height:630px; text-align: left; overflow:auto; overflow-x:hidden; \">\r\n<div id=\"log\" style=\"height:100px;display:table-cell;vertical-align:middle;\">");
  await r.write(r.text(r.get(s, "log")));
  await r.write("</div>\r\n<script>log_display='table-cell';</script>\r\n<div style=\"position:relative\">\r\n<!--<div id=\"loading\"></div>-->\r\n<form method=\"post\" id=\"gamecmd\" name=\"gamecmd\" style=\"margin: 0px\" >\r\n<div id=\"cmd_extrahead\">\r\n<input type=\"hidden\" id=\"oprecorder\" name=\"oprecorder\" value=\"\">\r\n<input type=\"hidden\" id=\"game_roomid\" name=\"game_roomid\" value=\"");
  await r.write(r.text(r.get(s, "room_id")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"templateid\" name=\"templateid\" value=\"");
  await r.write(r.text(r.get(s, "u_templateid")));
  await r.write("\">\r\n</div><div id=\"cmd\" class=\"rotater\">");
  if (r.truth((r.compare(r.get(s, "hp"), 0) <= 0))) {
    (await r.include(r.template("death"), s));
  } else {
    if (r.truth((r.truth(r.equal(r.get(s, "gametype"), 17)) && r.truth((await r.call("defined", "MOD_TUTORIAL")))))) {
      (await r.include(r.template("MOD_TUTORIAL_TUTORIAL"), s));
    } else {
      if (r.truth((r.truth((r.compare(r.get(s, "state"), 1) >= 0)) && r.truth((r.compare(r.get(s, "state"), 3) <= 0))))) {
        (await r.include(r.template("rest"), s));
      } else {
        if (r.truth(r.get(s, "itms0"))) {
          (await r.include(r.template("MOD_ITEMMAIN_ITEMFIND"), s));
        } else {
          if (r.truth(r.get(s, "cmd"))) {
            await r.write(r.text(r.get(s, "cmd")));
          } else {
            (await r.include(r.template("command"), s));
          }
        }
      }
    }
  }
  await r.write("</div>\t\t\t\t\t\t\r\n</form>\r\n</div>\r\n</div>\r\n</td>\r\n</tr>\r\n</table>");
return 1;
}
