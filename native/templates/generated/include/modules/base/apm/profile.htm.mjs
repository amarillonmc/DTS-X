// Generated from include/modules/base/apm/profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth(((r.get(s, "vapm") != null)))))) {
    r.list([r.slot(s, ["vapm"]), r.slot(s, ["aapm"])], (await r.module("apm", "calc_apm", r.get(s, "sdata"))));
  }
  await r.write("<td class=\"b2\" height=\"20\"><span>APM</span></td>\r\n<td class=\"b3\" height=\"20\">\r\n<span title=\"有效APM / 总APM\" style=\"white-space: nowrap;\">\r");
  await r.write(r.text(r.get(s, "vapm")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "aapm")));
  await r.write("</span>\r\n</td>");
return 1;
}
