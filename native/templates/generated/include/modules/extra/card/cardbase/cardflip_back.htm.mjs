// Generated from include/modules/extra/card/cardbase/cardflip_back.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:cardback;height:406;width:246;"));
  await r.write("<p>\r\n你撕开了礼物包装，请点击翻开卡片。<br>\r\n礼物： ");
  await r.write(r.text(r.get(s, "cardpresent_desc")));
  await r.write("</p>\r\n<div style=\"\r\ncursor:pointer; \r\nposition:relative; -moz-border-radius:8px; \r\n-webkit-border-radius:8px;\r\nborder-radius:8px; height:340px; width:240px; overflow:hidden; \r\n\"\r\ntitle=\"点击翻开\">\r\n<img src=\"img/cardback2.png\" class=\"cardback\" onclick=\"$('mode').value='command';$('command').value='itm");
  await r.write(r.text(r.get(s, "itmn")));
  await r.write("';$('subcmd').value='flipcard';postCmd('gamecmd','command.php');this.disabled=true;\"></img>\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"bubblebox_show('cardback');\">");
return 1;
}
