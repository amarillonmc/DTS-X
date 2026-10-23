// Generated from include/modules/base/items/radar/radarcmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" name=\"command\" value=\"menu\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\"  value=\"[Z]返回\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
