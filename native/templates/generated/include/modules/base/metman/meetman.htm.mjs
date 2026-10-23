// Generated from include/modules/base/metman/meetman.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "metman");
  await r.write("<table border=\"0\" width=720px height=420px cellspacing=\"0\" cellpadding=\"0\" valign=\"middle\">\r\n<TR align=\"center\" >\r\n<TD valign=\"middle\" class=\"b5\">");
  (await r.include(r.template("MOD_METMAN_UI_MAIN"), s));
  await r.write("</TD>\r\n</TR>\r\n</table>\r\n");
return 1;
}
