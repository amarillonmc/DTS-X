// Generated from templates/default/move.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<option value=\"main\">■ 移动 ■</option>\r\n<optgroup label=\"移动地点列表：\">");
  if (r.truth((await r.call("is_array", r.get(s, "plsinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "plsinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((await r.module("map", "check_can_enter", r.get(s, "key"))))) {
          if (r.truth(r.equal(r.get(s, "pls"), r.get(s, "key")))) {
            await r.write("<optgroup label=\"■ 现在位置 ■\">");
          } else {
            await r.write("<option value=\"");
            await r.write(r.text(r.get(s, "key")));
            await r.write("\">");
            await r.write(r.text(r.get(s, "value")));
            await r.write("(");
            await r.write(r.text(r.get(r.get(s, "xyinfo"), r.get(s, "key"))));
            await r.write(")</option>");
          }
        }
      }
    }
  }
return 1;
}
