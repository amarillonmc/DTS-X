// Generated from include/modules/base/opening/storyboard.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--标准剧情：标准局、自选卡片、随机卡片、荣耀模式-->");
  if (r.truth((r.truth((r.truth(r.equal(0, r.get(s, "gametype"))) || r.truth(r.equal(4, r.get(s, "gametype"))))) || r.truth(r.equal(6, r.get(s, "gametype")))))) {
    (await r.include(r.template("MOD_OPENING_STORYBOARD_GT0"), s));
    await r.write("<!--除错模式-->");
  } else {
    if (r.truth(r.equal(1, r.get(s, "gametype")))) {
      (await r.include(r.template("MOD_OPENING_STORYBOARD_GT1"), s));
      await r.write("<!--荣耀模式-->");
    } else {
      if (r.truth(r.equal(18, r.get(s, "gametype")))) {
        (await r.include(r.template("MOD_OPENING_STORYBOARD_GT18"), s));
        await r.write("<!--极速模式-->");
      } else {
        if (r.truth(r.equal(19, r.get(s, "gametype")))) {
          (await r.include(r.template("MOD_OPENING_STORYBOARD_GT19"), s));
          await r.write("<!--幻界叫唤-->");
        } else {
          if (r.truth(r.equal(5, r.get(s, "gametype")))) {
            await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n可以点击视觉小说界面下方的进入战场按钮跳过剧情直接进入游戏。<br>\r\n<iframe src=\"http://nmforce.net/Special/dtsex1/\" height=\"350\" width=\"700\" style=\"border:none;\"></iframe>\r\n</div>\r\n<!--试炼模式-->");
          } else {
            if (r.truth(r.equal(13, r.get(s, "gametype")))) {
              (await r.include(r.template("MOD_OPENING_STORYBOARD_GT13"), s));
            } else {
              await r.write("<div id=\"op_sht_0\" class=\"shootings\">\r\n咦？剧情可能被冴冴吃掉了。<br>\r\n这应该是一个BUG，请联系管理员。\r\n</div>");
            }
          }
        }
      }
    }
  }
return 1;
}
