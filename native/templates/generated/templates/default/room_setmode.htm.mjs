// Generated from templates/default/room_setmode.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:persistent-rmeditbox;height:280;width:200;scroll-bar:0;"));
  await r.write("<div id=\"loading3\"></div><div style=\"text-align:center;\">\r\n<span style=\"line-height:32px;\">设置游戏模式：</span>");
  r.global(s, "roomtypelist");
  if (r.truth((await r.call("is_array", r.get(s, "roomtypelist"))))) {
    {
      const a0 = r.copy(r.get(s, "roomtypelist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((r.truth((r.truth((await r.call("check_room_available", r.get(s, "value")))) && r.truth((!r.truth(r.get(r.get(s, "value"), "soleroom")))))) && r.truth((!r.truth(r.get(r.get(s, "value"), "without-ready"))))))) {
          await r.write("<div>");
          r.assign(r.slot(s, ["bname"]), (await r.call("str_replace", "\"", "'", r.get(r.get(s, "value"), "name"))));
          await r.write("<a class=\"b_button bc_black\" onclick=\"\r\n$('loading3').style.display='block';\r\n$('command').value='rmsetmode';\r\n$('para1').value=");
          await r.write(r.text(r.get(s, "i")));
          await r.write("; \r\npostCmd('roomcmd','roomcmd.php'); \r\nsleep(1000);\r\nbubblebox_show('persistent-roommain');\r\n$('loading3').style.display='none';\r\n\" style=\"margin:3px;width:85px\">");
          await r.write(r.text(r.get(s, "bname")));
          await r.write("</a>\r\n</div>");
        }
      }
    }
  }
  await r.write("<div>\r\n<a class=\"b_button bc_black\" onclick=\"bubblebox_show('persistent-roommain');\" style=\"margin:3px;width:85px\">返回</a>\r\n</div>\r\n</div>");
  (await r.call("bubblebox_end"));
return 1;
}
