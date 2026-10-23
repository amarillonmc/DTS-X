// Generated from include/modules/extra/instance/instance12_dream/skill981/showtrainstage.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["stage"]), r.int((await r.module("skillbase", "skill_getvalue", 981, "stage", r.get(s, "sdata")))));
  r.assign(r.slot(s, ["rm"]), r.int((await r.module("skillbase", "skill_getvalue", 981, "rm", r.get(s, "sdata")))));
  r.assign(r.slot(s, ["maxstage"]), r.int((await r.module("skillbase", "skill_getvalue", 981, "maxstage", r.get(s, "sdata")))));
  if (r.truth((r.compare(r.get(s, "stage"), 0) > 0))) {
    await r.write("第<span class=\"orange b\"> ");
    await r.write(r.text(r.get(s, "stage")));
    await r.write(" </span>波次\r\n<br>");
  }
  if (r.truth((r.compare(r.get(s, "rm"), 0) > 0))) {
    await r.write("剩余敌人 <span class=\"red b\">");
    await r.write(r.text(r.get(s, "rm")));
    await r.write("</span>");
  } else {
    if (r.truth((r.compare(r.get(s, "stage"), r.get(s, "maxstage")) < 0))) {
      await r.write("<input type=\"button\" class=\"cmdbutton Pulse\" id=\"sp_castsk981\" value=\"");
      await r.write(r.text((r.truth((r.compare(r.get(s, "stage"), 0) > 0)) ? "下一波次" : "开始挑战")));
      await r.write("\" onclick=\"$('mode').value='special';$('command').value='skill981_special';postCmd('gamecmd','command.php');this.disabled=true;\">");
    } else {
      await r.write("<span class=\"lime b\">已完成</span>");
    }
  }
return 1;
}
