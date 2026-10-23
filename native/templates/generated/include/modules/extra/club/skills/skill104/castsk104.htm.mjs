// Generated from include/modules/extra/club/skills/skill104/castsk104.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill104_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"castsk104\">\r\n你可以吸收一个方块，吸收后在战斗中有概率视为具有该方块对应的攻击属性。<br><br>");
  r.assign(r.slot(s, ["skill104_itmarr"]), (await r.module("skill104", "skill104_prepare_itmarr", r.get(s, "who"))));
  r.assign(r.slot(s, ["skill104_nowcount"]), (await r.call("sizeof", r.get(s, "skill104_itmarr"))));
  if (r.truth(r.get(s, "skill104_nowcount"))) {
    await r.write("当前已吸收的方块：");
    if (r.truth((await r.call("is_array", r.get(s, "skill104_itmarr"))))) {
      {
        const a0 = r.copy(r.get(s, "skill104_itmarr"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["v"]), v0);
          await r.write("<span class=\"yellow b\">");
          await r.write(r.text(r.get(r.get(s, "v"), "itm")));
          await r.write("</span> ");
        }
      }
    }
    await r.write("<br><br>");
  }
  await r.write("请选择要吸收的方块：<br>\r\n<select id=\"skill104_choice\" name=\"skill104_choice\" value=\"back\">\r\n<option value=\"back\">返回<br>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
    {
      const a1 = r.copy((await r.call("range", 1, 6)));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["i"]), v1);
        if (r.truth((r.truth(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))) && r.truth((!r.identical((await r.call("strpos", r.get(s, (r.text("itm") + r.text(r.get(s, "i")))), "方块")), false)))))) {
          await r.write("<option value=\"");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\"><span class=\"yellow b\">");
          await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
          await r.write("</span>/");
          await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
          await r.write("/");
          await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
          await r.write("<br>");
        }
      }
    }
  }
  await r.write("</select>\r\n<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
