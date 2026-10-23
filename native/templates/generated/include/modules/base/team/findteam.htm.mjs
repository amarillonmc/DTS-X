// Generated from include/modules/base/team/findteam.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("现在想要做什么？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"senditem\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">\r\n留言：<br><input size=\"30\" type=\"text\" name=\"message\" maxlength=\"60\"><br><br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"><br><br>");
  if (r.truth(r.get(s, "itms1"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme1")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms1")));
    await r.write("\" onclick=\"$('command').value='item1';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth(r.get(s, "itms2"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme2")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms2")));
    await r.write("\" onclick=\"$('command').value='item2';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth(r.get(s, "itms3"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme3")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms3")));
    await r.write("\" onclick=\"$('command').value='item3';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth(r.get(s, "itms4"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme4")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms4")));
    await r.write("\" onclick=\"$('command').value='item4';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth(r.get(s, "itms5"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme5")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms5")));
    await r.write("\" onclick=\"$('command').value='item5';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth(r.get(s, "itms6"))) {
    await r.write("转让：<input type=\"button\"  value=\"");
    await r.write(r.text(r.get(s, "itm6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itme6")));
    await r.write("/");
    await r.write(r.text(r.get(s, "itms6")));
    await r.write("\" onclick=\"$('command').value='item6';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  }
  if (r.truth((await r.call("defined", "MOD_ITEM_UVO_EXTRA")))) {
    r.imports(s, "item_uvo_extra");
    if (r.truth((await r.call("in_array", r.get(s, "gametype"), r.get(s, "allow_uvo_extra_cardsend_gametype"))))) {
      (await r.include(r.template("MOD_ITEM_UVO_EXTRA_UVO_EXTRA_CARDSEND"), s));
    }
  }
return 1;
}
