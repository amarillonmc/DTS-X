// Generated from include/modules/base/weapon/weapon/profile_wepskill.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "weapon");
  r.assign(r.slot(s, ["tmp_wskill_i"]), 0);
  await r.write("<div class=\"profile_row\">");
  if (r.truth((await r.call("is_array", r.get(s, "skilltypeinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "skilltypeinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth((await r.call("in_array", r.get(s, "key"), r.get(s, "skillinfo"))))) {
          r.post(r.slot(s, ["tmp_wskill_i"]), 1);
          await r.write("<div class=\"profile_bar\">\r\n<span class=\"typename\">");
          await r.write(r.text(r.get(s, "value")));
          await r.write("熟</span>\r\n<span class=\"main_cont\"><span");
          if (r.truth((r.compare(r.get(s, r.get(s, "key")), 500) >= 0))) {
            await r.write(" class=\"yellow b\"");
          } else {
            if (r.truth((r.compare(r.get(s, r.get(s, "key")), 100) < 0))) {
              await r.write(" class=\"grey b\"");
            }
          }
          await r.write(">");
          await r.write(r.text(r.get(s, r.get(s, "key"))));
          await r.write("</span></span>\r\n</div>");
          if (r.truth(r.equal(r.modulo(r.get(s, "tmp_wskill_i"), 3), 0))) {
            await r.write("</div><div class=\"profile_row\">");
          }
        }
      }
    }
  }
  await r.write("</div>");
return 1;
}
