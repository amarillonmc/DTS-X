// Generated from templates/default/rest.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "rest");
  (await r.module("rest", "init_rest_timing"));
  await r.write(r.text(r.get(r.get(s, "restinfo"), r.get(s, "state"))));
  await r.write("中……已经过<span class=\"yellow b\" id=\"rest_timing\">");
  await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "timing_r")));
  await r.write("</span>秒。<br>\r\n<input type=\"hidden\" id=\"mode\" name=\"mode\" value=\"rest\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"rest\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"");
  await r.write(r.text(r.get(r.get(s, "restinfo"), r.get(s, "state"))));
  await r.write("\" onclick=\"postCmd('gamecmd','command.php');this.disabled=true;\">\r\n<input type=\"button\" class=\"cmdbutton\" value=\"返回\" onclick=\"$('command').value='back';postCmd('gamecmd','command.php');this.disabled=true;\">");
  if (r.truth(r.equal(r.constant("CURSCRIPT"), "game"))) {
    await r.write("<script type=\"text/javascript\">updateTime('rest_timing', ");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "timing")));
    await r.write(", ");
    await r.write(r.text(r.get(r.get(r.get(r.get(s, "uip"), "timing"), "rest_timing"), "mode")));
    await r.write(", 1000, 'mm:ss');</script>");
  }
  await r.write(" ");
return 1;
}
