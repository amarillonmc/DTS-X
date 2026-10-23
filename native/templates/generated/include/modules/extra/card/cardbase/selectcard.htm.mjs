// Generated from include/modules/extra/card/cardbase/selectcard.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  if (r.truth((r.truth((!r.truth(r.get(s, "energy_recover_rate")))) && r.truth((!r.truth((!r.truth(r.get(s, "udata"))))))))) {
    r.assign(r.slot(s, ["energy_recover_rate"]), (await r.module("cardbase", "get_energy_recover_rate", r.get(s, "card_ownlist"), r.get(r.get(s, "udata"), "gold"))));
  }
  if (r.truth((!r.truth(((r.get(s, "cardChosen") != null)))))) {
    r.assign(r.slot(s, ["cardChosen"]), 0);
  }
  r.assign(r.slot(s, ["chosencard"]), r.get(s, "cardChosen"));
  r.assign(r.slot(s, ["current_pack"]), (r.truth((!r.truth((await r.call("in_array", r.get(r.get(r.get(s, "cards"), r.get(s, "chosencard")), "pack"), r.get(s, "packlist")))))) ? 0 : (await r.call("array_search", r.get(r.get(r.get(s, "cards"), r.get(s, "chosencard")), "pack"), r.get(s, "packlist")))));
  if (r.truth((!r.truth(((r.get(s, "hideDisableButton") != null)))))) {
    r.assign(r.slot(s, ["hideDisableButton"]), 0);
  }
  await r.write("<script>\r\ncarderrmsg = ");
  if (r.truth(((r.get(s, "card_error") != null)))) {
    await r.write(r.text((await r.call("json_encode", r.get(s, "card_error")))));
  } else {
    await r.write(r.text(0));
  }
  await r.write(";\r\nisShowAll = 0;\r\ncurrent_pack = ");
  await r.write(r.text(r.get(s, "current_pack")));
  await r.write(";\r\nchosen_card_id = ");
  await r.write(r.text(r.get(s, "chosencard")));
  await r.write(";\r\nnowsearch = '';\r\nnowsearchid = 0;\r\nsearchresult = new Array();\r\npacklist_rev=");
  await r.write(r.text((await r.call("json_encode", (await r.call("array_flip", r.get(s, "packlist")))))));
  await r.write(";\r\ncardinfo=");
  await r.write(r.text((await r.call("json_encode", r.get(s, "cards")))));
  await r.write(";\r\nhandleShowCardMouseOver = function(id) \r\n{ \r\nid=parseInt(id);\r\njQuery('.cardoption').hide();\r\njQuery('#card'+id).show();\r\n}\r\nhandleShowCardMouseOut = function(id) \r\n{ \r\nid=parseInt(id);\r\njQuery('.cardoption').hide();\r\njQuery('#card'+chosen_card_id).show();\r\n}\r\nhandleShowCardMouseClick = function(id) \r\n{ \r\nid=parseInt(id);\r\njQuery('#cardbg'+chosen_card_id+'-0').attr('src','img/cardbg.png');\r\nif (");
  await r.write(r.text(r.get(s, "hideDisableButton")));
  await r.write(" == 1) jQuery('#cardbg'+chosen_card_id+'-1').attr('src','img/cardbg.png');\r\nchosen_card_id = id;\r\nhandleShowCardMouseOver(id);\r\njQuery('#cardbg'+chosen_card_id+'-0').attr('src','img/cardbg-selected.png');\r\nif (");
  await r.write(r.text(r.get(s, "hideDisableButton")));
  await r.write(" == 1) jQuery('#cardbg'+chosen_card_id+'-1').attr('src','img/cardbg-selected.png');\r\nif (jQuery('#cardUnavailableHint')) jQuery('#cardUnavailableHint').html('');\r\nvar packid; packid = parseInt(packlist_rev[cardinfo[id]['pack']]);\r\nif(current_pack != packid) handleCardPackMouseClick(packid);\r\n}\r\nhandleCardPackMouseClick = function(id) \r\n{\r\nif (id==current_pack) return;\r\njQuery('#cardpanel'+id+'-'+isShowAll).css({display:'block'});\r\njQuery('#cardpackbg'+id).attr('src','img/cardpack-selected.png');\r\njQuery('#cardpanel'+current_pack+'-'+isShowAll).css({display:'none'});\r\njQuery('#cardpackbg'+current_pack).attr('src','img/cardpack.png');\r\ncurrent_pack=id;\r\n}\r\nhandleShowAvailableOnlyClick = function(t)\r\n{\r\nvar isChecked = t.checked;\r\nif (isChecked)\r\n{\r\njQuery('#cardpanel'+current_pack+'-0').css({display:'block'});\r\njQuery('#cardpanel'+current_pack+'-1').css({display:'none'});\r\nisShowAll = 0;\r\n}\r\nelse\r\n{\r\njQuery('#cardpanel'+current_pack+'-1').css({display:'block'});\r\njQuery('#cardpanel'+current_pack+'-0').css({display:'none'});\r\nisShowAll = 1;\r\n}\r\n}\r\nhandleShowCardErrorMouseOut = function() \r\n{\r\n$('cardErrMsg').style.display=\"none\";\r\n}\r\ncardSearchInit = function()\r\n{\r\nvar s = jQuery('#cardsearch_input').val().toString();\r\nif(!s) return;\r\nif(s != nowsearch){\r\nnowsearch = s;\r\nnowsearchid = 0;\r\nsearchresult = new Array();\r\nfor(var ci in cardinfo){\r\nif(unicode_to_chinese(cardinfo[ci]['name']).match(s) || unicode_to_chinese(cardinfo[ci]['effect']).match(s)){\r\nif(jQuery('#carderr'+ci).length == 0)\r\nsearchresult.push(ci);\r\n}\r\n}\r\nif(searchresult.length > 0)\t{\r\nhandleShowCardMouseClick(searchresult[0]);\r\njQuery('#cardsearch_feedback')[0].innerHTML='第'+1+'/'+searchresult.length+'个结果';\r\n}else {\r\njQuery('#cardsearch_feedback')[0].innerHTML='没有搜索结果';\r\n}\r\n}else{\r\nif(searchresult.length <= 0) return;\r\nif(nowsearchid < searchresult.length - 1) nowsearchid ++;\r\nelse nowsearchid = 0;\r\nhandleShowCardMouseClick(searchresult[nowsearchid]);\r\njQuery('#cardsearch_feedback')[0].innerHTML='第'+(nowsearchid+1)+'/'+searchresult.length+'个结果';\r\n}\r\n}\r\n</script>\r\n<div style=\"height:480px; width:1200px; margin:auto\">\r\n<div style=\"display:inline-block; height:480px; width:160px; vertical-align:top;\">\r\n<div style=\"height:10px;\"></div>");
  r.assign(r.slot(s, ["packid"]), (-r.number(1)));
  if (r.truth((await r.call("is_array", r.get(s, "packlist"))))) {
    {
      const a0 = r.copy(r.get(s, "packlist"));
      for (const [k0, v0] of r.entries(a0)) {
        r.assign(r.slot(s, ["cardpack"]), v0);
        r.post(r.slot(s, ["packid"]), 1);
        await r.write("<div class=\"cardpack_bar\">\r\n<img class=\"cardpack_bg\" id=\"cardpackbg");
        await r.write(r.text(r.get(s, "packid")));
        await r.write("\" src=\"");
        if (r.truth(r.equal(r.get(s, "packid"), r.get(s, "current_pack")))) {
          await r.write("img/cardpack-selected.png");
        } else {
          await r.write("img/cardpack.png");
        }
        await r.write("\">\r\n<div class=\"cardpack_cnt\">\r");
        await r.write(r.text(r.get(s, "cardpack")));
        await r.write("</div><div class=\"cardpack_czone\" onmousedown=\"handleCardPackMouseClick(");
        await r.write(r.text(r.get(s, "packid")));
        await r.write(");\">\r\n</div>\r\n</div>");
      }
    }
  }
  await r.write("</div><div style=\"display:inline-block; height:480px; width:710px;\">\r\n<div id=\"selectcard_middle\" style=\"position: relative; height:480px; width:710px;\"> ");
  r.assign(r.slot(s, ["packid"]), (-r.number(1)));
  if (r.truth((await r.call("is_array", r.get(s, "packlist"))))) {
    {
      const a1 = r.copy(r.get(s, "packlist"));
      for (const [k1, v1] of r.entries(a1)) {
        r.assign(r.slot(s, ["cardpack"]), v1);
        r.post(r.slot(s, ["packid"]), 1);
        if (r.truth((await r.call("is_array", r.array([[r.APPEND, 0], [r.APPEND, 1]]))))) {
          {
            const a2 = r.copy(r.array([[r.APPEND, 0], [r.APPEND, 1]]));
            for (const [k2, v2] of r.entries(a2)) {
              r.assign(r.slot(s, ["showDisableVal"]), v2);
              if (r.truth((r.compare(r.get(s, "showDisableVal"), r.get(s, "hideDisableButton")) <= 0))) {
                await r.write("<div id=\"cardpanel");
                await r.write(r.text(r.get(s, "packid")));
                await r.write("-");
                await r.write(r.text(r.get(s, "showDisableVal")));
                await r.write("\" class=\"cardpanel gscroll b3\" style=\"display: ");
                if (r.truth((r.truth(r.equal(r.get(s, "packid"), r.get(s, "current_pack"))) && r.truth(r.equal(r.get(s, "showDisableVal"), 0))))) {
                  await r.write("block");
                } else {
                  await r.write("none");
                }
                await r.write("\">\r\n\r\n<!--坑爹的html中的空格问题，每个div的close tag只好在生成下一个div时输出了-->\r\n<div id=\"a");
                await r.write(r.text(r.get(s, "packid")));
                await r.write("-");
                await r.write(r.text(r.get(s, "showDisableVal")));
                await r.write("\" style=\"display:inline-block; width:0px;\">");
                r.assign(r.slot(s, ["row"]), 0);
                r.assign(r.slot(s, ["flag"]), 1);
                r.assign(r.slot(s, ["last"]), (-r.number(1)));
                if (r.truth((await r.call("is_array", r.get(s, "cardindex"))))) {
                  {
                    const a3 = r.copy(r.get(s, "cardindex"));
                    for (const [k3, v3] of r.entries(a3)) {
                    r.assign(r.slot(s, ["cardrank"]), k3);
                      r.assign(r.slot(s, ["t"]), v3);
                      if (r.truth((!r.truth((await r.call("in_array", r.get(s, "cardrank"), (await r.call("array_keys", r.get(s, "cardtypecd"))))))))) {
                        continue;
                      }
                      if (r.truth((await r.call("is_array", r.array([[r.APPEND, 0], [r.APPEND, 1]]))))) {
                        {
                          const a4 = r.copy(r.array([[r.APPEND, 0], [r.APPEND, 1]]));
                          for (const [k4, v4] of r.entries(a4)) {
                            r.assign(r.slot(s, ["disableValue"]), v4);
                            if (r.truth((r.compare(r.get(s, "disableValue"), r.get(s, "showDisableVal")) <= 0))) {
                              if (r.truth((await r.call("is_array", r.get(s, "cards"))))) {
                                {
                                  const a5 = r.copy(r.get(s, "cards"));
                                  for (const [k5, v5] of r.entries(a5)) {
                                  r.assign(r.slot(s, ["cardid"]), k5);
                                    r.assign(r.slot(s, ["t"]), v5);
                                    if (r.truth((r.truth((r.truth(r.equal(r.get(r.get(s, "t"), "pack"), r.get(s, "cardpack"))) && r.truth(r.equal(r.get(r.get(s, "t"), "rare"), r.get(s, "cardrank"))))) && r.truth((await r.call("in_array", r.get(s, "cardid"), r.get(s, "card_ownlist"))))))) {
                                      r.assign(r.slot(s, ["carddisabled"]), (await r.call("in_array", r.get(s, "cardid"), (await r.call("array_keys", r.get(s, "card_disabledlist"))))));
                                      if (r.truth((r.truth((!r.truth(r.get(s, "hideDisableButton")))) || r.truth(r.equal(r.get(s, "carddisabled"), r.get(s, "disableValue")))))) {
                                        if (r.truth(r.equal(r.get(s, "row"), 0))) {
                                          await r.write("</div><div class=\"card_row\">");
                                        }
                                        if (r.truth((!r.truth(r.get(s, "carddisabled"))))) {
                                          r.assign(r.slot(s, ["flag"]), 2);
                                        }
                                        if (r.truth((r.truth(r.get(s, "carddisabled")) && r.truth((r.truth(r.equal(r.get(s, "last"), (-r.number(1)))) || r.truth((!r.equal(r.get(r.get(s, "t"), "rare"), r.get(r.get(r.get(s, "cards"), r.get(s, "last")), "rare"))))))))) {
                                          r.assign(r.slot(s, ["flag"]), 1);
                                        }
                                        r.assign(r.slot(s, ["cardname"]), r.get(r.get(s, "t"), "name"));
                                        r.assign(r.slot(s, ["cl"]), r.get(r.get(s, "card_rarecolor"), r.get(s, "cardrank")));
                                        if (r.truth(r.get(s, "carddisabled"))) {
                                          r.update(r.slot(s, ["cl"]), "concat", "Disabled");
                                        }
                                        await r.write("<div class=\"card_bar");
                                        if (r.truth((!r.truth(r.get(s, "carddisabled"))))) {
                                          await r.write(" pt");
                                        }
                                        await r.write("\">\r\n<img class=\"card_bg\" src=");
                                        if (r.truth((!r.truth(r.get(s, "carddisabled"))))) {
                                          await r.write("\"img/cardborder-");
                                          await r.write(r.text(r.get(s, "cardrank")));
                                          await r.write(".png\"");
                                        } else {
                                          await r.write("\"img/cardborder-");
                                          await r.write(r.text(r.get(s, "cardrank")));
                                          await r.write("-disabled-1.png\"");
                                        }
                                        await r.write(">\r\n<img class=\"card_bg\" id=\"cardbg");
                                        await r.write(r.text(r.get(s, "cardid")));
                                        await r.write("-");
                                        await r.write(r.text(r.get(s, "showDisableVal")));
                                        await r.write("\" src=");
                                        if (r.truth((r.truth(r.equal(r.get(s, "chosencard"), r.get(s, "cardid"))) && r.truth((!r.truth(r.get(s, "carddisabled"))))))) {
                                          await r.write("\"img/cardbg-selected.png\"");
                                        } else {
                                          await r.write("\"img/cardbg.png\"");
                                        }
                                        await r.write(">\r\n<div class=\"card_name\">\r\n<span class=\"");
                                        await r.write(r.text(r.get(s, "cl")));
                                        await r.write("\">");
                                        await r.write(r.text(r.get(r.get(s, "t"), "rare")));
                                        await r.write(" ");
                                        await r.write(r.text(r.get(s, "cardname")));
                                        await r.write("</span>\r\n</div>");
                                        if (r.truth((!r.truth(r.get(s, "carddisabled"))))) {
                                          await r.write(" \r\n<div class=\"card_czone\"\r\nonmouseover=\"handleShowCardMouseOver(");
                                          await r.write(r.text(r.get(s, "cardid")));
                                          await r.write(");\" \r\nonmouseout=\"handleShowCardMouseOut(");
                                          await r.write(r.text(r.get(s, "cardid")));
                                          await r.write(");\" \r\nonmousedown=\"handleShowCardMouseClick(");
                                          await r.write(r.text(r.get(s, "cardid")));
                                          await r.write(");\">\r\n</div>");
                                        } else {
                                          await r.write("<div id=\"carderr");
                                          await r.write(r.text(r.get(s, "cardid")));
                                          await r.write("\" class=\"card_err\"\r\ntitle=\"");
                                          if (r.truth((await r.call("is_array", r.get(r.get(s, "card_disabledlist"), r.get(s, "cardid")))))) {
                                            {
                                              const a6 = r.copy(r.get(r.get(s, "card_disabledlist"), r.get(s, "cardid")));
                                              for (const [k6, v6] of r.entries(a6)) {
                                                r.assign(r.slot(s, ["cdlv"]), v6);
                                                await r.write(r.text(r.get(r.get(s, "card_error"), r.get(s, "cdlv"))));
                                                await r.write("<br>");
                                              }
                                            }
                                          }
                                          await r.write("\">\r\n</div>");
                                        }
                                        await r.write("</div>");
                                        r.assign(r.slot(s, ["row"]), r.add(r.get(s, "row"), 1));
                                        r.assign(r.slot(s, ["last"]), r.get(s, "cardid"));
                                        if (r.truth(r.equal(r.get(s, "row"), 18))) {
                                          r.assign(r.slot(s, ["row"]), 0);
                                          r.assign(r.slot(s, ["flag"]), 1);
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                await r.write("</div>\r\n</div>");
              }
            }
          }
        }
      }
    }
  }
  if (r.truth(r.get(s, "hideDisableButton"))) {
    await r.write("<div style=\"position: absolute; right:5px; bottom:-20px;\">\r\n<input type=\"checkbox\" onclick=\"handleShowAvailableOnlyClick(this);\" checked><span>只显示目前可用卡片</span>\r\n</div>");
  }
  await r.write("</div>\r\n</div><div style=\"display:inline-block; height:480px; width:240px; vertical-align:top; margin-left:30px\">\r\n<div ");
  if (r.truth((!r.truth((!r.truth(r.get(s, "no_select"))))))) {
    await r.write("style=\"display:none\"");
  }
  await r.write(">\r\n<input type=\"text\" id=\"cardsearch_input\" size=\"12\">&nbsp;&nbsp;\r\n<input type=\"button\" class=\"b_button bc_black\" style=\"width:100px;padding-left: 0;padding-right: 0;\" value=\"搜索/下一个\" onclick=\"cardSearchInit()\">&nbsp;&nbsp;&nbsp;\r\n<div id=\"cardsearch_feedback\" class=\"yellow b\">\r\n&nbsp;\r\n</div>\r\n</div><div style=\"height:30px;\">\r\n<span class=\"yellow b\" style=\"line-height:30px\">当前被选择的卡片</span>\r\n</div><div style=\"position: relative;\">");
  r.assign(r.slot(s, ["showpack"]), 0);
  if (r.truth((await r.call("is_array", r.get(s, "cards"))))) {
    {
      const a7 = r.copy(r.get(s, "cards"));
      for (const [k7, v7] of r.entries(a7)) {
      r.assign(r.slot(s, ["cardid"]), k7);
        r.assign(r.slot(s, ["nowcard"]), v7);
        r.assign(r.slot(s, ["nowcard", "id"]), r.get(s, "cardid"));
        r.assign(r.slot(s, ["nowcard", "blink"]), (r.truth((!r.truth((!r.truth(r.get(r.get(r.get(s, "card_data_fetched"), r.get(s, "cardid")), "blink")))))) ? r.get(r.get(r.get(s, "card_data_fetched"), r.get(s, "cardid")), "blink") : 0));
        if (r.truth((await r.call("in_array", r.get(s, "cardid"), r.get(s, "card_ownlist"))))) {
          if (r.truth((await r.call("in_array", r.get(s, "cardid"), (await r.call("array_keys", r.get(s, "card_disabledlist"))))))) {
            r.assign(r.slot(s, ["unavailable"]), 1);
          } else {
            r.assign(r.slot(s, ["unavailable"]), 0);
          }
          r.assign(r.slot(s, ["card_achieved"]), (await r.call("in_array", r.get(s, "cardid"), r.get(s, "card_achieved_list"))));
          await r.write("<div id=\"card");
          await r.write(r.text(r.get(s, "cardid")));
          await r.write("\" class=\"cardoption\"");
          if (r.truth((!r.equal(r.get(s, "chosencard"), r.get(s, "cardid"))))) {
            await r.write(" style=\"display:none\"");
          }
          await r.write(" ");
          if (r.truth((!r.truth((!r.truth(r.get(r.get(s, "nowcard"), "desc_skills"))))))) {
            await r.write("title=\"");
            await r.write(r.text(r.get(r.get(s, "nowcard"), "desc_skills")));
            await r.write("\"");
          }
          await r.write(">");
          (await r.include(r.template("MOD_CARDBASE_CARD_FRAME"), s));
          await r.write("</div>");
        }
      }
    }
  }
  await r.write("</div><div style=\"height:30px;\">");
  if (r.truth((r.truth(r.get(s, "showCardUnavailableHint")) && r.truth((await r.call("in_array", r.get(s, "chosencard"), (await r.call("array_keys", r.get(s, "card_disabledlist"))))))))) {
    await r.write("<span id=\"cardUnavailableHint\" class=\"yellow b\" style=\"line-height:30px\">当前卡片暂时不可用，请重新选择！</span>");
  }
  await r.write("</div><div style=\"text-align:center;");
  if (r.truth((!r.truth((!r.truth(r.get(s, "no_select"))))))) {
    await r.write("display:none;");
  }
  await r.write("\">");
  if (r.truth((r.compare(r.add(r.get(s, "cd_s"), r.get(r.get(s, "cardtypecd"), "S")), r.get(s, "now")) > 0))) {
    await r.write("<span class=\"gold b\">");
    await r.write(r.text((await r.call("convert_tm", r.subtract(r.add(r.get(s, "cd_s"), r.get(r.get(s, "cardtypecd"), "S")), r.get(s, "now"))))));
    await r.write("后才可使用S级身份卡</span><br>");
  }
  if (r.truth((r.compare(r.add(r.get(s, "cd_a"), r.get(r.get(s, "cardtypecd"), "A")), r.get(s, "now")) > 0))) {
    await r.write("<span class=\"cyan b\">");
    await r.write(r.text((await r.call("convert_tm", r.subtract(r.add(r.get(s, "cd_a"), r.get(r.get(s, "cardtypecd"), "A")), r.get(s, "now"))))));
    await r.write("后才可使用A级身份卡</span><br>");
  }
  if (r.truth((r.compare(r.add(r.get(s, "cd_b"), r.get(r.get(s, "cardtypecd"), "B")), r.get(s, "now")) > 0))) {
    await r.write("<span class=\"brickred b\">");
    await r.write(r.text((await r.call("convert_tm", r.subtract(r.add(r.get(s, "cd_b"), r.get(r.get(s, "cardtypecd"), "B")), r.get(s, "now"))))));
    await r.write("后才可使用B级身份卡</span><br>");
  }
  await r.write("</div>\r\n</div>\r\n</div>\r\n\r\n<!-- 悬浮错误提示框 -->\r\n<div id=\"cardErrMsg\" style=\"position:fixed; left:0px; top:0px; display:none; text-align:left;  filter:alpha(opacity=95); opacity:0.95; background-color:#000000\">\r\n<div id=\"cardErrMsgInner\" class=\"noselect\" style=\"margin-left:3px; margin-right:3px; margin-top:3px; margin-bottom:3px;\">\r\n</div>\r\n</div>");
return 1;
}
