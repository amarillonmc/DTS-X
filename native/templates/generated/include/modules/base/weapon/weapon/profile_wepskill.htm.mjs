// Generated from include/modules/base/weapon/weapon/profile_wepskill.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weapon");
  if (r.truth((await r.call("is_array", r.get(s, "skilltypeinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "skilltypeinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((await r.call("in_array", r.get(s, "key"), r.get(s, "skillinfo"))))) {
          await r.write("<tr>\r\n<td class=\"b2\" height=\"20\">");
          if (r.truth((r.compare(r.get(s, r.get(s, "key")), 100) >= 0))) {
            await r.write("<span id=\"");
            await r.write(r.text(r.get(s, "key")));
            await r.write("\">");
            await r.write(r.text(r.get(s, "value")));
            await r.write("熟</span>");
          } else {
            await r.write("<span id=\"");
            await r.write(r.text(r.get(s, "key")));
            await r.write("\" class=\"grey b\">");
            await r.write(r.text(r.get(s, "value")));
            await r.write("熟</span>");
          }
          await r.write("</td>\r\n<td class=\"b3\" height=\"20\"><span id=\"");
          await r.write(r.text(r.get(s, "key")));
          await r.write("v\">");
          (await r.write(r.text(r.get(s, r.get(s, "key")))));
          await r.write("</span></td>\r\n</tr>");
        }
      }
    }
  }
return 1;
}
