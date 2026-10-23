// Generated from templates/default/sp_tac.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("想采取什么应战策略？<br>\r\n\r\n<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"radio\" name=\"command\" id=\"menu\" value=\"menu\" checked><a onclick=sl('menu'); href=\"javascript:void(0);\" >返回</a><br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "tacinfo"))))) {
    {
      const a0 = r.copy(r.get(s, "tacinfo"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["key"]), k0);
        r.assign(r.slot(s, ["value"]), v0);
        if (r.truth(r.get(s, "value"))) {
          await r.write("<input type=\"radio\" name=\"command\" id=\"tac");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\" value=\"tac");
          await r.write(r.text(r.get(s, "key")));
          await r.write("\"><a onclick=sl('tac");
          await r.write(r.text(r.get(s, "key")));
          await r.write("'); href=\"javascript:void(0);\" >");
          await r.write(r.text(r.get(s, "value")));
          await r.write(" </a><br>");
        }
      }
    }
  }
  await r.write(" \r\n\r\n");
return 1;
}
