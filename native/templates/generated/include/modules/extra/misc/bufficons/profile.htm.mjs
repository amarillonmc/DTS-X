// Generated from include/modules/extra/misc/bufficons/profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div>\r\n<table CellSpacing=0 CellPadding=0 style=\"margin-left:auto;margin-right:auto;\"><tr>");
  if (r.truth(r.get(s, "hp"))) {
    (await r.module("bufficons", "bufficons_display"));
  }
  await r.write("</tr></table>\r\n</div>");
return 1;
}
