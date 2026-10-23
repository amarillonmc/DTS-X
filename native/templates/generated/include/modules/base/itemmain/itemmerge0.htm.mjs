// Generated from include/modules/base/itemmain/itemmerge0.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" name=\"command\" value=\"itemmerge\">\r\n<input type=\"hidden\" name=\"merge1\" value=\"0\">\r\n<input type=\"hidden\" id=\"merge2\" name=\"merge2\" value=\"n\">\r\n是否将 <span class='yellow b'>");
  await r.write(r.text(r.get(s, "itm0")));
  await r.write("</span>与以下物品合并？\r\n<br>\r\n<br>");
  if (r.truth(r.equal(1, (await r.call("sizeof", r.get(s, "sameitem")))))) {
    await r.write("    ");
    r.assign(r.slot(s, ["i"]), (await r.mutate("array_pop", r.slot(s, ["sameitem"]))));
    await r.write("    <input type=\"button\" id=\"a\" class=\"cmdbutton\" value=\"[A]");
    await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
    await r.write("/");
    await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
    await r.write("/");
    await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
    await r.write("\" onclick=\"$('merge2').value='");
    await r.write(r.text(r.get(s, "i")));
    await r.write("';postCmd('gamecmd','command.php',this);return false;\"><br> ");
  } else {
    await r.write("    ");
    r.assign(r.slot(s, ["k"]), "0asdqwe");
    r.assign(r.slot(s, ["ku"]), "0ASDQWE");
    await r.write("    ");
    if (r.truth((await r.call("is_array", (await r.call("range", 1, 6)))))) {
      {
        const a0 = r.copy((await r.call("range", 1, 6)));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("        ");
          if (r.truth((await r.call("in_array", r.get(s, "i"), r.get(s, "sameitem"))))) {
            await r.write("            <input type=\"button\" id=\"");
            await r.write(r.text(r.get(r.get(s, "k"), r.get(s, "i"))));
            await r.write("\" class=\"cmdbutton\" value=\"[");
            await r.write(r.text(r.get(r.get(s, "ku"), r.get(s, "i"))));
            await r.write("]");
            await r.write(r.text(r.get(s, (r.text("itm") + r.text(r.get(s, "i"))))));
            await r.write("/");
            await r.write(r.text(r.get(s, (r.text("itme") + r.text(r.get(s, "i"))))));
            await r.write("/");
            await r.write(r.text(r.get(s, (r.text("itms") + r.text(r.get(s, "i"))))));
            await r.write("\" onclick=\"$('merge2').value='");
            await r.write(r.text(r.get(s, "i")));
            await r.write("';postCmd('gamecmd','command.php',this);return false;\"><br> \r\n        ");
          }
          await r.write("    ");
        }
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" id=\"z\" class=\"cmdbutton\" value=\"[Z]不合并\" onclick=\"postCmd('gamecmd','command.php',this);return false;\">");
return 1;
}
