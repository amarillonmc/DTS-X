// Generated from include/modules/extra/gmskills/skill1012/sub_page.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"special\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"skill1012_special\">\r\n<input type=\"hidden\" id=\"subcmd\" name=\"subcmd\" value=\"show_var\">\r\n<span class=\"yellow b\">输入时请搞清楚你在做什么。</span><br>\r\n请输入命名空间，留空为全局变量：<br>\r\n<input type=\"text\" name=\"show_ns\" value=\"\"><br>\r\n请输入变量名（不需要加美元符号）：<br>\r\n<input type=\"text\" name=\"show_vn\" value=\"\"><br>\r\n\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\"  value=\"提交\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\"> \r\n<input type=\"button\" class=\"cmdbutton\"  value=\"返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
