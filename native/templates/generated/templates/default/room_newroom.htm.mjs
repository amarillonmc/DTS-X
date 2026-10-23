// Generated from templates/default/room_newroom.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:persistent-newroombox;height:350;width:200;scroll-bar:0;cancellable:1;"));
  await r.write("<div id=\"loading\"></div><div style=\"text-align:center;\">\r\n<span style=\"line-height:32px;\">创建新房间：</span>");
  r.global(s, "roomtypelist");
  if (r.truth((await r.call("is_array", r.get(s, "roomtypelist"))))) {
    {
      const a0 = r.copy(r.get(s, "roomtypelist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["i"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((r.truth((await r.call("check_room_available", r.get(s, "value")))) && r.truth((!r.truth(r.get(r.get(s, "value"), "soleroom"))))))) {
          await r.write("<div>");
          r.assign(r.slot(s, ["bname"]), (await r.call("str_replace", "\"", "'", r.get(r.get(s, "value"), "name"))));
          await r.write("<a class=\"b_button bc_black\" onclick=\"\r\nwindow.location.href='roomcmd.php?command=newroom&para1='+");
          await r.write(r.text(r.get(s, "i")));
          await r.write(";\r\n$('loading').style.display='block'\" style=\"margin:3px;width:85px\">");
          await r.write(r.text(r.get(s, "bname")));
          await r.write("</a>\r\n</div>");
        }
      }
    }
  }
  await r.write("</div>");
  (await r.call("bubblebox_end"));
return 1;
}
