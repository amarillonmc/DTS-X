// Generated from include/modules/extra/instance/instance10_rogue/skill963/find_shopnpc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("现在想要做什么？<br><br>\r\n<input type=\"hidden\" name=\"mode\" value=\"shopnpc\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"back\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"><br><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"查看商品\" onclick=\"$('command').value='shop';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"打听情报\" onclick=\"$('command').value='tip';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"战斗\" onclick=\"$('command').value='battle';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
