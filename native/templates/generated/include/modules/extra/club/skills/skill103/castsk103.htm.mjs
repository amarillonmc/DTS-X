// Generated from include/modules/extra/club/skills/skill103/castsk103.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill103_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk103\">\r\n你可以在身体里嵌入一把武器，并可以更换该武器，但更换时原先嵌入的武器会消失。<br><br>\r\n请选择要嵌入的武器：<br><br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a0 = r.copy((await r.call("range", 1, 6)));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth(r.equal(r.get(r.get(s, (r.text("itmk") + r.text(r.get(s, "i")))), 0), "W"))))) {
          await r.write("<input type=\"radio\" name=\"skill103_choice\" id=\"skill103_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" value=\"");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><a onclick=\"sl('skill103_choice");
          await r.write(r.text(r.get(s, "i")));
          await r.write("');\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          r.assign(r.slot(s, ["itmskw"]), (r.truth((!r.truth((!r.truth(r.get(s, (r.text("itmsk") + r.text(r.get(s, "i"))))))))) ? (await r.module("itemmain", "parse_itmsk_words", r.get(s, (r.text("itmsk") + r.text(r.get(s, "i")))), 1)) : ""));
          if (r.truth(r.get(s, "itmskw"))) {
            await r.write("/");
            await r.write(r.text(r.get(s, "itmskw")));
          }
          await r.write("</a><br>");
        }
      }
    }
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
