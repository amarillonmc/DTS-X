// Generated from templates/2/cmd_interface.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"command_box\">\r\n<div id=\"log\"");
  if (r.truth((r.truth((r.compare(r.get(s, "hp"), 0) > 0)) || r.truth((await r.call("defined", "IN_REPLAY")))))) {
    await r.write(" class=\"log_block\"");
  }
  await r.write(">");
  await r.write(r.text(r.get(s, "log")));
  await r.write("</div>\r\n<script>log_display='block';</script>\r\n<div style=\"position:relative\">\r\n<!--<div id=\"loading\"></div>-->\r\n<form method=\"post\" id=\"gamecmd\" name=\"gamecmd\" style=\"margin: 0px\" >\r\n<div id=\"cmd_extrahead\">\r\n<input type=\"hidden\" id=\"oprecorder\" name=\"oprecorder\" value=\"\">\r\n<input type=\"hidden\" id=\"game_roomid\" name=\"game_roomid\" value=\"");
  await r.write(r.text(r.get(s, "room_id")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"templateid\" name=\"templateid\" value=\"");
  await r.write(r.text(r.get(s, "u_templateid")));
  await r.write("\">\r\n</div><div id=\"cmd\">");
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
  await r.write("</div>\t\t\t\t\t\t\r\n</form>\r\n</div>\r\n</div>");
return 1;
}
