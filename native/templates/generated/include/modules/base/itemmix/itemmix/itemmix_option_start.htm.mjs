// Generated from include/modules/base/itemmix/itemmix/itemmix_option_start.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itemmix\">\r\n<input type=\"hidden\" id=\"mixmask\" name=\"mixmask\" value=\"");
  await r.write(r.text(r.get(r.get(s, "uip"), "mixmask")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"itemselect\" name=\"itemselect\" value=\"-1\">");
return 1;
}
