// Generated from templates/default/areainfo.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<span class=\"evergreen b\"><b>现在的禁区是：</b></span>");
  if (r.truth((await r.call("is_array", (await r.module("map", "get_current_area")))))) {
    {
      const a0 = r.copy((await r.module("map", "get_current_area")));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("&nbsp;");
        await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(s, "i"))));
      }
    }
  }
  await r.write("<br><span class=\"evergreen b\"><b>下回的禁区是：</b></span>");
  await r.write(r.text((await r.module("map", "get_next_areadata_html"))));
return 1;
}
