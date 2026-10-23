import { present, number as n, text } from '../gameplay/numbers.mjs';
import { utcParts } from './sys-support.mjs';
import { gencode } from '../protocol/codec.mjs';

const required = (owner, method) => { if (typeof owner?.[method] !== 'function') throw new Error(`Native messages require ${method} service`); return owner[method].bind(owner); };
const entries = value => value instanceof Map ? [...value] : Object.entries(value ?? {});
const lookup = (value, key) => value instanceof Map ? value.get(String(key)) ?? value.get(Number(key)) : value?.[key];
const dateText = seconds => { const p = utcParts(seconds, true); return `${p.year}年${p.month.padStart(2,'0')}月${p.day.padStart(2,'0')}日 ${p.hour}:${p.min}:${p.sec}`; };
export function messageEnclosureNumber(enclosure, prefix) {
  if (!/^[a-z_]+$/.test(prefix)) throw new TypeError('Message enclosure prefix must be a known literal');
  return text(enclosure).match(new RegExp(prefix + '_(\\d+)', 's'))?.[1] ?? 0;
}

/** include/messages.func.php and messages.php. Read/write storage is native;
 * cards/logistics/template callbacks must be actual registered module adapters.
 * Mutating page() requires accounts.authenticate(), which holds the request's
 * username OS lock. No message attachment can be claimed twice concurrently.
 * Dates use the engine's already shifted UTC clock, as the sys service does.
 */
export function createMessageService({ database, tablePrefix = 'bra_', users, accounts, clock = () => Date.now() / 1000, cards, logistics, templates }) {
  if (!/^[A-Za-z0-9_]*$/.test(tablePrefix) || typeof database?.query !== 'function') throw new TypeError('Messages require a native database and valid table prefix');
  const table = deleted => tablePrefix + (deleted ? 'del_messages' : 'messages');
  const raw = row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key, typeof value === 'string' ? database.escape(value).slice(1,-1) : value]));
  const create = async (to, title = '', content = '', enclosure = '', from = 'sys', time = 0) => {
    if (!present(to)) return;
    await database.arrayInsert(table(false), raw({ timestamp: present(time) ? time : Math.floor(clock()), sender: from, receiver: to, title, content, enclosure }));
  };
  const checkNew = async username => (await database.query(`SELECT mid FROM ${table(false)} WHERE receiver=${database.escape(text(username))} AND rd=0`)).length;
  const load = async (user, midOnly = 0, deleted = false) => new Map((await database.query(`SELECT ${present(midOnly) ? 'mid' : '*'} FROM ${table(deleted)} WHERE receiver=${database.escape(text(user.username))} ORDER BY ${deleted && !present(midOnly) ? 'dtimestamp' : 'timestamp'} DESC, mid DESC`)).map(row => [row.mid,row]));
  const init = (mode, user) => load(user, 0, ['showdel','recover','del2'].includes(mode));
  const display = async (messages, user) => {
    const result = structuredClone(messages), userCards = await required(cards,'getCardList')(user);
    for (const [id,row] of entries(result)) {
      row.hint = present(row.rd) ? '' : '<span class="L5 b">NEW!</span>'; row.time_disp = dateText(row.timestamp);
      if (row.dtimestamp != null) row.del_time_disp = dateText(row.dtimestamp);
      row.encl_disp = '';
      if (present(row.enclosure) && cards) {
        row.encl_hint = present(row.checked) ? '<span class="grey b">附件已收</span>' : `<a class='L5 b' onclick="$('extracmd').name='sl${id}';$('extracmd').value='1';$('mode').value='check';postCmd('message_cmd', 'messages.php');$('extracmd').name='extracmd';$('extracmd').value='';">附件<br>点此查收</a>`;
        const gold = messageEnclosureNumber(row.enclosure,'getqiegao'); if (present(gold)) row.encl_disp += `<div class="gold b">${gold}切糕</div>`;
        const card = messageEnclosureNumber(row.enclosure,'getcard');
        if (present(card)) {
          const nowcard = structuredClone(cards.cards?.[card]); if (!nowcard) throw new Error('Message references unavailable card metadata');
          const nownew = !userCards.some(id => Number(id) === Number(card)); nowcard.blink = messageEnclosureNumber(row.enclosure,'getcardblink');
          const cardpage = await required(templates,'render')(cards.template, { nowcard, nownew, showpack: 1 });
          row.encl_disp += `<div>卡片：<span class="${cards.rareColors[nowcard.rare]}" title="${cardpage.replaceAll('"',"'")}">${nowcard.name}${nownew ? ' <span class="L5 b">NEW!</span>' : ''}</span></div>`;
        }
        const karma = messageEnclosureNumber(row.enclosure,'getkarma'); if (present(karma)) row.encl_disp += `<div class="cyan b">${karma}因果</div>`;
        const item = messageEnclosureNumber(row.enclosure,'getlogitem');
        if (logistics && present(item) && logistics.items?.[item] != null) row.encl_disp += `<div><span class="yellow b">${messageEnclosureNumber(row.enclosure,'getlogitemnum')}</span>个<span class="evergreen b">${logistics.items[item][0]}</span></div>`;
      }
    }
    return result;
  };
  const check = async (checklist, messages, user, info = []) => {
    if (!cards) return;
    let gold = 0, karma = 0, gotCard = false, gotItem = false;
    for (const id of checklist) {
      const row = lookup(messages,id); if (!row || present(row.checked)) continue;
      if (present(row.enclosure)) {
        const q = messageEnclosureNumber(row.enclosure,'getqiegao'); if (present(q)) { info.push(`获得了<span class="gold b">${q}切糕</span>`); gold += n(q); }
        const card = messageEnclosureNumber(row.enclosure,'getcard');
        if (present(card)) {
          const metadata = cards.cards?.[card]; if (!metadata) throw new Error('Message references unavailable card metadata');
          const blink = messageEnclosureNumber(row.enclosure,'getcardblink'), [isnew, converted] = await required(cards,'getCardAlternative')(card,user,0,blink);
          if (present(isnew)) info.push(`获得了卡片“<span class="${cards.rareColors[metadata.rare]}">${metadata.name}</span>”！`);
          if (present(converted)) info.push(`已有卡片“<span class="${cards.rareColors[metadata.rare]}">${metadata.name}</span>”，转化为了${converted}切糕！`);
          gotCard = true;
        }
        const k = messageEnclosureNumber(row.enclosure,'getkarma'); if (present(k)) { info.push(`获得了<span class="cyan b">${k}因果</span>`); karma += n(k); }
        const item = messageEnclosureNumber(row.enclosure,'getlogitem'), quantity = messageEnclosureNumber(row.enclosure,'getlogitemnum');
        if (logistics && present(item) && logistics.items?.[item] != null && n(quantity) > 0) { info.push(`获得了道具<span class="yellow b">${quantity}</span>个<span class="evergreen b">${logistics.items[item][0]}</span>`); await required(logistics,'itemGet')(item,user,quantity); gotItem = true; }
      }
    }
    if (gold || karma || gotCard || gotItem) {
      const update = { gold: n(user.gold) + gold, gold2: n(user.gold2) + karma, card_data: user.card_data };
      if (logistics && gotItem) update.u_settings = user.u_settings;
      await required(users,'writeRaw')(update,user.username);
    }
  };
  const page = async (input, scope) => {
    const user = await required(accounts,'authenticate')(scope); let mode = input.mode ?? 'show', messages = await init(mode,user), edit = false;
    const info = [], selected = entries(messages).filter(([id]) => present(input['sl' + id])).map(([id]) => id);
    let deleted = [], checked = [], recovered = [];
    if (['del','del2'].includes(mode)) { deleted = selected; edit = deleted.length > 0; }
    else if (mode === 'check') { checked = selected.filter(id => !present(lookup(messages,id).checked) && present(lookup(messages,id).enclosure)); edit = checked.length > 0; }
    else if (mode === 'recover') {
      recovered = selected;
      if (recovered.length) {
        const cost = 100 * recovered.length;
        if (n(user.gold) < cost) info.push('切糕不足，无法恢复邮件！');
        else { await required(cards,'getQiegao')(-cost,user); info.push(`支付了${cost}切糕`); edit = true; }
      }
    }
    const where = list => `mid IN (${list.map(id => { if (!/^\d+$/.test(text(id))) throw new TypeError('Invalid stored message id'); return id; }).join(',')}) AND receiver=${database.escape(user.username)}`;
    if (edit) {
      if (checked.length) { await check(checked,messages,user,info); info.push(checked.length > 1 ? `已查收${checked.length}条消息！` : '消息已查收！'); await database.execute(`UPDATE ${table(false)} SET checked='1' WHERE ${where(checked)}`); }
      if (deleted.length) {
        if (mode === 'del') await database.arrayInsert(table(true), deleted.map(id => { const row = { ...lookup(messages,id), dtimestamp: Math.floor(clock()) }; delete row.mid; return raw(row); }));
        const header = await database.execute(`DELETE FROM ${table(mode === 'del2')} WHERE ${where(deleted)}`); info.push(`已${mode === 'del2' ? '彻底' : ''}删除${header.affectedRows}条消息！`);
      }
      if (recovered.length) {
        await database.arrayInsert(table(false), recovered.map(id => { const row = { ...lookup(messages,id) }; delete row.mid; delete row.dtimestamp; return raw(row); }));
        const header = await database.execute(`DELETE FROM ${table(true)} WHERE ${where(recovered)}`); info.push(`已恢复${header.affectedRows}条消息！`);
      }
      if (['recover','del2'].includes(mode)) mode = 'showdel'; messages = await init(mode,user);
    } else if (!mode.startsWith('show') && !info.length) info.push('没有做任何更改');
    if (mode === 'show' && entries(messages).some(([,row]) => !present(row.rd))) await database.execute(`UPDATE ${table(false)} SET rd='1' WHERE receiver=${database.escape(user.username)} AND rd='0'`);
    messages = await display(messages,user);
    const context = { udata: user, username: user.username, mode, messages, info, message_rec_cost: 100 };
    if (mode === 'show') return { template: 'message_page', context };
    const data = { innerHTML: { info: info.join('<br>'), messages: await required(templates,'render')('messages',context) } };
    return { data, payload: gencode(data), context };
  };
  return Object.freeze({ create, checkNew, load, init, display, check, page,
    message_create: create, message_check_new: checkNew, message_load: (user,midOnly=0) => load(user,midOnly), deleted_message_load: (user,midOnly=0) => load(user,midOnly,true), message_get_encl_num: messageEnclosureNumber, message_disp: display, message_check: check, init_messages: init });
}
