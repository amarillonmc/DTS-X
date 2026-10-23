// Generated from include/modules/extra/club/sklearn_util/skilllearn_table.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["tmp_row_num"]), 4);
  await r.write("<table border=\"0\" cellSpacing=0 cellPadding=0 style=\"table-layout:fixed;width:653px;\">\r\n<tr>\r\n<td class=\"b1\" width=\"80px\">技能来源</td>");
  if (r.truth((await r.call("is_array", (await r.call("range", 1, r.get(s, "tmp_row_num"))))))) {
    {
      const a0 = r.copy((await r.call("range", 1, r.get(s, "tmp_row_num"))));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["i"]), v0);
        if (r.truth(r.get(s, "is_show_cost"))) {
          await r.write("<td class=\"b1\" width=\"40px\">技能</td>\r\n<td class=\"b1\" width=\"20px\">费</td>");
        } else {
          await r.write("<td class=\"b1\" width=\"60px\">技能</td>");
        }
        await r.write("<td class=\"b1\" width=\"80px\">操作</td>");
      }
    }
  }
  await r.write("</tr>");
  if (r.truth((await r.call("is_array", r.get(s, "lis"))))) {
    {
      const a1 = r.copy(r.get(s, "lis"));
      for (const [k1, v1] of r.entries(a1)) {
      r.assign(r.slot(s, ["nowclub"]), k1);
        r.assign(r.slot(s, ["slis"]), v1);
        if (r.truth((!r.equal(r.get(s, "nowclub"), r.get(s, "club"))))) {
          await r.write("<!--这堆外星代码虽然晦涩，但是懒得改了，能用就好……而且改掉未必比这个简洁-->\r\n<!--计算最适列数-->");
          r.assign(r.slot(s, ["sz"]), (await r.call("count", r.get(s, "slis"))));
          if (r.truth(r.equal(r.modulo(r.get(s, "sz"), r.get(s, "tmp_row_num")), 0))) {
            r.assign(r.slot(s, ["lz"]), r.get(s, "tmp_row_num"));
          } else {
            if (r.truth(r.equal(r.modulo(r.get(s, "sz"), r.subtract(r.get(s, "tmp_row_num"), 1)), 0))) {
              r.assign(r.slot(s, ["lz"]), r.subtract(r.get(s, "tmp_row_num"), 1));
            } else {
              if (r.truth((r.compare(r.modulo(r.get(s, "sz"), r.get(s, "tmp_row_num")), r.modulo(r.get(s, "sz"), r.subtract(r.get(s, "tmp_row_num"), 1))) >= 0))) {
                r.assign(r.slot(s, ["lz"]), r.get(s, "tmp_row_num"));
              } else {
                r.assign(r.slot(s, ["lz"]), r.subtract(r.get(s, "tmp_row_num"), 1));
              }
            }
          }
          await r.write("<!--计算首列的行数-->");
          r.assign(r.slot(s, ["rz"]), (await r.call("floor", r.divide(r.get(s, "sz"), r.get(s, "lz")))));
          r.assign(r.slot(s, ["rz"]), r.int(r.get(s, "rz")));
          if (r.truth((!r.equal(r.modulo(r.get(s, "sz"), r.get(s, "lz")), 0)))) {
            r.post(r.slot(s, ["rz"]), 1);
          }
          if (r.truth((await r.call("is_array", (await r.call("range", 0, r.subtract(r.get(s, "rz"), 1))))))) {
            {
              const a2 = r.copy((await r.call("range", 0, r.subtract(r.get(s, "rz"), 1))));
              for (const [k2, v2] of r.entries(a2)) {
                r.assign(r.slot(s, ["i"]), v2);
                await r.write("<tr>\r\n<!--首列：称号名-->");
                if (r.truth(r.equal(r.get(s, "i"), 0))) {
                  await r.write("<td class=\"b1\" rowspan=\"");
                  await r.write(r.text(r.get(s, "rz")));
                  await r.write("\">");
                  await r.write(r.text(r.get(r.get(s, "clubinfo"), r.get(s, "nowclub"))));
                  await r.write("</td>");
                }
                r.assign(r.slot(s, ["cz"]), r.get(s, "lz"));
                if (r.truth((r.truth(r.equal(r.get(s, "i"), r.subtract(r.get(s, "rz"), 1))) && r.truth((!r.equal(r.modulo(r.get(s, "sz"), r.get(s, "lz")), 0)))))) {
                  r.assign(r.slot(s, ["cz"]), r.modulo(r.get(s, "sz"), r.get(s, "lz")));
                }
                if (r.truth((await r.call("is_array", (await r.call("range", 0, r.subtract(r.get(s, "cz"), 1))))))) {
                  {
                    const a3 = r.copy((await r.call("range", 0, r.subtract(r.get(s, "cz"), 1))));
                    for (const [k3, v3] of r.entries(a3)) {
                      r.assign(r.slot(s, ["j"]), v3);
                      r.list([r.slot(s, ["skillid"]), r.slot(s, ["cost"]), r.slot(s, ["now_learnable"])], r.get(r.get(s, "slis"), r.add(r.multiply(r.get(s, "i"), r.get(s, "lz")), r.get(s, "j"))));
                      await r.write("<td class=\"b3\">");
                      await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "skillid"))));
                      await r.write("</td>");
                      if (r.truth((await r.module("skillbase", "skill_query", r.get(s, "skillid"))))) {
                        if (r.truth(r.get(s, "is_show_cost"))) {
                          await r.write("<td class=\"b3\"><span class=\"grey b\">∞</span></td>");
                        }
                        await r.write("<td class=\"b3\"><span class=\"grey b\">已经获得</span></td>");
                      } else {
                        if (r.truth(r.get(s, "is_show_cost"))) {
                          if (r.truth((r.compare(r.get(s, "cost"), 0) > 0))) {
                            await r.write("<td class=\"b3\"><span class=\"lime b\">");
                            await r.write(r.text(r.get(s, "cost")));
                            await r.write("</span></td>");
                          } else {
                            await r.write("<td class=\"b3\"><span class=\"grey b\">-</span></td>");
                          }
                        }
                        await r.write("<td class=\"b3\">\r\n<!--查看按钮-->\r\n<span style=\"width:40px;\"\r\nonmouseover=\"skilldesc_onmouseover(");
                        await r.write(r.text(r.get(s, "caller_id")));
                        await r.write(", ");
                        await r.write(r.text(r.get(s, "skillid")));
                        await r.write(", this);\"\r\nonmouseout=\"skilldesc_onmouseout(");
                        await r.write(r.text(r.get(s, "caller_id")));
                        await r.write(", ");
                        await r.write(r.text(r.get(s, "skillid")));
                        await r.write(");\"><input type=\"button\" style=\"width:38px;\" value=\"查看\"></span>\r\n<!--学习按钮-->");
                        if (r.truth(r.get(s, "now_learnable"))) {
                          await r.write("<span style=\"width:40px;\"><input type=\"button\" style=\"width:38px\"\r\nonclick=\"$('mode').value='special';$('command').value='skill");
                          await r.write(r.text(r.get(s, "caller_id")));
                          await r.write("_special';$('subcmd').value='upgrade';$('skillpara1').value='");
                          await r.write(r.text(r.get(s, "skillid")));
                          await r.write("';postCmd('gamecmd','command.php');this.disabled=true;\" value=\"学习\"></span>");
                        } else {
                          await r.write("<span style=\"width:40px;\"><input type=\"button\" style=\"width:38px\" disabled value=\"学习\"></span>");
                        }
                        await r.write("</td>");
                      }
                    }
                  }
                }
                if (r.truth((await r.call("is_array", (await r.call("range", r.get(s, "cz"), r.subtract(r.get(s, "tmp_row_num"), 1))))))) {
                  {
                    const a4 = r.copy((await r.call("range", r.get(s, "cz"), r.subtract(r.get(s, "tmp_row_num"), 1))));
                    for (const [k4, v4] of r.entries(a4)) {
                      r.assign(r.slot(s, ["k"]), v4);
                      if (r.truth(r.get(s, "is_show_cost"))) {
                        await r.write("<td></td><td></td><td></td>");
                      } else {
                        await r.write("<td></td><td></td>");
                      }
                    }
                  }
                }
                await r.write("</tr>");
              }
            }
          }
        }
      }
    }
  }
  await r.write("</table>");
return 1;
}
