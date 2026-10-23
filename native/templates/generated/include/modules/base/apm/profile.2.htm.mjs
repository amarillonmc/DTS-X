// Generated from include/modules/base/apm/profile.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth(((r.get(s, "vapm") != null)))))) {
    r.list([r.slot(s, ["vapm"]), r.slot(s, ["aapm"])], (await r.module("apm", "calc_apm", r.get(s, "sdata"))));
  }
  await r.write("<span class=\"typename\">APM</span><span class=\"main_cont\" title=\"有效APM / 总APM\">");
  await r.write(r.text(r.get(s, "vapm")));
  await r.write(" / ");
  await r.write(r.text(r.get(s, "aapm")));
  await r.write("</span>");
return 1;
}
