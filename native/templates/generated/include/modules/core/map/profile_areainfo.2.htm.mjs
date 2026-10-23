// Generated from include/modules/core/map/profile_areainfo.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "area_timing"), "on"))) {
    await r.write("<span class=\"typename\">距离禁区</span><span id=\"area_timing\" class=\"main_cont\">");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "area_timing"), "timing_r")));
    await r.write("</span>");
  } else {
    await r.write("<span class=\"typename\">距离禁区</span><span id=\"area_timing\" class=\"main_cont\">????</span>");
  }
  await r.write(" ");
  if (r.truth(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "area_timing"), "on"))) {
    await r.write("<script type=\"text/javascript\">updateTime('area_timing', ");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "area_timing"), "timing")));
    await r.write(", 0);</script>");
  }
  await r.write(" ");
return 1;
}
