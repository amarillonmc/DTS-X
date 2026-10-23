// Generated from include/modules/extra/card/cardbase/cardflip_result.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  (await r.call("bubblebox_start", "id:cardresult;height:406;width:246;cancellable:1"));
  await r.write("<p>\r\n你翻开了卡片。<br>\r\n</p>\r\n<div style=\"\r\ncursor:pointer;\r\nposition:relative; -moz-border-radius:8px; \r\n-webkit-border-radius:8px;\r\nborder-radius:8px; height:340px; width:240px; overflow:visible; \r\n\"\r\ntitle=\"点击返回\"\r\nonclick=\"bubblebox_hide_all();\"\r\n>");
  r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "cards"), r.get(s, "get_card_id")));
  r.assign(r.slot(s, ["nownew"]), (r.truth(r.get(s, "is_new")) ? 1 : 0));
  r.assign(r.slot(s, ["showpack"]), 1);
  r.assign(r.slot(s, ["nowcard", "blink"]), r.get(s, "blink"));
  await r.write("<div class=\"cardbox\" id=\"nowcardbox\">");
  (await r.include(r.template("MOD_CARDBASE_CARD_BACK_FRONT_BOX"), s));
  await r.write("</div>\r\n\r\n</div>");
  (await r.call("bubblebox_end"));
  await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" \r\nonload=\"bubblebox_show('cardresult');setTimeout(function(){$('nowcardbox').classList.toggle('card_flipped');}, 2);\">\r\n<!--太草了，appendChild()后因为浏览器重新渲染的关系，直接toggle()是不能触发动画的，需要设一个延时。真是震撼我妈一整年！-->");
return 1;
}
