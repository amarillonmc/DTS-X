// Generated from include/modules/base/opening/cmd_skip_op.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skip_op\">\r\n剧情中……<br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"跳过剧情\" onclick=\"postCmd('gamecmd','command.php');\">");
return 1;
}
