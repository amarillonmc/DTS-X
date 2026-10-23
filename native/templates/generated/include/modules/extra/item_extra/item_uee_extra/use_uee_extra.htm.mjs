// Generated from include/modules/extra/item_extra/item_uee_extra/use_uee_extra.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(s, "ueen")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"uee_extra_cmd\" name=\"uee_extra_cmd\" value=\"2\">\r\n<input type=\"hidden\" id=\"uee_extra_pos\" name=\"uee_extra_pos\" value=\"0\">");
  r.imports(s, "sys", "item_uee_extra");
  r.assign(r.slot(s, ["hack_num"]), (await r.module("item_uee_extra", "uee_extra_get_hack_num")));
  r.assign(r.slot(s, ["hack_state"]), r.get(r.get(s, "gamevars"), "hack_state"));
  r.assign(r.slot(s, ["hack_seq"]), r.get(r.get(s, "gamevars"), "hack_seq"));
  if (r.truth((!r.truth(r.get(s, "uee_extra_pos"))))) {
    await r.write("    屏幕上显示着数个模块的输出情况……都是一些意味不明的天书。<br>");
  } else {
    await r.write("    部分模块的输出改变了……<br><br>");
  }
  await r.write("<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, r.get(s, "hack_num"))))))) {
    {
      const a0 = r.copy((await r.call("range", 1, r.get(s, "hack_num"))));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        await r.write("<span class=\"yellow b\">模块");
        await r.write(r.text(r.get(s, "i")));
        await r.write("</span> 输出：");
        await r.write(r.text(r.get(r.get(s, "uee_extra_words"), r.get(r.get(s, "hack_state"), r.get(r.get(s, "hack_seq"), r.subtract(r.get(s, "i"), 1))))));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br>\r\n<div>要如何破解？<br></div>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, r.get(s, "hack_num"))))))) {
    {
      const a1 = r.copy((await r.call("range", 1, r.get(s, "hack_num"))));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), v1);
        await r.write("<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"");
        await r.write(r.text(r.get(r.get(s, "uee_extra_buttons"), r.subtract(r.get(s, "i"), 1))));
        await r.write("\" onclick=\"$('uee_extra_pos').value='");
        await r.write(r.text(r.get(s, "i")));
        await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回\" onclick=\"$('command').value='back';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
