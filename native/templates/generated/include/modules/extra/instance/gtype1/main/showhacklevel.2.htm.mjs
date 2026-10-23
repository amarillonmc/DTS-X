// Generated from include/modules/extra/instance/gtype1/main/showhacklevel.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<span class=\"typename\">除错层数</span><span class=\"main_cont orange\">");
  await r.write(r.text((await r.module("skillbase", "skill_getvalue", 424, "lvl"))));
  await r.write("</span>");
return 1;
}
