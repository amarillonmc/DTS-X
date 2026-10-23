// Generated from include/modules/extra/card/skills/skill504/okotta.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:skill504_end_okotta;height:120;width:240;cancellable:0"));
  await r.write("<div style=\"margin:20px\">\r\n<span style=\"font-size:16px\">生气了吗？</span>\r\n</div><div style=\"margin:20px\">\r\n<a class=\"b_button bc_black\" onclick=\"bubblebox_hide_all();\">没有</a>&nbsp;&nbsp;&nbsp;<a class=\"b_button bc_black\" onclick=\"bubblebox_hide_all();\">没有</a>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"bubblebox_show('skill504_end_okotta');\">\r\n");
return 1;
}
