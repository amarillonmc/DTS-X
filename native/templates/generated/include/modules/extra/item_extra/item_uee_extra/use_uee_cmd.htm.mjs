// Generated from include/modules/extra/item_extra/item_uee_extra/use_uee_cmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(s, "ueen")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"uee_extra_cmd\" name=\"uee_extra_cmd\" value=\"0\">\r\n<div>请选择你想要进行的操作：<br></div>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"自动解除禁区\" onclick=\"$('uee_extra_cmd').value='1';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n运行自动程序来解除禁区，不需操作但有一定风险。<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"手动破解禁区\" onclick=\"$('uee_extra_cmd').value='2';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n进行<span class=\"evergreen b\">「手动破解」</span>，通过更精密的操作来解除禁区，更安全但也更考验技术。<br><br>\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回\" onclick=\"$('command').value='back';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
