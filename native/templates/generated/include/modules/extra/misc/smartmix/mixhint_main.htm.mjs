// Generated from include/modules/extra/misc/smartmix/mixhint_main.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"width:720px\">\r\n<div class=\"b1\" style=\"height:20px\"><span>合成公式数据</span></div><div class=\"b3\" style=\"min-height:380px;display: flex;position:relative;justify-content: center;\">\r\n<div style=\"max-width:700px;text-align:left;word-break:break-all;overflow:auto;\">\r");
  await r.write(r.text(r.get(r.get(s, "uip"), "mixhint")));
  await r.write("</div>\r\n</div>\r\n</div>");
return 1;
}
