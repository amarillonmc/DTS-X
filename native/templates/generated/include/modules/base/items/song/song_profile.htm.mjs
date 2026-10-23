// Generated from include/modules/base/items/song/song_profile.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"button\" class=\"cmdbutton\" id=\"sp_weapon\" value=\"歌唱\" onclick=\"$('command').value='song';$('subcmd').name='song';postCmd('gamecmd','command.php');this.disabled=true;\">");
  r.assign(r.slot(s, ["songkind"]), (await r.module("skillbase", "skill_getvalue", 1003, "songkind")));
  if (r.truth((!r.truth((!r.truth(r.get(s, "songkind"))))))) {
    await r.write("<input type=\"hidden\" id=\"songkind\" name=\"songkind\" value=\"\">\r\n<input type=\"button\" class=\"cmdbutton\" id=\"r\" value=\"[R]复唱\" onclick=\"$('command').value='song';$('songkind').value='");
    await r.write(r.text(r.get(s, "songkind")));
    await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\">");
  }
return 1;
}
