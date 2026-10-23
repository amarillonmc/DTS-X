// Generated from templates/default/roomslot.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((!r.truth(((r.get(s, "tmp_cannot_forbid") != null)))))) {
    r.assign(r.slot(s, ["tmp_cannot_forbid"]), (await r.call("room_get_vars", r.get(s, "roomdata"), "cannot-forbid")));
  }
  if (r.truth(r.equal(r.get(s, "upos"), (-r.number(1))))) {
    if (r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "forbidden"))) {
      await r.write("<div id=\"pos");
      await r.write(r.text(r.get(s, "i")));
      await r.write("\" class=\"glow_buttons w140 h30 darkgrey forbidden\">(已禁入)</div>");
    } else {
      if (r.truth((!r.equal(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name"), "")))) {
        await r.write("<div id=\"pos");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" class=\"glow_buttons w140 h30 forbidden\">");
        await r.write(r.text(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name")));
        await r.write("</div>");
      } else {
        await r.write("<div id=\"pos");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" class=\"glow_buttons w140 h30 evergreen\" onclick=\"$('command').value='pos_enter';$('para1').value=");
        await r.write(r.text(r.get(s, "i")));
        await r.write(";postCmd('roomcmd','roomcmd.php');\">");
        if (r.truth(r.equal(r.get(s, "i"), 0))) {
          await r.write("成为房主");
        } else {
          if (r.truth((r.truth(r.equal(r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "leader-position"), r.get(s, "i")), r.get(s, "i"))) && r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "show-team-leader"))))) {
            await r.write("成为队长");
          } else {
            await r.write("进入位置");
          }
        }
        await r.write("</div>");
      }
    }
  } else {
    if (r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "forbidden"))) {
      await r.write("<div id=\"pos");
      await r.write(r.text(r.get(s, "i")));
      await r.write("\" class=\"glow_buttons w140 h30 darkgrey forbidden\">(已禁入)</div>");
    } else {
      if (r.truth(r.equal(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name"), ""))) {
        await r.write("<div id=\"pos");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" class=\"glow_buttons w140 h30 grey\" onclick=\"$('command').value='pos_enter';$('para1').value=");
        await r.write(r.text(r.get(s, "i")));
        await r.write(";postCmd('roomcmd','roomcmd.php');\">");
        if (r.truth(r.equal(r.get(s, "i"), 0))) {
          await r.write("空房主位置");
        } else {
          if (r.truth((r.truth(r.equal(r.get(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "leader-position"), r.get(s, "i")), r.get(s, "i"))) && r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "show-team-leader"))))) {
            await r.write("空队长位置");
          } else {
            await r.write("空位置");
          }
        }
        await r.write("</div>");
      } else {
        if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(s, "roomdata"), "readystat"), 1)) && r.truth((!r.equal(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name"), ""))))) && r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "ready"))))) {
          await r.write("<div id=\"pos");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"glow_buttons w140 h30 evergreen forbidden\">");
          await r.write(r.text(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name")));
          await r.write("</div>");
        } else {
          await r.write("<div id=\"pos");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"glow_buttons w140 h30 forbidden\">");
          await r.write(r.text(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name")));
          await r.write("</div>");
        }
      }
    }
  }
  if (r.truth(r.equal(r.get(s, "i"), 0))) {
    await r.write("<div style=\"position:absolute;left:110px;top:19px;\">\r\n<div id=\"action");
    await r.write(r.text(r.get(s, "i")));
    await r.write("\" class=\"glow_buttons w35 h15 lime forbidden\">房主</div>\r\n</div>");
  } else {
    if (r.truth((r.truth((r.truth(r.equal(r.get(s, "upos"), 0)) || r.truth(r.equal(r.get(s, "upos"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "i"))))))) && r.truth((!r.equal(r.get(s, "i"), r.get(s, "upos"))))))) {
      if (r.truth((r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "forbidden")))) && r.truth((!r.equal(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "name"), "")))))) {
        await r.write("<div style=\"position:absolute;left:110px;top:19px;\">\r\n<div id=\"action");
        await r.write(r.text(r.get(s, "i")));
        await r.write("\" class=\"glow_buttons w35 h15 red\" onclick=\"$('command').value='pos_kick';$('para1').value=");
        await r.write(r.text(r.get(s, "i")));
        await r.write(";postCmd('roomcmd','roomcmd.php');\">\r\n踢出\r\n</div>\r\n</div>");
      } else {
        if (r.truth((!r.truth(r.get(r.get(r.get(r.get(s, "roomdata"), "player"), r.get(s, "i")), "forbidden"))))) {
          if (r.truth((!r.truth(r.get(s, "tmp_cannot_forbid"))))) {
            await r.write("<div style=\"position:absolute;left:110px;top:19px;\">\r\n<div id=\"action");
            await r.write(r.text(r.get(s, "i")));
            await r.write("\" class=\"glow_buttons w35 h15 red\" onclick=\"$('command').value='pos_disable';$('para1').value=");
            await r.write(r.text(r.get(s, "i")));
            await r.write(";postCmd('roomcmd','roomcmd.php');\">\r\n禁用\r\n</div>\r\n</div>");
          }
        } else {
          await r.write("<div style=\"position:absolute;left:110px;top:19px;\">\r\n<div id=\"action");
          await r.write(r.text(r.get(s, "i")));
          await r.write("\" class=\"glow_buttons w35 h15 evergreen\" onclick=\"$('command').value='pos_enable';$('para1').value=");
          await r.write(r.text(r.get(s, "i")));
          await r.write(";postCmd('roomcmd','roomcmd.php');\">\r\n启用\r\n</div>\r\n</div>");
        }
      }
    }
    if (r.truth((r.truth((r.truth((!r.equal(r.get(s, "upos"), 0))) && r.truth(r.equal(r.get(s, "i"), (await r.call("room_team_leader_check", r.get(s, "roomdata"), r.get(s, "i"))))))) && r.truth(r.get(r.get(r.get(s, "roomtypelist"), r.get(r.get(s, "roomdata"), "roomtype")), "show-team-leader"))))) {
      await r.write("<div style=\"position:absolute;left:110px;top:19px;\">\r\n<div id=\"action");
      await r.write(r.text(r.get(s, "i")));
      await r.write("\" class=\"glow_buttons w35 h15 lime forbidden\">队长</div>\r\n</div>");
    }
  }
return 1;
}
