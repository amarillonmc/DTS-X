// Generated from include/modules/extra/activities/aprilfool2018/skill365/ranking.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<table width=390>\r\n<tr>\r\n<td class='b1' width=50>\r\n排名\r\n</td>\r\n<td class='b1' width=220>\r\n用户名\r\n</td>\r\n<td class='b1' width=120>\r\n分数\r\n</td>\r\n</tr>");
  r.assign(r.slot(s, ["i"]), 1);
  if (r.truth((await r.call("is_array", r.get(s, "adata"))))) {
    {
      const a0 = r.copy(r.get(s, "adata"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["ad"]), v0);
        await r.write("<tr>\r\n<td class='b3'>\r");
        await r.write(r.text(r.get(s, "i")));
        await r.write("</td>\r\n<td class='b3'>\r");
        await r.write(r.text(r.get(r.get(s, "ad"), "username")));
        await r.write("</td>\r\n<td class='b3'>\r");
        await r.write(r.text(r.get(r.get(s, "ad"), "score1")));
        await r.write("</td>\r\n</tr>");
        r.post(r.slot(s, ["i"]), 1);
      }
    }
  }
  await r.write("</table>");
return 1;
}
