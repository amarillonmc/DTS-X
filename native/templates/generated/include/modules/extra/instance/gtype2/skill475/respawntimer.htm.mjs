// Generated from include/modules/extra/instance/gtype2/skill475/respawntimer.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((await r.module("skillbase", "skill_query", 475)))) {
    r.imports(s, "sys", "player", "skill475");
    r.assign(r.slot(s, ["sk475t"]), (await r.call("max", 0, r.subtract(r.add(r.get(s, "endtime"), r.get(s, "skill475_revive_time")), r.get(s, "now")))));
    (await r.call("bubblebox_start", "id:sk475respawn;height:200;width:500;"));
    await r.write("<div style=\"text-align: center;\">\r\n<span style=\"line-height:68px\">&nbsp;</span><br>\r\n<span style=\"font-size:20px\">真是不幸，你死了。</span><br>\r\n但没关系，在这个游戏模式中你可以复活。<br>\r\n复活剩余时间：<span id=\"sk475timer\" class=\"yellow b\">");
    await r.write(r.text(r.get(s, "sk475t")));
    await r.write("</span>秒\r\n</div>\r\n<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"\r\nvar sk475t=");
    await r.write(r.text(r.get(s, "sk475t")));
    await r.write(";\r\nvar sk475fId = setInterval(function() {\r\nif (sk475t<=-1)\r\n{\r\nclearInterval(sk475fId);\r\nlocation.reload();\r\n}\r\nelse\r\n{\r\njQuery('#sk475timer').text(sk475t);\r\nsk475t--;\r\n}\r\n},1000);\r\n\">");
    (await r.call("bubblebox_end"));
    await r.write("<img style=\"display:none;\" type=\"hidden\" src=\"img/blank.png\" onload=\"bubblebox_show('sk475respawn');\">");
  }
return 1;
}
