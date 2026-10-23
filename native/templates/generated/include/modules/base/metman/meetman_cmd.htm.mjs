// Generated from include/modules/base/metman/meetman_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"返回\" onclick=\"postCmd('gamecmd','command.php');\"><br><br> \r\n");
return 1;
}
