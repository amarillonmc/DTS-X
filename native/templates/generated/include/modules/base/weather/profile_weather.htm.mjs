// Generated from include/modules/base/weather/profile_weather.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weather");
  await r.write("<td colspan=\"2\" class=\"b1\"><span>天气:");
  await r.write(r.text(r.get(r.get(s, "wthinfo"), r.get(s, "weather"))));
  await r.write("</span></td>");
return 1;
}
