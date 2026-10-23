// Generated from include/modules/extra/instance/instance_quit_button/instance_quit_button.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"instance_quit_button\" value=\"退出房间\" onclick=\"bubblebox_show('instance_quit_box');\">\r\n<form method=\"post\" id=\"instance_quit\" name=\"instance_quit\" style=\"margin: 0px\" >\r\n<input type=\"hidden\" id=\"dummycommand\" name=\"dummycommand\" value=\"instance_quit\">\r\n</form>");
  (await r.call("bubblebox_start", "id:instance_quit_box;height:125;width:240;cancellable:1"));
  await r.write("<div style=\"margin:20px;text-align: center;\">\r\n<span class=\"yellow b\" style=\"font-size:14px\">\r\n真的要退出当前房间吗？");
  if (r.truth((await r.call("in_array", (await r.call("get_var_in_module", "gametype", "sys")), (await r.call("get_var_in_module", "gametype_delete_player_after_quit", "instance_quit_button")))))) {
    await r.write("<br>你的角色将会被删除！");
  }
  await r.write("</span>\r\n</div><div style=\"margin:20px;text-align: center;\">\r\n<a class=\"b_button bc_black\" onclick=\r\n\"if(null!=$('command')) {\r\n$('command').value='instance_quit';\r\npostCmd('gamecmd','command.php');\r\n}else{\r\n$('dummycommand').name='command';\r\npostCmd('instance_quit','command.php');\r\n}\r\n\"\r\n>是</a>&nbsp;&nbsp;&nbsp;<a class=\"b_button bc_black\" onclick=\"bubblebox_hide_all();\">否</a>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("</div>");
return 1;
}
