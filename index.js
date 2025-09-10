// index.js - Pulse (Merged All Parts)
// Pulse - narodi Productions
// NOTE: Replace "YOUR_BOT_TOKEN_HERE" at the end with your token.

// ---------------------- Auto-install dependencies if missing ----------------------
const { execSync } = require("child_process");
try {
  require.resolve("discord.js");
} catch (e) {
  console.log("discord.js not found ¡ª installing discord.js@14...");
  execSync("npm install discord.js@14 --no-audit --no-fund", { stdio: "inherit" });
}
let QuickChart;
try {
  QuickChart = require("quickchart-js");
} catch (e) {
  console.log("quickchart-js not found ¡ª installing quickchart-js...");
  try {
    execSync("npm install quickchart-js --no-audit --no-fund", { stdio: "inherit" });
    QuickChart = require("quickchart-js");
  } catch (ie) {
    console.error("Failed to install quickchart-js:", ie);
  }
}

// ---------------------- Imports ----------------------
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionsBitField,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

// ---------------------- Client ----------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
});

client.commands = new Collection();
client.prefix = ".";
client.footer = "Pulse - narodi Productions";

// ---------------------- Data / Persistence ----------------------
const DATA_DIR = path.join(__dirname, "pulse_data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const SERVERS_FILE = path.join(DATA_DIR, "servers.json");
const MARKET_FILE = path.join(DATA_DIR, "market.json");
const REMINDERS_FILE = path.join(DATA_DIR, "reminders.json");

let SERVERS = {};
if (fs.existsSync(SERVERS_FILE)) {
  try { SERVERS = JSON.parse(fs.readFileSync(SERVERS_FILE, "utf8")); } catch (e) { SERVERS = {}; }
} else { fs.writeFileSync(SERVERS_FILE, JSON.stringify(SERVERS, null, 2)); }

let MARKET = {};
if (fs.existsSync(MARKET_FILE)) {
  try { MARKET = JSON.parse(fs.readFileSync(MARKET_FILE, "utf8")); } catch (e) { MARKET = {}; }
} else {
  MARKET = {
    stocks: {
      "PULSE": { price: 100, history: [100], volatility: 0.05 },
      "TECH": { price: 75, history: [75], volatility: 0.06 },
      "ENERGY": { price: 120, history: [120], volatility: 0.04 }
    },
    users: {}
  };
  fs.writeFileSync(MARKET_FILE, JSON.stringify(MARKET, null, 2));
}

let REMINDERS = {};
if (fs.existsSync(REMINDERS_FILE)) {
  try { REMINDERS = JSON.parse(fs.readFileSync(REMINDERS_FILE, "utf8")); } catch (e) { REMINDERS = {}; }
} else { fs.writeFileSync(REMINDERS_FILE, JSON.stringify(REMINDERS, null, 2)); }


function saveServersSync() {
  try { fs.writeFileSync(SERVERS_FILE, JSON.stringify(SERVERS, null, 2)); } catch (e) { console.error("Failed saving servers.json", e); }
}
function saveMarketSync() {
  try { fs.writeFileSync(MARKET_FILE, JSON.stringify(MARKET, null, 2)); } catch (e) { console.error("Failed saving market.json", e); }
}
function saveRemindersSync() {
  try { fs.writeFileSync(REMINDERS_FILE, JSON.stringify(REMINDERS, null, 2)); } catch (e) { console.error("Failed saving reminders.json", e); }
}

// ---------------------- Helpers ----------------------
function getRandomColor() {
  const colors = [0xFF5733, 0x33FF57, 0x3357FF, 0xFF33DA, 0xFFEE33, 0x33FFEC, 0x8A2BE2, 0x00CED1, 0xFF1493, 0xADFF2F];
  return colors[Math.floor(Math.random() * colors.length)];
}

function makeEmbed(title, description, color = getRandomColor()) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: client.footer })
    .setTimestamp();
}
client.makeEmbed = makeEmbed;

function generateCaseID() {
  return "P" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

// Permission levels for commands
const PERMISSIONS = {
  OWNER: 4,
  ADMIN: 3,
  MOD: 2,
  USER: 1,
};

// Default command permissions
const COMMAND_PERMISSIONS = {
  'help': PERMISSIONS.USER,
  'info': PERMISSIONS.USER,
  'setup': PERMISSIONS.ADMIN,
  'warn': PERMISSIONS.MOD,
  'kick': PERMISSIONS.MOD,
  'ban': PERMISSIONS.MOD,
  'softban': PERMISSIONS.MOD,
  'mute': PERMISSIONS.MOD,
  'unmute': PERMISSIONS.MOD,
  'purge': PERMISSIONS.MOD,
  'lock': PERMISSIONS.MOD,
  'unlock': PERMISSIONS.MOD,
  'case': PERMISSIONS.MOD,
  'restore': PERMISSIONS.ADMIN,
  'daily': PERMISSIONS.USER,
  'weekly': PERMISSIONS.USER,
  'monthly': PERMISSIONS.USER,
  'work': PERMISSIONS.USER,
  'beg': PERMISSIONS.USER,
  'rob': PERMISSIONS.USER,
  'slots': PERMISSIONS.USER,
  'balance': PERMISSIONS.USER,
  'bal': PERMISSIONS.USER,
  'deposit': PERMISSIONS.USER,
  'dep': PERMISSIONS.USER,
  'withdraw': PERMISSIONS.USER,
  'with': PERMISSIONS.USER,
  'pay': PERMISSIONS.USER,
  'market': PERMISSIONS.USER,
  'buy': PERMISSIONS.USER,
  'sell': PERMISSIONS.USER,
  'portfolio': PERMISSIONS.USER,
  'chart': PERMISSIONS.USER,
  'leaderboard': PERMISSIONS.USER,
  'lb': PERMISSIONS.USER,
  'rank': PERMISSIONS.USER,
  'userinfo': PERMISSIONS.USER,
  'serverinfo': PERMISSIONS.USER,
  'ping': PERMISSIONS.USER,
  'invite': PERMISSIONS.USER,
  'say': PERMISSIONS.MOD,
  'poll': PERMISSIONS.MOD,
  'suggest': PERMISSIONS.USER,
  'remindme': PERMISSIONS.USER,
  'tag': PERMISSIONS.USER,
  'rr': PERMISSIONS.ADMIN, // Reaction Role setup
  'starboard': PERMISSIONS.ADMIN, // Starboard setup
  'automod': PERMISSIONS.ADMIN,
  'blacklist': PERMISSIONS.MOD,
  'strikes': PERMISSIONS.MOD,
  'resetstrikes': PERMISSIONS.MOD,
  'antinuke': PERMISSIONS.ADMIN,
  'pet': PERMISSIONS.USER,
  '8ball': PERMISSIONS.USER,
  'coinflip': PERMISSIONS.USER,
  'dice': PERMISSIONS.USER,
  'ship': PERMISSIONS.USER,
  'rate': PERMISSIONS.USER,
  'roast': PERMISSIONS.USER,
  'love': PERMISSIONS.USER,
  'hangman': PERMISSIONS.USER,
  'tictactoe': PERMISSIONS.USER,
};

function getServer(guildId) {
  if (!SERVERS[guildId]) {
    SERVERS[guildId] = {
      modules: {
        moderation: true,
        economy: true,
        fun: true,
        automod: true,
        antinuke: true,
        utility: true,
        information: true,
        social: true, // New module
      },
      roles: { admins: [], mods: [] },
      channels: {
        logs: {
          moderation: null,
          economy: null,
          automod: null,
          antinuke: null,
          tickets: null, // New log channel
          modmail: null, // New log channel
        },
        suggestions: null,
        starboard: null,
        welcome: null, // New welcome channel
        goodbye: null, // New goodbye channel
        ticketCategory: null, // New ticket category
        ticketPanel: null, // New ticket panel channel
        modmailCategory: null, // New modmail category
      },
      welcomeMessage: "Welcome {user} to {server}!",
      goodbyeMessage: "Goodbye {user} from {server}.",
      autoRole: null, // New auto role
      warnings: {},
      cases: {},
      economy: { users: {}, shops: {}, jobs: {}, currency: "Coins", startingWallet: 100 },
      automod: {
        enabled: true,
        antiSpam: true,
        antiCaps: true,
        antiEmoji: true,
        antiLinks: true, // New automod feature
        antiInvites: true, // New automod feature
        profanityFilter: true, // New automod feature
        blacklist: [],
        autoPunishThreshold: 3, // Strikes to mute
        muteAt: 3, // Strikes for mute
        kickAt: 5, // Strikes for kick
        banAt: 7, // Strikes for ban
        users: {}
      },
      antinuke: {
        enabled: true,
        safe: [],
        protectChannels: true,
        protectRoles: true,
        protectWebhooks: true, // New antinuke feature
        protectBots: true, // New antinuke feature
      },
      utility: {
        reactionRoles: {},
        templates: {},
        tags: {},
        levels: {},
      },
      deleted: { channels: [], roles: [], bans: [] },
      permissions: {}, // Custom command permissions
      ticketCounter: 0,
    };
    // Initialize permissions for new servers
    for (const cmd in COMMAND_PERMISSIONS) {
      if (COMMAND_PERMISSIONS[cmd] === PERMISSIONS.MOD) SERVERS[guildId].permissions[cmd] = true;
      if (COMMAND_PERMISSIONS[cmd] === PERMISSIONS.ADMIN) SERVERS[guildId].permissions[cmd] = true;
    }
    saveServersSync();
  }
  return SERVERS[guildId];
}

function addCase(guildId, action, targetUserId, moderatorId, reason) {
  const srv = getServer(guildId);
  const id = generateCaseID();
  srv.cases[id] = {
    id,
    action,
    target: targetUserId,
    moderator: moderatorId,
    reason: reason || "No reason provided",
    timestamp: Date.now()
  };
  saveServersSync();
  return id;
}

function hasPermission(member, commandName) {
  const srv = getServer(member.guild.id);
  const requiredPerms = COMMAND_PERMISSIONS[commandName] || PERMISSIONS.USER;

  if (member.guild.ownerId === member.id) return true; // Owner has all permissions by default

  if (requiredPerms === PERMISSIONS.USER) return true;

  const isAdmin = isServerAdmin(member);
  const isMod = canModerate(member);

  // Custom permissions override defaults if explicitly set in srv.permissions
  if (requiredPerms === PERMISSIONS.ADMIN) {
    return isAdmin && (srv.permissions[commandName] !== undefined ? srv.permissions[commandName] : true); // Default true for admin commands
  }

  if (requiredPerms === PERMISSIONS.MOD) {
    return (isAdmin || isMod) && (srv.permissions[commandName] !== undefined ? srv.permissions[commandName] : true); // Default true for mod commands
  }

  return false;
}


function isServerAdmin(member) {
  const srv = getServer(member.guild.id);
  if (member.permissions?.has?.(PermissionsBitField.Flags.Administrator)) return true;
  if (srv.roles.admins && srv.roles.admins.some(roleId => member.roles.cache.has(roleId))) return true;
  return false;
}

function canModerate(member) {
  if (!member) return false;
  if (member.permissions?.has?.(PermissionsBitField.Flags.Administrator)) return true;
  if (member.permissions?.has?.(PermissionsBitField.Flags.KickMembers)) return true;
  const srv = getServer(member.guild.id);
  if (srv.roles.admins && srv.roles.admins.some(roleId => member.roles.cache.has(roleId))) return true;
  if (srv.roles.mods && srv.roles.mods.some(roleId => member.roles.cache.has(roleId))) return true;
  return false;
}

// ---------------------- Market helpers ----------------------
function getGlobalKey(guildId, userId) {
  return `${guildId}_${userId}`;
}
function ensureMarketUser(guildId, userId) {
  const key = getGlobalKey(guildId, userId);
  if (!MARKET.users[key]) {
    MARKET.users[key] = { wallet: 0, bank: 0, portfolio: {} };
    saveMarketSync();
  }
  return MARKET.users[key];
}
function computePortfolioValue(guildId, userId) {
  const key = getGlobalKey(guildId, userId);
  const mu = MARKET.users[key] || { wallet: 0, bank: 0, portfolio: {} };
  let value = (mu.wallet || 0) + (mu.bank || 0);
  for (const sym in mu.portfolio) {
    const qty = mu.portfolio[sym] || 0;
    if (MARKET.stocks[sym]) value += qty * MARKET.stocks[sym].price;
  }
  return value;
}

// market tick
function marketTick() {
  for (const sym in MARKET.stocks) {
    const s = MARKET.stocks[sym];
    const drift = (Math.random() - 0.5) * s.volatility * s.price * 2;
    s.price = Math.max(1, Math.round((s.price + drift) * 100) / 100);
    s.history = s.history || [];
    s.history.push(s.price);
    if (s.history.length > 50) s.history.shift();
  }
  saveMarketSync();
}
setInterval(marketTick, 60 * 1000); // every minute

// Reminder processing
function processReminders() {
  const now = Date.now();
  for (const reminderId in REMINDERS) {
    const reminder = REMINDERS[reminderId];
    if (reminder.time <= now) {
      client.users.fetch(reminder.userId)
        .then(user => user.send({ embeds: [makeEmbed("Reminder", reminder.message)] }).catch(() => {
          // Fallback to channel if DM fails
          client.channels.fetch(reminder.channelId)
            .then(channel => channel.send({ embeds: [makeEmbed("Reminder", `<@${reminder.userId}>, your reminder: ${reminder.message}`)] }).catch(() => {}))
            .catch(() => {});
        }))
        .catch(() => {
          // If user cannot be fetched, try channel
          client.channels.fetch(reminder.channelId)
            .then(channel => channel.send({ embeds: [makeEmbed("Reminder", `<@${reminder.userId}>, your reminder: ${reminder.message}`)] }).catch(() => {}))
            .catch(() => {});
        });
      delete REMINDERS[reminderId];
    }
  }
  saveRemindersSync();
}
setInterval(processReminders, 10 * 1000); // Check every 10 seconds

// ---------------------- Command Router ----------------------
async function handleCommand(message) {
  if (!message.guild || message.author.bot) return;
  const prefix = client.prefix;
  if (!message.content.toLowerCase().startsWith(prefix)) return;
  const raw = message.content.slice(prefix.length).trim();
  if (!raw.length) return;
  const parts = raw.split(/ +/);
  const cmd = parts.shift().toLowerCase();
  const args = parts;

  // Check permissions first
  if (!hasPermission(message.member, cmd)) {
    const embed = makeEmbed("Permission Denied", `You do not have permission to use the \`${cmd}\` command.`);
    return message.reply({ embeds: [embed] });
  }

  // route to registered command
  const command = client.commands.get(cmd);
  const context = {
    client,
    message,
    args,
    getServer,
    addCase,
    makeEmbed,
    MARKET,
    ensureMarketUser,
    saveServersSync,
    saveMarketSync,
    saveRemindersSync,
    QuickChart,
    execSync,
    REMINDERS,
  };
  if (command && typeof command.execute === "function") {
    try {
      await command.execute(context);
    } catch (err) {
      console.error("command error", err);
      await message.reply({ embeds: [makeEmbed("Error", "An error occurred while running that command.", 0xff0000)] });
    }
    return;
  }

  // built-in info fallback
  if (cmd === "info") {
    const e = makeEmbed("Pulse - Information",
      "Pulse is an all-in-one Discord bot by narodi Productions.\n\nFeatures: Moderation, Economy (global market + investing), Fun, Automatic Moderation, Anti-Nuke, Utility and Information tools.\n\nRun `.setup` to configure your server. All replies are embed-only.",
      getRandomColor());
    await message.reply({ embeds: [e] });
    return;
  }

  // unknown command: no spam, just ignore
}

// wire messageCreate for command router
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Modmail DM handler
  if (!message.guild) {
    const srv = Object.values(SERVERS).find(s => s.channels?.modmailCategory);
    if (!srv) {
      return message.author.send({ embeds: [makeEmbed("ModMail", "ModMail is not configured on any server I manage.", 0xff0000)] }).catch(() => {});
    }
    const guild = client.guilds.cache.get(srv.id);
    if (!guild) return message.author.send({ embeds: [makeEmbed("ModMail", "ModMail guild not found.", 0xff0000)] }).catch(() => {});
    const modmailCategory = guild.channels.cache.get(srv.channels.modmailCategory);
    if (!modmailCategory || modmailCategory.type !== ChannelType.GuildCategory) {
      return message.author.send({ embeds: [makeEmbed("ModMail", "ModMail category is invalid. Please contact a server admin.", 0xff0000)] }).catch(() => {});
    }

    let threadChannel = modmailCategory.children.cache.find(c => c.topic === message.author.id);

    if (!threadChannel) {
      threadChannel = await guild.channels.create({
        name: `modmail-${message.author.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`,
        type: ChannelType.GuildText,
        parent: modmailCategory.id,
        topic: message.author.id, // Store user ID in topic for easy retrieval
        permissionOverwrites: [{
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        }, {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
          ...srv.roles.admins.map(roleId => ({ id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
          ...srv.roles.mods.map(roleId => ({ id: roleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
        ],
      });
      await threadChannel.send({ embeds: [makeEmbed(`New Modmail from ${message.author.tag} (${message.author.id})`, message.content)] });
      await message.author.send({ embeds: [makeEmbed("Modmail Opened", `Your message has been sent to the server staff. A new thread has been opened: ${threadChannel}.`)] });
    } else {
      await threadChannel.send({ embeds: [makeEmbed(`Message from ${message.author.tag}`, message.content)] });
      await message.author.send({ embeds: [makeEmbed("Modmail", "Your message has been sent to the thread.")] });
    }
    return;
  }

  // XP system (moved here to avoid conflict with command handling for `if (!message.content.toLowerCase().startsWith(prefix)) return;`)
  const srv = getServer(message.guild.id);
  if (srv.modules.economy) { // Only award XP if economy module is enabled
    srv.utility.levels = srv.utility.levels || {};
    const levels = srv.utility.levels;
    if (!levels[message.author.id]) levels[message.author.id] = { xp: 0, level: 0, lastXP: Date.now() };
    const userXP = levels[message.author.id];
    if (Date.now() - userXP.lastXP > 60 * 1000) { // 1 min cooldown for XP gain
      const xpToAdd = Math.floor(Math.random() * 15) + 10;
      userXP.xp += xpToAdd;
      userXP.lastXP = Date.now();
      const neededXP = 50 + (userXP.level * 100);
      if (userXP.xp >= neededXP) {
        userXP.level++;
        userXP.xp = 0;
        message.channel.send({ embeds: [makeEmbed("Level Up!", `Congratulations, ${message.author}! You've reached **level ${userXP.level}**!`, getRandomColor())] }).catch(()=>{});
      }
    }
  }

  // AutoMod listener (only if automod module is enabled)
  if (srv.modules.automod) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) { // Admins bypass automod
      srv.automod.users = srv.automod.users || {};
      const uid = message.author.id;
      if (!srv.automod.users[uid]) srv.automod.users[uid] = { strikes: 0, lastMessage: "", spamCount: 0, capsCount: 0, linkCount: 0, inviteCount: 0, profanityCount: 0, lastMsgTime: 0 };
      const userEntry = srv.automod.users[uid];
      const content = message.content || "";
      let flagged = false;
      let reason = "";

      // Anti-spam (simple repeat detection)
      if (srv.automod.antiSpam && content && userEntry.lastMessage === content && Date.now() - userEntry.lastMsgTime < 5000) { // Same message within 5 seconds
        userEntry.spamCount = (userEntry.spamCount || 0) + 1;
        if (userEntry.spamCount >= 3) {
          flagged = true;
          reason = "Repeated messages / spam";
        }
      } else {
        userEntry.spamCount = 0; // Reset if message or time is different
      }
      userEntry.lastMessage = content;
      userEntry.lastMsgTime = Date.now();


      // Anti-links
      if (srv.automod.antiLinks && /(https?:\/\/[^\s]+)/gi.test(content)) {
        flagged = true;
        reason = "Posting links";
      }

      // Anti-invites (discord.gg links)
      if (srv.automod.antiInvites && /(discord\.gg\/\S+)/gi.test(content)) {
        flagged = true;
        reason = "Posting Discord invites";
      }

      // Profanity filter (basic example)
      if (srv.automod.profanityFilter) {
        const profanityList = ["badword1", "badword2", "damn", "ass", "bitch", "fuck", "shit", "cunt"]; // Expand as needed
        if (profanityList.some(word => content.toLowerCase().includes(word))) {
          flagged = true;
          reason = "Using profanity";
        }
      }

      // Anti-caps
      if (srv.automod.antiCaps) {
        const letters = content.replace(/[^A-Za-z]/g, "");
        if (letters.length > 10) { // Only check if message is long enough
          const caps = (letters.match(/[A-Z]/g) || []).length;
          const ratio = caps / letters.length;
          if (ratio > 0.7) { // More than 70% caps
            userEntry.capsCount = (userEntry.capsCount || 0) + 1;
            if (userEntry.capsCount >= 2) { // 2 consecutive messages with high caps
              flagged = true;
              reason = "Excessive caps usage";
              userEntry.capsCount = 0; // Reset after action
            }
          } else {
            userEntry.capsCount = 0;
          }
        }
      }

      // Apply strike if flagged
      if (flagged) {
        userEntry.strikes = (userEntry.strikes || 0) + 1;
        await message.delete().catch(()=>{}); // Delete the problematic message
        const caseId = addCase(message.guild.id, "automod-strike", uid, client.user.id, reason);
        saveServersSync();

        const logChannelId = srv.channels?.logs?.automod || srv.channels?.logs?.moderation;
        if (logChannelId) {
          const ch = message.guild.channels.cache.get(logChannelId);
          if (ch) ch.send({ embeds: [makeEmbed("AutoMod Action", `<@${uid}> was flagged for: **${reason}**.\nCase ID: **${caseId}**\nStrikes: **${userEntry.strikes}**`, 0xFFCC00)] }).catch(()=>{});
        }
        await message.channel.send({ embeds: [makeEmbed("AutoMod Alert", `<@${uid}>, your message was deleted for **${reason}**. You now have **${userEntry.strikes} strikes**.`, 0xFF0000)] }).then(m => setTimeout(() => m.delete().catch(() => {}), 10000)).catch(() => {});

        // Check for punishments
        const member = message.member;
        if (!member) return;

        if (userEntry.strikes >= srv.automod.banAt) {
          try {
            await member.ban({ reason: `AutoMod: Exceeded ${srv.automod.banAt} strikes (${reason})` });
            addCase(message.guild.id, "auto-ban", uid, client.user.id, `Exceeded strikes: ${reason}`);
            userEntry.strikes = 0; // Reset strikes after ban
            if (logChannelId) {
              const ch = message.guild.channels.cache.get(logChannelId);
              if (ch) ch.send({ embeds: [makeEmbed("AutoMod Punishment", `<@${uid}> has been **banned** for repeatedly violating rules.`, 0xFF0000)] }).catch(()=>{});
            }
          } catch (err) { console.error("AutoMod ban failed", err); }
        } else if (userEntry.strikes >= srv.automod.kickAt) {
          try {
            await member.kick(`AutoMod: Exceeded ${srv.automod.kickAt} strikes (${reason})`);
            addCase(message.guild.id, "auto-kick", uid, client.user.id, `Exceeded strikes: ${reason}`);
            userEntry.strikes = 0; // Reset strikes after kick
            if (logChannelId) {
              const ch = message.guild.channels.cache.get(logChannelId);
              if (ch) ch.send({ embeds: [makeEmbed("AutoMod Punishment", `<@${uid}> has been **kicked** for repeatedly violating rules.`, 0xFF9900)] }).catch(()=>{});
            }
          } catch (err) { console.error("AutoMod kick failed", err); }
        } else if (userEntry.strikes >= srv.automod.muteAt) {
          try {
            let muteRole = message.guild.roles.cache.find(r => r.name === "Pulse Muted");
            if (!muteRole) {
              muteRole = await message.guild.roles.create({ name: "Pulse Muted", permissions: [], reason: "Created by Pulse AutoMod for muting" });
              for (const [, ch] of message.guild.channels.cache) {
                try { await ch.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false }).catch(()=>{}); } catch {}
              }
            }
            await member.roles.add(muteRole);
            addCase(message.guild.id, "auto-mute", uid, client.user.id, `Exceeded strikes: ${reason}`);
            if (logChannelId) {
              const ch = message.guild.channels.cache.get(logChannelId);
              if (ch) ch.send({ embeds: [makeEmbed("AutoMod Punishment", `<@${uid}> has been **muted** for repeatedly violating rules.`, 0xFFA500)] }).catch(()=>{});
            }
          } catch (err) { console.error("AutoMod mute failed", err); }
        }
        saveServersSync();
      }
    }
  }

  try { await handleCommand(message); } catch (e) { console.error("handleCommand error", e); }
});

// ---------------------- COMMANDS: Moderation ----------------------

client.commands.set("warn", {
  name: "warn",
  description: "Issues a warning to a user.",
  usage: ".warn <@user> [reason]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, addCase, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to warn. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const reason = args.slice(1).join(" ") || "No reason provided";
    const caseId = addCase(message.guild.id, "warn", target.id, message.author.id, reason);
    srv.warnings[target.id] = (srv.warnings[target.id] || 0) + 1;
    saveServersSync();
    await message.reply({ embeds: [makeEmbed("User Warned", `**${target.user.tag}** was warned.\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] });
    const logChannelId = srv.channels?.logs?.moderation;
    if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Warn", `**User:** ${target.user.tag} (${target.id})\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] }).catch(()=>{});
  }
});

client.commands.set("kick", {
  name: "kick",
  description: "Kicks a user from the server.",
  usage: ".kick <@user> [reason]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, addCase, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to kick. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (!target.kickable) return message.reply({ embeds: [makeEmbed("Error", "I cannot kick that member. This might be due to role hierarchy or permissions.", 0xff0000)] });
    const reason = args.slice(1).join(" ") || "No reason provided";
    const caseId = addCase(message.guild.id, "kick", target.id, message.author.id, reason);
    try {
      await target.kick(reason);
      saveServersSync();
      await message.reply({ embeds: [makeEmbed("Kicked", `**${target.user.tag}** was kicked.\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] });
      const logChannelId = srv.channels?.logs?.moderation;
      if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Kick", `**User:** ${target.user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] }).catch(()=>{});
    } catch (e) {
      console.error("kick failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to kick user.", 0xff0000)] });
    }
  }
});

client.commands.set("ban", {
  name: "ban",
  description: "Bans a user from the server.",
  usage: ".ban <@user> [reason]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, addCase, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to ban. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (!target.bannable) return message.reply({ embeds: [makeEmbed("Error", "I cannot ban that member. This might be due to role hierarchy or permissions.", 0xff0000)] });
    const reason = args.slice(1).join(" ") || "No reason provided";
    const caseId = addCase(message.guild.id, "ban", target.id, message.author.id, reason);
    try {
      await target.ban({ reason });
      saveServersSync();
      await message.reply({ embeds: [makeEmbed("Banned", `**${target.user.tag}** was banned.\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] });
      const logChannelId = srv.channels?.logs?.moderation;
      if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Ban", `**User:** ${target.user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] }).catch(()=>{});
    } catch (e) {
      console.error("ban failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to ban user.", 0xff0000)] });
    }
  }
});

client.commands.set("softban", {
  name: "softban",
  description: "Bans a user then immediately unbans them, deleting their messages from the last 24 hours.",
  usage: ".softban <@user> [reason]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, addCase, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to softban. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const reason = args.slice(1).join(" ") || "No reason provided";
    const caseId = addCase(message.guild.id, "softban", target.id, message.author.id, reason);
    try {
      await target.ban({ deleteMessageSeconds: 60 * 60 * 24, reason }); // Delete messages from last 24 hours
      await message.guild.members.unban(target.id, "Softban complete").catch(()=>{});
      saveServersSync();
      await message.reply({ embeds: [makeEmbed("Softbanned", `**${target.user.tag}** was softbanned (messages cleared).\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] });
      const logChannelId = srv.channels?.logs?.moderation;
      if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Softban", `**User:** ${target.user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] }).catch(()=>{});
    } catch (e) {
      console.error("softban failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to softban user.", 0xff0000)] });
    }
  }
});

client.commands.set("mute", {
  name: "mute",
  description: "Mutes a user by applying the 'Pulse Muted' role.",
  usage: ".mute <@user> [reason]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, addCase, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to mute. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const reason = args.slice(1).join(" ") || "No reason provided";
    let muteRole = message.guild.roles.cache.find(r => r.name === "Pulse Muted");
    if (!muteRole) {
      try {
        muteRole = await message.guild.roles.create({ name: "Pulse Muted", permissions: [], reason: "Created by Pulse for muting" });
        for (const [, ch] of message.guild.channels.cache) {
          try { await ch.permissionOverwrites.edit(muteRole, { SendMessages: false, AddReactions: false, Speak: false }).catch(()=>{}); } catch {}
        }
      } catch (e) { console.error("create mute role failed", e); }
    }
    try {
      await target.roles.add(muteRole);
      const caseId = addCase(message.guild.id, "mute", target.id, message.author.id, reason);
      saveServersSync();
      await message.reply({ embeds: [makeEmbed("Muted", `**${target.user.tag}** was muted.\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] });
      const logChannelId = srv.channels?.logs?.moderation;
      if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Mute", `**User:** ${target.user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**Case ID:** ${caseId}`, getRandomColor())] }).catch(()=>{});
    } catch (e) {
      console.error("mute failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to mute user.", 0xff0000)] });
    }
  }
});

client.commands.set("unmute", {
  name: "unmute",
  description: "Unmutes a user by removing the 'Pulse Muted' role.",
  usage: ".unmute <@user>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to unmute. \nUsage: \`${this.usage}\``, 0xff0000)] });
    let muteRole = message.guild.roles.cache.find(r => r.name === "Pulse Muted");
    if (!muteRole) return message.reply({ embeds: [makeEmbed("Error", "No 'Pulse Muted' role found, so no one is muted.", 0xff0000)] });
    try {
      await target.roles.remove(muteRole);
      await message.reply({ embeds: [makeEmbed("Unmuted", `**${target.user.tag}** was unmuted.`, getRandomColor())] });
      const logChannelId = srv.channels?.logs?.moderation;
      if (logChannelId) message.guild.channels.cache.get(logChannelId)?.send({ embeds: [makeEmbed("Moderation | Unmute", `**User:** ${target.user.tag}\n**Moderator:** ${message.author.tag}`, getRandomColor())] }).catch(()=>{});
    } catch (e) {
      console.error("unmute failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to unmute user.", 0xff0000)] });
    }
  }
});

client.commands.set("purge", {
  name: "purge",
  description: "Deletes a specified number of messages from the current channel.",
  usage: ".purge <amount (1-100)>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const count = parseInt(args[0]);
    if (isNaN(count) || count < 1 || count > 100) return message.reply({ embeds: [makeEmbed("Usage", `Please specify a number between 1 and 100. \nUsage: \`${this.usage}\``, 0xff0000)] });
    try {
      await message.channel.bulkDelete(count, true);
      return message.reply({ embeds: [makeEmbed("Purged", `Deleted **${count}** messages.`, getRandomColor())] }).then(m => setTimeout(()=>m.delete().catch(()=>{}), 5000));
    } catch (e) {
      console.error("purge failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to purge messages. Messages older than 14 days cannot be deleted.", 0xff0000)] });
    }
  }
});

client.commands.set("lock", {
  name: "lock",
  description: "Locks the current channel, preventing @everyone from sending messages.",
  usage: ".lock",
  category: "Moderation",
  aliases: [],
  async execute({ message, makeEmbed }) {
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      return message.reply({ embeds: [makeEmbed("Locked", "This channel has been locked.", getRandomColor())] });
    } catch (e) {
      console.error("lock failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to lock channel. Check bot permissions.", 0xff0000)] });
    }
  }
});

client.commands.set("unlock", {
  name: "unlock",
  description: "Unlocks the current channel, allowing @everyone to send messages.",
  usage: ".unlock",
  category: "Moderation",
  aliases: [],
  async execute({ message, makeEmbed }) {
    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      return message.reply({ embeds: [makeEmbed("Unlocked", "This channel has been unlocked.", getRandomColor())] });
    } catch (e) {
      console.error("unlock failed", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to unlock channel. Check bot permissions.", 0xff0000)] });
    }
  }
});

client.commands.set("case", {
  name: "case",
  description: "Views details of a specific moderation case.",
  usage: ".case <case_id>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const caseId = args[0];
    if (!caseId) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a case ID. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const c = srv.cases && srv.cases[caseId];
    if (!c) return message.reply({ embeds: [makeEmbed("Not Found", "Case not found.", 0xff0000)] });
    const moderator = `<@${c.moderator}>`;
    const target = `<@${c.target}>`;
    return message.reply({ embeds: [makeEmbed(`Case ${caseId}`, `**Action:** ${c.action}\n**Target:** ${target}\n**Moderator:** ${moderator}\n**Reason:** ${c.reason}\n**Date:** <t:${Math.floor(c.timestamp/1000)}:f>`, getRandomColor())] });
  }
});

client.commands.set("restore", {
  name: "restore",
  description: "Attempts to restore channels and roles deleted within the last 72 hours.",
  usage: ".restore",
  category: "Administration",
  aliases: [],
  async execute({ message, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    let restoredCount = 0;
    const now = Date.now();
    srv.deleted = srv.deleted || { roles: [], channels: [], bans: [] };

    // Restore roles
    for (const rinfo of (srv.deleted.roles || [])) {
      if (!rinfo || !rinfo.deletedAt || (now - rinfo.deletedAt > 72 * 3600000)) continue;
      try {
        await message.guild.roles.create({ name: rinfo.name, permissions: BigInt(rinfo.permissions || 0) });
        restoredCount++;
      } catch (e) { console.error("Error restoring role:", e.message); }
    }
    srv.deleted.roles = []; // Clear restored roles

    // Restore channels
    for (const cinfo of (srv.deleted.channels || [])) {
      if (!cinfo || !cinfo.deletedAt || (now - cinfo.deletedAt > 72 * 3600000)) continue;
      try {
        const created = await message.guild.channels.create({ name: cinfo.name, type: cinfo.type || ChannelType.GuildText });
        if (cinfo.parent) {
          const parent = message.guild.channels.cache.get(cinfo.parent);
          if (parent && parent.type === ChannelType.GuildCategory) created.setParent(parent.id).catch(() => {});
        }
        if (Array.isArray(cinfo.permissions)) {
          for (const po of cinfo.permissions) {
            try {
              await created.permissionOverwrites.create(po.id, { allow: BigInt(po.allow || 0), deny: BigInt(po.deny || 0) }).catch(() => {});
            } catch (e) { console.error("Error restoring channel permissions:", e.message); }
          }
        }
        restoredCount++;
      } catch (e) { console.error("Error restoring channel:", e.message); }
    }
    srv.deleted.channels = []; // Clear restored channels

    saveServersSync();
    return message.reply({ embeds: [makeEmbed("Restore Complete", `Restored **${restoredCount}** items (roles & channels) deleted within the past 72 hours.`, getRandomColor())] });
  }
});

// ---------------------- Listeners for saving deleted metadata ----------------------
client.on("channelDelete", (ch) => {
  if (!ch.guild) return;
  const srv = getServer(ch.guild.id);
  // Store only if anti-nuke channel protection is enabled
  if (srv.modules.antinuke && srv.antinuke.protectChannels) {
    srv.deleted = srv.deleted || { channels: [], roles: [], bans: [] };
    srv.deleted.channels.push({
      id: ch.id,
      name: ch.name,
      type: ch.type,
      parent: ch.parentId || null,
      permissions: ch.permissionOverwrites.cache.map(po => ({ id: po.id, allow: po.allow?.bitfield || 0, deny: po.deny?.bitfield || 0 })),
      deletedAt: Date.now()
    });
    saveServersSync();
  }
});

client.on("roleDelete", (role) => {
  if (!role.guild) return;
  const srv = getServer(role.guild.id);
  // Store only if anti-nuke role protection is enabled
  if (srv.modules.antinuke && srv.antinuke.protectRoles) {
    srv.deleted = srv.deleted || { channels: [], roles: [], bans: [] };
    srv.deleted.roles.push({ id: role.id, name: role.name, permissions: role.permissions?.bitfield || 0, deletedAt: Date.now() });
    saveServersSync();
  }
});

// ---------------------- ECONOMY & MARKET & CHARTS ----------------------

client.commands.set("daily", {
  name: "daily",
  description: "Claims your daily coin reward.",
  usage: ".daily",
  category: "Economy",
  aliases: [],
  async execute({ message, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const users = srv.economy.users;
    if (!users[message.author.id]) users[message.author.id] = { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const u = users[message.author.id];
    const now = Date.now();
    const last = u.cooldowns?.daily || 0;
    if (now - last < 24 * 3600000) return message.reply({ embeds: [makeEmbed("Daily Reward", `You already claimed your daily reward. Try again <t:${Math.floor((last + 24 * 3600000) / 1000)}:R>.`, 0xff0000)] });
    const amount = Math.floor(Math.random() * 500) + 100;
    u.wallet += amount;
    u.cooldowns.daily = now;
    const mUserKey = `${message.guild.id}_${message.author.id}`;
    ensureMarketUser(message.guild.id, message.author.id);
    MARKET.users[mUserKey].wallet = (MARKET.users[mUserKey].wallet || 0) + amount;
    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Daily Reward", `You received **${amount} ${srv.economy.currency}**!`, getRandomColor())] });
  }
});

client.commands.set("weekly", {
  name: "weekly",
  description: "Claims your weekly coin reward.",
  usage: ".weekly",
  category: "Economy",
  aliases: [],
  async execute({ message, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const users = srv.economy.users;
    if (!users[message.author.id]) users[message.author.id] = { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const u = users[message.author.id];
    const now = Date.now();
    const last = u.cooldowns?.weekly || 0;
    if (now - last < 7 * 24 * 3600000) return message.reply({ embeds: [makeEmbed("Weekly Reward", `You already claimed your weekly reward. Try again <t:${Math.floor((last + 7 * 24 * 3600000) / 1000)}:R>.`, 0xff0000)] });
    const amount = Math.floor(Math.random() * 3000) + 1000;
    u.wallet += amount;
    u.cooldowns.weekly = now;
    const mUserKey = `${message.guild.id}_${message.author.id}`;
    ensureMarketUser(message.guild.id, message.author.id);
    MARKET.users[mUserKey].wallet = (MARKET.users[mUserKey].wallet || 0) + amount;
    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Weekly Reward", `You received **${amount} ${srv.economy.currency}**!`, getRandomColor())] });
  }
});

client.commands.set("monthly", {
  name: "monthly",
  description: "Claims your monthly coin reward.",
  usage: ".monthly",
  category: "Economy",
  aliases: [],
  async execute({ message, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const users = srv.economy.users;
    if (!users[message.author.id]) users[message.author.id] = { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const u = users[message.author.id];
    const now = Date.now();
    const last = u.cooldowns?.monthly || 0;
    if (now - last < 30 * 24 * 3600000) return message.reply({ embeds: [makeEmbed("Monthly Reward", `You already claimed your monthly reward. Try again <t:${Math.floor((last + 30 * 24 * 3600000) / 1000)}:R>.`, 0xff0000)] });
    const amount = Math.floor(Math.random() * 12000) + 5000;
    u.wallet += amount;
    u.cooldowns.monthly = now;
    const mUserKey = `${message.guild.id}_${message.author.id}`;
    ensureMarketUser(message.guild.id, message.author.id);
    MARKET.users[mUserKey].wallet = (MARKET.users[mUserKey].wallet || 0) + amount;
    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Monthly Reward", `You received **${amount} ${srv.economy.currency}**!`, getRandomColor())] });
  }
});

client.commands.set("work", {
  name: "work",
  description: "Plays a mini-game to earn coins. Has a cooldown.",
  usage: ".work",
  category: "Economy",
  aliases: [],
  async execute({ message, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const now = Date.now();
    const last = u.cooldowns?.work || 0;
    if (now - last < 60 * 60 * 1000) return message.reply({ embeds: [makeEmbed("Work", `You are on cooldown. Try again <t:${Math.floor((last + 60 * 60 * 1000) / 1000)}:R>.`, 0xff0000)] });
    const number = Math.floor(Math.random() * 5) + 1;
    await message.reply({ embeds: [makeEmbed("Work Mini-Game", "Guess a number between 1 and 5. Reply within 15 seconds.", getRandomColor())] });
    const filter = m => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 }).catch(() => null);
    let reward = Math.floor(Math.random() * 300) + 100;
    if (collected && collected.first()) {
      const guess = parseInt(collected.first().content);
      if (guess === number) {
        u.wallet += reward;
        const mUserKey = `${message.guild.id}_${message.author.id}`;
        ensureMarketUser(message.guild.id, message.author.id);
        MARKET.users[mUserKey].wallet = (MARKET.users[mUserKey].wallet || 0) + reward;
        u.cooldowns.work = now;
        saveServersSync();
        saveMarketSync();
        return message.channel.send({ embeds: [makeEmbed("Work Success", `Correct! You earned **${reward} ${srv.economy.currency}**.`, getRandomColor())] });
      }
    }
    const consolation = Math.floor(Math.random() * 50) + 5;
    u.wallet += consolation;
    ensureMarketUser(message.guild.id, message.author.id);
    MARKET.users[`${message.guild.id}_${message.author.id}`].wallet += consolation;
    u.cooldowns.work = now;
    saveServersSync();
    saveMarketSync();
    return message.channel.send({ embeds: [makeEmbed("Work Failed", `Wrong or no answer. You received **${consolation} ${srv.economy.currency}** for effort. (The number was ${number})`, 0xff0000)] });
  }
});

client.commands.set("beg", {
  name: "beg",
  description: "Begs for some coins.",
  usage: ".beg",
  category: "Economy",
  aliases: [],
  async execute({ message, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const success = Math.random() < 0.6;
    if (success) {
      const amount = Math.floor(Math.random() * 80) + 5;
      u.wallet += amount;
      ensureMarketUser(message.guild.id, message.author.id);
      MARKET.users[`${message.guild.id}_${message.author.id}`].wallet += amount;
      saveServersSync();
      saveMarketSync();
      return message.reply({ embeds: [makeEmbed("Beg Result", `Someone gave you **${amount} ${srv.economy.currency}**!`, getRandomColor())] });
    } else {
      return message.reply({ embeds: [makeEmbed("Beg Result", "No one helped you this time.", 0xff0000)] });
    }
  }
});

client.commands.set("rob", {
  name: "rob",
  description: "Attempts to rob another user's wallet.",
  usage: ".rob <@user>",
  category: "Economy",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to rob. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (target.user.bot || target.id === message.author.id) return message.reply({ embeds: [makeEmbed("Error", "You cannot rob a bot or yourself.", 0xff0000)] });

    const srv = getServer(message.guild.id);
    const robber = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const victim = srv.economy.users[target.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };

    if ((victim.wallet || 0) < 50) return message.reply({ embeds: [makeEmbed("Robbery Failed", `${target.user.tag} doesn't have enough ${srv.economy.currency} to be robbed (needs at least 50).`, 0xff0000)] });

    const chance = Math.random();
    if (chance > 0.5) { // Success
      const stolen = Math.floor((victim.wallet || 0) * (0.15 + Math.random() * 0.2)); // Steal 15-35%
      victim.wallet -= stolen;
      robber.wallet += stolen;
      ensureMarketUser(message.guild.id, message.author.id);
      ensureMarketUser(message.guild.id, target.id);
      MARKET.users[`${message.guild.id}_${target.id}`].wallet = (MARKET.users[`${message.guild.id}_${target.id}`].wallet || 0) - stolen;
      MARKET.users[`${message.guild.id}_${message.author.id}`].wallet = (MARKET.users[`${message.guild.id}_${message.author.id}`].wallet || 0) + stolen;
      saveServersSync();
      saveMarketSync();
      return message.reply({ embeds: [makeEmbed("Robbery Success", `You successfully robbed **${stolen} ${srv.economy.currency}** from ${target.user.tag}!`, getRandomColor())] });
    } else { // Fail
      const fine = Math.floor((robber.wallet || 0) * 0.1); // Lose 10%
      robber.wallet = Math.max(0, (robber.wallet || 0) - fine);
      ensureMarketUser(message.guild.id, message.author.id);
      MARKET.users[`${message.guild.id}_${message.author.id}`].wallet = robber.wallet;
      saveServersSync();
      saveMarketSync();
      return message.reply({ embeds: [makeEmbed("Robbery Failed", `You got caught and fined **${fine} ${srv.economy.currency}**!`, 0xff0000)] });
    }
  }
});

client.commands.set("slots", {
  name: "slots",
  description: "Plays a slot machine game.",
  usage: ".slots <bet_amount>",
  category: "Economy",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const bet = parseInt(args[0]);
    if (isNaN(bet) || bet <= 0 || bet > u.wallet) return message.reply({ embeds: [makeEmbed("Slots", `Please enter a valid bet amount you have in your wallet. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const emojis = ["🍒", "🍊", "🍋", "🍇", "7️⃣"];
    const spin = () => [
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)],
      emojis[Math.floor(Math.random() * emojis.length)]
    ];
    const result = spin();

    let winnings = -bet; // Default to losing the bet
    if (result[0] === result[1] && result[1] === result[2]) {
      if (result[0] === "7️⃣") winnings = bet * 10; // Jackpot
      else winnings = bet * 5; // Three of a kind
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      winnings = bet * 2; // Two of a kind (simple payout)
    }

    u.wallet += winnings;
    ensureMarketUser(message.guild.id, message.author.id);
    MARKET.users[`${message.guild.id}_${message.author.id}`].wallet += winnings;
    saveServersSync();
    saveMarketSync();

    const resultEmbed = makeEmbed("🎰 Slots 🎰", `[ ${result.join(" | ")} ]\n\nYou ${winnings >= 0 ? "won" : "lost"} **${Math.abs(winnings)} ${srv.economy.currency}**.\nYour new wallet balance is **${u.wallet} ${srv.economy.currency}**.`);
    return message.reply({ embeds: [resultEmbed] });
  }
});


client.commands.set("balance", {
  name: "balance",
  description: "Checks your or another user's coin balance.",
  usage: ".balance [user]",
  category: "Economy",
  aliases: ["bal"],
  async execute({ message, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first() || message.member;
    const u = srv.economy.users[target.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const embed = makeEmbed(`${target.user.tag}'s Balance`, `**Wallet:** ${u.wallet || 0} ${srv.economy.currency}\n**Bank:** ${u.bank || 0} ${srv.economy.currency}`, getRandomColor());
    return message.reply({ embeds: [embed] });
  }
});

client.commands.set("deposit", {
  name: "deposit",
  description: "Deposits coins from your wallet to your bank.",
  usage: ".deposit <amount | all>",
  category: "Economy",
  aliases: ["dep"],
  async execute({ message, args, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    let amount;
    if (args[0]?.toLowerCase() === "all") {
      amount = u.wallet;
    } else {
      amount = parseInt(args[0]);
    }
    if (isNaN(amount) || amount <= 0 || amount > u.wallet) return message.reply({ embeds: [makeEmbed("Usage", `Please specify a valid amount to deposit from your wallet. \nUsage: \`${this.usage}\``, 0xff0000)] });
    
    u.wallet -= amount;
    u.bank = (u.bank || 0) + amount;
    ensureMarketUser(message.guild.id, message.author.id);
    const mu = MARKET.users[`${message.guild.id}_${message.author.id}`];
    mu.wallet = u.wallet;
    mu.bank = u.bank;
    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Deposit", `Deposited **${amount} ${srv.economy.currency}** to your bank.`, getRandomColor())] });
  }
});

client.commands.set("withdraw", {
  name: "withdraw",
  description: "Withdraws coins from your bank to your wallet.",
  usage: ".withdraw <amount | all>",
  category: "Economy",
  aliases: ["with"],
  async execute({ message, args, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    let amount;
    if (args[0]?.toLowerCase() === "all") {
      amount = u.bank;
    } else {
      amount = parseInt(args[0]);
    }
    if (isNaN(amount) || amount <= 0 || amount > u.bank) return message.reply({ embeds: [makeEmbed("Usage", `Please specify a valid amount to withdraw from your bank. \nUsage: \`${this.usage}\``, 0xff0000)] });
    
    u.bank -= amount;
    u.wallet = (u.wallet || 0) + amount;
    ensureMarketUser(message.guild.id, message.author.id);
    const mu = MARKET.users[`${message.guild.id}_${message.author.id}`];
    mu.wallet = u.wallet;
    mu.bank = u.bank;
    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Withdraw", `Withdrew **${amount} ${srv.economy.currency}** from your bank.`, getRandomColor())] });
  }
});

client.commands.set("pay", {
  name: "pay",
  description: "Pays another user a specified amount of coins from your wallet.",
  usage: ".pay <@user> <amount>",
  category: "Economy",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync, saveMarketSync }) {
    const target = message.mentions.members.first();
    const amount = parseInt(args[1]);
    if (!target || isNaN(amount) || amount <= 0) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user and a valid amount to pay. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (target.user.bot || target.id === message.author.id) return message.reply({ embeds: [makeEmbed("Error", "You cannot pay a bot or yourself.", 0xff0000)] });

    const srv = getServer(message.guild.id);
    const sender = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const receiver = srv.economy.users[target.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };

    if (sender.wallet < amount) return message.reply({ embeds: [makeEmbed("Insufficient Funds", `You do not have enough ${srv.economy.currency} in your wallet.`, 0xff0000)] });

    sender.wallet -= amount;
    receiver.wallet += amount;

    ensureMarketUser(message.guild.id, message.author.id);
    ensureMarketUser(message.guild.id, target.id);
    MARKET.users[`${message.guild.id}_${message.author.id}`].wallet = sender.wallet;
    MARKET.users[`${message.guild.id}_${target.id}`].wallet = receiver.wallet;

    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Payment Sent", `You paid **${amount} ${srv.economy.currency}** to ${target.user.tag}.`, getRandomColor())] });
  }
});


client.commands.set("market", {
  name: "market",
  description: "Displays the current global stock market prices.",
  usage: ".market",
  category: "Investing",
  aliases: [],
  async execute({ message, makeEmbed, MARKET }) {
    const marketInfo = Object.entries(MARKET.stocks).map(([sym, data]) => `**${sym}**: ${data.price.toFixed(2)} ${getServer(message.guild.id).economy.currency}`);
    return message.reply({ embeds: [makeEmbed("Global Market", marketInfo.join("\n"), getRandomColor())] });
  }
});

client.commands.set("buy", {
  name: "buy",
  description: "Buys a specified quantity of stock from the market.",
  usage: ".buy <stock_symbol> <quantity>",
  category: "Investing",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, MARKET, ensureMarketUser, saveServersSync, saveMarketSync }) {
    const symbol = args[0]?.toUpperCase();
    const quantity = parseInt(args[1]);
    if (!symbol || !quantity || quantity <= 0) return message.reply({ embeds: [makeEmbed("Usage", `Please specify a stock symbol and valid quantity. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (!MARKET.stocks[symbol]) return message.reply({ embeds: [makeEmbed("Error", `Invalid stock symbol. Available: ${Object.keys(MARKET.stocks).join(", ")}`, 0xff0000)] });

    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const stockPrice = MARKET.stocks[symbol].price;
    const cost = stockPrice * quantity;

    if (u.wallet < cost) return message.reply({ embeds: [makeEmbed("Insufficient Funds", `You don't have enough ${srv.economy.currency} in your wallet. Total cost: **${cost.toFixed(2)} ${srv.economy.currency}**`, 0xff0000)] });

    u.wallet -= cost;
    const mUser = ensureMarketUser(message.guild.id, message.author.id);
    mUser.wallet = u.wallet;
    mUser.portfolio[symbol] = (mUser.portfolio[symbol] || 0) + quantity;

    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Stock Purchase", `Bought **${quantity} shares** of **${symbol}** for **${cost.toFixed(2)} ${srv.economy.currency}**.`, getRandomColor())] });
  }
});

client.commands.set("sell", {
  name: "sell",
  description: "Sells a specified quantity of stock from your portfolio.",
  usage: ".sell <stock_symbol> <quantity>",
  category: "Investing",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, MARKET, ensureMarketUser, saveServersSync, saveMarketSync }) {
    const symbol = args[0]?.toUpperCase();
    const quantity = parseInt(args[1]);
    if (!symbol || !quantity || quantity <= 0) return message.reply({ embeds: [makeEmbed("Usage", `Please specify a stock symbol and valid quantity. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (!MARKET.stocks[symbol]) return message.reply({ embeds: [makeEmbed("Error", `Invalid stock symbol. Available: ${Object.keys(MARKET.stocks).join(", ")}`, 0xff0000)] });

    const srv = getServer(message.guild.id);
    const u = srv.economy.users[message.author.id] || { wallet: srv.economy.startingWallet, bank: 0, inventory: [], cooldowns: {} };
    const mUser = ensureMarketUser(message.guild.id, message.author.id);
    const held = mUser.portfolio[symbol] || 0;

    if (held < quantity) return message.reply({ embeds: [makeEmbed("Error", `You only own **${held} shares** of **${symbol}**.`, 0xff0000)] });

    const stockPrice = MARKET.stocks[symbol].price;
    const revenue = stockPrice * quantity;

    u.wallet += revenue;
    mUser.wallet = u.wallet;
    mUser.portfolio[symbol] -= quantity;
    if (mUser.portfolio[symbol] <= 0) delete mUser.portfolio[symbol]; // Remove if no shares left

    saveServersSync();
    saveMarketSync();
    return message.reply({ embeds: [makeEmbed("Stock Sale", `Sold **${quantity} shares** of **${symbol}** for **${revenue.toFixed(2)} ${srv.economy.currency}**.`, getRandomColor())] });
  }
});


client.commands.set("portfolio", {
  name: "portfolio",
  description: "Displays your current stock portfolio and total net worth.",
  usage: ".portfolio",
  category: "Investing",
  aliases: [],
  async execute({ message, makeEmbed, MARKET, ensureMarketUser, computePortfolioValue }) {
    const srv = getServer(message.guild.id);
    const mUser = ensureMarketUser(message.guild.id, message.author.id);
    const portfolio = mUser.portfolio;
    let portfolioStr = "No holdings.";

    if (Object.keys(portfolio).length > 0) {
      portfolioStr = Object.keys(portfolio).map(sym => {
        const qty = portfolio[sym];
        const stock = MARKET.stocks[sym];
        const value = stock ? stock.price * qty : 0;
        return `**${sym}**: ${qty} shares (Current Value: ${value.toFixed(2)} ${srv.economy.currency})`;
      }).join("\n");
    }

    const totalNetWorth = computePortfolioValue(message.guild.id, message.author.id);

    return message.reply({ embeds: [makeEmbed("My Portfolio", `${portfolioStr}\n\n**Total Net Worth:** ${totalNetWorth.toFixed(2)} ${srv.economy.currency}`, getRandomColor())] });
  }
});


client.commands.set("chart", {
  name: "chart",
  description: "Displays a price chart for a given stock symbol.",
  usage: ".chart <stock_symbol>",
  category: "Investing",
  aliases: [],
  async execute({ message, args, makeEmbed, MARKET, QuickChart }) {
    const symbol = args[0]?.toUpperCase();
    if (!symbol || !MARKET.stocks[symbol]) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a valid stock symbol. \nUsage: \`${this.usage}\``, 0xff0000)] });
    if (!QuickChart) return message.reply({ embeds: [makeEmbed("Error", "QuickChart is not installed or failed to load. Cannot generate chart.", 0xff0000)] });

    const stock = MARKET.stocks[symbol];
    const chart = new QuickChart();
    chart.setConfig({
      type: 'line',
      data: {
        labels: Array.from({ length: stock.history.length }, (_, i) => ''),
        datasets: [{
          label: `${symbol} Price`,
          data: stock.history,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        legend: { display: false },
        title: { display: true, text: `${symbol} Price History` },
      },
    });

    const chartUrl = await chart.getShortUrl(); // Use short URL to avoid embed issues
    const embed = makeEmbed(`Stock Chart: ${symbol}`, `Current Price: **${stock.price.toFixed(2)} ${getServer(message.guild.id).economy.currency}**`, getRandomColor());
    embed.setImage(chartUrl);
    return message.reply({ embeds: [embed] });
  }
});

client.commands.set("leaderboard", {
  name: "leaderboard",
  description: "Displays the server's top 10 wealthiest users.",
  usage: ".leaderboard",
  category: "Economy",
  aliases: ["lb"],
  async execute({ message, makeEmbed, MARKET, computePortfolioValue }) {
    const guildId = message.guild.id;
    const leaderData = Object.keys(MARKET.users)
      .filter(key => key.startsWith(`${guildId}_`))
      .map(key => {
        const userId = key.split('_')[1];
        return {
          userId,
          value: computePortfolioValue(guildId, userId)
        };
      })
      .sort((a, b) => b.value - a.value);

    const topTen = leaderData.slice(0, 10);
    if (topTen.length === 0) return message.reply({ embeds: [makeEmbed("Leaderboard", "No one is on the leaderboard yet. Start earning with `.daily` or `.work`!", getRandomColor())] });

    const leaderboardText = await Promise.all(topTen.map(async (entry, index) => {
      const member = await message.guild.members.fetch(entry.userId).catch(() => null);
      const username = member ? member.user.tag : `Unknown User (${entry.userId})`;
      return `${index + 1}. **${username}** - **${entry.value.toFixed(2)} ${getServer(message.guild.id).economy.currency}**`;
    }));

    return message.reply({ embeds: [makeEmbed("Top 10 Wealthiest Users", leaderboardText.join("\n"), getRandomColor())] });
  }
});

client.commands.set("rank", {
  name: "rank",
  description: "Displays your or another user's current level and XP progress.",
  usage: ".rank [user]",
  category: "Social & Engagement",
  aliases: [],
  async execute({ message, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first() || message.member;
    const userXP = srv.utility.levels[target.id] || { xp: 0, level: 0 };
    const neededXP = 50 + (userXP.level * 100);
    const progress = (userXP.xp / neededXP); // 0 to 1
    const progressBarLength = 10;
    const filledBlocks = Math.floor(progress * progressBarLength);
    const emptyBlocks = progressBarLength - filledBlocks;
    const progressBar = "█".repeat(filledBlocks) + "─".repeat(emptyBlocks);

    const embed = makeEmbed(`${target.user.tag}'s Rank`,
      `**Level:** ${userXP.level}\n**XP:** ${userXP.xp} / ${neededXP}\n\n[${progressBar}] ${(progress * 100).toFixed(0)}%`,
      getRandomColor());
    return message.reply({ embeds: [embed] });
  }
});

// ---------------------- COMMANDS: Utility ----------------------
client.commands.set("poll", {
  name: "poll",
  description: "Creates a multiple-choice poll with reaction options.",
  usage: ".poll <question> | <option1> | <option2> | ... (max 9 options)",
  category: "Utility",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const parts = args.join(" ").split(" | ");
    const question = parts.shift();
    const options = parts;
    if (!question || options.length === 0 || options.length > 9) return message.reply({ embeds: [makeEmbed("Usage", `Invalid poll format. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    let desc = `**${question}**\n\n`;
    for (let i = 0; i < options.length; i++) {
      desc += `${emojis[i]} ${options[i]}\n`;
    }

    const pollEmbed = makeEmbed("📊 New Poll", desc, getRandomColor());
    const sent = await message.channel.send({ embeds: [pollEmbed] });
    for (let i = 0; i < options.length; i++) {
      await sent.react(emojis[i]);
    }
    await message.delete().catch(()=>{}); // Delete poll command message
  }
});

client.commands.set("suggest", {
  name: "suggest",
  description: "Submits a suggestion to the designated suggestion channel.",
  usage: ".suggest <your suggestion>",
  category: "Utility",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const suggestionChannelId = srv.channels?.suggestions;
    if (!suggestionChannelId) return message.reply({ embeds: [makeEmbed("Error", "A suggestion channel has not been set up. An admin can configure it via `.setup`.", 0xff0000)] });

    const suggestion = args.join(" ");
    if (!suggestion) return message.reply({ embeds: [makeEmbed("Usage", `Please provide your suggestion. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const suggestionChannel = message.guild.channels.cache.get(suggestionChannelId);
    if (!suggestionChannel || suggestionChannel.type !== ChannelType.GuildText) return message.reply({ embeds: [makeEmbed("Error", "The configured suggestion channel does not exist or is not a text channel. An admin can configure it via `.setup`.", 0xff0000)] });

    const embed = makeEmbed("💡 New Suggestion", suggestion, getRandomColor())
      .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() });

    const sent = await suggestionChannel.send({ embeds: [embed] });
    await sent.react("⬆️");
    await sent.react("⬇️");

    await message.reply({ embeds: [makeEmbed("Suggestion Submitted", `Your suggestion has been submitted to <#${suggestionChannelId}>.`, getRandomColor())] }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
  }
});

client.commands.set("remindme", {
  name: "remindme",
  description: "Sets a personal reminder.",
  usage: ".remindme <time><unit> <message> (e.g., 10s, 5m, 2h, 1d)",
  category: "Utility",
  aliases: [],
  async execute({ message, args, makeEmbed, REMINDERS, saveRemindersSync }) {
    const timeRegex = /(\d+)([smhd])/;
    const timeMatch = args[0]?.match(timeRegex);
    if (!timeMatch) return message.reply({ embeds: [makeEmbed("Usage", `Invalid time format. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const amount = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    let ms = 0;
    if (unit === "s") ms = amount * 1000;
    else if (unit === "m") ms = amount * 60 * 1000;
    else if (unit === "h") ms = amount * 60 * 60 * 1000;
    else if (unit === "d") ms = amount * 24 * 60 * 60 * 1000;

    const reminderMessage = args.slice(1).join(" ");
    if (!reminderMessage) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a message for the reminder. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const reminderId = crypto.randomUUID(); // Unique ID for each reminder
    REMINDERS[reminderId] = {
      userId: message.author.id,
      channelId: message.channel.id, // Store channel ID for fallback
      message: reminderMessage,
      time: Date.now() + ms,
    };
    saveRemindersSync();

    return message.reply({ embeds: [makeEmbed("Reminder Set", `I will remind you in **${amount}${unit}** about "${reminderMessage}".`, getRandomColor())] });
  }
});


client.commands.set("serverinfo", {
  name: "serverinfo",
  description: "Displays detailed information about the server.",
  usage: ".serverinfo",
  category: "Information",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const guild = message.guild;
    await guild.fetch(); // Ensure guild data is fresh

    const memberCount = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = memberCount - botCount;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const roles = guild.roles.cache.size;
    const boosts = guild.premiumSubscriptionCount;
    const created = Math.floor(guild.createdTimestamp / 1000);

    const infoEmbed = makeEmbed(
      `📊 Server Information: ${guild.name}`,
      `
**ID:** ${guild.id}
**Owner:** <@${guild.ownerId}>
**Created:** <t:${created}:R>
**Members:** ${memberCount} (${humanCount} humans, ${botCount} bots)
**Channels:** ${textChannels} text, ${voiceChannels} voice, ${categories} categories
**Roles:** ${roles}
**Boosts:** ${boosts || 0}
**Verification Level:** ${guild.verificationLevel}
      `,
      getRandomColor()
    );
    if (guild.iconURL()) infoEmbed.setThumbnail(guild.iconURL());

    return message.reply({ embeds: [infoEmbed] });
  }
});

client.commands.set("userinfo", {
  name: "userinfo",
  description: "Displays detailed information about a user.",
  usage: ".userinfo [user]",
  category: "Information",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const target = message.mentions.members.first() || message.member;
    const user = target.user;
    const member = target;

    const status = user.presence?.status || "offline";
    const roles = member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).join(" ") || "None";

    const embed = makeEmbed(
      `👤 User Information: ${user.tag}`,
      `
**ID:** ${user.id}
**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>
**Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>
**Status:** ${status}
**Roles:** ${roles}
      `,
      getRandomColor()
    );
    embed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
    return message.reply({ embeds: [embed] });
  }
});

client.commands.set("ping", {
  name: "ping",
  description: "Checks the bot's latency to the Discord API.",
  usage: ".ping",
  category: "Utility",
  aliases: [],
  async execute({ message, client, makeEmbed }) {
    const latency = Math.round(client.ws.ping);
    const embed = makeEmbed("🏓 Pong!", `Latency: **${latency}ms**`, getRandomColor());
    return message.reply({ embeds: [embed] });
  }
});

client.commands.set("say", {
  name: "say",
  description: "Makes the bot say a message in the current channel.",
  usage: ".say <message>",
  category: "Fun",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const text = args.join(" ");
    if (!text) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a message for the bot to say. \nUsage: \`${this.usage}\``, 0xff0000)] });
    await message.channel.send(text);
    await message.delete().catch(()=>{});
  }
});

client.commands.set("tag", {
  name: "tag",
  description: "Manages custom text tags for quick access.",
  usage: ".tag set <name> <content> | .tag get <name> | .tag delete <name> | .tag list",
  category: "Utility",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const sub = args[0]?.toLowerCase();
    const srv = getServer(message.guild.id);
    srv.utility.tags = srv.utility.tags || {};
    const tags = srv.utility.tags;

    if (sub === "set") {
      if (!canModerate(message.member)) return message.reply({ embeds: [makeEmbed("Permission Denied", "You need moderator permissions to set tags.", 0xff0000)] });
      const name = args[1]?.toLowerCase();
      const content = args.slice(2).join(" ");
      if (!name || !content) return message.reply({ embeds: [makeEmbed("Usage", `Invalid usage. \nUsage: \`${this.usage}\``, 0xff0000)] });
      tags[name] = content;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Tag Set", `Tag **\`${name}\`** has been saved.`, getRandomColor())] });
    } else if (sub === "get") {
      const name = args[1]?.toLowerCase();
      if (!name) return message.reply({ embeds: [makeEmbed("Usage", `Invalid usage. \nUsage: \`${this.usage}\``, 0xff0000)] });
      const content = tags[name];
      if (!content) return message.reply({ embeds: [makeEmbed("Tag Not Found", `Tag **\`${name}\`** not found.`, 0xff0000)] });
      return message.reply({ embeds: [makeEmbed(`Tag: ${name}`, content, getRandomColor())] });
    } else if (sub === "delete") {
      if (!canModerate(message.member)) return message.reply({ embeds: [makeEmbed("Permission Denied", "You need moderator permissions to delete tags.", 0xff0000)] });
      const name = args[1]?.toLowerCase();
      if (!name) return message.reply({ embeds: [makeEmbed("Usage", `Invalid usage. \nUsage: \`${this.usage}\``, 0xff0000)] });
      if (!tags[name]) return message.reply({ embeds: [makeEmbed("Tag Not Found", `Tag **\`${name}\`** not found.`, 0xff0000)] });
      delete tags[name];
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Tag Deleted", `Tag **\`${name}\`** has been deleted.`, getRandomColor())] });
    } else if (sub === "list") {
      const tagList = Object.keys(tags).map(t => `\`${t}\``).join(", ");
      return message.reply({ embeds: [makeEmbed("Available Tags", tagList || "No tags set yet.", getRandomColor())] });
    } else {
      return message.reply({ embeds: [makeEmbed("Usage", `Invalid subcommand for tag. \nUsage: \`${this.usage}\``, 0xff0000)] });
    }
  }
});

client.commands.set("rr", {
  name: "rr",
  description: "Sets up a reaction role message with the ✅ emoji.",
  usage: ".rr <message_id> <@role>",
  category: "Utility",
  aliases: ["reactionrole"],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const messageId = args[0];
    const role = message.mentions.roles.first();
    if (!messageId || !role) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a message ID and mention a role. \nUsage: \`${this.usage}\``, 0xff0000)] });

    try {
      const targetMessage = await message.channel.messages.fetch(messageId);
      await targetMessage.react("✅"); // Default reaction emoji

      const srv = getServer(message.guild.id);
      srv.utility.reactionRoles = srv.utility.reactionRoles || {};
      srv.utility.reactionRoles[messageId] = role.id;
      saveServersSync();

      return message.reply({ embeds: [makeEmbed("Reaction Role Set", `A reaction on [this message](${targetMessage.url}) will now grant the role **${role.name}**.`, getRandomColor())] });
    } catch (e) {
      console.error("Reaction role setup failed:", e);
      return message.reply({ embeds: [makeEmbed("Error", "Failed to set up reaction role. Make sure the message ID is valid and I have permissions to add reactions.", 0xff0000)] });
    }
  }
});

client.commands.set("starboard", {
  name: "starboard",
  description: "Sets the starboard channel for starred messages.",
  usage: ".starboard <#channel>",
  category: "Utility",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const channel = message.mentions.channels.first();
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a text channel to set as the starboard. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const srv = getServer(message.guild.id);
    srv.channels.starboard = channel.id;
    saveServersSync();
    return message.reply({ embeds: [makeEmbed("Starboard Set", `Starboard channel has been set to ${channel}. Any message with 3+ ⭐ reactions will be posted there.`, getRandomColor())] });
  }
});

// Listener for reaction roles
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message || !reaction.message.guild) return;

  const srv = getServer(reaction.message.guild.id);

  // Reaction Roles
  const rr = srv.utility?.reactionRoles || {};
  if (rr[reaction.message.id] && reaction.emoji.name === "✅") { // Only default '✅' emoji for now
    const roleId = rr[reaction.message.id];
    const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
    if (member) member.roles.add(roleId).catch((e) => console.error("Failed to add reaction role:", e));
  }

  // Starboard
  const starboardChannelId = srv.channels?.starboard;
  if (starboardChannelId && reaction.emoji.name === "⭐") {
    const starCount = reaction.count;
    const minStars = 3; // Default minimum stars

    if (starCount >= minStars) {
      const starboardChannel = reaction.message.guild.channels.cache.get(starboardChannelId);
      if (!starboardChannel || starboardChannel.type !== ChannelType.GuildText) return;

      const fetchedMessages = await starboardChannel.messages.fetch({ limit: 100 }); // Check if already posted
      const existingStarboardMsg = fetchedMessages.find(m =>
        m.embeds.length > 0 &&
        m.embeds[0].footer &&
        m.embeds[0].footer.text &&
        m.embeds[0].footer.text.includes(reaction.message.id)
      );

      const embed = makeEmbed("⭐ Starboard ⭐", reaction.message.content || "*(No message content)*", getRandomColor())
        .setAuthor({ name: reaction.message.author.tag, iconURL: reaction.message.author.displayAvatarURL({ dynamic: true }) })
        .setDescription(`[Jump to message](${reaction.message.url})`)
        .setFooter({ text: `Message ID: ${reaction.message.id} | ⭐ ${starCount}` });

      if (reaction.message.attachments.size > 0) {
        embed.setImage(reaction.message.attachments.first().url);
      }

      if (existingStarboardMsg) {
        // Update existing message
        await existingStarboardMsg.edit({ embeds: [embed] }).catch(() => {});
      } else {
        // Post new message
        await starboardChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message || !reaction.message.guild) return;

  const srv = getServer(reaction.message.guild.id);

  // Reaction Roles
  const rr = srv.utility?.reactionRoles || {};
  if (rr[reaction.message.id] && reaction.emoji.name === "✅") {
    const roleId = rr[reaction.message.id];
    const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
    if (member) member.roles.remove(roleId).catch((e) => console.error("Failed to remove reaction role:", e));
  }

  // Starboard (decrease count)
  const starboardChannelId = srv.channels?.starboard;
  if (starboardChannelId && reaction.emoji.name === "⭐") {
    const starCount = reaction.count;
    const minStars = 3; // Must match min stars in add listener

    const starboardChannel = reaction.message.guild.channels.cache.get(starboardChannelId);
    if (!starboardChannel || starboardChannel.type !== ChannelType.GuildText) return;

    const fetchedMessages = await starboardChannel.messages.fetch({ limit: 100 });
    const existingStarboardMsg = fetchedMessages.find(m =>
      m.embeds.length > 0 &&
      m.embeds[0].footer &&
      m.embeds[0].footer.text &&
      m.embeds[0].footer.text.includes(reaction.message.id)
    );

    if (existingStarboardMsg) {
      if (starCount < minStars) {
        await existingStarboardMsg.delete().catch(() => {}); // Delete if too few stars
      } else {
        const embed = makeEmbed("⭐ Starboard ⭐", reaction.message.content || "*(No message content)*", getRandomColor())
          .setAuthor({ name: reaction.message.author.tag, iconURL: reaction.message.author.displayAvatarURL({ dynamic: true }) })
          .setDescription(`[Jump to message](${reaction.message.url})`)
          .setFooter({ text: `Message ID: ${reaction.message.id} | ⭐ ${starCount}` });
        if (reaction.message.attachments.size > 0) {
          embed.setImage(reaction.message.attachments.first().url);
        }
        await existingStarboardMsg.edit({ embeds: [embed] }).catch(() => {});
      }
    }
  }
});


// ---------------------- AUTOMATIC MODERATION (AutoMod) ----------------------

function isSafeExecutor(guildId, executorId) {
  const srv = getServer(guildId);
  const safe = (srv.antinuke && srv.antinuke.safe) || [];
  if (safe.includes(executorId)) return true;
  return false;
}

client.commands.set("automod", {
  name: "automod",
  description: "Manages the server's automatic moderation settings.",
  usage: ".automod <enable|disable|status|set <setting> <value>>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    srv.automod = srv.automod || {};
    const sub = args[0]?.toLowerCase();

    if (sub === "enable") {
      srv.automod.enabled = true;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("AutoMod", "Automatic Moderation enabled.", getRandomColor())] });
    }
    if (sub === "disable") {
      srv.automod.enabled = false;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("AutoMod", "Automatic Moderation disabled.", getRandomColor())] });
    }
    if (sub === "status") {
      const enabled = srv.automod.enabled ? "Enabled" : "Disabled";
      const settings = [
        `**Status:** ${enabled}`,
        `**Anti-Spam:** ${srv.automod.antiSpam ? 'Enabled' : 'Disabled'}`,
        `**Anti-Caps:** ${srv.automod.antiCaps ? 'Enabled' : 'Disabled'}`,
        `**Anti-Links:** ${srv.automod.antiLinks ? 'Enabled' : 'Disabled'}`,
        `**Anti-Invites:** ${srv.automod.antiInvites ? 'Enabled' : 'Disabled'}`,
        `**Profanity Filter:** ${srv.automod.profanityFilter ? 'Enabled' : 'Disabled'}`,
        `**Mute Threshold:** ${srv.automod.muteAt} strikes`,
        `**Kick Threshold:** ${srv.automod.kickAt} strikes`,
        `**Ban Threshold:** ${srv.automod.banAt} strikes`,
        `**Blacklist Entries:** ${(srv.automod.blacklist || []).length}`,
      ].join("\n");
      return message.reply({ embeds: [makeEmbed("AutoMod Status", settings, getRandomColor())] });
    }
    if (sub === "set") {
      const setting = args[1]?.toLowerCase();
      const value = args[2]?.toLowerCase();
      if (!setting || !value) return message.reply({ embeds: [makeEmbed("Usage", `Usage: \`${this.usage}\``, 0xff0000)] });

      let responseMessage = "";
      if (['antispam', 'anticaps', 'antilinks', 'antiinvites', 'profanityfilter'].includes(setting)) {
        const boolValue = value === 'true' || value === 'enable';
        srv.automod[setting.charAt(0).toLowerCase() + setting.slice(1)] = boolValue;
        responseMessage = `\`${setting}\` set to **${boolValue}**.`;
      } else if (['mutethreshold', 'kickthreshold', 'banthreshold'].includes(setting)) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue <= 0) return message.reply({ embeds: [makeEmbed("Error", "Threshold must be a positive number.", 0xff0000)] });
        srv.automod[setting.replace('threshold', 'At')] = numValue;
        responseMessage = `\`${setting}\` set to **${numValue}**.`;
      } else {
        return message.reply({ embeds: [makeEmbed("Error", "Invalid AutoMod setting. Options: antispam, anticaps, antilinks, antiinvites, profanityfilter, mutethreshold, kickthreshold, banthreshold", 0xff0000)] });
      }
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("AutoMod Settings Updated", responseMessage, getRandomColor())] });
    }

    return message.reply({ embeds: [makeEmbed("Usage", `Invalid usage. \nUsage: \`${this.usage}\``, 0xff0000)] });
  }
});


client.commands.set("blacklist", {
  name: "blacklist",
  description: "Manages the AutoMod's blacklist for words/phrases.",
  usage: ".blacklist <add|remove|list> [pattern]",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    srv.automod = srv.automod || { blacklist: [] };
    const sub = args[0]?.toLowerCase();
    const pattern = args.slice(1).join(" ");

    if (sub === "add") {
      if (!pattern) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a pattern to add. \nUsage: \`${this.usage}\``, 0xff0000)] });
      srv.automod.blacklist.push(pattern);
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Blacklist", `Pattern **\`${pattern}\`** added to the blacklist.`, getRandomColor())] });
    } else if (sub === "remove") {
      if (!pattern) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a pattern to remove. \nUsage: \`${this.usage}\``, 0xff0000)] });
      srv.automod.blacklist = (srv.automod.blacklist || []).filter(p => p !== pattern);
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Blacklist", `Pattern **\`${pattern}\`** removed from the blacklist (if it existed).`, getRandomColor())] });
    } else if (sub === "list") {
      const list = (srv.automod.blacklist || []);
      return message.reply({ embeds: [makeEmbed("Blacklist Patterns", list.length ? list.map(p => `\`${p}\``).join(", ") : "No patterns configured.", getRandomColor())] });
    } else {
      return message.reply({ embeds: [makeEmbed("Usage", `Invalid subcommand for blacklist. \nUsage: \`${this.usage}\``, 0xff0000)] });
    }
  }
});

client.commands.set("strikes", {
  name: "strikes",
  description: "Views a user's current AutoMod strike count.",
  usage: ".strikes <@user>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to view strikes. \nUsage: \`${this.usage}\``, 0xff0000)] });
    srv.automod.users = srv.automod.users || {};
    const u = srv.automod.users[target.id] || { strikes: 0 };
    return message.reply({ embeds: [makeEmbed("AutoMod Strikes", `User: **${target.user.tag}**\nStrikes: **${u.strikes || 0}**`, getRandomColor())] });
  }
});

client.commands.set("resetstrikes", {
  name: "resetstrikes",
  description: "Resets a user's AutoMod strike count to zero.",
  usage: ".resetstrikes <@user>",
  category: "Moderation",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    const target = message.mentions.members.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to reset strikes. \nUsage: \`${this.usage}\``, 0xff0000)] });
    srv.automod.users = srv.automod.users || {};
    srv.automod.users[target.id] = { strikes: 0, lastMessage: "", spamCount: 0, capsCount: 0, linkCount: 0, inviteCount: 0, profanityCount: 0, lastMsgTime: 0 };
    saveServersSync();
    return message.reply({ embeds: [makeEmbed("Reset Strikes", `Strikes for **${target.user.tag}** have been reset.`, getRandomColor())] });
  }
});

// ---------------------- ANTI-NUKE ----------------------

client.commands.set("antinuke", {
  name: "antinuke",
  description: "Manages the server's anti-nuke protection settings.",
  usage: ".antinuke <enable|disable|status|safe <add|remove|list> [user/role_id]>",
  category: "Anti-Nuke",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    srv.antinuke = srv.antinuke || { enabled: true, safe: [], protectChannels: true, protectRoles: true, protectWebhooks: true, protectBots: true };
    const sub = args[0]?.toLowerCase();

    if (sub === "enable") {
      srv.antinuke.enabled = true;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Anti-Nuke", "Anti-Nuke protection enabled.", getRandomColor())] });
    }
    if (sub === "disable") {
      srv.antinuke.enabled = false;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("Anti-Nuke", "Anti-Nuke protection disabled.", getRandomColor())] });
    }
    if (sub === "status") {
      const enabled = srv.antinuke.enabled ? "Enabled" : "Disabled";
      const statusText = [
        `**Status:** ${enabled}`,
        `**Protect Channels:** ${srv.antinuke.protectChannels ? 'Enabled' : 'Disabled'}`,
        `**Protect Roles:** ${srv.antinuke.protectRoles ? 'Enabled' : 'Disabled'}`,
        `**Protect Webhooks:** ${srv.antinuke.protectWebhooks ? 'Enabled' : 'Disabled'}`,
        `**Protect Bots:** ${srv.antinuke.protectBots ? 'Enabled' : 'Disabled'}`,
        `**Safe Entries:** ${(srv.antinuke.safe || []).length} users/roles`,
      ].join("\n");
      return message.reply({ embeds: [makeEmbed("Anti-Nuke Status", statusText, getRandomColor())] });
    }
    if (sub === "safe") {
      const action = args[1]?.toLowerCase();
      if (action === "add") {
        const mention = message.mentions.users.first() || message.mentions.roles.first();
        const id = mention?.id || args[2];
        if (!id) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user/role or provide an ID to add to the safe list. \nUsage: \`${this.usage}\``, 0xff0000)] });
        srv.antinuke.safe = srv.antinuke.safe || [];
        if (!srv.antinuke.safe.includes(id)) srv.antinuke.safe.push(id);
        saveServersSync();
        return message.reply({ embeds: [makeEmbed("Anti-Nuke Safe List", `Added **\`${id}\`** to the safe list.`, getRandomColor())] });
      }
      if (action === "remove") {
        const id = args[2];
        if (!id) return message.reply({ embeds: [makeEmbed("Usage", `Please provide the ID of the user/role to remove from the safe list. \nUsage: \`${this.usage}\``, 0xff0000)] });
        srv.antinuke.safe = (srv.antinuke.safe || []).filter(x => x !== id);
        saveServersSync();
        return message.reply({ embeds: [makeEmbed("Anti-Nuke Safe List", `Removed **\`${id}\`** from the safe list.`, getRandomColor())] });
      }
      if (action === "list") {
        const list = srv.antinuke.safe || [];
        return message.reply({ embeds: [makeEmbed("Anti-Nuke Safe List", list.length ? list.map(id => `<@${id}>`).join("\n") : "No entries in safe list.", getRandomColor())] });
      }
      return message.reply({ embeds: [makeEmbed("Usage", `Invalid action for safe list. \nUsage: \`${this.usage}\``, 0xff0000)] });
    }
    return message.reply({ embeds: [makeEmbed("Usage", `Invalid subcommand for antinuke. \nUsage: \`${this.usage}\``, 0xff0000)] });
  }
});

// Anti-Nuke Listeners
client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const srv = getServer(channel.guild.id);
  if (!srv.modules.antinuke || !srv.antinuke.enabled || !srv.antinuke.protectChannels) return;
  try {
    const audit = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(()=>null); // CHANNEL_DELETE = 12
    const entry = audit?.entries?.first();
    if (entry && entry.executor) {
      const ex = entry.executor;
      if (!isSafeExecutor(channel.guild.id, ex.id) && ex.id !== client.user.id) {
        try {
          await channel.guild.members.ban(ex.id, { reason: "Anti-Nuke: unauthorized channel deletion" });
          const caseId = addCase(channel.guild.id, "antinuke-ban", ex.id, client.user.id, `Deleted channel ${channel.name}`);
          saveServersSync();
          const logId = srv.channels?.logs?.antinuke || srv.channels?.logs?.moderation;
          if (logId && channel.guild.channels.cache.get(logId)) channel.guild.channels.cache.get(logId).send({ embeds: [makeEmbed("Anti-Nuke | Executor Banned", `<@${ex.id}> was banned for deleting a channel (**${channel.name}**). Case: ${caseId}`, 0xFF0000)] }).catch(()=>{});
        } catch (e) { console.error("anti-nuke ban failed", e); }
      }
    }
  } catch (e) { console.error("fetch audit logs failed", e); }
});

client.on("roleDelete", async (role) => {
  if (!role.guild) return;
  const srv = getServer(role.guild.id);
  if (!srv.modules.antinuke || !srv.antinuke.enabled || !srv.antinuke.protectRoles) return;
  try {
    const audit = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(()=>null); // ROLE_DELETE = 32
    const entry = audit?.entries?.first();
    if (entry && entry.executor) {
      const ex = entry.executor;
      if (!isSafeExecutor(role.guild.id, ex.id) && ex.id !== client.user.id) {
        try {
          await role.guild.members.ban(ex.id, { reason: "Anti-Nuke: unauthorized role deletion" });
          const caseId = addCase(role.guild.id, "antinuke-ban", ex.id, client.user.id, `Deleted role ${role.name}`);
          saveServersSync();
          const logId = srv.channels?.logs?.antinuke || srv.channels?.logs?.moderation;
          if (logId && role.guild.channels.cache.get(logId)) role.guild.channels.cache.get(logId).send({ embeds: [makeEmbed("Anti-Nuke | Executor Banned", `<@${ex.id}> was banned for deleting a role (**${role.name}**). Case: ${caseId}`, 0xFF0000)] }).catch(()=>{});
        } catch (e) { console.error("anti-nuke ban failed", e); }
      }
    }
  } catch (e) { console.error("fetch audit logs failed", e); }
});

client.on("webhookUpdate", async (channel) => {
  if (!channel.guild) return;
  const srv = getServer(channel.guild.id);
  if (!srv.modules.antinuke || !srv.antinuke.enabled || !srv.antinuke.protectWebhooks) return;
  try {
    const audit = await channel.guild.fetchAuditLogs({ type: 50, limit: 1 }).catch(()=>null); // WEBHOOK_CREATE = 50, WEBHOOK_UPDATE = 51, WEBHOOK_DELETE = 52
    const entry = audit?.entries?.first();
    if (entry && entry.executor) {
      const ex = entry.executor;
      if (!isSafeExecutor(channel.guild.id, ex.id) && ex.id !== client.user.id) {
        try {
          const webhooks = await channel.fetchWebhooks();
          const unauthorizedWebhook = webhooks.find(wh => wh.owner?.id === ex.id);
          if (unauthorizedWebhook) {
            await unauthorizedWebhook.delete("Anti-Nuke: unauthorized webhook creation/update");
            const caseId = addCase(channel.guild.id, "antinuke-whdelete", ex.id, client.user.id, `Unauthorized webhook activity by ${ex.tag}`);
            saveServersSync();
            const logId = srv.channels?.logs?.antinuke || srv.channels?.logs?.moderation;
            if (logId && channel.guild.channels.cache.get(logId)) channel.guild.channels.cache.get(logId).send({ embeds: [makeEmbed("Anti-Nuke | Webhook Action", `Unauthorized webhook activity by <@${ex.id}>. Webhook deleted. Case: ${caseId}`, 0xFF0000)] }).catch(()=>{});
          }
        } catch (e) { console.error("Anti-Nuke webhook protection failed:", e); }
      }
    }
  } catch (e) { console.error("webhookUpdate handler error", e); }
});

client.on("guildMemberAdd", async (member) => {
  if (!member.guild) return;
  const srv = getServer(member.guild.id);

  // Anti-Nuke Bot Protection
  if (member.user.bot && srv.modules.antinuke && srv.antinuke.enabled && srv.antinuke.protectBots) {
    if (!isSafeExecutor(member.guild.id, member.user.id)) { // Check if bot itself is in safe list
      try {
        const audit = await member.guild.fetchAuditLogs({ type: 28, limit: 1 }).catch(()=>null); // BOT_ADD = 28
        const entry = audit?.entries?.first();
        if (entry && entry.target.id === member.id && entry.executor) {
          const inviter = entry.executor;
          if (!isSafeExecutor(member.guild.id, inviter.id) && inviter.id !== client.user.id) { // Check if inviter is in safe list
            await member.kick("Anti-Nuke: Unauthorized bot added by non-safe user");
            await member.guild.members.ban(inviter.id, { reason: "Anti-Nuke: Added unauthorized bot" }); // Ban the inviter
            const caseIdBot = addCase(member.guild.id, "antinuke-botkick", member.id, client.user.id, "Unauthorized bot join");
            const caseIdInviter = addCase(member.guild.id, "antinuke-ban", inviter.id, client.user.id, "Added unauthorized bot");
            saveServersSync();
            const logId = srv.channels?.logs?.antinuke || srv.channels?.logs?.moderation;
            if (logId && member.guild.channels.cache.get(logId)) member.guild.channels.cache.get(logId).send({ embeds: [makeEmbed("Anti-Nuke | Bot & Inviter Banned", `Unauthorized bot **${member.user.tag}** added by <@${inviter.id}>. Both have been banned. Bot Case: ${caseIdBot}, Inviter Case: ${caseIdInviter}`, 0xFF0000)] }).catch(()=>{});
            return; // Exit after handling
          }
        }
      } catch (e) { console.error("Anti-Nuke bot protection failed:", e); }
    }
  }

  // Welcome Message & Auto-Role
  if (srv.modules.social) {
    if (srv.channels.welcome && srv.welcomeMessage) {
      const welcomeChannel = member.guild.channels.cache.get(srv.channels.welcome);
      if (welcomeChannel && welcomeChannel.type === ChannelType.GuildText) {
        const messageContent = srv.welcomeMessage
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, member.guild.memberCount);
        welcomeChannel.send(messageContent).catch(() => {});
      }
    }
    if (srv.autoRole) {
      const role = member.guild.roles.cache.get(srv.autoRole);
      if (role) {
        member.roles.add(role).catch((e) => console.error(`Failed to assign auto-role to ${member.user.tag}: ${e.message}`));
      }
    }
  }
});

client.on("guildMemberRemove", async (member) => {
  if (!member.guild) return;
  const srv = getServer(member.guild.id);

  // Goodbye Message
  if (srv.modules.social) {
    if (srv.channels.goodbye && srv.goodbyeMessage) {
      const goodbyeChannel = member.guild.channels.cache.get(srv.channels.goodbye);
      if (goodbyeChannel && goodbyeChannel.type === ChannelType.GuildText) {
        const messageContent = srv.goodbyeMessage
          .replace(/{user}/g, member.user.tag)
          .replace(/{server}/g, member.guild.name)
          .replace(/{membercount}/g, member.guild.memberCount);
        goodbyeChannel.send(messageContent).catch(() => {});
      }
    }
  }
});


// ---------------------- SETUP WIZARD ----------------------

// Helper for building channel/role options
function getChannelSelectOptions(guild, channelType) {
  return guild.channels.cache
    .filter(c => c.type === channelType)
    .map(c => ({ label: c.name, value: c.id }));
}

function getRoleSelectOptions(guild) {
  return guild.roles.cache
    .filter(r => r.id !== guild.id && !r.managed) // Exclude @everyone and bot-managed roles
    .map(r => ({ label: r.name, value: r.id }));
}


client.commands.set("setup", {
  name: "setup",
  description: "Launches the comprehensive server setup wizard for Pulse.",
  usage: ".setup",
  category: "Administration",
  aliases: [],
  async execute({ client, message, args, getServer, makeEmbed, saveServersSync }) {
    if (!message.guild) return;
    const isOwner = message.author.id === message.guild.ownerId;
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
    if (!isOwner && !isAdmin) return message.reply({ embeds: [makeEmbed("Permission Denied", "Only the server owner or administrators can run the setup wizard.", 0xff0000)] });

    const srv = getServer(message.guild.id);
    let currentPage = 0;
    const totalPages = 10; // Adjust as more steps are added

    const sendSetupPage = async (interaction, page, isInitial = false) => {
      let embed, components = [];

      switch (page) {
        case 0: // Welcome & Modules
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Welcome & Modules",
            "Welcome to the Pulse setup wizard! Use the menu below to enable/disable core modules for your server. This step is crucial for customizing bot functionality.\n\n" +
            "**Current Page:** 1/10",
            getRandomColor()
          );
          const moduleOptions = [
            { label: "Moderation", value: "moderation", description: "Enable commands like ban, kick, warn, mute." },
            { label: "Economy", value: "economy", description: "Enable the server-wide economy, gambling, market." },
            { label: "Fun", value: "fun", description: "Enable fun commands and mini-games." },
            { label: "Automatic Moderation", value: "automod", description: "Enable anti-spam, profanity filter, etc." },
            { label: "Anti Nuke", value: "antinuke", description: "Enable protection against raids and malicious activity." },
            { label: "Utility", value: "utility", description: "Enable reaction roles, polls, reminders, tags." },
            { label: "Information", value: "information", description: "Enable user and server info commands." },
            { label: "Social & Engagement", value: "social", description: "Enable welcome/goodbye messages, levels." },
          ];
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_modules_p${message.author.id}`)
              .setPlaceholder("Select modules to enable/disable")
              .setMinValues(0)
              .setMaxValues(moduleOptions.length)
              .addOptions(moduleOptions.map(opt => ({
                ...opt,
                default: srv.modules[opt.value] !== undefined ? srv.modules[opt.value] : true // Default to enabled
              })))
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 1: // Log Channels
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Log Channels",
            "Select dedicated channels for different types of logs generated by Pulse.\n\n" +
            "**Current Page:** 2/10",
            getRandomColor()
          );
          const logChannelOptions = [
            { label: "Moderation Logs", value: "moderation", description: "Warnings, kicks, bans, mutes." },
            { label: "Economy Logs", value: "economy", description: "Coin gains/losses, market activity." },
            { label: "Automod Logs", value: "automod", description: "Auto-moderation actions (strikes, deletions)." },
            { label: "Anti-Nuke Logs", value: "antinuke", description: "Anti-raid/nuke activity." },
            { label: "Ticket Logs", value: "tickets", description: "Ticket open/close transcripts." },
            { label: "Modmail Logs", value: "modmail", description: "Modmail thread activity." },
            { label: "Suggestions Channel", value: "suggestions", description: "Channel for user suggestions." },
            { label: "Starboard Channel", value: "starboard", description: "Channel for starred messages." },
          ];
          const textChannels = getChannelSelectOptions(interaction.guild, ChannelType.GuildText);
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_logs_p${message.author.id}`)
              .setPlaceholder("Select a log type and then a channel...")
              .setMinValues(0)
              .setMaxValues(logChannelOptions.length)
              .addOptions(logChannelOptions.map(opt => ({
                ...opt,
                default: srv.channels.logs[opt.value] || srv.channels[opt.value] ? true : false,
              })))
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 2: // Admin & Mod Roles
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Admin & Mod Roles",
            "Designate roles for administrators and moderators. Members with these roles will have elevated bot permissions.\n\n" +
            "**Current Page:** 3/10",
            getRandomColor()
          );
          const allRoles = getRoleSelectOptions(interaction.guild);
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_admin_roles_p${message.author.id}`)
              .setPlaceholder("Select Admin Roles")
              .setMinValues(0)
              .setMaxValues(Math.min(25, allRoles.length))
              .addOptions(allRoles.map(role => ({
                ...role,
                default: srv.roles.admins.includes(role.value)
              })))
          ));
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_mod_roles_p${message.author.id}`)
              .setPlaceholder("Select Moderator Roles")
              .setMinValues(0)
              .setMaxValues(Math.min(25, allRoles.length))
              .addOptions(allRoles.map(role => ({
                ...role,
                default: srv.roles.mods.includes(role.value)
              })))
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 3: // Automod Settings
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: AutoMod Configuration",
            "Configure anti-spam, profanity filters, and punishment thresholds for automatic moderation.\n\n" +
            "**Current Page:** 4/10",
            getRandomColor()
          );
          const automodToggles = [
            { label: "Anti-Spam", value: "antiSpam", default: srv.automod.antiSpam },
            { label: "Anti-Caps", value: "antiCaps", default: srv.automod.antiCaps },
            { label: "Anti-Links", value: "antiLinks", default: srv.automod.antiLinks },
            { label: "Anti-Invites", value: "antiInvites", default: srv.automod.antiInvites },
            { label: "Profanity Filter", value: "profanityFilter", default: srv.automod.profanityFilter },
          ];
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_automod_toggles_p${message.author.id}`)
              .setPlaceholder("Toggle AutoMod Features")
              .setMinValues(0)
              .setMaxValues(automodToggles.length)
              .addOptions(automodToggles)
          ));
          // Thresholds can be set via separate buttons or a modal for input
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`automod_set_mute_thresh_p${message.author.id}`).setLabel(`Mute: ${srv.automod.muteAt}`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`automod_set_kick_thresh_p${message.author.id}`).setLabel(`Kick: ${srv.automod.kickAt}`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`automod_set_ban_thresh_p${message.author.id}`).setLabel(`Ban: ${srv.automod.banAt}`).setStyle(ButtonStyle.Secondary)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 4: // Anti-Nuke Settings
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Anti-Nuke Configuration",
            "Enable powerful protections against server raids, mass deletions, and unauthorized bot activity. You can also specify 'safe' users/roles.\n\n" +
            "**Current Page:** 5/10",
            getRandomColor()
          );
          const antinukeToggles = [
            { label: "Protect Channels", value: "protectChannels", default: srv.antinuke.protectChannels },
            { label: "Protect Roles", value: "protectRoles", default: srv.antinuke.protectRoles },
            { label: "Protect Webhooks", value: "protectWebhooks", default: srv.antinuke.protectWebhooks },
            { label: "Protect Bots", value: "protectBots", default: srv.antinuke.protectBots },
          ];
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_antinuke_toggles_p${message.author.id}`)
              .setPlaceholder("Toggle Anti-Nuke Protections")
              .setMinValues(0)
              .setMaxValues(antinukeToggles.length)
              .addOptions(antinukeToggles)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_antinuke_safe_add_p${message.author.id}`).setLabel("Add Safe User/Role").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_antinuke_safe_list_p${message.author.id}`).setLabel("List Safe Entries").setStyle(ButtonStyle.Secondary),
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 5: // Welcome/Goodbye Messages & Auto-Role
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Welcome & Goodbye",
            "Customize messages for members joining or leaving, and set up an automatic role assignment for new members.\n\n" +
            "**Current Page:** 6/10",
            getRandomColor()
          );
          const welcomeGoodbyeOptions = getChannelSelectOptions(interaction.guild, ChannelType.GuildText);
          const allRolesForAutoRole = getRoleSelectOptions(interaction.guild);

          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_welcome_channel_p${message.author.id}`)
              .setPlaceholder(`Welcome Channel: ${srv.channels.welcome ? interaction.guild.channels.cache.get(srv.channels.welcome)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(welcomeGoodbyeOptions)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_goodbye_channel_p${message.author.id}`)
              .setPlaceholder(`Goodbye Channel: ${srv.channels.goodbye ? interaction.guild.channels.cache.get(srv.channels.goodbye)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(welcomeGoodbyeOptions)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_auto_role_p${message.author.id}`)
              .setPlaceholder(`Auto-Role: ${srv.autoRole ? interaction.guild.roles.cache.get(srv.autoRole)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(allRolesForAutoRole)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_welcome_msg_p${message.author.id}`).setLabel("Edit Welcome Message").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_goodbye_msg_p${message.author.id}`).setLabel("Edit Goodbye Message").setStyle(ButtonStyle.Secondary),
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 6: // Ticket System Setup
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Ticket System",
            "Configure the server's ticketing system for user support. Define where tickets are created and logged.\n\n" +
            "**Current Page:** 7/10",
            getRandomColor()
          );
          const categories = getChannelSelectOptions(interaction.guild, ChannelType.GuildCategory);
          const textChans = getChannelSelectOptions(interaction.guild, ChannelType.GuildText);

          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_ticket_category_p${message.author.id}`)
              .setPlaceholder(`Ticket Category: ${srv.channels.ticketCategory ? interaction.guild.channels.cache.get(srv.channels.ticketCategory)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(categories)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_ticket_panel_p${message.author.id}`)
              .setPlaceholder(`Ticket Panel Channel: ${srv.channels.ticketPanel ? interaction.guild.channels.cache.get(srv.channels.ticketPanel)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(textChans)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 7: // Modmail System Setup
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Modmail System",
            "Set up the Modmail system to allow users to directly message staff via DM. Messages will be forwarded to a dedicated category.\n\n" +
            "**Current Page:** 8/10",
            getRandomColor()
          );
          const modmailCategories = getChannelSelectOptions(interaction.guild, ChannelType.GuildCategory);
          components.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`setup_modmail_category_p${message.author.id}`)
              .setPlaceholder(`Modmail Category: ${srv.channels.modmailCategory ? interaction.guild.channels.cache.get(srv.channels.modmailCategory)?.name : 'Not Set'}`)
              .setMinValues(0)
              .setMaxValues(1)
              .addOptions(modmailCategories)
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 8: // Economy System Settings
          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Economy Settings",
            "Customize the server's economy. Define your currency name and the starting amount new users receive.\n\n" +
            "**Current Page:** 9/10",
            getRandomColor()
          );
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_eco_currency_p${message.author.id}`).setLabel(`Currency: ${srv.economy.currency}`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_eco_start_wallet_p${message.author.id}`).setLabel(`Starting Wallet: ${srv.economy.startingWallet}`).setStyle(ButtonStyle.Secondary),
          ));
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_next_p${message.author.id}`).setLabel("Next").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;

        case 9: // Final Summary & Confirmation
          const summary = [
            "**Module Status:**",
            ...Object.entries(srv.modules).map(([key, value]) => `  - \`${key}\`: ${value ? 'Enabled' : 'Disabled'}`),
            "",
            "**Log Channels:**",
            ...Object.entries(srv.channels.logs).map(([key, value]) => `  - \`${key}\`: ${value ? `<#${value}>` : 'Not Set'}`),
            `  - \`Suggestions\`: ${srv.channels.suggestions ? `<#${srv.channels.suggestions}>` : 'Not Set'}`,
            `  - \`Starboard\`: ${srv.channels.starboard ? `<#${srv.channels.starboard}>` : 'Not Set'}`,
            "",
            "**Roles:**",
            `  - \`Admins\`: ${srv.roles.admins.length ? srv.roles.admins.map(r => `<@&${r}>`).join(', ') : 'None'}`,
            `  - \`Moderators\`: ${srv.roles.mods.length ? srv.roles.mods.map(r => `<@&${r}>`).join(', ') : 'None'}`,
            "",
            "**AutoMod:**",
            `  - \`Anti-Spam\`: ${srv.automod.antiSpam}`,
            `  - \`Anti-Caps\`: ${srv.automod.antiCaps}`,
            `  - \`Anti-Links\`: ${srv.automod.antiLinks}`,
            `  - \`Anti-Invites\`: ${srv.automod.antiInvites}`,
            `  - \`Profanity Filter\`: ${srv.automod.profanityFilter}`,
            `  - \`Mute @ Strikes\`: ${srv.automod.muteAt}`,
            `  - \`Kick @ Strikes\`: ${srv.automod.kickAt}`,
            `  - \`Ban @ Strikes\`: ${srv.automod.banAt}`,
            "",
            "**Anti-Nuke:**",
            `  - \`Enabled\`: ${srv.antinuke.enabled}`,
            `  - \`Protect Channels\`: ${srv.antinuke.protectChannels}`,
            `  - \`Protect Roles\`: ${srv.antinuke.protectRoles}`,
            `  - \`Protect Webhooks\`: ${srv.antinuke.protectWebhooks}`,
            `  - \`Protect Bots\`: ${srv.antinuke.protectBots}`,
            `  - \`Safe IDs\`: ${srv.antinuke.safe.length ? srv.antinuke.safe.map(id => `<@${id}>`).join(', ') : 'None'}`,
            "",
            "**Welcome/Goodbye:**",
            `  - \`Welcome Channel\`: ${srv.channels.welcome ? `<#${srv.channels.welcome}>` : 'Not Set'}`,
            `  - \`Welcome Message\`: \`${srv.welcomeMessage}\``,
            `  - \`Goodbye Channel\`: ${srv.channels.goodbye ? `<#${srv.channels.goodbye}>` : 'Not Set'}`,
            `  - \`Goodbye Message\`: \`${srv.goodbyeMessage}\``,
            `  - \`Auto-Role\`: ${srv.autoRole ? `<@&${srv.autoRole}>` : 'Not Set'}`,
            "",
            "**Ticket System:**",
            `  - \`Category\`: ${srv.channels.ticketCategory ? `<#${srv.channels.ticketCategory}>` : 'Not Set'}`,
            `  - \`Panel Channel\`: ${srv.channels.ticketPanel ? `<#${srv.channels.ticketPanel}>` : 'Not Set'}`,
            `  - \`Log Channel\`: ${srv.channels.logs.tickets ? `<#${srv.channels.logs.tickets}>` : 'Not Set'}`,
            "",
            "**Modmail System:**",
            `  - \`Category\`: ${srv.channels.modmailCategory ? `<#${srv.channels.modmailCategory}>` : 'Not Set'}`,
            `  - \`Log Channel\`: ${srv.channels.logs.modmail ? `<#${srv.channels.logs.modmail}>` : 'Not Set'}`,
            "",
            "**Economy:**",
            `  - \`Currency Name\`: ${srv.economy.currency}`,
            `  - \`Starting Wallet\`: ${srv.economy.startingWallet} ${srv.economy.currency}`,
          ].join("\n");

          embed = makeEmbed(
            "⚙️ Pulse Setup Wizard: Summary & Confirm",
            `Please review your settings below. Click "Confirm & Apply" to save, or "Cancel" to discard changes.\n\n${summary}\n\n**Current Page:** 10/10`,
            getRandomColor()
          );
          components.push(new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`setup_prev_p${message.author.id}`).setLabel("Previous").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`setup_confirm_p${message.author.id}`).setLabel("Confirm & Apply").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`setup_cancel_p${message.author.id}`).setLabel("Cancel Setup").setStyle(ButtonStyle.Danger)
          ));
          break;
      }

      if (isInitial) {
        return interaction.reply({ embeds: [embed], components: components, ephemeral: true });
      } else {
        return interaction.update({ embeds: [embed], components: components });
      }
    };

    // Initial setup message
    await sendSetupPage(message, currentPage, true);

    const filter = (i) => i.customId.endsWith(`_p${message.author.id}`);
    const collector = message.channel.createMessageComponentCollector({ filter, time: 15 * 60 * 1000 }); // 15 minutes for setup

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ embeds: [makeEmbed("Permission Denied", "Only the setup executor can interact with this wizard.", 0xff0000)], ephemeral: true });
      }

      if (interaction.customId.startsWith("setup_next_")) {
        currentPage = Math.min(currentPage + 1, totalPages - 1);
        await sendSetupPage(interaction, currentPage);
      } else if (interaction.customId.startsWith("setup_prev_")) {
        currentPage = Math.min(currentPage - 1, totalPages - 1);
        await sendSetupPage(interaction, currentPage);
      } else if (interaction.customId.startsWith("setup_cancel_")) {
        collector.stop("cancel");
        await interaction.update({ embeds: [makeEmbed("Setup Cancelled", "The setup wizard has been cancelled. No changes were applied.", getRandomColor())], components: [] });
      } else if (interaction.customId.startsWith("setup_confirm_")) {
        // Save final settings
        saveServersSync();
        collector.stop("confirm");
        await interaction.update({ embeds: [makeEmbed("Setup Complete", "Pulse has been configured for your server! Use `.help` to explore commands.", getRandomColor())], components: [] });
      }
      // Handle specific input components
      else if (interaction.isStringSelectMenu()) {
        await interaction.deferUpdate();
        const customId = interaction.customId;

        if (customId.startsWith("setup_modules_")) {
          const enabledModules = interaction.values;
          Object.keys(srv.modules).forEach(mod => {
            srv.modules[mod] = enabledModules.includes(mod);
          });
          saveServersSync();
        } else if (customId.startsWith("setup_logs_")) {
          const selectedLogs = interaction.values;
          const currentLogChannels = srv.channels.logs || {};
          // For now, if a log type is selected, we assume the next step will prompt for the channel.
          // This menu just indicates intent.
          // A more complex implementation would involve another select menu or modal to pick channels.
          // For simplicity, this will be handled in the next step or directly in the collector.
          // For now, just indicate that the *types* of logs are being configured.
        } else if (customId.startsWith("setup_admin_roles_")) {
          srv.roles.admins = interaction.values;
          saveServersSync();
        } else if (customId.startsWith("setup_mod_roles_")) {
          srv.roles.mods = interaction.values;
          saveServersSync();
        } else if (customId.startsWith("setup_automod_toggles_")) {
          const toggledFeatures = interaction.values;
          ['antiSpam', 'antiCaps', 'antiLinks', 'antiInvites', 'profanityFilter'].forEach(feature => {
            srv.automod[feature] = toggledFeatures.includes(feature);
          });
          saveServersSync();
        } else if (customId.startsWith("setup_antinuke_toggles_")) {
          const toggledProtections = interaction.values;
          ['protectChannels', 'protectRoles', 'protectWebhooks', 'protectBots'].forEach(protection => {
            srv.antinuke[protection] = toggledProtections.includes(protection);
          });
          saveServersSync();
        } else if (customId.startsWith("setup_welcome_channel_")) {
          srv.channels.welcome = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_goodbye_channel_")) {
          srv.channels.goodbye = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_auto_role_")) {
          srv.autoRole = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_ticket_category_")) {
          srv.channels.ticketCategory = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_ticket_panel_")) {
          srv.channels.ticketPanel = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_modmail_category_")) {
          srv.channels.modmailCategory = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_suggestions_channel_")) {
          srv.channels.suggestions = interaction.values[0] || null;
          saveServersSync();
        } else if (customId.startsWith("setup_starboard_channel_")) {
          srv.channels.starboard = interaction.values[0] || null;
          saveServersSync();
        }
        // After updating the state, re-render the current page to reflect changes
        await sendSetupPage(interaction, currentPage);

      } else if (interaction.isButton()) {
        await interaction.deferUpdate(); // Defer all button interactions first

        const customId = interaction.customId;

        // AutoMod Threshold Modals
        if (customId.startsWith('automod_set_mute_thresh_')) {
          const modal = new ModalBuilder().setCustomId(`modal_automod_mute_p${message.author.id}`).setTitle("Set Mute Threshold");
          const input = new TextInputBuilder().setCustomId("value").setLabel("Strikes for Mute").setStyle(TextInputStyle.Short).setValue(String(srv.automod.muteAt || 3)).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        } else if (customId.startsWith('automod_set_kick_thresh_')) {
          const modal = new ModalBuilder().setCustomId(`modal_automod_kick_p${message.author.id}`).setTitle("Set Kick Threshold");
          const input = new TextInputBuilder().setCustomId("value").setLabel("Strikes for Kick").setStyle(TextInputStyle.Short).setValue(String(srv.automod.kickAt || 5)).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        } else if (customId.startsWith('automod_set_ban_thresh_')) {
          const modal = new ModalBuilder().setCustomId(`modal_automod_ban_p${message.author.id}`).setTitle("Set Ban Threshold");
          const input = new TextInputBuilder().setCustomId("value").setLabel("Strikes for Ban").setStyle(TextInputStyle.Short).setValue(String(srv.automod.banAt || 7)).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        }

        // Anti-Nuke Safe List Modals
        else if (customId.startsWith('setup_antinuke_safe_add_')) {
          const modal = new ModalBuilder().setCustomId(`modal_antinuke_safe_add_p${message.author.id}`).setTitle("Add Safe User/Role ID");
          const input = new TextInputBuilder().setCustomId("id_value").setLabel("User or Role ID").setStyle(TextInputStyle.Short).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        } else if (customId.startsWith('setup_antinuke_safe_list_')) {
          const safeList = srv.antinuke.safe.length ? srv.antinuke.safe.map(id => `<@${id}>`).join("\n") : "No safe entries.";
          await interaction.followUp({ embeds: [makeEmbed("Anti-Nuke Safe List", safeList, getRandomColor())], ephemeral: true });
        }

        // Welcome/Goodbye Message Modals
        else if (customId.startsWith('setup_welcome_msg_')) {
          const modal = new ModalBuilder().setCustomId(`modal_welcome_msg_p${message.author.id}`).setTitle("Edit Welcome Message");
          const input = new TextInputBuilder().setCustomId("message_content").setLabel("Message Content").setStyle(TextInputStyle.Paragraph).setValue(srv.welcomeMessage).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        } else if (customId.startsWith('setup_goodbye_msg_')) {
          const modal = new ModalBuilder().setCustomId(`modal_goodbye_msg_p${message.author.id}`).setTitle("Edit Goodbye Message");
          const input = new TextInputBuilder().setCustomId("message_content").setLabel("Message Content").setStyle(TextInputStyle.Paragraph).setValue(srv.goodbyeMessage).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        }

        // Economy Settings Modals
        else if (customId.startsWith('setup_eco_currency_')) {
          const modal = new ModalBuilder().setCustomId(`modal_eco_currency_p${message.author.id}`).setTitle("Set Currency Name");
          const input = new TextInputBuilder().setCustomId("currency_name").setLabel("Currency Name").setStyle(TextInputStyle.Short).setValue(srv.economy.currency).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        } else if (customId.startsWith('setup_eco_start_wallet_')) {
          const modal = new ModalBuilder().setCustomId(`modal_eco_start_wallet_p${message.author.id}`).setTitle("Set Starting Wallet Amount");
          const input = new TextInputBuilder().setCustomId("amount").setLabel("Starting Amount").setStyle(TextInputStyle.Short).setValue(String(srv.economy.startingWallet)).setRequired(true);
          modal.addComponents(new ActionRowBuilder().addComponents(input));
          await interaction.showModal(modal);
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        await message.channel.send({ embeds: [makeEmbed("Setup Timeout", "The setup wizard timed out. Please run `.setup` again to restart.", 0xff0000)] });
      }
      // Interaction messages might already be deleted or updated, so catch errors gracefully
      try {
        if (setupMsg) await setupMsg.edit({ components: [] }).catch(() => {});
      } catch (e) {
        console.error("Failed to clean up setup message:", e);
      }
    });
  }
});

// Modal submission handler for setup
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;
  if (!interaction.guild) return;

  const srv = getServer(interaction.guild.id);
  const authorId = interaction.customId.split('_p')[1]; // Extract author ID from customId
  if (interaction.user.id !== authorId) {
    return interaction.reply({ embeds: [makeEmbed("Permission Denied", "Only the setup executor can interact with this wizard.", 0xff0000)], ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  if (interaction.customId.startsWith("modal_automod_")) {
    const type = interaction.customId.split('_')[2]; // mute, kick, ban
    const value = parseInt(interaction.fields.getTextInputValue("value"));
    if (isNaN(value) || value <= 0) return interaction.editReply({ embeds: [makeEmbed("Error", "Threshold must be a positive number.", 0xff0000)] });
    srv.automod[`${type}At`] = value;
    saveServersSync();
    await interaction.editReply({ embeds: [makeEmbed("AutoMod Threshold Set", `\`${type} threshold\` set to **${value} strikes**.`, getRandomColor())] });
  } else if (interaction.customId.startsWith("modal_antinuke_safe_add_")) {
    const id = interaction.fields.getTextInputValue("id_value");
    if (!id) return interaction.editReply({ embeds: [makeEmbed("Error", "Please provide a user or role ID.", 0xff0000)] });
    srv.antinuke.safe = srv.antinuke.safe || [];
    if (!srv.antinuke.safe.includes(id)) {
      srv.antinuke.safe.push(id);
      saveServersSync();
      await interaction.editReply({ embeds: [makeEmbed("Anti-Nuke Safe List", `Added **\`${id}\`** to the safe list.`, getRandomColor())] });
    } else {
      await interaction.editReply({ embeds: [makeEmbed("Anti-Nuke Safe List", `**\`${id}\`** is already in the safe list.`, 0xffa500)] });
    }
  } else if (interaction.customId.startsWith("modal_welcome_msg_")) {
    const messageContent = interaction.fields.getTextInputValue("message_content");
    srv.welcomeMessage = messageContent;
    saveServersSync();
    await interaction.editReply({ embeds: [makeEmbed("Welcome Message Updated", `Welcome message set to: \`${messageContent}\``, getRandomColor())] });
  } else if (interaction.customId.startsWith("modal_goodbye_msg_")) {
    const messageContent = interaction.fields.getTextInputValue("message_content");
    srv.goodbyeMessage = messageContent;
    saveServersSync();
    await interaction.editReply({ embeds: [makeEmbed("Goodbye Message Updated", `Goodbye message set to: \`${messageContent}\``, getRandomColor())] });
  } else if (interaction.customId.startsWith("modal_eco_currency_")) {
    const currencyName = interaction.fields.getTextInputValue("currency_name");
    srv.economy.currency = currencyName.substring(0, 32); // Limit length
    saveServersSync();
    await interaction.editReply({ embeds: [makeEmbed("Economy Currency Set", `Currency name set to: **${currencyName}**.`, getRandomColor())] });
  } else if (interaction.customId.startsWith("modal_eco_start_wallet_")) {
    const amount = parseInt(interaction.fields.getTextInputValue("amount"));
    if (isNaN(amount) || amount < 0) return interaction.editReply({ embeds: [makeEmbed("Error", "Starting wallet amount must be a non-negative number.", 0xff0000)] });
    srv.economy.startingWallet = amount;
    saveServersSync();
    await interaction.editReply({ embeds: [makeEmbed("Economy Starting Wallet Set", `Starting wallet amount set to: **${amount}**.`, getRandomColor())] });
  }
  // After modal submission, send the user back to the current setup page.
  // This requires fetching the original setup message and updating it.
  // For simplicity here, we'll just acknowledge the modal and the user can click prev/next.
  // A more robust solution would find the original setup message by ID and update it.
});

// ---------------------- Fun & Misc Commands ----------------------
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

client.commands.set("8ball", {
  name: "8ball",
  description: "Asks the magic 8-ball a question.",
  usage: ".8ball <question>",
  category: "Fun",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const q = args.join(" ");
    if (!q) return message.reply({ embeds: [makeEmbed("Usage", `Please ask a question. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const responses = ["Yes", "No", "Maybe", "Definitely", "Absolutely not", "Ask again later", "I have no idea", "Most likely", "Unlikely"];
    const choice = responses[randInt(0, responses.length - 1)];
    return message.reply({ embeds: [makeEmbed("🎱 Magic 8-Ball", `**Question:** ${q}\n**Answer:** ${choice}`, getRandomColor())] });
  }
});

client.commands.set("coinflip", {
  name: "coinflip",
  description: "Flips a coin.",
  usage: ".coinflip",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const outcome = Math.random() < 0.5 ? "Heads" : "Tails";
    return message.reply({ embeds: [makeEmbed("🪙 Coinflip", `Result: **${outcome}**`, getRandomColor())] });
  }
});

client.commands.set("dice", {
  name: "dice",
  description: "Rolls a dice with a specified number of sides (default 6).",
  usage: ".dice [sides]",
  category: "Fun",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const sides = parseInt(args[0]) || 6;
    if (isNaN(sides) || sides < 2) return message.reply({ embeds: [makeEmbed("Usage", `Minimum sides for a dice roll is 2. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const roll = randInt(1, sides);
    return message.reply({ embeds: [makeEmbed("🎲 Dice Roll", `You rolled a **${roll}** (d${sides})`, getRandomColor())] });
  }
});

client.commands.set("ship", {
  name: "ship",
  description: "Calculates the compatibility between two users.",
  usage: ".ship <@user1> <@user2>",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const user1 = message.mentions.users.first();
    const user2 = message.mentions.users.last();
    if (!user1 || !user2 || user1.id === user2.id) return message.reply({ embeds: [makeEmbed("Usage", `Please mention two different users to ship. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const percent = randInt(0, 100);
    return message.reply({ embeds: [makeEmbed("💖 Ship Result", `${user1.tag} 💖 ${user2.tag}: **${percent}%**`, getRandomColor())] });
  }
});

client.commands.set("rate", {
  name: "rate",
  description: "Rates something out of 10.",
  usage: ".rate <thing_to_rate>",
  category: "Fun",
  aliases: [],
  async execute({ message, args, makeEmbed }) {
    const target = args.join(" ");
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please provide something to rate. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const score = randInt(0, 10);
    return message.reply({ embeds: [makeEmbed("⭐ Rating", `I rate **${target}** a **${score}/10**`, getRandomColor())] });
  }
});

client.commands.set("roast", {
  name: "roast",
  description: "Delivers a witty roast to a user.",
  usage: ".roast [@user]",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const target = message.mentions.users.first() || message.author;
    const roasts = [
      "You're the reason the gene pool needs a lifeguard.",
      "I'd agree with you but then we'd both be wrong.",
      "You're like a cloud. When you disappear, it's a beautiful day.",
      "Is your brain made of sponges? Because it seems to soak up everything but knowledge.",
      "I've seen more charisma in a broken stapler.",
      "If I wanted to hear from an idiot, I'd fart."
    ];
    const roast = roasts[randInt(0, roasts.length - 1)];
    return message.reply({ embeds: [makeEmbed("🔥 Roast", `${target.username}, ${roast}`, getRandomColor())] });
  }
});

client.commands.set("love", {
  name: "love",
  description: "Calculates the love percentage between the user and another.",
  usage: ".love <@user>",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const target = message.mentions.users.first();
    if (!target) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a user to check love with. \nUsage: \`${this.usage}\``, 0xff0000)] });
    const percent = randInt(0, 100);
    return message.reply({ embeds: [makeEmbed("❤️ Love Meter", `${message.author.username} ❤️ ${target.username}: **${percent}%**`, getRandomColor())] });
  }
});

client.commands.set("hangman", {
  name: "hangman",
  description: "Starts a game of Hangman.",
  usage: ".hangman",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const words = ["discord", "pulse", "bot", "javascript", "node", "moderation", "economy", "utility", "antispam", "admin"];
    const word = words[randInt(0, words.length - 1)];
    let hidden = Array(word.length).fill("_");
    let attempts = 6;
    let guessedLetters = [];

    const sendHangmanState = async (channel, initial = false) => {
      const embed = makeEmbed(
        "📝 Hangman",
        `**Word:** ${hidden.join(" ")}\n**Attempts left:** ${attempts}\n**Guessed:** ${guessedLetters.join(", ") || "None"}`,
        getRandomColor()
      );
      if (initial) {
        await channel.send({ embeds: [embed] });
      } else {
        // Find and edit the last bot message for hangman state if possible
        const lastBotMessage = (await channel.messages.fetch({ limit: 10 })).find(m => m.author.id === client.user.id && m.embeds[0]?.title === "📝 Hangman");
        if (lastBotMessage) {
          await lastBotMessage.edit({ embeds: [embed] }).catch(()=>{});
        } else {
          await channel.send({ embeds: [embed] });
        }
      }
    };

    await sendHangmanState(message.channel, true);

    const filter = m => m.author.id === message.author.id && /^[a-zA-Z]$/.test(m.content) && !guessedLetters.includes(m.content.toLowerCase());
    const collector = message.channel.createMessageCollector({ filter, time: 120000 }); // 2 minutes to play

    collector.on("collect", async m => {
      const letter = m.content.toLowerCase();
      guessedLetters.push(letter);
      await m.delete().catch(()=>{}); // Delete user's guess

      let hit = false;
      for (let i = 0; i < word.length; i++) {
        if (word[i] === letter) {
          hidden[i] = letter;
          hit = true;
        }
      }

      if (!hit) attempts--;

      await sendHangmanState(message.channel); // Update state

      if (!hidden.includes("_")) {
        collector.stop("win");
      } else if (attempts <= 0) {
        collector.stop("lose");
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "win") {
        await message.channel.send({ embeds: [makeEmbed("🎉 Hangman: You Won!", `The word was **${word}**`, getRandomColor())] });
      } else if (reason === "lose") {
        await message.channel.send({ embeds: [makeEmbed("😭 Hangman: Game Over", `You lost! The word was **${word}**`, 0xff0000)] });
      } else {
        await message.channel.send({ embeds: [makeEmbed("⏰ Hangman: Timed Out", `The game ended due to inactivity. The word was **${word}**`, 0xffa500)] });
      }
    });
  }
});

client.commands.set("tictactoe", {
  name: "tictactoe",
  description: "Starts a game of Tic-Tac-Toe with another user.",
  usage: ".tictactoe <@opponent>",
  category: "Fun",
  aliases: [],
  async execute({ message, makeEmbed }) {
    const opponent = message.mentions.members.first();
    if (!opponent || opponent.user.bot || opponent.id === message.author.id) return message.reply({ embeds: [makeEmbed("Usage", `Please mention a valid user to play against. \nUsage: \`${this.usage}\``, 0xff0000)] });

    const player1 = message.author;
    const player2 = opponent.user;

    let board = Array(9).fill(" "); // '1' to '9' for positions, 'X', 'O' for players
    let currentPlayer = player1;
    const playerEmojis = {
      [player1.id]: "🇽",
      [player2.id]: "🇴",
    };

    const getBoardDisplay = () => {
      let display = "";
      for (let i = 0; i < 9; i++) {
        display += (board[i] === " " ? (i + 1).toString() : board[i]);
        if ((i + 1) % 3 === 0) display += "\n";
        else display += " | ";
      }
      return `\`\`\`\n${display.trim()}\n\`\`\``;
    };

    const checkWin = () => {
      const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
      ];
      for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] !== " " && board[a] === board[b] && board[b] === board[c]) {
          return board[a];
        }
      }
      return null;
    };

    const checkTie = () => {
      return !board.includes(" ");
    };

    const sendGameState = async (channel, actionMessage = "") => {
      const embed = makeEmbed(
        "✖️⭕ Tic-Tac-Toe",
        `${actionMessage}\n\n${getBoardDisplay()}\n\nIt's **${currentPlayer.tag}**'s turn (${playerEmojis[currentPlayer.id]})! Type a number (1-9) to make your move.`,
        getRandomColor()
      );
      await channel.send({ embeds: [embed] });
    };

    await message.channel.send({
      embeds: [makeEmbed("Tic-Tac-Toe Challenge!", `${opponent}, ${player1.tag} challenges you to Tic-Tac-Toe! React with ✅ to accept.`, getRandomColor())],
      components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`tictactoe_accept_${message.author.id}_${opponent.id}`).setLabel("Accept").setStyle(ButtonStyle.Success))]
    });

    const collector = message.channel.createMessageComponentCollector({
      filter: (i) => i.customId === `tictactoe_accept_${message.author.id}_${opponent.id}` && i.user.id === opponent.id,
      time: 60000,
      max: 1
    });

    collector.on("collect", async (i) => {
      await i.update({ embeds: [makeEmbed("Tic-Tac-Toe Accepted!", `${player2.tag} accepted the challenge! Let the game begin!`, getRandomColor())], components: [] });
      await sendGameState(message.channel, "");

      const gameCollector = message.channel.createMessageCollector({
        filter: m => [player1.id, player2.id].includes(m.author.id) && /^[1-9]$/.test(m.content),
        time: 300000 // 5 minutes for the game
      });

      gameCollector.on("collect", async m => {
        if (m.author.id !== currentPlayer.id) {
          return m.reply({ embeds: [makeEmbed("Tic-Tac-Toe", "It's not your turn!", 0xffa500)], ephemeral: true });
        }

        const move = parseInt(m.content) - 1;
        if (board[move] !== " ") {
          return m.reply({ embeds: [makeEmbed("Tic-Tac-Toe", "That spot is already taken! Choose another.", 0xffa500)], ephemeral: true });
        }

        board[move] = playerEmojis[currentPlayer.id];
        await m.delete().catch(() => {}); // Delete the player's move message

        const winner = checkWin();
        const tie = checkTie();

        if (winner) {
          gameCollector.stop("win");
          await message.channel.send({ embeds: [makeEmbed("🎉 Game Over!", `**${currentPlayer.tag}** wins!`, getRandomColor())] });
          await message.channel.send(getBoardDisplay());
        } else if (tie) {
          gameCollector.stop("tie");
          await message.channel.send({ embeds: [makeEmbed("🤝 Game Over!", "It's a tie!", getRandomColor())] });
          await message.channel.send(getBoardDisplay());
        } else {
          currentPlayer = (currentPlayer.id === player1.id) ? player2 : player1;
          await sendGameState(message.channel);
        }
      });

      gameCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
          await message.channel.send({ embeds: [makeEmbed("⏰ Game Over!", "The Tic-Tac-Toe game timed out due to inactivity.", 0xffa500)] });
        }
      });
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time" && !collected.size) {
        await message.channel.send({ embeds: [makeEmbed("Tic-Tac-Toe Challenge", `${player1.tag}'s Tic-Tac-Toe challenge timed out.`, 0xffa500)] });
      } else if (reason === "cancel") {
        await message.channel.send({ embeds: [makeEmbed("Tic-Tac-Toe Challenge", `${player1.tag}'s Tic-Tac-Toe challenge was declined.`, 0xffa500)] });
      }
    });
  }
});


client.commands.set("pet", {
  name: "pet",
  description: "Interacts with your virtual pet.",
  usage: ".pet <adopt <name> | feed | status | rename <new_name> | play>",
  category: "Fun",
  aliases: [],
  async execute({ message, args, getServer, makeEmbed, saveServersSync }) {
    const srv = getServer(message.guild.id);
    srv.fun = srv.fun || {};
    srv.fun.pets = srv.fun.pets || {};
    const sub = args[0]?.toLowerCase();
    const uid = message.author.id;
    let pet = srv.fun.pets[uid];

    // Pet status update based on time
    if (pet && pet.lastFed) {
      const timeElapsed = Date.now() - pet.lastFed;
      const hoursElapsed = Math.floor(timeElapsed / (1000 * 60 * 60));
      pet.hunger = Math.min(100, (pet.hunger || 0) + (hoursElapsed * 5)); // Hunger increases by 5 every hour
      pet.love = Math.max(0, (pet.love || 0) - (hoursElapsed * 3)); // Love decreases by 3 every hour
      if (pet.hunger >= 100) {
        // Potentially add a "run away" or "sick" mechanic here
        // For now, just cap hunger
        pet.hunger = 100;
      }
      if (pet.love <= 0) {
        // Pet might become sad, run away
        pet.love = 0;
      }
    }


    if (sub === "adopt") {
      const name = args.slice(1).join(" ") || `Pet-${randInt(100, 999)}`;
      if (pet) return message.reply({ embeds: [makeEmbed("Pet", "You already have a pet. Use `.pet status`.", 0xffa500)] });
      srv.fun.pets[uid] = { name, hunger: 50, love: 50, lastFed: Date.now() };
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("🐾 Pet Adopted", `You adopted **${name}**! Welcome to your new companion!`, getRandomColor())] });
    } else if (!pet) {
      return message.reply({ embeds: [makeEmbed("Pet", `You don't have a pet. Adopt one with \`.pet adopt <name>\`. \nUsage: \`${this.usage}\``, 0xffa500)] });
    } else if (sub === "feed") {
      pet.hunger = Math.max(0, (pet.hunger || 0) - randInt(10, 30));
      pet.love = Math.min(100, (pet.love || 0) + randInt(5, 15));
      pet.lastFed = Date.now();
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("🍽️ Pet Fed", `You fed **${pet.name}**. Hunger: ${pet.hunger}/100, Love: ${pet.love}/100`, getRandomColor())] });
    } else if (sub === "status") {
      return message.reply({ embeds: [makeEmbed(`🐾 ${pet.name}'s Status`, `**Hunger:** ${pet.hunger}/100\n**Love:** ${pet.love}/100\n**Last fed:** <t:${Math.floor(pet.lastFed/1000)}:R>`, getRandomColor())] });
    } else if (sub === "rename") {
      const newName = args.slice(1).join(" ");
      if (!newName) return message.reply({ embeds: [makeEmbed("Usage", `Please provide a new name for your pet. \nUsage: \`${this.usage}\``, 0xffa500)] });
      pet.name = newName;
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("🏷️ Pet Renamed", `Your pet was renamed to **${newName}**.`, getRandomColor())] });
    } else if (sub === "play") {
      pet.love = Math.min(100, (pet.love || 0) + randInt(5, 20));
      pet.hunger = Math.min(100, (pet.hunger || 0) + randInt(5, 15)); // Playing makes them a bit hungry
      saveServersSync();
      return message.reply({ embeds: [makeEmbed("🎾 Pet Played", `You played with **${pet.name}**. Love: ${pet.love}/100, Hunger: ${pet.hunger}/100`, getRandomColor())] });
    } else {
      return message.reply({ embeds: [makeEmbed("Usage", `Invalid pet command. \nUsage: \`${this.usage}\``, 0xff0000)] });
    }
  }
});


// ---------------------- General Listeners & Handlers ----------------------

// On Guild Join (Bot Welcome)
client.on("guildCreate", async (guild) => {
  const owner = await guild.fetchOwner();
  if (owner) {
    const welcomeEmbed = makeEmbed(
      "👋 Thanks for inviting Pulse!",
      `Hello ${owner.user.tag},\n\nI'm Pulse, your all-in-one Discord bot! To get started and customize me for your server, please use the \`.setup\` command in any channel I can see.\n\n` +
      "The setup wizard will guide you through enabling modules, setting up logging, roles, automod, anti-nuke, welcome/goodbye messages, tickets, modmail, economy, and more!\n\n" +
      "If you need help, feel free to use `.help` after setup.",
      getRandomColor()
    );
    await owner.send({ embeds: [welcomeEmbed] }).catch(() => {
      // Fallback to sending to first available text channel if DM fails
      const defaultChannel = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText &&
        channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
      );
      if (defaultChannel) {
        defaultChannel.send({ embeds: [welcomeEmbed] }).catch(() => {});
      }
    });
  }
});


// ---------------------- Error handlers ----------------------
process.on("uncaughtException", (err) => { console.error("uncaughtException", err); });
process.on("unhandledRejection", (err) => { console.error("unhandledRejection", err); });

// ---------------------- Client ready ----------------------
client.once("ready", () => {
  console.log(`Pulse is online as ${client.user.tag}`);
});

// ---------------------- Final: login ----------------------
// Replace the token below with your bot's token before running.
client.login("OTcwMzQzODA2MTYxNTM5MTMy.G0xUiP.JOD6480LWYzw4GjQokAwD0dFzpSZPDPdWxk7IE").catch(err => {
  console.error("Failed to login. Please ensure 'YOUR_BOT_TOKEN_HERE' is replaced with a valid token.", err);
});