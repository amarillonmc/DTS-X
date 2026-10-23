// Generated from include/modules/base/wound/wound_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "wound");
  await r.write("<td width=\"110\" height=\"20\" colspan=\"2\" style=\"text-align:center;\">");
  if (r.truth((!r.truth(r.get(s, "hp"))))) {
    await r.write("<span class=\"red b\">\r\n已死亡\r\n</span>");
  } else {
    if (r.truth((!r.truth(r.get(s, "inf"))))) {
      await r.write("<span>\r\n</span>");
    } else {
      await r.write("<span class=\"grey b\">\r\n受伤和异常状态\r\n</span>");
    }
  }
  await r.write("</td>\r\n<td width=\"114\" height=\"20\" colspan=\"2\" style=\"text-align:center;\">\r\n<span>");
  if (r.truth(r.get(s, "inf"))) {
    if (r.truth((await r.call("is_array", r.get(s, "infinfo"))))) {
      {
        const a0 = r.copy(r.get(s, "infinfo"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), k0);
          r.assign(r.slot(s, ["val"]), v0);
          if (r.truth((!r.identical((await r.call("strpos", r.get(s, "inf"), r.get(s, "key"))), false)))) {
            await r.write(r.text(r.get(s, "val")));
          }
        }
      }
    }
  } else {
  }
  await r.write("</span>\r\n</td>");
return 1;
}
