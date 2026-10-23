// Generated from include/modules/base/ending/storyboard.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  await r.write("<!--全部死亡-->");
  if (r.truth(r.equal(r.get(s, "winmode"), 1))) {
    await r.write("全灭结局，理论上不应该出现这行字，请联系管理员。<br>\r\n<!--最后幸存-->");
  } else {
    if (r.truth(r.equal(r.get(s, "winmode"), 2))) {
      (await r.include(r.template("MOD_ENDING_STORYBOARD_WM2"), s));
      await r.write("<!--锁定解除-->");
    } else {
      if (r.truth(r.equal(r.get(s, "winmode"), 3))) {
        (await r.include(r.template("MOD_ENDING_STORYBOARD_WM3"), s));
        await r.write("<!--无人参加-->");
      } else {
        if (r.truth(r.equal(r.get(s, "winmode"), 4))) {
          await r.write("无人参加，理论上不应该出现这行字，请联系管理员。<br>\r\n<!--核爆全灭-->");
        } else {
          if (r.truth(r.equal(r.get(s, "winmode"), 5))) {
            (await r.include(r.template("MOD_ENDING_STORYBOARD_WM5"), s));
            await r.write("<!--GM中止-->");
          } else {
            if (r.truth(r.equal(r.get(s, "winmode"), 6))) {
              await r.write("本局游戏被GM中止，请返回游戏首页。\r\n<!--幻境解离-->");
            } else {
              if (r.truth(r.equal(r.get(s, "winmode"), 7))) {
                (await r.include(r.template("MOD_ENDING_STORYBOARD_WM7"), s));
                await r.write("<!--挑战结束：除错模式、伐木模式-->");
              } else {
                if (r.truth(r.equal(r.get(s, "winmode"), 8))) {
                  (await r.include(r.template("MOD_ENDING_STORYBOARD_WM8"), s));
                  await r.write("<!--其他胜利方式-->");
                } else {
                  await r.write("<span>未知胜利方式，可能是开发者尚未编写结局说明，请返回游戏首页！<br>\r\nstate=");
                  await r.write(r.text(r.get(s, "winner_flag")));
                  await r.write(" winmode=");
                  await r.write(r.text(r.get(s, "winmode")));
                  await r.write("</span>");
                }
              }
            }
          }
        }
      }
    }
  }
return 1;
}
