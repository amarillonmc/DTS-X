// Generated from include/modules/base/items/song/sing.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<input type=\"hidden\" name=\"mode\" value=\"command\">\r\n<input type=\"hidden\" id=\"command\" name=\"command\" value=\"song\">\r\n<input type=\"hidden\" id=\"song_choice\" name=\"song_choice\" value='0'>\r\n请选择你要唱的歌：<br><br>");
  r.assign(r.slot(s, ["ls"]), (await r.module("song", "get_available_songlist")));
  if (r.truth((!r.truth(r.get(s, "ls"))))) {
    await r.write("<span class=\"yellow b\">好像你一首歌都不会唱的样子……</span><br>");
  } else {
    await r.write(" ");
    r.imports(s, "song");
    if (r.truth((await r.call("is_array", r.get(s, "ls"))))) {
      {
        const a0 = r.copy(r.get(s, "ls"));
        for (const [k0, v0] of r.entries(a0)) {
          r.assign(r.slot(s, ["i"]), v0);
          await r.write("<input type=\"button\" class=\"cmdbutton\" value=\"");
          await r.write(r.text(r.get(r.get(r.get(s, "songlist"), r.get(s, "i")), "songname")));
          await r.write("\" style=\"width: 180px;\" onclick=\"$('song_choice').value='");
          await r.write(r.text(r.get(s, "i")));
          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\"><br>");
        }
      }
    }
  }
  await r.write("<br>\r\n<input type=\"button\" class=\"cmdbutton\" id=\"x\" value=\"[X]返回\" onclick=\"$('command').value='menu'; postCmd('gamecmd','command.php');this.disabled=true;\">");
return 1;
}
