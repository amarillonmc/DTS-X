// Generated from templates/default/alive.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div id=\"notice\"></div><div id=\"aliveinfo\">\r\n<center>\r\n<span class=\"subtitle\">幸存者一览</span>\r\n<form method=\"post\" name=\"alive\" onSubmit=\"return false;\">\r\n<input type=\"hidden\" id=\"alivemode\" name=\"alivemode\" value=\"last\">\r\n<input type=\"button\"  value=\"显示前");
  await r.write(r.text(r.get(s, "alivelimit")));
  await r.write("名幸存者\" onClick=\"$('alivemode').value='last';postCmd('alive','alive.php');\">\r\n<input type=\"button\"  value=\"显示全部幸存者\" onClick=\"$('alivemode').value='all';postCmd('alive','alive.php');\">\r\n</form>\r\n<div id=\"alivelist\">");
  (await r.include(r.template("alivelist"), s));
  await r.write("</div>\r\n<form method=\"post\" name=\"backindex\" action=\"index.php\">\r\n<input type=\"submit\" name=\"enter\" value=\"返回首页\">\r\n</form>\r\n</center>\r\n</div>");
  (await r.include(r.template("footer"), s));
return 1;
}
