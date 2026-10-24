import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir,mkdtemp,rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createCookiePass } from '../native/accounts/primitives.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
test('request host assembles actual database, modules, account, files and templates without shared request state',{timeout:60000},async t=>{
  const db=await isolatedDatabase(t,'request_host');if(!db)return;
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});const stateRoot=await mkdtemp(path.join(parent,'native-request-host-'));
  const broadcast=createRoomBroadcast(),maintenance=createMaintenanceGate(),hosts=[];
  t.after(async()=>{for(const host of hosts)await host.close();broadcast.close();await maintenance.close();assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent)+path.sep));await rm(stateRoot,{recursive:true,force:true});});
  await installNative({database:db.database,stateRoot,admin:{username:'宿主测试',password:'HostFixtureOnly!'}});
  const request={pathname:'/login.php',input:prepareInputRequest({cookies:{bra_user:'宿主测试',bra_pass:createCookiePass('HostFixtureOnly!')}}),server:{SERVER_PORT:'80'},pageStartTime:1700000000};
  const options={configuration:nativeGameplayModules.map(module=>({name:module.name,enabled:true})),databaseOptions:db.credentials,sourceRoot:path.join(root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',request,broadcast,maintenance,clock:{now:()=>1700000000},randomSeed:77,systemConfig:{gtablepre:'bra_',gamefounder:'宿主测试'}};
  const first=await createNativeRequestHost(options);hosts.push(first);
  assert.equal((await first.accounts.authenticate(first.scope)).username,'宿主测试');
  await first.session.call('sys','load_gameinfo');assert.equal(first.scope.room_id,0);
  assert.ok(first.session.state('player').db_player_structure.length>40);
  const html=await first.templates.render('login_page',first.scope);assert.match(html,/<form/);assert.match(html,/username/);
  first.scope.custom_host_probe='only first';first.session.state('sys').gamevars={probe:1};
  const second=await createNativeRequestHost({...options,request:{...request,input:prepareInputRequest()}});hosts.push(second);
  assert.equal(second.scope.custom_host_probe,undefined);assert.equal(second.scope.cuser,null);assert.equal(second.scope.gamevars?.probe,undefined);
  assert.equal(second.output.peek(),'');
  // command.php defines CURSCRIPT='game' upstream, independently of its URL.
  // Otherwise the next AJAX profile silently loses all wound onclick handlers.
  for (const pathname of ['/command.php','/act.php','/replay.php','/index.php']) {
    const host=await createNativeRequestHost({...options,request:{...request,pathname,input:prepareInputRequest()}});hosts.push(host);
    const game=pathname!=='/index.php';
    assert.equal(host.constants.CURSCRIPT,game?'game':'index',pathname);
    for(const theme of [1,2])for(const mode of ['command','combat']) {
      const profile=await host.templates.render('MOD_WOUND_WOUND_PICTURE',{inf:'hbaf',mode},theme);
      for(const mark of 'hbaf') {
        const image=profile.match(new RegExp('<img id="inf'+mark+'"[^>]*>'))?.[0];assert.ok(image);
        assert.equal(image.includes('onclick='),game&&mode==='command',`${pathname} theme ${theme} ${mode} ${mark}`);
      }
    }
    await host.close();
  }
  await t.test('area countdown follows the dispatched game page and remains disabled outside play', async () => {
    const cases = [
      ['/game.php', {}, true], ['/act.php', {}, true], ['/command.php', {}, true],
      ['/command.php', { page: 'command' }, true], ['/command.php', { page: 'command_game' }, true],
      ['/command.php', { command: 'area_timing_refresh' }, true],
      ['/command.php', { page: 'command_news' }, false], ['/command.php', { page: 'command_end' }, false],
      ['/news.php', {}, false], ['/index.php', {}, false], ['/replay.php', {}, false],
      ['/replay.php', { page: 'command_game' }, false],
    ];
    for (const [pathname, post, on] of cases) {
      const host = await createNativeRequestHost({ ...options, request: { ...request, pathname, input: prepareInputRequest({ post }) } });
      hosts.push(host);
      try {
        assert.equal(host.services.system.request.inReplay, pathname === '/replay.php');
        const sys = host.session.state('sys'); sys.uip = null; sys.areatime = sys.now + 90;
        await host.session.call('map', 'init_areatiming');
        assert.deepEqual(sys.uip.timing.area_timing, { on, mode: 0, timing: 90000, timing_r: '01:30' }, pathname + JSON.stringify(post));
        for (const theme of [1, 2]) {
          const html = await host.templates.render('MOD_MAP_PROFILE_AREAINFO', host.scope, theme);
          assert.equal(html.includes('????'), !on, `${pathname}/${theme}`);
          assert.equal(html.includes("updateTime('area_timing', 90000, 0)"), on, `${pathname}/${theme}`);
        }
      } finally { await host.close(); }
    }
  });
});
