// Generated from include/modules/extra/misc/bubblebox/end.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("</div>\r\n</div>\r\n</div>\r\n</div>\r\n</div>");
return 1;
}
