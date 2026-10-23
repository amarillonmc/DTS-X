// Generated from include/modules/base/weather/profile_weather.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weather");
  await r.write("<span class=\"typename\">天气</span><span class=\"main_cont\">");
  await r.write(r.text(r.get(r.get(s, "wthinfo"), r.get(s, "weather"))));
  await r.write("</span>");
return 1;
}
