// Generated from include/modules/extra/item_extra/item_uvo_extra/uvo_extra_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "item_uvo_extra");
  if (r.truth((await r.call("in_array", r.get(s, "gametype"), r.get(s, "allow_uvo_extra_gametype"))))) {
    await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_card\" value=\"卡片列表\" onclick=\"$('command').value='card';$('subcmd').value='carduse';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
