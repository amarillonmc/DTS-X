// Generated from include/modules/extra/misc/advteam/team.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.compare(r.get(s, "teammate_num"), 0) > 0))) {
    if (r.truth((await r.call("is_array", r.get(s, "teammateinfo"))))) {
      {
        const a0 = r.copy(r.get(s, "teammateinfo"));
        for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["key"]), k0);
          r.assign(r.slot(s, ["value"]), v0);
          await r.write("<tr>");
          if (r.truth(r.equal(r.get(s, "key"), 1))) {
            await r.write("<td class=\"b1\" rowspan=");
            await r.write(r.text(r.get(s, "teammate_num")));
            await r.write("><span>队友</span></td>");
          }
          await r.write("<td height=\"20\" colspan=\"2\"");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("class=\"b3\"");
          } else {
            if (r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0))) {
              await r.write("class=\"b7\"");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "pls"), r.get(s, "pls")))) {
                await r.write("class=\"b6\"");
              } else {
                await r.write("class=\"b3\"");
              }
            }
          }
          await r.write(">\r\n<span>");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("-");
          } else {
            await r.write(r.text(r.get(r.get(s, "value"), "name")));
          }
          await r.write("</span>\r\n</td>\r\n<td height=\"20\"");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("class=\"b3\"");
          } else {
            if (r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0))) {
              await r.write("class=\"b7\"");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "pls"), r.get(s, "pls")))) {
                await r.write("class=\"b6\"");
              } else {
                await r.write("class=\"b3\"");
              }
            }
          }
          await r.write(">\r\n<span>");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("-");
          } else {
            await r.write(r.text(r.get(r.get(s, "plsinfo"), r.get(r.get(s, "value"), "pls"))));
          }
          await r.write("</span>\r\n</td>\r\n<td  height=\"20\"");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("class=\"b3\"");
          } else {
            if (r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0))) {
              await r.write("class=\"b7\"");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "pls"), r.get(s, "pls")))) {
                await r.write("class=\"b6\"");
              } else {
                await r.write("class=\"b3\"");
              }
            }
          }
          await r.write(">");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("<span>-</span>");
          } else {
            if (r.truth((r.truth(r.get(r.get(s, "value"), "flare")) && r.truth((r.compare(r.get(r.get(s, "value"), "hp"), 0) > 0))))) {
              await r.write("<span class=\"red b\" style=\"background-color:yellow\">请求支援</span>");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0))) {
                await r.write("<span>已死亡</span>");
              } else {
                await r.write("<span>-</span>");
              }
            }
          }
          await r.write("</td>\r\n<td height=\"20\"");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("class=\"b3\"");
          } else {
            if (r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0))) {
              await r.write("class=\"b7\"");
            } else {
              if (r.truth(r.equal(r.get(r.get(s, "value"), "pls"), r.get(s, "pls")))) {
                await r.write("class=\"b6\"");
              } else {
                await r.write("class=\"b3\"");
              }
            }
          }
          await r.write(">\r\n<span>");
          if (r.truth(r.equal(r.get(r.get(s, "value"), "dummy"), 1))) {
            await r.write("-");
          } else {
            await r.write("<input type=\"button\" value=\"赠送物品\" onclick=\"$('mode').value='advteamspecial';$('command').value='findteam");
            await r.write(r.text(r.get(r.get(s, "value"), "pid")));
            await r.write("';postCmd('gamecmd','command.php');return false;\" ");
            if (r.truth((r.truth((r.truth((r.truth((!r.equal(r.constant("CURSCRIPT"), "game"))) || r.truth((!r.equal(r.get(r.get(s, "value"), "pls"), r.get(s, "pls")))))) || r.truth(r.equal(r.get(r.get(s, "value"), "hp"), 0)))) || r.truth((r.compare(r.get(s, "hp"), 0) <= 0))))) {
              await r.write("disabled");
            }
            await r.write(">");
          }
          await r.write("</span>\r\n</td>");
          if (r.truth(r.equal(r.get(s, "key"), 1))) {
            await r.write("<td height=\"20\" rowspan=");
            await r.write(r.text(r.get(s, "teammate_num")));
            await r.write(" align=\"center\" class=\"b3\">");
            if (r.truth((r.truth(r.get(s, "flare")) && r.truth((r.compare(r.get(s, "hp"), 0) > 0))))) {
              await r.write("<span class=\"red b\">正在请求队友支援。<input type=\"button\" value=\"停止请求\" onclick=\"$('mode').value='advteamspecial';$('command').value='stopflare';postCmd('gamecmd','command.php');return false;\" ");
              if (r.truth((r.truth((!r.equal(r.constant("CURSCRIPT"), "game"))) || r.truth((r.compare(r.get(s, "hp"), 0) <= 0))))) {
                await r.write("disabled");
              }
              await r.write(">\r\n</span>");
            } else {
              await r.write("<input type=\"button\" value=\"向队友发出支援请求\" onclick=\"$('mode').value='advteamspecial';$('command').value='sendflare';postCmd('gamecmd','command.php');return false;\" ");
              if (r.truth((r.truth((!r.equal(r.constant("CURSCRIPT"), "game"))) || r.truth((r.compare(r.get(s, "hp"), 0) <= 0))))) {
                await r.write("disabled");
              }
              await r.write(">");
            }
            await r.write("</td>");
          }
          await r.write("</tr>");
        }
      }
    }
  }
return 1;
}
