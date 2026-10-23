// Generated from include/modules/extra/card/cardbase/showcardentry.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div style=\"height:25px; width:200px;\">\r\n<div style=\"position:absolute; top:0px; left:0px;\">\r\n<img src=\"img/cardbg_");
  await r.write(r.text(r.get(s, "cardrank")));
  await r.write(".png\">\r\n</div><div style=\"position:absolute; top:4px; left:5px; \">\r\n<span class=\"orange\">");
  await r.write(r.text(r.get(s, "cardrank")));
  await r.write(" ");
  await r.write(r.text(r.get(s, "cardname")));
  await r.write("</span>\r\n</div>");
  if (r.truth(r.get(s, "carddisabled"))) {
    await r.write("<div style=\"position:absolute; top:0px; left:0px;\">\r\n<img src=\"img/cardbg-cover.png\">\r\n</div>");
  }
  await r.write("</div>\r\n");
return 1;
}
