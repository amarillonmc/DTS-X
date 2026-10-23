// Generated from include/modules/extra/card/cardbase/profile_cardname.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<span id=\"cardname_n_name\" class=\"");
  await r.write(r.text(r.get(r.get(s, "uip"), "cardrare_show")));
  await r.write("\" ");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "cardinfo_show"))))))) {
    await r.write("onmouseenter=\"$('cardframe_show').style.display='block';\" onmouseleave=\"$('cardframe_show').style.display='none';\" ");
  }
  await r.write(">\r");
  await r.write(r.text(r.get(r.get(s, "uip"), "cardname_show")));
  await r.write(" ");
  await r.write(r.text(r.get(s, "name")));
  await r.write("</span> ");
  if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "uip"), "cardinfo_show"))))))) {
    r.assign(r.slot(s, ["showpack"]), 1);
    r.assign(r.slot(s, ["nowcard"]), r.get(r.get(s, "uip"), "cardinfo_show"));
    r.assign(r.slot(s, ["card_rarecolor"]), r.get(r.get(s, "uip"), "card_rarecolor"));
    await r.write("<div id=\"cardframe_show\" class=\"cardframe_show\" style=\"display:none;position:absolute;z-index:30;left:5px;top:20px;\">");
    (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
    await r.write("</div>");
  }
return 1;
}
