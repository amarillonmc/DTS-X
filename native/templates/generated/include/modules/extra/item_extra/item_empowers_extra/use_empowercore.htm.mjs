// Generated from include/modules/extra/item_extra/item_empowers_extra/use_empowercore.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "item_empowers_extra");
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(r.get(s, "theitem"), "itmn")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"ec_choice\" name=\"ec_choice\" value=\"0\">");
  r.assign(r.slot(s, ["ec_lvl"]), (await r.module("item_empowers_extra", "get_ec_lvl", r.get(s, "itmsk"))));
  await r.write("你可以选择一项以强化你的武器：<br><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 3)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 3)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
        await r.write(r.text(r.get(r.get(r.get(s, "ec_words"), r.get(s, "ec_lvl")), r.get(s, "i"))));
        await r.write("\" style=\"width: 120px\" onclick=\"$('ec_choice').value='");
        await r.write(r.text(r.get(s, "i")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
