/**
 * .movie — Cinesubz search → select → download as DOCUMENT
 * Features:
 *  - Search results with numbered list + quick buttons
 *  - Movie details with preview image
 *  - Download options (qualities) via reply-number or buttons
 *  - Sends the selected file as a WhatsApp DOCUMENT (mp4/mkv)
 *  - Headers fix (axios { headers: ... })
 *  - Single global messages.upsert handler (no duplicate listeners)
 */

const { cmd } = require('../lib/command');
const axios = require('axios');
const cheerio = require('cheerio');
const os = require('os');

// ---------- CONFIG ----------
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://google.com'
};

// platform tag (optional – same logic you used)
function detectPlatform() {
  const len = os.hostname().length;
  if (len === 12) return '𝚁𝙴𝙿𝙻𝙸𝚃';
  if (len === 36) return '𝙷𝙴𝚁𝙾𝙺𝚄';
  if (len === 8) return '𝙺𝙾𝚈𝙴𝙱';
  return '𝚅𝙿𝚂 || 𝚄𝙽𝙺𝙽𝙾𝚆𝙽';
}
const PLATFORM = detectPlatform();

// in-memory sessions keyed by messageId
// sessions[stanzaId] = { step: 'list'|'details', films|jsons|film }
const sessions = Object.create(null);

// emojis for numbering
const NUM_EMO = ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
const toEmojiNum = (n) => String(n).split('').map(d => NUM_EMO[+d]).join('');

// ---------- SCRAPERS ----------
async function searchFilms(query) {
  try {
    const url = `https://cinesubz.co/?s=${encodeURIComponent(query)}`;
    const res = await axios.get(url, { headers: HEADERS, maxRedirects: 5 });
    const $ = cheerio.load(res.data);

    const films = [];
    $('article').each((i, el) => {
      const filmName = $(el).find('.details .title a').text().trim();
      const imageUrl = $(el).find('.image .thumbnail img').attr('src');
      const description = $(el).find('.details .contenido p').text().trim();
      const year = $(el).find('.details .meta .year').text().trim();
      const imdbText = $(el).find('.details .meta .rating:first').text().trim();
      const imdb = imdbText.replace('IMDb', '').trim();
      const movieLink = $(el).find('.image .thumbnail a').attr('href');
      if (filmName && movieLink) films.push({ filmName, imageUrl, description, year, imdb, movieLink });
    });

    // enrich with download links per film (sequential to be gentle)
    for (const film of films) {
      try {
        const page = await axios.get(film.movieLink, { headers: HEADERS, maxRedirects: 5 });
        const $$ = cheerio.load(page.data);
        const downloadLinks = [];

        // site uses api-* anchors; text contains quality
        $$('a[href^="https://cinesubz.co/api-"]').each((_, a) => {
          const link = $$(a).attr('href');
          const quality = $$(a).text().trim();
          // sometimes size appears near this link
          const size = $$(a).closest('li').next().text().trim();
          if (link && quality) downloadLinks.push({ link, quality, size });
        });
        film.downloadLinks = downloadLinks;
      } catch (e) {
        film.downloadLinks = [];
      }
    }

    return films;
  } catch (e) {
    console.error('❌ searchFilms error:', e.message);
    return [];
  }
}

function mapServerLink(modifiedLink) {
  const maps = [
    { search: ["https://google.com/server11/1:/", "https://google.com/server12/1:/", "https://google.com/server13/1:/"], replace: "https://cinescloud.cskinglk.xyz/server1/" },
    { search: ["https://google.com/server21/1:/", "https://google.com/server22/1:/", "https://google.com/server23/1:/"], replace: "https://cinescloud.cskinglk.xyz/server2/" },
    { search: ["https://google.com/server3/1:/"], replace: "https://cinescloud.cskinglk.xyz/server3/" },
    { search: ["https://google.com/server4/1:/"], replace: "https://cinescloud.cskinglk.xyz/server4/" }
  ];
  for (const m of maps) {
    for (const s of m.search) {
      if (modifiedLink.includes(s)) {
        return modifiedLink.replace(s, m.replace);
      }
    }
  }
  return modifiedLink;
}

async function scrapeModifiedLink(url) {
  try {
    const res = await axios.get(url, { headers: HEADERS, maxRedirects: 5 });
    const $ = cheerio.load(res.data);
    let modified = $('#link').attr('href');
    if (!modified) return url;

    modified = mapServerLink(modified)
      .replace(".mp4?bot=cscloud2bot&code=", "?ext=mp4&bot=cscloud2bot&code=")
      .replace(".mp4", "?ext=mp4")
      .replace(".mkv?bot=cscloud2bot&code=", "?ext=mkv&bot=cscloud2bot&code=")
      .replace(".mkv", "?ext=mkv")
      .replace(".zip", "?ext=zip");

    return modified;
  } catch (e) {
    console.error('❌ scrapeModifiedLink error:', e.message);
    return url;
  }
}

async function fetchJsonData(payload, url) {
  try {
    // POST to get json
    const post = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, maxRedirects: 5 });
    // then GET page to parse size
    const html = await axios.get(url, { headers: HEADERS, maxRedirects: 5 });
    const $ = cheerio.load(html.data);
    const fileSize = $('p.file-info:contains("File Size") span').text().trim();
    const data = post.data || {};
    data.fileSize = fileSize || data.fileSize || 'Unknown';
    return data;
  } catch (e) {
    console.error('❌ fetchJsonData error:', e.message);
    return { error: e.message };
  }
}

// util: pick safe mimetype & filename
function pickFileMeta(url, fallbackName) {
  try {
    const clean = url.split('?')[0];
    const ext = (clean.split('.').pop() || 'mp4').toLowerCase();
    const safeExt = ['mp4', 'mkv', 'zip'].includes(ext) ? ext : 'mp4';
    const mime =
      safeExt === 'mkv' ? 'video/x-matroska' :
      safeExt === 'zip' ? 'application/zip' :
      'video/mp4';
    return { fileName: `${fallbackName}.${safeExt}`, mime };
  } catch {
    return { fileName: `${fallbackName}.mp4`, mime: 'video/mp4' };
  }
}

function parseSizeMB(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return 0;
  const num = parseFloat(sizeStr);
  if (isNaN(num)) return 0;
  const isGB = /gb/i.test(sizeStr);
  return isGB ? num * 1024 : num; // MB
}

// ---------- GLOBAL HANDLER (register once) ----------
function registerGlobalHandler(conn) {
  if (conn._movieHandlerRegistered) return;
  conn._movieHandlerRegistered = true;

  conn.ev.on('messages.upsert', async (up) => {
    try {
      const msg = up.messages && up.messages[0];
      if (!msg || !msg.message) return;

      // button clicks
      if (msg.message.buttonsResponseMessage) {
        const btnId = msg.message.buttonsResponseMessage.selectedButtonId || '';
        const ctx = msg.message.buttonsResponseMessage.contextInfo;
        const stanzaId = ctx && ctx.stanzaId;
        if (!stanzaId || !sessions[stanzaId]) return;

        if (btnId.startsWith('movie_')) {
          // movie index select
          const idx = parseInt(btnId.split('_')[1]) - 1;
          await handleMovieChosen(conn, msg, stanzaId, idx);
          return;
        }

        if (btnId.startsWith('dl_')) {
          // quality index select
          const idx = parseInt(btnId.split('_')[1]) - 1;
          await handleDownloadChosen(conn, msg, stanzaId, idx);
          return;
        }
      }

      // reply-number (extended text)
      if (msg.message.extendedTextMessage) {
        const text = (msg.message.extendedTextMessage.text || '').trim();
        const ctx = msg.message.extendedTextMessage.contextInfo;
        const stanzaId = ctx && ctx.stanzaId;
        if (!stanzaId || !sessions[stanzaId]) return;

        const n = parseInt(text);
        if (isNaN(n)) return; // ignore non-numeric replies

        const sess = sessions[stanzaId];
        if (sess.step === 'list') {
          await handleMovieChosen(conn, msg, stanzaId, n - 1);
        } else if (sess.step === 'details') {
          await handleDownloadChosen(conn, msg, stanzaId, n - 1);
        }
      }
    } catch (e) {
      console.error('movie global handler error:', e);
    }
  });
}

// ---------- STEP HANDLERS ----------
async function handleMovieChosen(conn, msg, stanzaId, index) {
  const { from } = msg.key.remoteJid ? { from: msg.key.remoteJid } : { from: msg.key.remoteJid };
  const sess = sessions[stanzaId];
  const films = sess.films || [];
  if (index < 0 || index >= films.length) {
    return conn.sendMessage(from, { text: '❌ Invalid selection. Choose a number from the list.' }, { quoted: msg });
  }
  const film = films[index];

  // react
  await conn.sendMessage(from, { react: { text: '🔄', key: msg.key } });

  // filter links
  const dlLinks = (film.downloadLinks || []).filter(dl => !/Telegram/i.test(dl.quality));
  if (!dlLinks.length) {
    await conn.sendMessage(from, { text: '⚠️ No download links found for this title.' }, { quoted: msg });
    return;
  }

  // resolve to direct JSON urls in parallel
  const jsons = [];
  for (let i = 0; i < dlLinks.length; i++) {
    try {
      const mod = await scrapeModifiedLink(dlLinks[i].link);
      const jsn = await fetchJsonData({ direct: true }, mod);
      jsons.push({ meta: dlLinks[i], json: jsn });
    } catch {
      jsons.push({ meta: dlLinks[i], json: { error: 'resolve failed' } });
    }
  }

  // build caption
  let cap = `📢 *\`DARK SHADOW\`*\n\n*🎬 ${film.filmName}* ${film.year ? `(${film.year})` : ''}\n`;
  if (film.imdb) cap += `*⭐ IMDb:* ${film.imdb}\n`;
  if (film.description) cap += `*📝* ${film.description}\n\n`;
  cap += `*Reply Number ⤵️* (or tap a button)\n\n`;

  const buttons = [];
  jsons.forEach((it, i) => {
    const fileSize = it.json && it.json.fileSize ? it.json.fileSize : (it.meta.size || 'Unknown');
    const cleanedQ = (it.meta.quality || '').replace(/\b(SD|HD|BluRay|FHD|WEBRip|WEB-DL|WEBDL|Direct)\b/gi,'').trim() || it.meta.quality;
    cap += `${toEmojiNum(i+1)} *${cleanedQ}* — ${fileSize}\n`;
    if (i < 8) {
      buttons.push({
        buttonId: `dl_${i+1}`,
        buttonText: { displayText: `${cleanedQ} | ${fileSize}` },
        type: 1
      });
    }
  });

  // send details message with preview image + buttons
  const sent = await conn.sendMessage(from, {
    image: film.imageUrl ? { url: film.imageUrl } : undefined,
    caption: cap,
    footer: '© DARK SHADOW • Reply with a number or use a button',
    headerType: 4,
    buttons
  }, { quoted: msg });

  // update session to details step keyed by the new message id
  delete sessions[stanzaId];
  sessions[sent.key.id] = { step: 'details', film, jsons };
  await conn.sendMessage(from, { react: { text: '🔢', key: sent.key } });
}

async function handleDownloadChosen(conn, msg, stanzaId, index) {
  const { from } = msg.key.remoteJid ? { from: msg.key.remoteJid } : { from: msg.key.remoteJid };
  const sess = sessions[stanzaId];
  if (!sess) return;

  const jsons = sess.jsons || [];
  if (index < 0 || index >= jsons.length) {
    return conn.sendMessage(from, { text: '❌ Invalid selection. Choose a number from the list.' }, { quoted: msg });
  }

  await conn.sendMessage(from, { react: { text: '⬇️', key: msg.key } });

  const chosen = jsons[index];
  const film = sess.film;
  const data = chosen.json || {};

  if (!data.url) {
    await conn.sendMessage(from, { react: { text: '❌', key: msg.key } });
    await conn.sendMessage(from, { text: '❌ Link not available. Try another quality.' }, { quoted: msg });
    return;
  }

  // platform restriction
  if (['𝙷𝙴𝚁𝙾𝙺𝚄', '𝙺𝙾𝚈𝙴𝙱'].includes(PLATFORM)) {
    await conn.sendMessage(from, { react: { text: '🚫', key: msg.key } });
    await conn.sendMessage(from, { text: `🚫 Cannot send large files on ${PLATFORM}.\nUse a VPS or suitable server.` }, { quoted: msg });
    return;
  }

  // size check
  const sizeStr = data.fileSize || chosen.meta.size || '0 MB';
  const sizeMB = parseSizeMB(sizeStr);
  if (sizeMB > 2000) {
    await conn.sendMessage(from, { react: { text: '🚫', key: msg.key } });
    await conn.sendMessage(from, { text: '🚫 Cannot send files larger than 2GB. Try a lower quality.' }, { quoted: msg });
    return;
  }

  const { fileName, mime } = pickFileMeta(data.url, (film.filmName || 'movie').replace(/[\\/:*?"<>|]+/g, '_'));

  await conn.sendMessage(from, {
    document: { url: data.url },
    mimetype: mime,
    fileName,
    caption:
      `*🎥 ${film.filmName}*\n` +
      (film.year ? `*⏳ Year:* ${film.year}\n` : '') +
      (film.imdb ? `*⭐ Rating:* ${film.imdb}\n` : '') +
      `*📦 Size:* ${sizeStr}\n\n` +
      (film.description ? `📝 ${film.description}` : '')
  }, { quoted: msg });

  await conn.sendMessage(from, { react: { text: '✅', key: msg.key } });

  // done with this session
  delete sessions[stanzaId];
}

// ---------- COMMAND ----------
cmd({
  pattern: 'movie',
  alias: ['film'],
  use: '.movie <query>',
  desc: 'Search movies on cinesubz and download as document',
  category: 'search',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    registerGlobalHandler(conn);

    const query = (q || '').trim();
    if (!query) return reply('🔎 Please provide a movie name. Example: .movie spiderman');

    await m.react?.('🎬');

    const films = await searchFilms(query);
    if (!films.length) {
      return reply('❌ No movies found for your query.');
    }

    // Build results list (top 10)
    let list = `📢 *\`DARK SHADOW\`*\n\n🎥 *Movie Search Results*\n*Reply Number ⤵️* (or tap a button)\n\n`;
    const buttons = [];

    films.slice(0, 10).forEach((f, i) => {
      list += `${toEmojiNum(i+1)} *${f.filmName}*${f.year ? ` (${f.year})` : ''}\n`;
      if (i < 8) {
        buttons.push({
          buttonId: `movie_${i+1}`,
          buttonText: { displayText: `${i+1}. ${f.filmName.slice(0, 18)}` },
          type: 1
        });
      }
    });

    const sent = await conn.sendMessage(from, {
      image: { url: 'https://telegra.ph/file/1ece2e0281513c05d20ee.jpg' }, // your banner/placeholder
      caption: list,
      footer: '© DARK SHADOW • Reply with a number or use a button',
      headerType: 4,
      buttons,
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '',
          newsletterName: 'DARK SHADOW',
          serverMessageId: 999
        }
      }
    }, { quoted: mek });

    // store session keyed by this message id
    sessions[sent.key.id] = { step: 'list', films };

    // react hint
    await conn.sendMessage(from, { react: { text: '🔢', key: sent.key } });

  } catch (e) {
    console.error(e);
    reply('⚠️ An error occurred while searching for films.');
  }
});
