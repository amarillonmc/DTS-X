// Generated from include/modules/extra/instance/instance_close_button/instance_close_button.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"instance_close_button\" value=\"关闭当前房间\" onclick=\"bubblebox_show('instance_close_box');\">\r\n<form method=\"post\" id=\"instance_close\" name=\"instance_close\" style=\"margin: 0px\" >\r\n<input type=\"hidden\" id=\"dummycommand\" name=\"dummycommand\" value=\"instance_close\">\r\n</form>");
  (await r.call("bubblebox_start", "id:instance_close_box;height:120;width:240;cancellable:1"));
  await r.write("<div style=\"margin:20px;text-align: center;\">\r\n<span class=\"yellow b\" style=\"font-size:14px\">真的要关闭当前房间吗？</span>\r\n</div><div style=\"margin:20px;text-align: center;\">\r\n<a class=\"b_button bc_black\" onclick=\r\n\"if(null!=$('command')) {\r\n$('command').value='instance_close';\r\npostCmd('gamecmd','command.php');\r\n}else{\r\n$('dummycommand').name='command';\r\npostCmd('instance_close','command.php');\r\n}\r\n\"\r\n>是</a>&nbsp;&nbsp;&nbsp;<a class=\"b_button bc_black\" onclick=\"bubblebox_hide_all();\">否</a>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("</div>");
return 1;
}
