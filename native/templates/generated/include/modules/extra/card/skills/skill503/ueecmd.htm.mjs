// Generated from include/modules/extra/card/skills/skill503/ueecmd.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"itm");
  await r.write(r.text(r.get(s, "ueen")));
  await r.write("\">\r\n<input type=\"hidden\" id=\"ueecmd\" name=\"ueecmd\" value=\"0\">\r\n<div>请选择你想要进行的操作：<br></div>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"解除禁区\" onclick=\"$('ueecmd').value='1';postCmd('gamecmd','command.php');this.disabled=true;\"><br>\r\n同正常使用移动PC一样，尝试解除当前禁区。<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"禁区提前到来\" onclick=\"$('ueecmd').value='2';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  r.assign(r.slot(s, ["tmp_interval"]), r.divide((await r.module("map", "get_area_interval")), 2));
  if (r.truth(r.get(s, "hack2_r"))) {
    await r.write("让下次禁区时间提前到1分钟后。只有在连斗前，且1分钟≤距离下次禁区时间≤");
    await r.write(r.text(r.get(s, "tmp_interval")));
    await r.write("分钟时才能操作。本局游戏中还能操作<span class=\"cyan b\">");
    await r.write(r.text(r.get(s, "hack2_r")));
    await r.write("</span>次。");
  } else {
    await r.write("<span class=\"red b\">本局游戏中无法再这么操作了。</span>");
  }
  await r.write("<br><br>\r\n<input type=\"button\" class=\"cmdbutton\" style=\"width:120px\" value=\"打乱禁区顺序\" onclick=\"$('ueecmd').value='3';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
  if (r.truth(r.get(s, "hack3_r"))) {
    await r.write("打乱未来的禁区顺序。只有在连斗前，且距离下次禁区时间≥1分钟时才能操作。本局游戏中还能操作<span class=\"cyan b\">");
    await r.write(r.text(r.get(s, "hack3_r")));
    await r.write("</span>次");
  } else {
    await r.write("<span class=\"red b\">本局游戏中无法再这么操作了。</span>");
  }
  await r.write("<br><br>\r\n<br>\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回\" onclick=\"$('command').value='back';postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
