// Generated from include/modules/extra/card/cardbase/card_back_front_box.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<div class=\"showfront\">\r\n<img src=\"img/cardback2.png\" class=\"cardback\" />\r\n</div><div class=\"showback\">");
  (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
  await r.write("</div>");
return 1;
}
