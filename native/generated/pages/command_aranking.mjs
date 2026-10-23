// Static native page from include/pages/command_aranking.php. Build-only source translation.
export default async function execute(r, s) {
  if (r.truth((!r.truth((await r.call("defined", "IN_GAME")))))) {
    r.exit("Access Denied");
  }
  r.imports(s, "sys", "player");
  r.assign(r.slot(s, ["valid"]), false);
  if (r.truth((r.truth(((r.get(s, "asign") != null))) && r.truth(((r.get(s, "apass") != null)))))) {
    {
      const a1 = r.copy(r.get(s, "userdb_receive_list"));
      loop0: for (const [k1, v1] of r.entries(a1)) {
      r.assign(r.slot(s, ["rs"]), k1);
        r.assign(r.slot(s, ["rp"]), v1);
        if (r.truth((r.truth((r.truth(r.identical(r.get(s, "rs"), r.get(s, "asign"))) && r.truth((await r.call("compare_ts_pass", r.get(s, "apass"), r.get(r.get(s, "rp"), "pass")))))) && r.truth((r.truth((!r.truth(r.get(r.get(s, "rp"), "ip")))) || r.truth(r.equal(r.get(r.get(s, "rp"), "ip"), r.get(s, "arealip")))))))) {
          r.assign(r.slot(s, ["valid"]), true);
          break loop0;
        }
      }
    }
  }
  if (r.truth((!r.truth(r.get(s, "valid"))))) {
    await r.write(r.text("Error: Invalid sign"));
  } else {
    if (r.truth((!r.truth(r.get(s, "acmd"))))) {
      await r.write(r.text("Error: Invalid command"));
    } else {
      r.assign(r.slot(s, ["userdb_forced_local"]), 1);
      r.assign(r.slot(s, ["apara1"]), (r.truth((!r.truth((!r.truth(r.get(s, "apara1")))))) ? r.get(s, "apara1") : null));
      r.assign(r.slot(s, ["apara2"]), (r.truth((!r.truth((!r.truth(r.get(s, "apara2")))))) ? r.get(s, "apara2") : null));
      if (r.truth(r.equal("load_aranking", r.get(s, "acmd")))) {
        r.assign(r.slot(s, ["ret"]), (await r.module("activity_ranking", "load_aranking", r.get(s, "apara1"), r.get(s, "apara2"))));
      } else {
        if (r.truth(r.equal("save_ulist_aranking", r.get(s, "acmd")))) {
          r.assign(r.slot(s, ["apara2"]), (await r.call("gdecode", r.get(s, "apara2"), 1)));
          (await r.module("activity_ranking", "save_ulist_aranking", r.get(s, "apara1"), r.get(s, "apara2")));
          r.assign(r.slot(s, ["ret"]), "Successed.");
        }
      }
      if (r.truth((!r.truth(r.get(s, "ret"))))) {
        await r.write(r.text("Error: Invalid command 2"));
      } else {
        await r.write(r.text((await r.call("gencode", r.get(s, "ret")))));
      }
    }
  }
  return null;
}
