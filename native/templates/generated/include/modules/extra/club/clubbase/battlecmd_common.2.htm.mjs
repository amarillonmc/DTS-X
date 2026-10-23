// Generated from include/modules/extra/club/clubbase/battlecmd_common.2.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["rage_func"]), (r.text((r.text((r.text("\\skill") + r.text(r.get(s, "key")))) + r.text("\\get_rage_cost"))) + r.text(r.get(s, "key"))));
  if (r.truth((await r.call("function_exists", r.get(s, "rage_func"))))) {
    r.assign(r.slot(s, ["rageneed"]), (await r.namedCall(r.get(s, "rage_func"), r.get(s, "sdata"))));
  }
  r.assign(r.slot(s, ["skill_state"]), (await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), r.get(s, "key"))));
  r.imports(s, "clubbase", (r.text("skill") + r.text(r.get(s, "key"))));
  r.assign(r.slot(s, ["desc_htm"]), (r.text((r.text("MOD_SKILL") + r.text(r.get(s, "key")))) + r.text("_BATTLECMD_DESC")));
  await r.write("<div><div class=\"cmd_positioner common_cmd\" style=\"height:65px\">\r\n<input type=\"button\" class=\"cmd_button common_cmd glow_buttons white b\" style=\"height:65px;font-size:12pt;\" value=\"");
  await r.write(r.text(r.get(r.get(s, "clubskillname"), r.get(s, "key"))));
  await r.write("\" ");
  if (r.truth((r.compare(r.get(s, "skill_state"), 0) > 0))) {
    await r.write("disabled");
  } else {
    await r.write("onclick=\"$('command').value='';$('bskill').value=");
    await r.write(r.text(r.get(s, "key")));
    await r.write(";postCmd('gamecmd','command.php',this);\"");
  }
  await r.write(">\r\n</div><div \r\nclass=\"cmd_positioner battlecmd_desc\">\r\n<div id=\"battcmd_desc_");
  await r.write(r.text(r.get(s, "key")));
  await r.write("\" class=\"battlecmd_desc glow_buttons ");
  if (r.truth((r.compare(r.get(s, "skill_state"), 0) > 0))) {
    await r.write("grey");
  } else {
    await r.write("white");
  }
  await r.write(" forbidden\">\r\n<div class=\"battlecmd_desc_cont\">");
  if (r.truth((r.compare(r.get(s, "skill_state"), 0) > 0))) {
    if (r.truth(r.equal(1, r.get(s, "skill_state")))) {
      r.imports(s, "itemmain");
      if (r.truth(r.equal("WN", r.get(s, "wepk_req")))) {
        await r.write("空手方可发动");
      } else {
        await r.write("武器不适用，需持<span class=\"yellow b\">");
        await r.write(r.text(r.get(r.get(s, "iteminfo"), r.get(s, "wepk_req"))));
        await r.write("</span>");
      }
    } else {
      if (r.truth(r.equal(2, r.get(s, "skill_state")))) {
        r.imports(s, "weapon");
        await r.write("武器不适用，需持<span class=\"yellow b\">");
        await r.write(r.text(r.get(r.get(s, "skilltypeinfo"), r.get(s, "wep_skillkind_req"))));
        await r.write("系武器</span>");
      } else {
        if (r.truth(r.equal(3, r.get(s, "skill_state")))) {
          await r.write("怒气不足，需要<span class=\"red b\">");
          await r.write(r.text(r.get(s, "rageneed")));
          await r.write("</span>点怒气");
        } else {
          if (r.truth(r.equal(4, r.get(s, "skill_state")))) {
            await r.write("<span class=\"yellow b\">技能冷却中</span>");
          } else {
            if (r.truth(r.equal(5, r.get(s, "skill_state")))) {
              await r.write("<span class=\"red b\">剩余次数用尽</span>");
            } else {
              if (r.truth((await r.call("defined", r.get(s, "desc_htm"))))) {
                (await r.include(r.template(r.get(s, "desc_htm")), s));
              }
            }
          }
        }
      }
    }
  } else {
    if (r.truth((await r.call("defined", r.get(s, "desc_htm"))))) {
      (await r.include(r.template(r.get(s, "desc_htm")), s));
    }
  }
  await r.write("</div>\r\n</div>\r\n</div>\t\r\n</div>");
return 1;
}
