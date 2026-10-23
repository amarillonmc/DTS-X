// Generated from include/modules/extra/misc/elorating/elorating.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<br>\r\n<div style=\"height:400px; width:600px;\">\r\n<div style=\"position:relative; height:280px; width:600px;\">\r\n<div style=\"text-align:left;\"><span style=\"line-height:20px;font-size:15px;\">天梯积分曲线图</span></div><div style=\"text-align:left; margin-bottom:8px;\">");
  if (r.truth((!r.equal(r.get(s, "elo_history"), "")))) {
    await r.write("<span style=\"line-height:20px;font-size:15px; margin-left:40px;\">当前为<span style=\"color:");
    await r.write(r.text((await r.module("elorating", "elorating_get_color", r.get(s, "elo_rating")))));
    await r.write("\">");
    await r.write(r.text((await r.module("elorating", "elorating_get_title", r.get(s, "elo_rating")))));
    await r.write("&nbsp;(<span style=\"font-weight:bold;\">");
    await r.write(r.text(r.get(s, "elo_rating")));
    await r.write("</span>)</span>&nbsp;&nbsp;历史最高记录为<span style=\"color:");
    await r.write(r.text((await r.module("elorating", "elorating_get_color", r.get(s, "elo_max_rating")))));
    await r.write("\">");
    await r.write(r.text((await r.module("elorating", "elorating_get_title", r.get(s, "elo_max_rating")))));
    await r.write("&nbsp;(<span style=\"font-weight:bold;\">");
    await r.write(r.text(r.get(s, "elo_max_rating")));
    await r.write("</span>)</span></span>");
  }
  await r.write("</div><div style=\"position:relative;\">");
  (await r.module("elorating", "elorating_draw", r.get(s, "data")));
  await r.write("</div>\r\n</div>\r\n</div>\r\n");
return 1;
}
