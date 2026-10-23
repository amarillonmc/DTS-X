// Generated from include/modules/base/itemmain/itemfind.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("你想如何处理？\r\n<br>\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"itemmain\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itemget\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"\">\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"z\" value=\"[Z]拾取\" onclick=\"postCmd('gamecmd','command.php',this,1);this.disabled=true;\">");
  if (r.truth((await r.module("itemmain", "get_item_allow_find_and_use")))) {
    await r.write("&nbsp;<input type=\"button\" class=\"cmdbutton\"  id=\"a\" ");
    if (r.truth((await r.module("itemmain", "is_equipable", r.get(s, "itmk0"))))) {
      await r.write("value=\"[A]装备\"");
    } else {
      await r.write("value=\"[A]使用\"");
    }
    await r.write(" onclick=\"$('mode').value='command';$('command').value='itm0';postCmd('gamecmd','command.php',this,1);this.disabled=true;\">");
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\"  id=\"x\" value=\"[X]丢弃\" onclick=\"$('command').value='dropitm0';postCmd('gamecmd','command.php',this,1);this.disabled=true;\">");
return 1;
}
