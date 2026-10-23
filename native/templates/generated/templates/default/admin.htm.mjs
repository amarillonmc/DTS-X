// Generated from templates/default/admin.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<center>\r\n<div class=\"subtitle\" >游戏管理</div><div><span class=\"yellow b\">");
  await r.write(r.text(r.get(r.get(s, "lang"), "mygroup")));
  await r.write(" ");
  await r.write(r.text(r.get(s, "mygroup")));
  await r.write("</span></div><div style=\"margin:12px 0;\"><span class=\"yellow b\">");
  await r.write(r.text(r.get(s, "cmd_info")));
  await r.write("</span></div>");
  if (r.truth(r.get(s, "showdata"))) {
    await r.write(r.text(r.get(s, "showdata")));
    await r.write("<div>\r\n<form method=\"post\" name=\"goto_menu\" action=\"admin.php\">\r\n<input type=\"submit\" name=\"enter\" value=\"");
    await r.write(r.text(r.get(r.get(s, "lang"), "goto_menu")));
    await r.write("\">\r\n</form>\r\n</div>");
  } else {
    (await r.include(r.template("admin_menu"), s));
  }
  await r.write("</center>");
  (await r.include(r.template("footer"), s));
return 1;
}
