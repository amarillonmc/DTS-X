// Generated from include/modules/extra/card/skills/skill733/castsk733.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "skill733");
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill733_special\">\r\n请选择要抽取的扭蛋：<br><br>");
  if (r.truth((await r.call("is_array", r.get(s, "skill733_gachalist"))))) {
    {
      const a0 = r.copy(r.get(s, "skill733_gachalist"));
      for (const [k0, v0] of r.entries(a0)) {
      r.assign(r.slot(s, ["k"]), k0);
        r.assign(r.slot(s, ["v"]), v0);
        await r.write("<input type=\"radio\" name=\"skill733_gachaid\" id=\"gachaid");
        await r.write(r.text(r.get(s, "k")));
        await r.write("\" value=\"");
        await r.write(r.text(r.get(s, "k")));
        await r.write("\"><a class=\"yellow b\" onclick=\"sl('gachaid");
        await r.write(r.text(r.get(s, "k")));
        await r.write("');\" title=\"");
        await r.write(r.text(r.get(r.get(s, "v"), "desc")));
        await r.write("\">【");
        await r.write(r.text(r.get(r.get(s, "v"), "name")));
        await r.write("】</a> /价：");
        await r.write(r.text(r.get(r.get(s, "v"), "price")));
        await r.write("<br>");
      }
    }
  }
  await r.write("<br>\r\n要抽取的个数（单次至多5个）：\r\n<input type=\"number\" name=\"skill733_gnum\" style=\"width:60px\" value=\"1\" min=\"1\" max=\"5\">\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
