// Generated from include/modules/extra/item_extra/item_uvo_extra/uvo_extra_cardsend.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "cardbase");
  r.assign(r.slot(s, ["cards_uvo"]), (await r.module("item_uvo_extra", "get_cards_uvo_extra", r.get(s, "sdata"))));
  r.assign(r.slot(s, ["showpack"]), 1);
  if (r.truth((!r.truth((!r.truth(r.get(s, "cards_uvo"))))))) {
    if (r.truth((await r.call("is_array", r.get(s, "cards_uvo"))))) {
      {
        const a0 = r.copy(r.get(s, "cards_uvo"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["cid"]), v0);
          await r.write("转让：<input type=\"button\"  value=\"卡片【");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "name")));
          await r.write(" ");
          await r.write(r.text(r.get(r.get(r.get(s, "cards"), r.get(s, "cid")), "rare")));
          await r.write("】\" onclick=\"$('command').value='card");
          await r.write(r.text(r.get(s, "cid")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
        }
      }
    }
  }
return 1;
}
