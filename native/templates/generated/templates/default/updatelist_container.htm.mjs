// Generated from templates/default/updatelist_container.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.include(r.template("header"), s));
  await r.write("<br>\r\n<style type=text/css>\r\nh3{color:#98fb98;}\r\n#changelog p{color:rgb(204,234,250);font-size:12pt;font-weight:bold}\r\n</style>\r\n<div id=\"changelog\" style=\"width:800px; margin:0 auto; text-align:left;font-size:15px; line-height:22px;\">\r\n<h2>更新日志</h2>\r\n<span class=\"b\">以下更新中，（+）指新增内容，（-）指移除内容，（△）指改变/修复的内容</span>");
  (await r.include(r.template("updatelist_2025"), s));
  await r.write("</div>");
  (await r.include(r.template("footer"), s));
return 1;
}
