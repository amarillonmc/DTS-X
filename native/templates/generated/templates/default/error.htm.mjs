// Generated from templates/default/error.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<div class=\"subtitle\" style=\"margin:10px 0\">\r\n    ");
  await r.write(r.text(r.get(s, "message")));
  await r.write("</div><div>\r\n    ");
  if (r.truth(r.equal((await r.call("trim", r.get(s, "message"))), r.get(r.get(r.globals, "_ERROR"), "access_disabled")))) {
    await r.write("        <img style=\"width:512px;height:512px\" src=\"img/ERROR_1.png\" />\r\n    ");
  } else {
    await r.write("        <img style=\"width:512px;height:512px\" src=\"img/ERROR_2.png\" />\r\n    ");
  }
  await r.write("</div>");
  if (r.truth(r.get(s, "errorinfo"))) {
    await r.write("file=");
    await r.write(r.text(r.get(s, "file")));
    await r.write("<br \\>line=");
    await r.write(r.text(r.get(s, "line")));
  }
  await r.write("<br>\r\n<form method=\"post\" name=\"backindex\" action=\"index.php\">\r\n<input type=\"submit\" name=\"enter\" value=\"返回首页\">\r\n</form>");
  (await r.include(r.template("footer"), s));
return 1;
}
