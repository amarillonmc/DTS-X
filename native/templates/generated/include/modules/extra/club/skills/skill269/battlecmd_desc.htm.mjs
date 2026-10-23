// Generated from include/modules/extra/club/skills/skill269/battlecmd_desc.htm; edit source migration/compiler, not generated code.
export default async function render(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.assign(r.slot(s, ["rageneed"]), (await r.module("skill269", "get_rage_cost269")));
  r.assign(r.slot(s, ["rageneed0"]), r.assign(r.slot(s, ["hpcost"]), (await r.module("skill269", "get_min_rage_cost269"))));
  r.assign(r.slot(s, ["hpcost"]), (await r.module("skill269", "get_hp_cost269", r.get(s, "sdata"), r.get(s, "edata"), 1)));
  if (r.truth((!r.truth((await r.module("clubbase", "check_battle_skill_unactivatable", r.get(s, "sdata"), r.get(s, "edata"), 269)))))) {
    if (r.truth((r.compare(r.get(s, "rage"), r.get(s, "rageneed")) >= 0))) {
      await r.write("消耗<span class=\"red b\">");
      await r.write(r.text(r.get(s, "rageneed")));
      await r.write("</span>怒气，附加<span class=\"red b\">");
      await r.write(r.text(r.get(s, "hpcost")));
      await r.write("</span>点伤害。");
    } else {
      await r.write("消耗<span class=\"red b\">");
      await r.write(r.text(r.get(s, "rageneed0")));
      await r.write("</span>怒气以及<span class=\"red b\">");
      await r.write(r.text(r.get(s, "hpcost")));
      await r.write("</span>点生命值，附加消耗生命数值的伤害。");
    }
  } else {
    await r.write("怒气不足，至少需要<span class=\"red b\">");
    await r.write(r.text(r.get(s, "rageneed0")));
    await r.write("</span>怒气");
  }
return 1;
}
