// Tavernkeep Bot
// Commands:
//   !serve                          -> serves a random fantasy food/drink to the caller (self-serve only),
//                                      AND automatically pours + drinks a real round, raising your drunk meter
//   !fortune                        -> random tea-leaf fortune
//   !gossip                         -> random tavern rumor
//   !gossip @user                   -> makes the mentioned user the subject of the rumor
//   !toast                          -> raises a toast to the room (self-only);
//                                      auto-drinks a real round, raising only your own drunk meter
//   !throw @user                    -> throws a random potion at the mentioned user (can't target yourself),
//                                      raising their drunk meter and applying its speech-flair. Open to
//                                      everyone, on everyone (no mod role needed). 3 minute cooldown per thrower.
//   !tod @user                      -> puts the mentioned user on the spot with Truth or Dare (can't target
//                                      yourself or a bot). Posts a Truth/Dare button pair that ONLY the
//                                      mentioned user can press — anyone else gets a quiet ephemeral nudge.
//                                      Whichever they pick, a random line from tod.json is revealed publicly
//                                      by editing the same message into a Truth/Dare box. Open to everyone,
//                                      on everyone (no mod role needed). 2 minute cooldown per target (not
//                                      per caller), so one person can't be spammed back-to-back by different
//                                      callers.
//   !tod                            -> (Council/Knight only) opens the mod-only Truth or Dare prompt book —
//                                      Truths and Dares on file, numbered separately (1..N each), with Add
//                                      Truth / Add Dare, Edit Truth / Edit Dare, and Remove Truth / Remove
//                                      Dare buttons. Every button already knows its list, so it goes straight
//                                      to a small form (new prompt for Add; # + new text for Edit; # for
//                                      Remove) and always asks Yes/No before anything is saved. Non-mods
//                                      running bare `!tod` just get the usage reminder to add an @user.
//   !cast @user                     -> (members) casts a RANDOM speech-flair on someone else (can't self-cast).
//                                      3 minute cooldown per caster. Council/Knight get the full `!cast` below instead,
//                                      with no cooldown.
//   !parry                          -> reflects the most recent spell/potion effect still active on you back onto
//                                      whoever cast/threw it (bounces are chainable — the original caster can then
//                                      parry it right back). 3 minute cooldown per parrier (Council/Knight: none).
//                                      Announced as a short "X parried Y" line.
//   !stats                          -> shows how many times you've cast, thrown, or parried
//   !stats @user                    -> same, for the mentioned user
//   !user <name>                    -> looks up a member's in-game username by their Discord name —
//                                      no @mention needed (typing !user @someone tells you to use
//                                      their name instead). Mods maintain these entries manually.
//   !user / !user list              -> lists every Discord Username -> In-Game Username entry on
//                                      file as a paged book (◀ Prev / Next ▶ buttons, 15 per page)
//                                      with a Search button that opens a small popup to look one
//                                      name up without leaving the message. Members can browse/
//                                      search this freely but can't press the mod-only buttons below.
//   !name <name> / !name list       -> alias for !user / !user list
//   !user add <name> <username>     -> adds a Discord Username -> In-Game Username entry
//                                      (Council/Knight only)
//   !user remove <name>             -> removes an entry (Council/Knight only)
//   !user edit <name> <username>    -> updates an existing entry's In-Game Username
//                                      (Council/Knight only)
//   !user change <name> <username>  -> alias for !user edit
//   The Add/Remove/Edit buttons on the !user book are Council/Knight-only, but — unlike the
//   rest of the mod tools — they're allowed in the Tavern and at the Bartop too, so mods can
//   maintain the directory from those channels as well.
//   !recruit <username>             -> (Council/Knight/Emissary only) adds a plain-text username
//                                      (no @mention) to the shared Recruit Ticket Board and posts/
//                                      refreshes the paged board in the same reply
//   !recruit / !recruit list        -> just shows the current board (Council/Knight/Emissary only)
//   !rec                            -> shortcut alias for !recruit, same usage
//   !activity                       -> (Council/Knight/Emissary/Guild Leader only) paginated book of
//                                      every member and the date of their last tracked message,
//                                      most-recently-active first (◀ Prev / Next ▶ buttons, 15 per
//                                      page). Reads the same activity.json the inactivity sweep
//                                      uses; flags members already marked inactive by that sweep
//                                      with 🕸️, and shows "No tracked messages" (not a date) for
//                                      anyone with no entry on file yet — see the caveat above
//                                      sweepInactiveMembers for why that means unknown, not active.
//   !vote                            -> (Council/Knight/Emissary/Guild Leader only, mod channels
//                                      or the Tavern) posts a button prompting for the vote's
//                                      reason; once submitted via popup, that same message becomes
//                                      the final vote card (title + bolded reason) with ✅/❌
//                                      reactions seeded on it. Nothing is tracked, counted, or
//                                      stored anywhere — it's just a message people react to by
//                                      hand, unlike !game's vote system which does track selections.
//   The board's ◀ Prev / Next ▶ / ➕ Add / 🗑️ Remove buttons work for ANY Council/Knight/Emissary/
//   Guild Leader looking at the message (not just whoever ran the command), and every Add/Remove
//   edits that same message in place instead of posting a new one — keeps the whole tier in sync
//   without flooding the mod channel.
//   !help                           -> shows the public command menu (does not list moderation commands)
//   !menu                           -> same as !help
//   !drink / !drink water           -> permanent, always-in-inventory item — drink it to instantly sober up
//                                      (clears your drunk meter and any active flair). Self-serve, no mod needed.
//                                      Tipsy+ members risk having their next chat messages pulled and reposted
//                                      slurred (via webhook, made to look/sound like them) — but only when
//                                      posted in the tavern or bartop channel.
//   !warn                          -> (Council/Knight only) no @mention given — opens a Warn /
//                                      History / Remove / Edit button menu instead:
//                                        Warn    -> search the whole guild for a member, type the
//                                                   reason in a popup, then an Announce/No prompt
//                                        History -> lists every member who currently has warnings
//                                                   (name + count), paginated with Prev/Next when
//                                                   the list runs long
//                                        Remove  -> search for a member and, after a Yes/No
//                                                   confirm, wipe their whole warning history
//                                        Edit    -> (Council/Knight/Sentinel/Guild Leader only —
//                                                   NOT Emissary) search for a member, pick one of
//                                                   their warnings, edit its reason in a popup, then
//                                                   a Yes/No confirm before the change is saved
//                                      (typing it directly still works too — see below)
//   !warn                          -> (everyone else) no @mention given, and not a Council/Knight
//                                      — opens a single "View Warning History" button instead
//                                      (they can't issue/remove/edit, but can still browse). See
//                                      startMemberWarnHistoryMenu().
//   Warning penalties: 1 warn = 1-day random speech-flair (non-drinkable, non-parryable, stacks,
//   can't be removed even by someone else casting a flair on them). 2 warns = 2-day random
//   speech-flair (same non-drinkable/non-parryable/stacking rules, no mute). 3 warns = 3-hour
//   mute. 4 warns = 3-day mute. 5+ warns = 5-day mute + Council ping. See WARNING_TIERS.
//   Warnings auto-expire 30 days after they're issued — cleared quietly from the member's
//   history and announced when it happens. See WARNING_EXPIRY_MS / sweepExpiredWarnings().
//   !warn show / !warn history -> every line always shows the warned member, reason, and date,
//   but NEVER who issued it unless the viewer is a Council/Knight/Guild Leader reading outside
//   the moderation-private channel — moderator anonymity is the point (see
//   shouldHideWarnModerator()). Posts in moderation-private stay right there; everywhere else
//   redirects to the admin warn-show channel.
//   !warn @user reason            -> warns a user (Council/Knight/Sentinel only), posts in current channel, logs secretly
//   !warn @user #channel reason   -> same, but posts the public message in the specified channel instead
//   !warn @user <message link> reason -> same, but posts as a reply to that exact message instead
//                                      of a fresh one (paste a Discord message link anywhere in the
//                                      command); overrides #channel since a reply must live in that
//                                      message's own channel
//   Attach an image to any !warn command -> the image gets carried over onto the public warning post
//   NOTE: every warning now gets an Announce/No button prompt (Council and officers alike) before
//         anything public goes out — the warning, its log, and any tier action (mute/Council ping)
//         still happen either way; the prompt only gates the public post. The public post itself
//         never names which mod issued it (that's only in the secret grimoire log) and no longer
//         self-deletes — it stays up so members can see who was warned and why.
//   !warn show                    -> shows all logged warnings and reasons, globally numbered (anyone can use this)
//   !warn history [name/ID]       -> shows all warnings, or one member's, by name/ID/mention — no ping needed (anyone can use this)
//   !warn remove <name/ID/number> -> removes one member's whole history, or a single numbered warning; asks yes/no first (Council/Knight/Sentinel/Guild Leader only — NOT Emissary)
//   !warn clear @user             -> wipes a user's warning history; asks yes/no first (Council/Knight/Sentinel/Guild Leader only — NOT Emissary, legacy alias for !warn remove <name>)
//   !unmute @user                -> removes an active timeout/mute from a user (Council/Sentinel/Emissary/Guild Leader only)
//
//   !ban                           -> (Council/Guild Leader ONLY — NOT Knight, NOT
//                                      Emissary) no @mention given — opens a search-for-a-member button,
//                                      then walks through reason -> "banish? yes/no" -> Announce/No,
//                                      same shape as the !warn interactive picker.
//   !ban @user reason              -> bans a user (Council/Guild Leader ONLY), your
//                                      command message is auto-deleted, then a "banish? yes/no"
//                                      confirmation (this can't be undone) before anything happens, then
//                                      an Announce/No prompt before anything posts publicly (default
//                                      channel: the Tavern), and the public post never names who banned
//                                      them. Logged (with the moderator's name) to the secret grimoire.
//                                      The Guild Leader can never be targeted, same exemption as !warn.
//   !curse <name/ID/mention>     -> forces a random speech-flair on someone for 24 hours: non-drinkable,
//                                     non-parryable, immune to anyone else's !cast/!throw/!serve/!toast, and
//                                     stacks instead of refreshing on repeat casts (Council/Sentinel/Emissary/
//                                     Guild Leader). Fully anonymous — command message deleted instantly, whole
//                                     flow runs in the private grimoire channel, caster's name only ever shows
//                                     in the secret grimoire log, even a public Tavern announcement stays anonymous.
//   !curse search                -> same, but opens a guild-wide member search first
//   !curse clear <name/ID/mention> -> lifts every active curse from someone at once (yes/no confirm) — NOT
//                                     anonymous, logged/replied to normally like !warn remove
//   !mute <duration> @user        -> times out a user for the given duration — a bare number
//                                      means days (e.g. `!mute 3 @user`), same as before; or add
//                                      a unit suffix: `!mute 30s @user`, `!mute 10m @user`,
//                                      `!mute 2h @user`, `!mute 3d @user`
//                                      (Council/Sentinel/Emissary/Guild Leader only, capped at Discord's 28-day max)
//   Each dungeon has its own persistent run-chat thread, created and wired in by hand (see
//   DUNGEON_ROLES in the source — add a roleId/name/threadId entry there for any new dungeon).
//   The Party Up! card always posts in the dungeon hub channel itself; that dungeon's thread
//   unarchives alongside it and gets a short "party's open, jump back to the card"
//   notice, then archives (hidden from the channel's thread list) again once the last
//   party for that dungeon ends (Complete, Disband, everyone leaves, or the idle sweep).
//   Anyone can still post in an archived dungeon thread at any time — sending a message
//   auto-unarchives it (standard Discord behavior), so a party running late is never blocked
//   from chatting. Separately, the dungeon-runs channel's general chat thread
//   (DUNGEON_GENERAL_CHAT_THREAD_ID) is always visible/unarchived for everyone — !party and
//   @dungeon-role pings both work there like anywhere else. The hub
//   channel itself only ever shows Party Up! cards — any other message posted there directly
//   gets a reactive "ready to call a party?" Start-button nudge (same Start prompt !party posts
//   anywhere else), then the original message is deleted. !party or an @dungeon-role ping typed
//   there work exactly as they do anywhere else.
//   !shout #channel message      -> makes the Tavernkeep speak your message in the given channel (Council only)
//   !message #channel message    -> alias for !shout
//   The word "spell" is optional throughout — !cast and !cast spell are the same command.
//   !cast spells                            -> lists all castable spells and their status effects (Council only)
//   !cast @user  (or !cast spell @user)     -> casts a random speech-flair on a user, announced in the current channel (Council only)
//   !cast @user #channel                    -> same, but announced in the given channel instead (Council only)
//   !cast #channel                          -> no @user = casts on EVERYONE who can see that channel, guaranteed
//                                               flair (100% — every message they send shows it)
//                                               (Council / Guild Leader only, unless opened up
//                                               to officers via !enable — see below)
//   !enable                       -> lets officers (Knight) use the channel-wide cast too (Guild Leader/Council only)
//   !disable                      -> reverts the channel-wide cast back to Council/Guild Leader only (Guild Leader/Council only)
//   !cast #channel #channel                 -> same, but the 1st channel is who gets hit and the 2nd is where the
//                                               announcement is posted instead, so the cast channel never sees the
//                                               command that triggered it (Council only)
//   !cast  (or !cast spell)                 -> omit @user entirely to cast on YOURSELF, for quick testing
//   !cast <status effect> @user             -> casts a specific speech-flair instead of a random one (Council only)
//                                               (works with #channel too, in any order)
//                                               speech-flair statuses: cat, troll, dragon, dog,
//                                               lizard, bird, bee, pirate, ghost, goblin, orc, vampire,
//                                               wizard, royal, zombie, viking, siren (see !cast spells)
//   !cast clear #channel                    -> clears EVERY tracked member's drunk state at once (Council only)
//   !cast list                              -> lists everyone currently tracked as drunk, guild-wide (Council only)
//   !cast variants                          -> lists all randomized clear-spell voicelines (Council only)
//   A spell-forced flair wears off on its own after 10 minutes (with a voiceline), so nobody has
//   to hunt down a mod for a !cast clear. Casting shows the Guild Leader's Paladin skill names;
//   any other Council/Knight caster gets generic fantasy flavor under their own name.
//   !roll                           -> rolls a 6-sided die
//   !flip                           -> flips a coin
//   !giveaway                       -> (Council/Knight/Emissary, must be run in the giveaway
//                                      channel — GIVEAWAY_CHANNEL_ID) posts a one-button prompt;
//                                      clicking it opens a modal asking what's being given away
//                                      (1 required prize field + 4 more optional ones — Discord
//                                      caps modals at 5 fields total, so that's the max in one go;
//                                      more prizes can still be added after with the card's own
//                                      ➕ Add button). Submitting posts the giveaway card with a
//                                      ping to GIVEAWAY_ROLE_ID. Anyone can Join; mods manage the
//                                      prize pool (Add/Edit/Remove) and draw winners with Roll
//                                      Winners. Run from any other channel -> quiet redirect there
//                                      instead. (Merged in from the standalone giveaway-bot.js.)
//   !giveaway cleanup                -> (same access/channels as !giveaway) removes every ended
//   !giveaway clear                     giveaway from giveaways.json/giveawayStore so they stop
//                                      being restored (and logged) on every bot restart. Only
//                                      touches the JSON store — the closed giveaway cards already
//                                      posted in the channel are left exactly as they are.
//   !rsvp                           -> (Council/Knight only — NOT Emissary — must be run in the
//                                      giveaway channel) opens a small "Create Event" button ->
//                                      modal (title / when / details), then posts an event card
//                                      there. Members respond with a simple ✅ Going / ❌ Can't
//                                      Make It (no Maybe). Council/Knight can Close Event to lock
//                                      it. Run from any other channel -> quiet redirect there instead.
//   !lore                           -> shares a random tale about a random guild member
//   !lore <name>                    -> tells a random tale about a specific guild member
//   !lore all <name>                -> tells every known tale about a specific guild member
//   !lore list                      -> shows the full guild roster, grouped by rank. Council/Knight
//                                      also see Add/Remove/Edit buttons here to add a new page,
//                                      remove one, or edit an existing entry's title/category/
//                                      aliases and append a new tale — all live, no code changes
//                                      or restart needed. Entries live in lore.json (see below),
//                                      not hardcoded in this file.
//   !party                          -> if you're already in a live party (any dungeon), bumps it
//                                      instantly. Otherwise opens a wizard: pick a dungeon from a
//                                      dropdown, pick how many adventurers are already in the party
//                                      (counting yourself) — anything above 1 seeds the extra
//                                      slots as "Filled" placeholders — then a small popup asking
//                                      what server you're in (blank or "N/A" is fine if you're not
//                                      sure yet), then choose Yes/No on pinging that dungeon's
//                                      role, then opens that dungeon's Party Up! card, same card
//                                      as the @mention flow (which skips this wizard and always
//                                      pings). New parties are rate-limited
//                                      to one every 30 seconds per person. On the card itself, the
//                                      leader can mark any further open slot Filled with the Add
//                                      button, and Kick works on Filled slots the same way it
//                                      works on real members (by roster number, or the name
//                                      "Filled").
//   b / bump                        -> (only while in a live party) bumps your current party
//                                      card(s) straight away, same as !party — no wizard. Does
//                                      nothing at all if you aren't currently in a party.
//   !game / !gn                     -> Tavern/Bartop only. Party Up! for the "other games" roles
//                                      (sandbox-game/Game Night) — same ethereal wizard shape
//                                      as !party (a Start button, then everything else ephemeral):
//                                      pick the game from a dropdown, then a small popup for the
//                                      time (time, AM/PM, timezone) — picking Game Night adds a
//                                      free-text field asking what you'd like to play. The
//                                      finished card posts publicly in the dungeon-runs hub,
//                                      pinging that game's role, and runs for 3 hours from the
//                                      scheduled time before auto-ending itself. Unlike dungeon
//                                      parties there's no headcount cap — anyone can Join, and the
//                                      card paginates its roster 10 names to a page. See
//                                      OTHER_GAME_ROLES below.
//
// Warning tiers (see WARNING_TIERS below):
//   1 warning  -> speech-flair only (1 day)
//   2 warnings -> speech-flair only (2 days)
//   3 warnings -> 3 hour mute
//   4 warnings -> 3 day mute
//   5 warnings -> 5 day mute + pings Council to decide on removal
// Warnings auto-expire and are quietly cleared 30 days after being issued (see
// WARNING_EXPIRY_MS / sweepExpiredWarnings()).
//
// Setup:
//   1. npm init -y
//   2. npm install   (installs discord.js and dotenv)
//   3. Copy .env.example to .env and put your bot token in DISCORD_TOKEN. Copy config.example.json
//      to config.json and fill in your own channel/role/user IDs. Both files are gitignored.
//   4. Place lore.json in the same folder as this file (seeds the !lore grimoire — safe to
//      start with an empty [] if you'd rather build the roster from scratch via !lore list's
//      Add button instead).
//   5. Place tod.json in the same folder as this file (holds your custom Truth/Dare prompts —
//      see the shipped starter file, or edit { "truths": [...], "dares": [...] } by hand; if
//      it's missing entirely, !tod falls back to a handful of built-in defaults).
//   6. giveaways.json and rsvp.json are created automatically on first use (giveaway-bot.js's
//      giveaway system and the new !rsvp event system are both merged into this file now — see
//      GIVEAWAY_CHANNEL_ID below, and run the standalone giveaway-bot.js separately no longer).
//   7. node tavernkeep-bot.js
//
// Required bot permissions when inviting: Send Messages, Read Message History,
// View Channels, Moderate Members (for the timeout/mute and unmute),
// Manage Messages (to clean up the !shout command message, and to delete a drunk member's
// original message before the webhook reposts the slurred version),
// Manage Webhooks (to create/use the webhook that reposts slurred messages under a member's name/avatar),
// View Audit Log (so the tavern farewell message can tell a kick or ban apart from a voluntary leave),
// Embed Links
//
// Required Privileged Gateway Intents (toggle ON in Developer Portal -> Bot):
//   Message Content Intent, Server Members Intent

const {
  Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
  ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,
  AuditLogEvent, AttachmentBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// ---------- Config loading ----------
// All server-specific IDs live in config.json (gitignored). Copy config.example.json to
// config.json and fill in your own. Missing keys fall back to '0' so the bot still boots, but
// features that depend on them simply won't match anything.
require('dotenv').config();
const CONFIG_FILE = path.join(__dirname, 'config.json');
function loadConfig() {
  const file = fs.existsSync(CONFIG_FILE) ? CONFIG_FILE : path.join(__dirname, 'config.example.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`Failed to read ${path.basename(file)}:`, err);
    process.exit(1);
  }
}
const CONFIG = loadConfig();
const cfgId = (group, key) => String((CONFIG[group] && CONFIG[group][key]) || '0');

// Writes `data` to `file` atomically: write to a temp file in the same directory, then rename
// over the target. A plain fs.writeFileSync can leave a truncated/corrupt file behind if the
// process dies mid-write (crash, kill -9, power loss, disk full) — and since these files get
// re-read with JSON.parse on the next startup, a partial write there means the bot refuses to
// boot until someone manually fixes or deletes the file. rename() on the same filesystem is
// atomic, so readers only ever see either the old complete file or the new complete file.
function atomicWriteFileSync(file, data) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
});

// ---------- Config ----------

const TAVERN_CHANNEL_ID = cfgId('channels', 'tavern');   // 🍺｜the-tavern — full mention-greet goes here once someone's let in
const BARTOP_CHANNEL_ID = cfgId('channels', 'bartop');   // 🍻｜bartop — drunk-meter interception also allowed here
const GRIMOIRE_CHANNEL_ID = cfgId('channels', 'adminLog');  // 🤖｜bot-grimoire — secret admin log
const WARN_SHOW_CHANNEL_ID = cfgId('channels', 'warnShow'); // where !warn show output gets posted (admin channel)
const MODERATION_PRIVATE_CHANNEL_ID = cfgId('channels', 'modPrivate'); // moderation-private — !warn history/show can also post directly here instead of always redirecting to WARN_SHOW_CHANNEL_ID; the issuing moderator's name is redacted per-line when shown here (see formatWarnLine)
const COUNCIL_ROLE_ID = cfgId('roles', 'council');      // Council — can use moderation commands
const KNIGHT_ROLE_ID = cfgId('roles', 'knight');       // Knight — can also use moderation commands
const EMISSARY_ROLE_ID = cfgId('roles', 'emissary');     // Emissary — same moderation access as Council/Knight
const GUILD_LEADER_ROLE_ID = cfgId('roles', 'guildLeader'); // Guild Leader — exempt from being warned
const ETHEREAL_ROLE_ID = cfgId('roles', 'highCouncil');      // High Council — same tier as Council
// Hardcoded user IDs so the GM and Vice GM always keep full access, even if their roles change.
const GUILD_MASTER_USER_ID = cfgId('users', 'guildMaster'); // current Guild Master
const VICE_GM_USER_ID = cfgId('users', 'viceGuildMaster');       // Vice Guild Master
const LEADERSHIP_USER_IDS = new Set([GUILD_MASTER_USER_ID, VICE_GM_USER_ID]);
function isLeadershipUser(member) {
  return Boolean(member && member.id && LEADERSHIP_USER_IDS.has(member.id));
}
const GIVEAWAY_CHANNEL_ID = cfgId('channels', 'giveaways'); // giveaways AND !rsvp event cards both live here
const GIVEAWAY_ROLE_ID = cfgId('roles', 'giveawayPing'); // Giveaway — pinged whenever a new giveaway is posted
const HONORED_TRAVELLER_ROLE_ID = cfgId('roles', 'guest'); // manually granted — unlocks the tavern
const ROOKIE_ADVENTURER_ROLE_ID = cfgId('roles', 'rookie'); // manually granted — unlocks the tavern
const ENTRY_ROLE_IDS = [HONORED_TRAVELLER_ROLE_ID, ROOKIE_ADVENTURER_ROLE_ID];

// !giveaway and !rsvp can also be *started* from any of these private/mod-only channels, so
// members in GIVEAWAY_CHANNEL_ID don't see the setup happening (empty prize list, a mod fiddling
// with Add/Edit, etc.) before it's ready. The resulting giveaway/event card always still gets
// posted in GIVEAWAY_CHANNEL_ID itself — this list only controls where the command can be typed
// from. Add more channel IDs here as needed.
const MOD_PRIVATE_CHANNEL_IDS = [GRIMOIRE_CHANNEL_ID, WARN_SHOW_CHANNEL_ID, MODERATION_PRIVATE_CHANNEL_ID];

function isAllowedGiveawayRsvpChannel(channelId) {
  return channelId === GIVEAWAY_CHANNEL_ID || MOD_PRIVATE_CHANNEL_IDS.includes(channelId);
}

// ---- Adventurer skill tiers (dungeon party gating) ----
// Rookie/Novice-only parties keep struggling to actually clear the harder dungeons and the other
// dungeons. Nothing here blocks a Rookie/Novice from calling a party — it just nudges them,
// right after their card goes up, to line up at least 1 Seasoned Adventurer or 1-2 Expert
// Adventurers before heading in. Expert/Seasoned callers face no gate at all, and additionally
// get offered an exclusive "fast run" flag (see runPartyCreationWizard) that limits the ping to
// fellow Expert/Seasoned Adventurers only. Honored Traveler (guild guests) count as experienced
// too — they're not guild members, but they're strong enough to skip the gate the same way.
const NOVICE_ADVENTURER_ROLE_ID = cfgId('roles', 'novice');
const SEASONED_ADVENTURER_ROLE_ID = cfgId('roles', 'seasoned');
const EXPERT_ADVENTURER_ROLE_ID = cfgId('roles', 'expert');

function isExperiencedAdventurer(member) {
  if (!member?.roles?.cache) return false;
  return (
    member.roles.cache.has(EXPERT_ADVENTURER_ROLE_ID) ||
    member.roles.cache.has(SEASONED_ADVENTURER_ROLE_ID) ||
    member.roles.cache.has(HONORED_TRAVELLER_ROLE_ID)
  );
}
function isNewAdventurer(member) {
  if (!member?.roles?.cache) return false;
  return member.roles.cache.has(NOVICE_ADVENTURER_ROLE_ID) || member.roles.cache.has(ROOKIE_ADVENTURER_ROLE_ID);
}

// ---- Party recruitment tier requirement (Join gating) ----
// A leader picks one of these presets in the creation wizard for who can self-serve Join.
// 'open' never gates. This is enforced ONLY on the Join button — the leader can always seat a
// specific person below the tier via Add (see buildPartyComponents/handlePartyButton 'add'),
// which fills a slot without going through Join at all. An exclusive fast run always implies
// 'expert' (see runPartyCreationWizard), so the wizard skips asking in that case.
const PARTY_TIER_REQUIREMENTS = {
  open: { label: 'Open to All' },
  novice: { label: 'Novice+ (Novice, Expert, Seasoned)' },
  expert: { label: 'Expert+ (Expert, Seasoned)' },
};

function partyTierLabel(requiredTier) {
  return (PARTY_TIER_REQUIREMENTS[requiredTier] || PARTY_TIER_REQUIREMENTS.open).label;
}

function meetsPartyTierRequirement(member, requiredTier) {
  if (!requiredTier || requiredTier === 'open') return true;
  if (requiredTier === 'expert') return isExperiencedAdventurer(member);
  if (requiredTier === 'novice') {
    if (!member?.roles?.cache) return false;
    return member.roles.cache.has(NOVICE_ADVENTURER_ROLE_ID) || isExperiencedAdventurer(member);
  }
  return true;
}

// Hoisted to module scope so both the message handler and the !menu button/select
// interaction handler can reach it without redeclaring it.
const DRUNK_CHANNELS = [TAVERN_CHANNEL_ID, BARTOP_CHANNEL_ID];

// ---- Dungeon ping redirect + Party Up! system ----
// Reaction-role sigils that summon guildmates for a specific dungeon/activity. When one of
// these gets @mentioned in ANY channel, the Tavernkeep intercepts it: posts a small heads-up in
// the origin channel (role named in plain text, no second ping), deletes the original, then
// opens an interactive "Party Up!" card inside DUNGEON_HUB_CHANNEL_ID (see
// buildPartyEmbed/buildPartyComponents below) — without pinging the role again, since the
// original @mention already delivered a real notification before the bot ever saw the message.
// One card is posted per matched dungeon role, and each becomes its own tracked party (keyed by
// that card's message ID in partyStore, in-memory only — a bot restart clears any parties still
// forming, same as the drunk/cooldown state elsewhere).
//
// Party card buttons:
//   Join / Leave    -> anyone
//   Full Party      -> leader only; closes recruitment early even if under max size
//   Server          -> leader only; opens a modal to set/change the server, posts a small
//                      fantasy-flavored non-ping notice each time (worded differently for the
//                      first-ever set vs. a later change)
//   Complete & Disband Party -> leader OR a mod (Council/Knight/Guild Leader); marks the run as
//                      done, disbands the party, and locks the card. This is also the button for
//                      finishing a run early — see the comment above buildPartyComponents for why
//                      there's no separate Disband button anymore.
//   Kick            -> leader only; prompts them to type the roster number to remove
// Max party size is 6 for every dungeon except raids configured with a maxSize in config.json — see
// PARTY_MAX_SIZE_OVERRIDES below if any other dungeon ever needs a non-default size.
//
// Every dungeon posts its Party Up! cards under this hub channel — the card itself always lives
// here (not in a thread), and the channel is kept clean: any human message posted directly in
// it gets deleted (see the DUNGEON_HUB_CHANNEL_ID cleanup near the top of messageCreate), so the
// channel only ever contains Party Up! cards.
// Each dungeon ALSO has its own persistent run-chat thread (DUNGEON_ROLES[roleId].threadId),
// created manually ahead of time and never deleted. It sits archived (hidden from the channel's
// active thread list, though anyone can still post in it — that auto-unarchives it) whenever
// that dungeon has no live party, and pops back open — unarchived, plus a short "party's open,
// jump back to the card" notice — the moment a party is initiated for it. See
// lockDungeonThread/unlockDungeonThread below. Adding a new dungeon: create its thread by hand
// under this channel, then add its roleId/name/threadId to DUNGEON_ROLES below.
// Lures isn't really a "dungeon" activity — it's an open-world farming role, not an instance run
// — so it kept its own separate thread even before this change, and (see lockDungeonThread/
// unlockDungeonThread below) is deliberately exempt from the archive/hide treatment everything
// else here gets. It still uses DUNGEON_ROLES for its role/thread/party-size wiring, it just
// never gets locked or unlocked.
const DUNGEON_HUB_CHANNEL_ID = cfgId('channels', 'dungeonHub');
const LURES_THREAD_ID = cfgId('channels', 'luresThread');

// General run-chat thread under the dungeon-runs channel — NOT one of the per-dungeon threads
// above, just a shared space for anyone hanging out/waiting to form a party. Unlike the
// per-dungeon threads it never gets RE-ARCHIVED by party lifecycle events — it's deliberately
// left out of DUNGEON_THREAD_IDS/ROLE_ID_BY_THREAD_ID so none of the lock/unlock/relock/idle
// machinery above ever closes it. It's meant to always be open. Discord can still auto-archive
// it on its own after enough inactivity though, so two things force it back open: the hourly
// keepGeneralDungeonChatUnarchived sweep (near the client.once('clientReady', ...) handler),
// and — so it doesn't have to wait up to an hour — ensureGeneralDungeonChatOpen(), called
// directly from every party-up/join path (finishPartyCreation, the dungeon-ping-redirect
// handler, and the `join` button case) so it pops open the moment there's any party activity.
// !party and @dungeon-role pings both already work in here for free — neither is restricted to
// specific channels (see handleMessageCreate/isAtPartyDestination and the !party handler below)
// — so no extra redirect logic was needed for that half of the request.
const DUNGEON_GENERAL_CHAT_THREAD_ID = cfgId('channels', 'dungeonGeneralChat');

// Built from config.json -> dungeons[]. Each entry: { roleId, name, threadId, maxSize? }.
// channels.luresThread (optional) marks one thread as an always-open farming thread.
const DUNGEON_ROLES = Object.fromEntries(
  (CONFIG.dungeons || []).map((d) => [String(d.roleId), { name: d.name, threadId: d.threadId ? String(d.threadId) : null }])
);

// Every distinct destination thread/channel any dungeon can post its Party Up! card in — used
// to detect "this ping happened inside a destination itself" regardless of which one it is.
// Filters out unset threadId placeholders (see DUNGEON_ROLES) so an unconfigured dungeon just
// doesn't match anything yet, rather than polluting this set with nulls.
const DUNGEON_THREAD_IDS = new Set(Object.values(DUNGEON_ROLES).map((info) => info.threadId).filter(Boolean));

// Reverse lookup (threadId -> dungeon name) purely for readable error reports below — so a
// failed lock/unlock can say "Spider Den" instead of a bare thread ID.
const DUNGEON_NAME_BY_THREAD_ID = new Map(
  Object.values(DUNGEON_ROLES).filter((info) => info.threadId).map((info) => [info.threadId, info.name])
);

// Reverse lookup (threadId -> roleId) so a message landing in a dungeon thread can find out
// which role's party state governs it. Needed by relockDungeonThreadIfIdle below — everything
// else in this file keys off roleId, but a messageCreate event only gives us the thread.
const ROLE_ID_BY_THREAD_ID = new Map(
  Object.entries(DUNGEON_ROLES).filter(([, info]) => info.threadId).map(([roleId, info]) => [info.threadId, roleId])
);

// Reverse lookup (dungeon name -> threadId), used only by the orphaned-party recovery flow
// (see handleOrphanPartyRecovery below). A stale card that survived a bot restart has no party
// object anymore — dungeonName parsed out of the card's own embed title is all we have to go on.
const THREAD_ID_BY_DUNGEON_NAME = new Map(
  Object.values(DUNGEON_ROLES).filter((info) => info.threadId).map((info) => [info.name, info.threadId])
);

// Parses a !mute duration argument. Accepts a bare number for backward compatibility (treated
// as days, same as before — e.g. `!mute 3 @user`), or a number with a unit suffix: s/sec/secs/
// second/seconds, m/min/mins/minute/minutes, h/hr/hrs/hour/hours, d/day/days — e.g. `!mute 30s`,
// `!mute 10m @user`, `!mute 2h @user`, `!mute 3d @user`. Case-insensitive, decimals allowed
// (e.g. `!mute 1.5h @user`). Returns { ms, label } or null if the string doesn't parse.
// Hoisted to module scope (was previously rebuilt on every single message inside
// messageCreate) so it's only constructed once, at startup.
const MUTE_DURATION_UNIT_MS = {
  s: 1000, sec: 1000, secs: 1000, second: 1000, seconds: 1000,
  m: 60 * 1000, min: 60 * 1000, mins: 60 * 1000, minute: 60 * 1000, minutes: 60 * 1000,
  h: 60 * 60 * 1000, hr: 60 * 60 * 1000, hrs: 60 * 60 * 1000, hour: 60 * 60 * 1000, hours: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000, day: 24 * 60 * 60 * 1000, days: 24 * 60 * 60 * 1000,
};
const MUTE_UNIT_MS_LABEL = { 1000: 'second', 60000: 'minute', 3600000: 'hour', 86400000: 'day' };
const MUTE_DURATION_ARG_RE = /^(\d+(?:\.\d+)?)(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds)?$/i;

function parseMuteDuration(raw) {
  const match = MUTE_DURATION_ARG_RE.exec(raw);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  if (!(amount > 0)) return null;
  const unitKey = (match[2] || 'd').toLowerCase(); // no suffix = days, same as the old behavior
  const unitMs = MUTE_DURATION_UNIT_MS[unitKey];
  const ms = amount * unitMs;
  const unitLabel = MUTE_UNIT_MS_LABEL[unitMs];
  return { ms, label: `${amount} ${unitLabel}${amount === 1 ? '' : 's'}` };
}

// Party Up! sizing — every dungeon defaults to 6, override per role ID for anything different.
// Large raid-style dungeons can set maxSize in config.json.
const DEFAULT_PARTY_MAX_SIZE = 6;
const PARTY_MAX_SIZE_OVERRIDES = Object.fromEntries(
  (CONFIG.dungeons || []).filter((d) => d.maxSize).map((d) => [String(d.roleId), d.maxSize])
);
function getPartyMaxSize(roleId) {
  return PARTY_MAX_SIZE_OVERRIDES[roleId] || DEFAULT_PARTY_MAX_SIZE;
}

// ---- Dungeon run-chat thread hide helpers ----
// Idle state: the thread is archived, which drops it out of the parent channel's active thread
// list (it's still reachable via "Archived Threads" if someone goes looking, but it's out of
// the way day-to-day). Anyone can still send a message to it, idle or not — Discord
// auto-unarchives a thread the moment a message lands in it, so a party that's still going
// never gets locked out just because the idle sweep fired.
// NOTE: Threads don't have their own permissionOverwrites manager in discord.js — they inherit
// permissions from the parent channel, so thread.permissionOverwrites is always undefined. An
// earlier version of this function tried to set per-role overwrites directly on the thread,
// which threw "Cannot read properties of undefined (reading 'edit')" every time. A later version
// used ThreadChannel#setLocked to restrict sends to members with ManageThreads, but that's what
// caused active parties to get shut out when the idle timer fired mid-conversation — so hiding
// is archive-only now, with no lock.

// Lock/unlock failures used to only hit console.error, which meant a permissions problem on one
// of the dungeon threads (e.g. the bot losing View Channel/Manage Threads on the hub) would fail
// silently forever — the thread would just quietly stop hiding itself with no visible signal.
// This posts a one-line report to the grimoire (secret admin log) any time a lock/unlock/archive
// call throws, so a broken thread shows up there instead of only in server logs nobody's tailing.
async function reportDungeonThreadError(action, thread, err) {
  const label = DUNGEON_NAME_BY_THREAD_ID.get(thread?.id) || thread?.name || thread?.id || 'unknown thread';
  console.error(`Failed to ${action} dungeon thread ${label} (${thread?.id}):`, err);
  try {
    const grimoire = await client.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
    if (!grimoire) return;
    const reason = err?.rawError?.message || err?.message || String(err);
    const code = err?.code ? ` (code ${err.code})` : '';
    await grimoire.send(
      `⚠️ Failed to **${action}** dungeon thread **${label}** (\`${thread?.id}\`): ${reason}${code}. ` +
      `Likely a permissions issue on the parent channel — check the bot's View Channel / Manage Threads access.`
    );
  } catch (reportErr) {
    console.error('Also failed to post dungeon-thread error report to the grimoire:', reportErr);
  }
}

async function lockDungeonThread(thread) {
  // Lures isn't a real "dungeon" — it's an open-world farming role people party up for on their
  // own schedule, and the bot deliberately has no Manage Threads access on it for that reason.
  // Treat it like DUNGEON_GENERAL_CHAT_THREAD_ID: always left open, never archived.
  if (thread?.id === LURES_THREAD_ID) return;
  try {
    if (!thread.archived) await thread.setArchived(true, 'Dungeon idle — no active party');
  } catch (err) {
    await reportDungeonThreadError('hide', thread, err);
  }
}

// Active state: unarchive so the thread shows back up in the parent channel's active thread
// list. Called the moment a fresh Party Up! call goes out for a dungeon, right before its card
// is posted, so members land in a visible thread.
async function unlockDungeonThread(thread) {
  if (thread?.id === LURES_THREAD_ID) return;
  try {
    if (thread.archived) await thread.setArchived(false, 'Party forming — reopening run chat');
  } catch (err) {
    await reportDungeonThreadError('unhide', thread, err);
  }
}

// Force DUNGEON_GENERAL_CHAT_THREAD_ID open right now, instead of waiting on the hourly
// keepGeneralDungeonChatUnarchived sweep near the bottom of this file. Called from every
// party-up/join path (see finishPartyCreation, the dungeon-ping-redirect handler, and the
// `join` button case) so the shared chat pops open the moment anyone calls or joins a party,
// not up to an hour later. Safe to call liberally — it's a no-op once already unarchived, and
// swallows/reports its own errors, so callers never need to await-and-handle this.
async function ensureGeneralDungeonChatOpen() {
  let thread;
  try {
    thread = await client.channels.fetch(DUNGEON_GENERAL_CHAT_THREAD_ID, { force: true });
  } catch (err) {
    console.error('Failed to fetch the general dungeon-runs chat thread to force it open:', err);
    return;
  }
  if (!thread) return;
  if (!thread.archived) return;
  try {
    await thread.setArchived(false, 'Party activity — reopening shared dungeon chat');
  } catch (err) {
    // Previously only hit console.error, which nobody's tailing — this is the exact failure
    // mode that would explain the general chat lagging behind or never reopening alongside a
    // dungeon thread, so it gets the same grimoire visibility as the per-dungeon lock/unlock
    // failures already get via reportDungeonThreadError.
    await reportDungeonThreadError('unhide', thread, err);
  }
}

// Adds a user as an actual thread member of the general dungeon chat — not just leaving it
// unarchived, but joining THEM to it — so Discord keeps it pinned/bold in their personal
// sidebar going forward instead of them needing to click into it manually once. Called
// wherever a user shows dungeon activity (calling/joining/bumping a party, chatting in a
// dungeon thread or the hub, or in the general chat thread itself — see call sites).
// Intentionally ADD-ONLY: nothing in this file ever removes a member from this thread, so a
// finished/disbanded run does not unjoin anyone — once you're in, you stay in.
// thread.members.add() is a no-op (resolves fine) if the user is already a member, so this is
// safe to call on every relevant event without tracking who's already joined.
async function addUserToGeneralDungeonChat(userId) {
  try {
    const thread = await client.channels.fetch(DUNGEON_GENERAL_CHAT_THREAD_ID, { force: true }).catch(() => null);
    if (!thread) return;
    await thread.members.add(userId);
  } catch (err) {
    console.error(`Failed to auto-join ${userId} to the general dungeon-runs chat thread:`, err);
  }
}

// Same idea as addUserToGeneralDungeonChat above, but for a SPECIFIC dungeon's own run-chat
// thread (party.threadId / info.threadId — the per-dungeon thread from THREAD_ID_BY_DUNGEON_NAME,
// not the shared general one). Previously only the general chat thread got this treatment, so
// joining/creating a party never actually seated anyone in their own dungeon's run chat — they'd
// only get a jump-link they had to click manually, and it wouldn't pin/bold in their sidebar.
// Also add-only and a no-op if already a member, same as addUserToGeneralDungeonChat.
async function addUserToDungeonThread(threadId, userId) {
  if (!threadId) return;
  try {
    const thread = await client.channels.fetch(threadId, { force: true }).catch(() => null);
    if (!thread) return;
    await thread.members.add(userId);
  } catch (err) {
    console.error(`Failed to auto-join ${userId} to dungeon thread ${threadId}:`, err);
  }
}

// Call right after deactivateParty() on any path that ends a party's life (leave-empties-it,
// Complete, confirmed Disband, idle sweep). If that was the LAST active party for this dungeon
// — activePartyByRole no longer has an entry for it, since deactivateParty() already cleaned
// that up — the dungeon's run-chat thread (party.threadId, NOT party.channelId — the card lives
// in the hub channel, this is the separate chat thread) goes back to locked+hidden until the
// next party opens it again. If another party for the same dungeon is still going, this is a
// no-op. Also a no-op if this dungeon has no configured thread yet.
async function lockDungeonThreadIfNowIdle(party) {
  if (activePartyByRole.has(party.roleId)) return;
  if (pendingPartyCreations.has(party.roleId)) return;
  if (!party.threadId) return;
  try {
    const thread = await client.channels.fetch(party.threadId, { force: true });
    await lockDungeonThread(thread);
  } catch (err) {
    const label = DUNGEON_NAME_BY_THREAD_ID.get(party.threadId) || party.threadId;
    console.error(`Failed to fetch dungeon thread ${label} to re-lock it (role ${party.roleId}):`, err);
    const grimoire = await client.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
    if (grimoire) {
      await grimoire.send(
        `⚠️ Couldn't even fetch the **${label}** run-chat thread to re-lock it (\`${party.threadId}\`): ` +
        `${err?.message || err}. The bot may have lost View Channel on that thread's parent.`
      ).catch(() => null);
    }
  }
}

// A mod (Council/Knight/Guild Leader) can post in a dungeon thread at any time, locked or not
// (see the permission comment near line 62). Sending a message to an archived/locked thread
// auto-unarchives it on Discord's end — that's platform behavior we don't control — so a mod
// pinging someone about an idle dungeon pops the thread back into the channel's visible list
// with nothing to re-hide it, until the next party's lifecycle happens to call
// lockDungeonThreadIfNowIdle.
//
// We can't see who's currently *viewing* a thread — Discord's bot API has no such signal, only
// message events — so "quiet for a while" is the closest real proxy for "nobody's actively in
// here." Each message in an idle dungeon thread pushes the re-lock out by RELOCK_DEBOUNCE_MS
// instead of firing instantly, so a mod mid-conversation doesn't get the thread yanked shut
// out from under them after every single message. Only the last message in a quiet burst
// actually results in a lock. Keyed per-thread so multiple idle dungeons debounce independently.
const RELOCK_DEBOUNCE_MS = 5 * 1000;
const relockTimersByThreadId = new Map();

async function relockDungeonThreadIfIdle(message) {
  const roleId = ROLE_ID_BY_THREAD_ID.get(message.channel?.id);
  if (!roleId) return;
  if (activePartyByRole.has(roleId)) return;
  if (pendingPartyCreations.has(roleId)) return;

  const threadId = message.channel.id;
  const existingTimer = relockTimersByThreadId.get(threadId);
  if (existingTimer) clearTimeout(existingTimer);

  const timer = setTimeout(async () => {
    relockTimersByThreadId.delete(threadId);
    // Re-check at fire time, not just at schedule time — a party may have formed in the
    // interim (or another message may have already re-armed a newer timer, in which case
    // this stale one would've been cleared above and never reach here).
    if (activePartyByRole.has(roleId)) return;
    if (pendingPartyCreations.has(roleId)) return;
    try {
      const thread = await client.channels.fetch(threadId, { force: true });
      await lockDungeonThread(thread);
    } catch (err) {
      console.error(`Failed to re-lock idle dungeon thread ${threadId} after debounce:`, err);
    }
  }, RELOCK_DEBOUNCE_MS);
  relockTimersByThreadId.set(threadId, timer);
}

// Active Party Up! cards, keyed by the card message's ID. In-memory only — same tradeoff as
// the drunk-meter/cooldown maps elsewhere in this file (parties are short-lived, so this is
// fine; it just means parties don't survive a bot restart).
const partyStore = new Map();

// Live parties per dungeon role, keyed by role ID -> Set of that role's active card message IDs.
// A ping from someone already IN one of these parties bumps that card instead of spawning a new
// one; a ping from anyone else (never joined, or left) gets their own fresh party — see the
// dungeon-ping-redirect handler below. Multiple concurrent parties per role are expected now.
const activePartyByRole = new Map();

// Clears a party out of both trackers at once. Call this from every code path that ends a
// party's life (leave-empties-it, Complete, confirmed Disband) so the two maps never drift.
function deactivateParty(party, messageId, endReason = 'unknown') {
  recordPartyHistory(party, messageId, endReason);
  partyStore.delete(messageId);
  const roleSet = activePartyByRole.get(party.roleId);
  if (roleSet) {
    roleSet.delete(messageId);
    if (roleSet.size === 0) activePartyByRole.delete(party.roleId);
  }
}

// ---------- Party persistence (parties.json) ----------
//
// partyStore/activePartyByRole above are the live in-memory source of truth; parties.json is a
// periodic snapshot of them (flushed on the same timer as drinks.json/warnings.json/etc. near the
// bottom of this file) so an ongoing party card survives a bot restart instead of coming back
// looking live with no data behind it (see the mod "Force Disband This Card" recovery flow in
// handlePartyButton — restoring from disk means that flow should now only ever get used if
// parties.json itself is missing/corrupt). We also keep a capped rolling history of parties that
// have ended (Complete & Disband Party, idle sweep, card-deleted, etc.) purely as a record —
// nothing in the bot currently reads history back out at runtime.
const PARTIES_FILE = path.join(__dirname, 'parties.json');
const PARTY_HISTORY_LIMIT = 200; // oldest entries drop off past this so the file can't grow forever

let partyHistory = [];
let partiesRestored = false;

function readPartiesFromDisk() {
  if (!fs.existsSync(PARTIES_FILE)) return { active: [], history: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(PARTIES_FILE, 'utf8'));
    return { active: Array.isArray(parsed.active) ? parsed.active : [], history: Array.isArray(parsed.history) ? parsed.history : [] };
  } catch (err) {
    console.error('Failed to read parties.json, starting fresh.', err);
    return { active: [], history: [] };
  }
}

// Called once at startup (see the clientReady handler below) to repopulate partyStore and
// activePartyByRole from the last snapshot, before any button click on an old card could hit an
// empty partyStore. Each active entry carries its own messageId (stamped on when we snapshot),
// which we peel back off here so it re-keys into the Maps exactly where it left off.
function restorePartiesFromDisk() {
  if (partiesRestored) return;
  partiesRestored = true;
  const { active, history } = readPartiesFromDisk();
  partyHistory = history;
  for (const entry of active) {
    const { messageId, ...party } = entry;
    if (!messageId) continue;
    partyStore.set(messageId, party);
    if (!activePartyByRole.has(party.roleId)) activePartyByRole.set(party.roleId, new Set());
    activePartyByRole.get(party.roleId).add(messageId);
  }
  if (active.length) {
    console.log(`Restored ${active.length} live part${active.length === 1 ? 'y' : 'ies'} from parties.json.`);
  }
}

// Snapshots the full live state to disk. Unlike drinks.json/warnings.json this isn't dirty-flagged
// on write — party objects get mutated in place all over handlePartyButton (join/leave/kick/full/
// server/etc.) rather than through one central setter, so precise dirty-tracking would mean
// touching every one of those call sites. Parties are few, short-lived, and small, so just
// re-snapshotting everything on the same timer as the other flushes is cheap and much harder to
// get wrong than trying to track every mutation.
function flushPartiesToDisk() {
  try {
    const active = [];
    for (const [messageId, party] of partyStore.entries()) {
      active.push({ messageId, ...party });
    }
    atomicWriteFileSync(PARTIES_FILE, JSON.stringify({ active, history: partyHistory }));
  } catch (err) {
    console.error('Failed to write parties.json:', err);
  }
}

// Appends a snapshot of an ended party to the rolling history. Called from deactivateParty()
// above so every path that ends a party's life (Complete & Disband Party, idle sweep,
// card-deleted, leaderless auto-close) is covered in one place.
function recordPartyHistory(party, messageId, endReason) {
  partyHistory.push({ ...party, messageId, endedAt: Date.now(), endReason });
  if (partyHistory.length > PARTY_HISTORY_LIMIT) {
    partyHistory.splice(0, partyHistory.length - PARTY_HISTORY_LIMIT);
  }
}

// Tracks in-flight party creations per dungeon role, keyed by role ID -> count of creations
// currently between "we decided to open a card" and "the card finished posting and got
// registered in activePartyByRole". Both party-creation flows (the @mention redirect and the
// !party wizard) unlock/unarchive the dungeon's shared run-chat thread BEFORE the card message
// has actually been sent and registered — there's an awaited Discord API round-trip in between.
// If another party for that same dungeon gets disbanded/completed during that exact window,
// lockDungeonThreadIfNowIdle would otherwise see zero *registered* active parties for the role
// and re-lock/archive the thread right as the new one is being born under it. Call
// beginPartyCreation() right before that round-trip and endPartyCreation() right after (success
// or failure, hence always in a finally), and lockDungeonThreadIfNowIdle checks this too.
const pendingPartyCreations = new Map();

function beginPartyCreation(roleId) {
  pendingPartyCreations.set(roleId, (pendingPartyCreations.get(roleId) || 0) + 1);
}

function endPartyCreation(roleId) {
  const count = (pendingPartyCreations.get(roleId) || 0) - 1;
  if (count > 0) pendingPartyCreations.set(roleId, count);
  else pendingPartyCreations.delete(roleId);
}

// Stamps a party as "something happened" so the idle sweep (below) doesn't reap it out from
// under an active group. Call this from every join/leave/kick/full/complete action.
function touchParty(party) {
  party.lastActivity = Date.now();
}

// A party sits idle for this long with zero join/leave/kick/full/complete activity before the
// idle sweep quietly disbands it. Exists so an abandoned card (leader forgot to hit Complete,
// or just wandered off) doesn't permanently soft-lock that dungeon's @mention for everyone else
// — see activePartyByRole above. Set generously (3h) since dungeon runs can be long grinds.
const PARTY_IDLE_TIMEOUT_MS = 3 * 60 * 60 * 1000;

// Minimum time between bumps for a single party, so a member can't just spam @dungeon pings to
// keep yanking their own card back to the bottom of the thread. Applies to the party as a whole
// (party.lastBumpAt), not per-member, so it doesn't matter which party member triggers a bump —
// the cooldown covers everyone in that party equally.
const PARTY_BUMP_COOLDOWN_MS = 30 * 1000;

// Separate, shorter cooldown for the specific case of an @dungeon-role mention landing on a
// party the pinger is already in. Like the quiet !party/"bump"/"b" shortcut, this doesn't
// re-ping the role either (the @mention itself already delivered a real notification) — but
// it's an active call for more people rather than incidental visibility upkeep, so it's kept
// on a shorter cooldown than the plain bump. Both cooldowns are checked against the same
// party.lastBumpAt, so whichever path bumped most recently still gates the other one at its
// own threshold.
const PARTY_MENTION_BUMP_COOLDOWN_MS = 10 * 1000;

// Cooldown for the leader-only "Re-ping" button on the card itself — same idea as the mention
// bump above (re-pings the role, not just a quiet reposition), but gated a bit longer since it's
// a one-tap button rather than something that requires actually typing/mentioning the role.
// Checked against the same party.lastBumpAt as every other bump path, so whichever one fired
// most recently gates the others too.
const PARTY_REPING_COOLDOWN_MS = 2 * 60 * 1000;

// Minimum time between a single user creating brand-new parties — via the !party wizard, or an
// @mention of a dungeon role that doesn't match a party they're already in. Without this, a user
// could spam `!party` (pick a dungeon, skip the ping, repeat) to flood a thread with an unlimited
// number of fresh cards in seconds. Keyed per-user, in-memory only (same tradeoff as everything
// else here — resets on a bot restart, which just means one earlier grace period, not a bug).
const PARTY_CREATE_COOLDOWN_MS = 30 * 1000;
const partyCreateCooldowns = new Map(); // userId -> Date.now() of their last successful party creation

function partyCreateCooldownRemaining(userId) {
  const last = partyCreateCooldowns.get(userId);
  if (!last) return 0;
  const remaining = PARTY_CREATE_COOLDOWN_MS - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}

function markPartyCreated(userId) {
  partyCreateCooldowns.set(userId, Date.now());
}

// This map only ever grows — one entry per user who's ever created a party, for the life of the
// process. Fine for a while, but on a bot that stays up for months it'd slowly accumulate stale
// entries for users who created one party and never again. Sweep out anything past its cooldown
// window every hour so the map stays bounded to "recently active" users.
setInterval(() => {
  const now = Date.now();
  for (const [userId, last] of partyCreateCooldowns.entries()) {
    if (now - last >= PARTY_CREATE_COOLDOWN_MS) partyCreateCooldowns.delete(userId);
  }
}, 60 * 60 * 1000);

// ---- !game create/vote cooldowns + "one active thing at a time" guards ----
// Same shape as PARTY_CREATE_COOLDOWN_MS/partyCreateCooldowns above, just two separate tracks:
// one for game-party creation (Create button), one for vote creation (Vote button). Kept as
// their own maps rather than sharing partyCreateCooldowns since a busy host could otherwise burn
// their dungeon-party cooldown on a game-night vote and vice versa.
const GAME_PARTY_CREATE_COOLDOWN_MS = 30 * 1000;
const gamePartyCreateCooldowns = new Map(); // userId -> Date.now() of their last successful game-party creation

function gamePartyCreateCooldownRemaining(userId) {
  const last = gamePartyCreateCooldowns.get(userId);
  if (!last) return 0;
  const remaining = GAME_PARTY_CREATE_COOLDOWN_MS - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}

function markGamePartyCreated(userId) {
  gamePartyCreateCooldowns.set(userId, Date.now());
}

const VOTE_CREATE_COOLDOWN_MS = 30 * 1000;
const voteCreateCooldowns = new Map(); // userId -> Date.now() of their last successful vote creation

function voteCreateCooldownRemaining(userId) {
  const last = voteCreateCooldowns.get(userId);
  if (!last) return 0;
  const remaining = VOTE_CREATE_COOLDOWN_MS - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}

function markVoteCreated(userId) {
  voteCreateCooldowns.set(userId, Date.now());
}

// Sweep both cooldown maps hourly, same reasoning as the partyCreateCooldowns sweep — otherwise
// each map only ever grows, one entry per person who's ever created a game party/vote.
setInterval(() => {
  const now = Date.now();
  for (const [userId, last] of gamePartyCreateCooldowns.entries()) {
    if (now - last >= GAME_PARTY_CREATE_COOLDOWN_MS) gamePartyCreateCooldowns.delete(userId);
  }
  for (const [userId, last] of voteCreateCooldowns.entries()) {
    if (now - last >= VOTE_CREATE_COOLDOWN_MS) voteCreateCooldowns.delete(userId);
  }
}, 60 * 60 * 1000);

// Standalone Ping button pings Game Night for everyone at once, so its cooldown is global (not
// per-user) — otherwise 5 different people could each tap it back-to-back and spam the role five
// times in a row.
const GAME_NIGHT_PING_COOLDOWN_MS = 2 * 60 * 1000;
let lastGameNightPingAt = 0;

function gameNightPingCooldownRemaining() {
  const remaining = GAME_NIGHT_PING_COOLDOWN_MS - (Date.now() - lastGameNightPingAt);
  return remaining > 0 ? remaining : 0;
}

// Once a party's run is over — Complete, a confirmed Disband, the last member leaving, or the
// idle sweep quietly retiring it — the full Party Up! card (embed + buttons) gets replaced with
// a single themed closing line instead of leaving a dead, disabled-button box sitting in the
// channel. `kind` is 'completed' | 'disbanded' | 'retired' (idle sweep / orphaned card cleanup).
function buildPartyClosingLine(party, kind) {
  const names = party.members.map((m) => m.name);
  const roster = names.length
    ? names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
    : 'nobody';

  if (kind === 'completed') {
    return `🏆 **${roster}** has finished their **${party.dungeonName}** conquest — share the spoils, adventurers!`;
  }
  if (kind === 'disbanded') {
    return `💀 The party bound for **${party.dungeonName}** has been disbanded and stood down.`;
  }
  // idle sweep / orphaned-card cleanup — no drama, just a gentle nod that they wandered back
  return `🌙 *The party of ${roster} finished their conquest and have now returned to the tavern.*`;
}

// Quietly disbands a party with no member pings — just names, no @mentions — and closes the
// card in place (embed/buttons swapped for a single closing line). Shared by the idle sweep and
// (indirectly) by the message-delete cleanup below.
async function quietlyRetireParty(party, messageId, reason) {
  party.disbanded = true;
  deactivateParty(party, messageId, reason);
  await lockDungeonThreadIfNowIdle(party);

  const closingLine = buildPartyClosingLine(party, 'retired');

  if (!party.channelId) return;
  try {
    const channel = await client.channels.fetch(party.channelId).catch(() => null);
    if (!channel) return;

    let cardClosed = false;
    if (reason !== 'card-deleted') {
      try {
        const cardMessage = await channel.messages.fetch(messageId);
        await cardMessage.edit({ content: closingLine, embeds: [], components: [] });
        cardClosed = true;
      } catch (err) {
        // Card's already gone or otherwise unreachable — fall through and post the line instead.
      }
    }

    if (!cardClosed) {
      await channel.send({ content: closingLine, allowedMentions: { parse: [] } });
    }
  } catch (err) {
    console.error('Failed to quietly retire an idle/orphaned party:', err);
  }
}

// Deletes a party's current card and reposts a fresh copy at the bottom of its thread, then
// re-keys partyStore/activePartyByRole to the new message ID. Leader and roster are untouched —
// a plain bump is purely about visibility (back at the bottom of the channel), not a new call,
// so by default no role ping goes out. Pass pingRoleId to have the repost also re-mention that
// role — used specifically when the bump is standing in for an @dungeon-role mention (see the
// "Dungeon ping redirect" handler below), since that's someone actively calling for more people,
// not just nudging their own card back up. Returns the new message, or null if the repost failed
// (old card/state is left exactly as it was, so the caller can fall back to a plain jump-link
// notice).
async function bumpParty(party, oldMessageId, pingRoleId = null) {
  try {
    const channel = await client.channels.fetch(party.channelId).catch(() => null);
    if (!channel) return null;

    const newMessage = await channel.send({
      content: pingRoleId ? `<@&${pingRoleId}> — the call for **${party.dungeonName}** is still open!` : undefined,
      embeds: [buildPartyEmbed(party)],
      components: buildPartyComponents(party),
      allowedMentions: pingRoleId ? { roles: [pingRoleId] } : { parse: [] },
    });

    partyStore.delete(oldMessageId);
    partyStore.set(newMessage.id, party);
    const roleSet = activePartyByRole.get(party.roleId);
    if (roleSet) {
      roleSet.delete(oldMessageId);
      roleSet.add(newMessage.id);
    }
    party.lastBumpAt = Date.now();
    touchParty(party);

    try {
      const oldMessage = await channel.messages.fetch(oldMessageId).catch(() => null);
      if (oldMessage) await oldMessage.delete();
    } catch (err) {
      console.error('Bump: failed to delete the old party card after reposting:', err);
    }

    return newMessage;
  } catch (err) {
    console.error('Bump: failed to repost a bumped party card:', err);
    return null;
  }
}

// Every active (not disbanded/completed) party a given user currently belongs to, across every
// dungeon. A member can be in more than one at once (they can join separate parties for separate
// dungeons), so this returns an array rather than a single match.
function getActivePartiesForUser(userId) {
  const results = [];
  for (const [messageId, party] of partyStore.entries()) {
    if (party.disbanded || party.completed) continue;
    if (party.members.some((m) => m.id === userId)) {
      results.push({ messageId, party });
    }
  }
  return results;
}

// Same idea as getActivePartiesForUser, just for the game-party system (gamePartyStore) instead
// of the dungeon one — a live (not cancelled/ended) game party the user is either hosting or has
// joined. Used to block the Create button from opening a second game party while one's still
// going, same "one active thing at a time" rule the dungeon Party Up! system enforces.
function getActiveGamePartiesForUser(userId) {
  const results = [];
  for (const [messageId, party] of gamePartyStore.entries()) {
    if (isGamePartyClosed(party)) continue;
    if (party.hostId === userId || party.members.some((m) => m.id === userId)) {
      results.push({ messageId, party });
    }
  }
  return results;
}

// Shared by the bare "b" / "bump" shortcut and by "!party" (when the caller's already in a
// party): bumps every active party the author currently belongs to, respecting each party's own
// PARTY_BUMP_COOLDOWN_MS, and posts one combined notice. Returns false and sends nothing at all
// if the author isn't currently in any active party — callers use that to fall through to
// whatever they'd normally do (ordinary chat handling for "b"/"bump", the dungeon-picker wizard
// for "!party").
//
// opts.blockedCreation: pass true when this bump is standing in for a blocked party-creation
// attempt (i.e. "!party" while already in one) so the notice also explains how to actually free
// the caller up to start a new one — Complete the run (leader) or Leave it (regular member).
async function quickBumpForAuthor(message, opts = {}) {
  const { blockedCreation = false } = opts;
  const entries = getActivePartiesForUser(message.author.id);
  if (entries.length === 0) return false;

  const noticeLines = [];
  for (const { messageId, party } of entries) {
    const isLeader = party.leaderId === message.author.id;
    const guidance = blockedCreation
      ? isLeader
        ? ` You're leading it — hit **Complete** on it first before calling a new one.`
        : ` You're a member of it — **Leave** it first if you'd rather start/join a different one.`
      : '';

    const sinceLastBump = Date.now() - (party.lastBumpAt || party.createdAt || 0);
    if (sinceLastBump < PARTY_BUMP_COOLDOWN_MS) {
      const waitLabel = formatRemaining(PARTY_BUMP_COOLDOWN_MS - sinceLastBump);
      noticeLines.push(`⚔️ Your **${party.dungeonName}** party was bumped recently — try again in ${waitLabel}.${guidance}`);
      continue;
    }
    const newMessage = await bumpParty(party, messageId);
    if (newMessage) {
      const jumpUrl = `https://discord.com/channels/${message.guild.id}/${party.channelId}/${newMessage.id}`;
      noticeLines.push(`🔼 Bumped your **${party.dungeonName}** party: ${jumpUrl}${guidance}`);
    } else {
      noticeLines.push(`⚠️ Couldn't bump your **${party.dungeonName}** party card.${guidance}`);
    }
  }

  if (noticeLines.length > 0) {
    try {
      await message.channel.send(noticeLines.join('\n'));
    } catch (err) {
      console.error('Quick bump: failed to post notice:', err);
    }
  }
  return true;
}

// Everything after the dungeon + ping-or-not choice are made: finds/unlocks the dungeon's thread,
// re-checks membership (a race guard — the picker/Yes-No wait can take up to a minute), and either
// bumps an existing party or posts a fresh Party Up! card. Shared by the `!party` command and the
// button-driven wizard the dungeon-hub nudge runs (runPartyCreationWizard below) — `ctx` only
// needs `.author` (a User), `.guild`, and `.channel` (to send follow-up notices in), which a
// Message already satisfies as-is and an interaction satisfies via a small {author, guild,
// channel} shim.
async function finishPartyCreation(ctx, { roleId, info, authorName, shouldPing, filledCount = 1, server = null, fastRunOnly = false, requiredTier = 'open' }) {
  const hubChannel = await ctx.guild.channels.fetch(DUNGEON_HUB_CHANNEL_ID).catch(() => null);
  if (!hubChannel) {
    await ctx.channel.send(`⚠️ Couldn't find the dungeon hub channel — check DUNGEON_HUB_CHANNEL_ID.`);
    return;
  }
  const dungeonThread = info.threadId ? await ctx.guild.channels.fetch(info.threadId, { force: true }).catch(() => null) : null;

  // Marks this role as "mid-creation" from the moment we unlock the thread until the new party
  // is either registered or this whole attempt gives up (bump-instead, or the send fails) —
  // see beginPartyCreation/endPartyCreation. Without this, a concurrent disband of a DIFFERENT
  // active party for the same dungeon could see zero registered parties in that gap and re-lock
  // the thread right as this one's card is being posted underneath it.
  beginPartyCreation(roleId);
  try {
    if (dungeonThread) await unlockDungeonThread(dungeonThread);
    ensureGeneralDungeonChatOpen();
    addUserToGeneralDungeonChat(ctx.author.id);
    if (info.threadId) addUserToDungeonThread(info.threadId, ctx.author.id);

    // Already in a live party for this dungeon? Bump it instead of spawning a duplicate card.
    const activeIds = activePartyByRole.get(roleId);
    let memberMatch = null;
    if (activeIds) {
      for (const id of activeIds) {
        const p = partyStore.get(id);
        if (p && !p.disbanded && !p.completed && p.members.some((m) => m.id === ctx.author.id)) {
          memberMatch = { existingParty: p, existingId: id };
          break;
        }
      }
    }

    if (memberMatch) {
      const { existingParty, existingId } = memberMatch;
      const sinceLastBump = Date.now() - (existingParty.lastBumpAt || existingParty.createdAt || 0);
      if (sinceLastBump < PARTY_BUMP_COOLDOWN_MS) {
        const waitLabel = formatRemaining(PARTY_BUMP_COOLDOWN_MS - sinceLastBump);
        await ctx.channel.send(`⚔️ Your **${info.name}** party was bumped recently — try again in ${waitLabel}.`);
        return;
      }
      const newMessage = await bumpParty(existingParty, existingId);
      if (newMessage) {
        const jumpUrl = `https://discord.com/channels/${ctx.guild.id}/${existingParty.channelId}/${newMessage.id}`;
        await ctx.channel.send(`🔼 Bumped your **${info.name}** party: ${jumpUrl}`);
      } else {
        await ctx.channel.send(`⚠️ Couldn't bump your **${info.name}** party card.`);
      }
      return;
    }

    // Exclusive fast run: instead of pinging the dungeon's own role, only fellow Expert/Seasoned
    // Adventurers get notified — see the fast-run step in runPartyCreationWizard for how a
    // caller opts into this (Expert/Seasoned only).
    const rolePing = fastRunOnly
      ? `<@&${EXPERT_ADVENTURER_ROLE_ID}> <@&${SEASONED_ADVENTURER_ROLE_ID}>`
      : `<@&${roleId}>`;
    const body = shouldPing
      ? fastRunOnly
        ? `${rolePing} — **${authorName}** is calling an **⚡ exclusive fast run** for **${info.name}**! (Expert/Seasoned Adventurers only)`
        : `${rolePing} — **${authorName}** is calling for a party!`
      : `🗝️ **${authorName}** opened a party for **${info.name}** (no ping sent).`;

    const maxSize = getPartyMaxSize(roleId);
    // filledCount is "how many are already in the party, counting the leader" from the wizard's
    // size-picker step — clamp it in case a stale/tampered customId ever slipped through, then
    // seed one Filled placeholder per adventurer beyond the leader (slot 1, always real).
    const extraFilled = Math.max(0, Math.min(filledCount, maxSize) - 1);
    const members = [{ id: ctx.author.id, name: authorName }];
    for (let i = 0; i < extraFilled; i++) members.push(makeFilledMember());

    const party = {
      dungeonName: info.name,
      roleId,
      channelId: hubChannel.id,
      threadId: dungeonThread ? dungeonThread.id : null,
      leaderId: ctx.author.id,
      leaderName: authorName,
      maxSize,
      members,
      closed: false,
      completed: false,
      disbanded: false,
      fastRunOnly: !!fastRunOnly,
      // Exclusive fast runs are always Expert+ under the hood, regardless of what got passed in.
      requiredTier: fastRunOnly ? 'expert' : requiredTier,
      server: server || null,
      serverNoticeMessageId: null,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    try {
      const partyMessage = await hubChannel.send({
        content: body,
        embeds: [buildPartyEmbed(party)],
        components: buildPartyComponents(party),
        allowedMentions: shouldPing
          ? { roles: fastRunOnly ? [EXPERT_ADVENTURER_ROLE_ID, SEASONED_ADVENTURER_ROLE_ID] : [roleId] }
          : { parse: [] },
      });
      partyStore.set(partyMessage.id, party);
      if (!activePartyByRole.has(roleId)) activePartyByRole.set(roleId, new Set());
      activePartyByRole.get(roleId).add(partyMessage.id);
      markPartyCreated(ctx.author.id);

      if (ctx.channel.id !== hubChannel.id) {
        await ctx.channel.send(`🗺️ **${info.name}** party opened here → <#${hubChannel.id}>`);
      }
      if (dungeonThread) {
        const jumpUrl = `https://discord.com/channels/${ctx.guild.id}/${hubChannel.id}/${partyMessage.id}`;
        try {
          // Ping the creator directly so Discord's notification drops them straight into the
          // run-chat thread — this IS the "redirect" (there's no way to force-navigate a user's
          // client, so a targeted mention + jump link is the closest equivalent).
          await dungeonThread.send({
            content: `<@${ctx.author.id}> ⚔️ **${authorName}** opened a **${info.name}** party! [Jump to the Party Up! card](${jumpUrl})`,
            allowedMentions: { users: [ctx.author.id] },
          });
        } catch (err) {
          console.error(`Party creation: failed to post thread notice for ${info.name}:`, err);
        }
      }
    } catch (err) {
      console.error('Party creation: failed to post party card:', err);
      await ctx.channel.send(`⚠️ Something went wrong opening the **${info.name}** party.`);
    }
  } finally {
    endPartyCreation(roleId);
  }
}

// Sweeps every tracked party once a minute and quietly disbands anything that's gone idle for
// PARTY_IDLE_TIMEOUT_MS. This is the fix for the permanent-dungeon-lock griefing vector: without
// it, one abandoned party (leader never hits Disband/Complete) locks that role's @mention for
// everyone until the bot restarts.
setInterval(() => {
  const now = Date.now();
  for (const [messageId, party] of partyStore.entries()) {
    if (party.disbanded || party.completed) continue;
    const lastActivity = party.lastActivity || party.createdAt || 0;
    if (now - lastActivity >= PARTY_IDLE_TIMEOUT_MS) {
      quietlyRetireParty(party, messageId, 'idle').catch((err) => {
        console.error('Idle party sweep failed for a party:', err);
      });
    }
  }
}, 60 * 1000);

// Guild logo used as the thumbnail on every !menu page, to give the book-menu its look.
const MENU_PARCHMENT_URL = 'https://file.garden/adMvuUsLaQ5DhcDC/Guild/GuildLogo.png';

// Warning tiers: what happens at each warning count.
// 1 warn: no mute, just a 1-day random speech-flair penalty (see 'flair' action below).
// 2 warns: no mute either, just a 2-day random speech-flair penalty (also 'flair' — same action
// as tier 1, just a longer flair).
// Both flair penalties are non-drinkable, non-parryable, and stack instead of overwriting each
// other or getting wiped by someone else casting/throwing a flair — see applyWarnPenaltyFlair().
// 3/4/5 warns are pure mutes (no flair): 3 hours, then 3 days, then 5 days (5 also pings Council
// to decide on removal).
const WARNING_TIERS = {
  1: { action: 'flair', flairDurationMs: 1 * 24 * 60 * 60 * 1000, flairDurationLabel: '1 day' },
  2: { action: 'flair', flairDurationMs: 2 * 24 * 60 * 60 * 1000, flairDurationLabel: '2 days' },
  3: { action: 'mute', durationMs: 3 * 60 * 60 * 1000, durationLabel: '3 hours' },
  4: { action: 'mute', durationMs: 3 * 24 * 60 * 60 * 1000, durationLabel: '3 days' },
  5: { action: 'mute', durationMs: 5 * 24 * 60 * 60 * 1000, durationLabel: '5 days', pingCouncil: true },
};

// Warnings auto-expire (are quietly wiped from a member's history) after this long — "a month"
// on the calendar varies, so this is a flat 30-day window from the warning's issued timestamp
// (see the `timestamp` field set in issueWarning). Checked by sweepExpiredWarnings() below.
const WARNING_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Highest warning count with its own dedicated WARNING_TIERS entry — anything past this repeats
// this tier's action (see issueWarning). Shared with sweepExpiredWarnings() for its "remaining"
// footer label.
const MAX_DEFINED_WARNING_TIER = 5;

const SERVE_ITEMS = [
  'Beer',
  'Poop',
  'Mead',
  'Milk',
  'a Suspicious Stew',
  'a Rat on a Stick',
  'Wine (mostly water)',
  'Ale that tastes like regret',
  'a Goblin Ear (garnish included)',
  'Bread, hard as a rock',
  'the Finest Grog in the land',
  'a Dragonfruit Tart',
  'Elven Honey Cakes',
  'a bowl of Mystery Cellar Mushrooms',
  'Salted Griffin Jerky',
  'a Bottomless Bowl of Soup (allegedly)',
  'Moonberry Wine',
  'a Slice of Cursed Cheese (it stares back)',
  'Roasted Chestnuts from the Hearth',
  'a Pint of Dwarven Stout',
  'Candied Ginger from the Spice Wagon',
  'a Bard\'s Leftover Sandwich',
  'Pixie Dust Sprinkled Pastry',
  'a Wheel of Aged Tavern Cheese',
  'Spiced Cider, still steaming',
  'a Questionable Meat Pie',
  'Sugarplum Fritters',
  'a Tankard of Troll-Brewed Ale',
  'Honeyed Mead Bread',
  'a bowl of Stone Soup (there is, in fact, a stone)',
  'Frostberry Sorbet',
  'a Haunch of Roast Boar',
  'Dwarven Beer (the Guildmaster\'s usual — he asks for it constantly)',
  'a Bubbling Mana Potion (tastes like static)',
  'an Elixir of Minor Healing (still slightly warm)',
  'a Potion of Questionable Origin (label rubbed off)',
  'a Vial of Shimmering Starlight Tonic',
  'a Flask of Liquid Courage (side effects: mostly hiccups)',
  'a Tuft of Mystery Fur, Steeped Like Tea',
  'a Goblin Toenail Garnish (came with the ear)',
  'Witch\'s Brew, Color-Changing and Faintly Glowing',
  'a Jar of Pickled Pixie Wings',
  'Alchemist\'s Fizzy Draught (bubbles for way too long)',
  'a Sprig of Whispering Nightshade Tea (perfectly safe, probably)',
  'a Chalice of Enchanted Fog (drink at your own risk)',
  'Slime Jelly, Still Slightly Twitching',
  'a Basilisk-Egg Omelet (don\'t make eye contact with it)',
];

// Rare story events — a small chance of triggering instead of a normal item.
// Each one has its own item name and a follow-up line of flavor text.
const RARE_SERVE_CHANCE = 0.04; // 4% chance per !serve

const RARE_SERVE_EVENTS = [
  {
    item: 'the Guildmaster\'s Protein Shake, Stolen from the Head Table',
    flavor: 'You can hear the Guildmaster\'s distant screaming... "GAHHH, WHERE IS MY STRAWBERRY SHAKE?!" You should probably finish that fast.',
  },
  {
    item: 'the Tavernkeep\'s Own Secret Stash, Served Just This Once',
    flavor: 'The Tavernkeep\'s ears go flat with regret the moment it leaves his paws. "Don\'t tell the others, nya. This doesn\'t happen twice."',
  },
  {
    item: 'a Bowl of Cream Someone Left Unattended',
    flavor: 'The Tavernkeep eyes it a little too fondly before sliding it over. "...I wasn\'t going to drink that. Probably. Enjoy."',
  },
];

// Rare toast events — same idea as RARE_SERVE_EVENTS, but for !toast: a small chance of an extra
// flavor line appended after the toast + auto-drink resolve. Flavor-only, no mechanical effect.
const RARE_TOAST_CHANCE = 0.04; // 4% chance per !toast

const RARE_TOAST_EVENTS = [
  {
    flavor: 'The Guildmaster barges in mid-toast, grabs a mug that isn\'t his, and downs it in one go. "MMM. PROTEIN," he declares, and wanders off satisfied.',
  },
  {
    flavor: 'The whole tavern raises their mugs back at you in reply, and for one clean, unironic moment, everyone actually means it.',
  },
  {
    flavor: 'The Tavernkeep winks and quietly tops your mug off with something a little stronger than usual, nya~',
  },
  {
    flavor: 'A bard in the corner starts playing along to your toast, badly, on an instrument nobody can name.',
  },
];

// Rare throw events — same idea again, but for !throw: a small chance of an extra flavor line
// appended after the hit resolves. Flavor-only — the mechanical result (target's meter/flair) is
// unaffected either way.
const RARE_THROW_CHANCE = 0.04; // 4% chance per !throw

const RARE_THROW_EVENTS = [
  {
    flavor: 'The bottle arcs wide and clips the Tavernkeep instead — he shakes a fist, though he doesn\'t seem all that mad about it.',
  },
  {
    flavor: 'Somewhere in the guild hall, the Guildmaster feels a disturbance among the potion shelves and bellows "WHO\'S TAKING MY COCOA?!" from three rooms away.',
  },
  {
    flavor: 'The cork pops early mid-throw, and a fine mist catches the air — even the thrower gets a faint tingle out of it.',
  },
  {
    flavor: 'The bottle shatters louder than it should, and for a second the whole tavern goes quiet to look. Then it doesn\'t care anymore.',
  },
];

// Short, no-mention voicelines for when someone lands in the introduce-yourself channel —
// they haven't been let into the tavern proper yet, so this is just a "someone's outside" nudge.
const DOOR_LINES = [
  'A shadow falls across the doorstep — someone new has arrived, nya.',
  'Someone steps up to the tavern door, stamping the cold off their boots.',
  'The Tavernkeep\'s ear twitches toward the door. Someone\'s waiting outside.',
  'A figure lingers at the tavern\'s door, who might it be?.',
  'Footsteps stop just outside the door. Someone\'s arrived.',
  'The bell above the door gives a single curious jingle — someone\'s standing just outside of it.',
  'Someone new has found their way to the tavern door.',
];

const WELCOME_LINES = [
  'Greetings nya! The tavern was just waiting on one more chair to fill.',
  'Welcome, welcome — warm your bones by the fire, the frost outside has no business following you in.',
  'Ah, a new face! Sit, sit, the tavern always has room for one more soul.',
  'Well met, traveler. The ale is cold, the stories are warm, and the Tavernkeep\'s ears are already perked up for yours.',
  'Come in, come in! Mind the goblin under the table — he bites, but only if you\'re rude about it.',
  'A new traveller arrives! The Tavernkeep raises a mug in your honor, tail flicking with approval.',
  'Mrow~ another traveler crosses the threshold. The candles seem to burn a little brighter for it.',
  'The door creaks, the cat-ears twitch, and the Tavernkeep grins. "Ah, fresh company nya~"',
  'Step lightly, traveller — the floorboards remember every guest, and now they\'ll remember you too.',
  'The Tavernkeep sets down a fresh mug before you\'ve even asked. "On the house, for the newly arrived."',
  'A gust follows you in from the cold. The Tavernkeep flicks an ear and purrs, "Good, good — sit by the fire, you look half-frozen."',
  'Welcome to the the guild\'s tavern, traveler. Whatever road brought you here, it ends warm and fed tonight.',
  'The Tavernkeep\'s whiskers twitch toward the door before you even step through. "I smelled you coming, traveller — sit, eat, stay a while nya~"',
];

const FAREWELL_LINES = [
  'The door swings shut behind them, and the draft carries their empty mug back to the bar.',
  'The Tavernkeep\'s ears droop, just a little. "Off already, nya? Well — the fire stays lit for when you\'re back."',
  'One chair sits empty by the tavern tonight. The Tavernkeep gives it a quiet, knowing look.',
  'A traveller steps out into the cold. The candles flicker like they noticed too.',
  'The Tavernkeep clears the empty mug from the table, and sets it aside instead of putting it away.',
  'The bell above the door jingles once, softer than usual, as they slip out.',
  'Mrow... another one wanders off down the road. The Tavernkeep watches the door a beat longer than it needs to.',
  'The floorboards remember every guest, even the ones who\'ve gone. The tavern is a little quieter now.',
  'Safe travels, wherever the road leads. The tavern will keep a seat warm, just in case.',
  'The Tavernkeep doesn\'t say much, just tucks their mug on the shelf reserved for regulars who might return.',
];

// Used when guildMemberRemove is traced back to a kick (see detectDepartureKind) rather than a
// voluntary leave — same spirit as FAREWELL_LINES, just acknowledging the door didn't open on
// its own.
const KICKED_LINES = [
  'The Tavernkeep plants a paw on their back and walks them straight out the door. No refunds.',
  'One sharp word from the bar, and the chair\'s already empty before the mug stops spinning.',
  'The Tavernkeep doesn\'t raise his voice. He doesn\'t have to — the door does the talking.',
  'Out they go, whether their boots agreed to it or not.',
  'The bell above the door jingles hard, rattled by how fast they left.',
  'The Tavernkeep dusts off his paws. "Some folk just don\'t know when to behave, nya."',
];

// Used when guildMemberRemove is traced back to a ban — the door doesn't just close, it locks.
const BANISHED_LINES = [
  'The Tavernkeep slides the bolt across the door himself. That one\'s not coming back.',
  'A name gets struck from the guest ledger, and the Tavernkeep doesn\'t look twice.',
  'The door locks behind them with a final, unambiguous click.',
  'The Tavernkeep tosses their mug straight in the bin. Some seats don\'t stay warm.',
  'No farewell, no last round — just the door, bolted shut, nya.',
];

const FORTUNES = [
  'The tea leaves say... you will trip over nothing tomorrow, and it will be witnessed by someone you were trying to impress.',
  'A stranger will offer you food. Accept it, traveller. It will be delicious, and the debt will be small.',
  'Fortune favors you this week, but only on Tuesdays, and only if you\'re wearing your good boots.',
  'You will find a coin on the ground. It will be worth exactly one coin, and yet it will feel like treasure.',
  'Beware of geese. They remember every wrong ever done to them, and they are patient.',
  'Your next great idea will arrive at the witching hour and vanish the moment the sun does its duty.',
  'The stars whisper of good fortune, if you remember to hydrate — even heroes forget to drink water, nya.',
  'Someone is thinking of you. Probably about something you owe them.',
  'A grand adventure awaits — right after you finish your chores. The dragons can wait; the dishes cannot.',
  'The leaves are unclear, traveller. Try again after another drink — the tea leaves respect persistence.',
  'The dregs form the shape of a crown. Either greatness awaits, or you\'ll spill something on your good tunic. Fifty-fifty odds.',
  'A door will open where you swore there was only wall. Walk through it before you talk yourself out of it.',
  'The cat sees a long road ahead of you, traveller — pack extra socks and a little more patience than you think you\'ll need.',
  'Someone from your past will send word soon. Whether it\'s good news or a bill depends entirely on how you left things.',
  'The leaves curl into the shape of a paw. Good luck follows you tonight, purring quietly at your heel.',
  'A small kindness you\'ve forgotten will return to you tenfold, and probably at the worst possible moment.',
  'Ask the cook for her secret sometime. She\'ll just say "butter." She is not joking.',
  'If the guild champion asks you to duel, the tea leaves offer no way out — only the choice of how bravely you lose.',
];

const GOSSIP_LINES = [
  'They say the blacksmith still hasn\'t paid off his tab from the solstice festival — the innkeeper\'s patience is not infinite.',
  'Word is the innkeeper down the road waters down the ale. Shameful. The Tavernkeep would never, nya.',
  'Rumor has it a knight was seen crying over a bowl of soup last week. The onions, they claimed. Sure.',
  'Apparently the mayor\'s cat has more titles than the mayor himself, and demands to be addressed by all of them.',
  'Some say the forest north of here hums at midnight. Nobody\'s checked why. Nobody\'s that brave.',
  'A traveling bard owes three separate taverns money for "creative differences." The tab always seems to follow the tune.',
  'The baker\'s bread has been suspiciously good lately. Some whisper of a pact. Others just whisper "more butter."',
  'Someone saw the town guard asleep on duty again. Third time this moon. The rats are taking notes.',
  'They say the old well grants wishes, but only takes silver, never gold. Very particular, that well.',
  'A merchant was overheard bragging about smuggling glitter. Glitter. Of all things to risk the noose for.',
  'They say the Guildmaster counted his shakes this morning and came up one short. Someone\'s in very serious trouble.',
  'Word is the Guildmaster has a secret stash of strawberries hidden somewhere in the guild hall. The Tavernkeep is not saying where. Nya~',
  'A cloaked figure was seen buying an unusual amount of candles last week. The Tavernkeep suspects a very dramatic ritual, or a very bad sense of direction.',
  'They say the tavern cat — a distant cousin twice removed — once won a staring contest against a basilisk. Bold claim. Nobody\'s tested it.',
  'The stable boy swears the horses whisper prophecies at dawn. So far the horses have only predicted breakfast.',
  'Someone left a very strongly worded note on the notice board about the guild hall\'s missing spoons. The spoons remain missing.',
  'They say the guild tank\'s shield hasn\'t budged in weeks — good thing too, since the Guildmaster\'s reckless Paladin days used to depend on it.',
  'A moderator was seen adjusting their pointy witch hat three separate times before deciding who deserved a warning. A trickster\'s ritual, some call it.',
  'Word is the guild champion challenged the blacksmith to a duel over nothing. The blacksmith declined. The champion did not accept the decline.',
  'Someone saw a moderator try to open a chest mid-meeting. It exploded. Everyone pretended not to laugh. Nobody was convincing.',
  'The quartermaster gave someone a "guild discount" so generous the Tavernkeep suspects she\'s losing coin on purpose.',
  'They say the guild medic once patched up a dungeon party with nothing but bandages and pure confidence. The nursing books are paying off already.',
];

// Use {target} as a placeholder — it gets replaced with the mentioned user
const GOSSIP_TARGET_LINES = [
  'They say {target} still owes the blacksmith for that "solstice festival incident." Details remain scarce, and everyone prefers it that way.',
  'Word is {target} was seen crying over a bowl of soup last week. Onions, apparently. The Tavernkeep has questions nya.',
  'Rumor has it {target} tried to pet a griffin. It did not go well. The griffin, reportedly, is fine.',
  'Apparently {target} has more debts than the mayor\'s cat has titles, and that cat has a lot of titles.',
  'Some say {target} talks to the forest at midnight. Nobody\'s checked why. Nobody\'s that brave.',
  'A traveling bard swears {target} owes three separate taverns money, though the bard also swears many things.',
  '{target}\'s cooking has been suspiciously good lately. Some whisper of a pact. The Tavernkeep just wants the recipe.',
  'Someone saw {target} asleep on guard duty. Third time this moon. Even the rats have started walking quieter around them.',
  'They say {target} wished on the old well. It only takes silver, never gold — a lesson learned the expensive way.',
  '{target} was overheard bragging about smuggling glitter. Glitter. Bold, reckless, and glittery.',
  'Word around the tavern is {target} once lost a fight to a very determined goose. The goose has not let it go either.',
  'They say {target} still hasn\'t returned that library book from three kingdoms ago. The overdue fee alone could fund an army.',
  'The Tavernkeep\'s whiskers twitch every time {target}\'s name comes up. There\'s a story there, nya, but it\'s not the Tavernkeep\'s to tell.',
  'Someone claims {target} once tried to haggle with a dragon. The dragon, apparently, found it "refreshing."',
  '{target} was spotted sneaking an extra helping of pie when they thought no one was watching. The Tavernkeep was watching. The Tavernkeep is always watching.',
];

const TOAST_LINES = [
  'may your mug never run dry and your foes always trip on their own boots.',
  'to good company, better ale, and the worst decisions made together.',
  'may your coin purse stay full and your enemies stay confused.',
  'to another day survived — the tavern remembers your name.',
  'may the road rise to meet you, and the tab never come due.',
  'to victories loud and losses quiet.',
  'may your blade stay sharp and your friends stay sharper-witted.',
  'to nine lives well spent, and the tenth spent even better, nya~',
  'may your fire never gutter and your enemies never find the matches.',
  'to the travellers who found their way home, and the ones still finding it.',
  'may your dreams be bigger than your debts, and your friends louder than your doubts.',
  'to scars worth the stories, and stories worth the scars.',
  'may the moon light your path and the tavern always leave a light on for you.',
  'to claws sheathed among friends, and bared for everyone else.',
];

// ---------- Truth or Dare (!tod) — stored in tod.json, cached in memory ----------
//
// Same cache-then-flush pattern as lore.json below: tod.json holds two plain arrays of strings,
// `truths` and `dares`. Hand-edit the file to add/remove/change entries — no code changes or
// restart needed, the cache just needs a disk flush (happens automatically on the periodic timer
// or on the next bot restart, whichever comes first). If tod.json is missing, the bot falls back
// to a small built-in starter set so `!tod` still works out of the box.

const TOD_FILE = path.join(__dirname, 'tod.json');

const DEFAULT_TOD_DATA = {
  truths: [
    "What's the most embarrassing thing that's ever happened to you in-game?",
    "Who in this server would you trust to guard your back in a real dungeon?",
    "What's a rumor about you that's actually true?",
    "What's the worst decision you've made in a party run?",
  ],
  dares: [
    'Type your next 3 messages in this server using only emojis.',
    'Send a voice message doing your best pirate impression.',
    'Change your nickname to something silly for the next 10 minutes.',
    'Compliment the last 3 people who spoke in this channel.',
  ],
};

let todCache = null;
let todDirty = false;

function readTodFromDisk() {
  if (!fs.existsSync(TOD_FILE)) return { truths: [...DEFAULT_TOD_DATA.truths], dares: [...DEFAULT_TOD_DATA.dares] };
  try {
    const parsed = JSON.parse(fs.readFileSync(TOD_FILE, 'utf8'));
    return {
      truths: Array.isArray(parsed.truths) && parsed.truths.length ? parsed.truths : [...DEFAULT_TOD_DATA.truths],
      dares: Array.isArray(parsed.dares) && parsed.dares.length ? parsed.dares : [...DEFAULT_TOD_DATA.dares],
    };
  } catch (err) {
    console.error('Failed to read tod.json, falling back to defaults.', err);
    return { truths: [...DEFAULT_TOD_DATA.truths], dares: [...DEFAULT_TOD_DATA.dares] };
  }
}

function loadTod() {
  if (!todCache) todCache = readTodFromDisk();
  return todCache;
}

function flushTodToDisk() {
  if (!todDirty || !todCache) return;
  try {
    atomicWriteFileSync(TOD_FILE, JSON.stringify(todCache, null, 2));
    todDirty = false;
  } catch (err) {
    console.error('Failed to write tod.json:', err);
  }
}

// !tod is open to everyone, on everyone (same shape as !throw) — but a caller has to wait this
// long between calls targeting the SAME person, so one person can't be spammed with prompt after
// prompt. In-memory only (resets on restart), keyed by target user ID, same tradeoff as the
// party-create cooldown above.
const TOD_COOLDOWN_MS = 2 * 60 * 1000;
const todTargetCooldowns = new Map(); // targetUserId -> Date.now() of the last !tod aimed at them

function todCooldownRemaining(targetUserId) {
  const last = todTargetCooldowns.get(targetUserId);
  if (!last) return 0;
  const remaining = TOD_COOLDOWN_MS - (Date.now() - last);
  return remaining > 0 ? remaining : 0;
}

function markTodUsed(targetUserId) {
  todTargetCooldowns.set(targetUserId, Date.now());
}

// Same unbounded-growth issue as partyCreateCooldowns above — one entry per person ever targeted
// by !tod, forever. Prune anything past its cooldown window every hour.
setInterval(() => {
  const now = Date.now();
  for (const [targetUserId, last] of todTargetCooldowns.entries()) {
    if (now - last >= TOD_COOLDOWN_MS) todTargetCooldowns.delete(targetUserId);
  }
}, 60 * 60 * 1000);

// ---------- Truth or Dare mod-only prompt book (bare `!tod`, Council/Knight only) ----------
//
// Same tier as the Grimoire's Add/Remove/Edit controls above: Council or
// Knight only, gated both when the buttons render and again on every click/submit
// (roles can change between the two).
//
// Every button names its category up front (Add Truth / Add Dare / Edit Truth / Edit Dare /
// Remove Truth / Remove Dare), so a mod never has to pick a list mid-flow — Truths and Dares are
// numbered independently (1..N each). Each flow goes straight from the button to ONE modal
// (interaction.showModal called directly on the button interaction, same shape that's proven to
// work), instead of routing a select-menu pick through to a modal — that extra hop was the bug:
// a select-menu interaction handing off to showModal() was silently failing and getting eaten by
// a blanket .catch(() => {}), so Add would just sit there until it timed out. The catches below
// now log to the console instead of swallowing errors, so any future failure is actually visible.
function todModControlsVisible(member) {
  return isCouncil(member);
}

// Only PAGE_SIZE truths + PAGE_SIZE dares are shown per page (Discord embed fields cap out at
// 1024 characters, so a long book gets silently clipped otherwise). Prev/Next below page through
// the same numbering the Edit/Remove modals expect, and "Show Full List" dumps everything,
// untruncated, as a text file for whoever needs the whole thing at once.
const TOD_PAGE_SIZE = 10;

function todTotalPages(tod) {
  const maxLen = Math.max(tod.truths.length, tod.dares.length, 1);
  return Math.max(1, Math.ceil(maxLen / TOD_PAGE_SIZE));
}

function buildTodListEmbed(note, page = 1) {
  const tod = loadTod();
  const totalPages = todTotalPages(tod);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * TOD_PAGE_SIZE;

  const truthLines = tod.truths
    .slice(start, start + TOD_PAGE_SIZE)
    .map((t, i) => `\`${start + i + 1}.\` ${t}`)
    .join('\n');
  const dareLines = tod.dares
    .slice(start, start + TOD_PAGE_SIZE)
    .map((d, i) => `\`${start + i + 1}.\` ${d}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle('🎭 Truth or Dare — Prompt Book')
    .setDescription(
      (note ? `${note}\n\n` : '') +
        'Truths and Dares are numbered separately below. Pick the button for the list and action you ' +
        'want — each opens a small form, and nothing changes until you confirm Yes/No. Use Prev/Next ' +
        'to page through the rest, or Show Full List for everything at once.'
    )
    .addFields(
      { name: '🗣️ Truths', value: truthLines || '*None on this page.*' },
      { name: '🔥 Dares', value: dareLines || '*None on this page.*' }
    )
    .setFooter({
      text: `${tod.truths.length + tod.dares.length} on file • Page ${safePage}/${totalPages} • Mod-only view`,
    });
}

function buildTodListComponents(ownerId, page = 1) {
  const tod = loadTod();
  const totalPages = todTotalPages(tod);
  const safePage = Math.min(Math.max(1, page), totalPages);

  const addRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`todctl:add:truths:${ownerId}:${safePage}`).setLabel('Add Truth').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`todctl:add:dares:${ownerId}:${safePage}`).setLabel('Add Dare').setEmoji('➕').setStyle(ButtonStyle.Success)
  );
  const editRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`todctl:edit:truths:${ownerId}:${safePage}`).setLabel('Edit Truth').setEmoji('✏️').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`todctl:edit:dares:${ownerId}:${safePage}`).setLabel('Edit Dare').setEmoji('✏️').setStyle(ButtonStyle.Primary)
  );
  const removeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`todctl:remove:truths:${ownerId}:${safePage}`).setLabel('Remove Truth').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`todctl:remove:dares:${ownerId}:${safePage}`).setLabel('Remove Dare').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`todctl:nav:prev:${ownerId}:${safePage}`)
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage <= 1),
    new ButtonBuilder()
      .setCustomId(`todctl:nav:page:${ownerId}:${safePage}`)
      .setLabel(`Page ${safePage}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`todctl:nav:next:${ownerId}:${safePage}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage >= totalPages)
  );
  const showRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`todctl:show:full:${ownerId}:${safePage}`).setLabel('Show Full List').setEmoji('📜').setStyle(ButtonStyle.Secondary)
  );
  return [addRow, editRow, removeRow, navRow, showRow];
}

// Resolves the number a mod types (matching what's printed next to each line for THAT category,
// since the category is already fixed by whichever button they pressed) to an in-array index.
function resolveTodLocalTarget(category, raw) {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return { index: -1, error: 'Give me a number from the list, traveller — run `!tod` to see them again.' };
  }
  const num = parseInt(trimmed, 10);
  const tod = loadTod();
  const list = tod[category];
  const localIndex = num - 1;
  if (num >= 1 && num <= list.length) {
    return { index: num, localIndex, text: list[localIndex] };
  }
  return { index: -1, error: `There's no #${trimmed} in that list right now — run \`!tod\` to see current numbers.` };
}

// Handles the Add/Edit/Remove button clicks on the mod-only `!tod` prompt book. Only the
// traveller who ran bare `!tod` can press their own copy's buttons (same "get your own copy"
// convention as the Grimoire/IGN directory), and every button is re-gated on click in case roles
// changed since the book was posted.
async function handleTodListButton(interaction) {
  const [, action, category, ownerId, pageRaw] = interaction.customId.split(':');
  const page = parseInt(pageRaw, 10) || 1;

  // Wrong-copy / no-permission checks stay ephemeral — they're about who's clicking, not about
  // prompt-book content, so there's nothing here the rest of the mod chat needs to see.
  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'This isn\'t your copy of the prompt book — run `!tod` to get your own.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!todModControlsVisible(interaction.member)) {
    await interaction.reply({
      content: "You don't have permission to manage the prompt book here.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'add') {
    await handleTodAddFlow(interaction, category, ownerId, page);
  } else if (action === 'edit') {
    await handleTodEditFlow(interaction, category, ownerId, page);
  } else if (action === 'remove') {
    await handleTodRemoveFlow(interaction, category, ownerId, page);
  } else if (action === 'nav') {
    await handleTodNavFlow(interaction, category, ownerId, page);
  } else if (action === 'show') {
    await handleTodShowFlow(interaction);
  }
}

// Prev/Next — just re-renders the same public message on a different page. No new message, no
// modal, nothing to confirm: everyone who could already see the book sees the new page instantly.
async function handleTodNavFlow(interaction, direction, ownerId, page) {
  const tod = loadTod();
  const totalPages = todTotalPages(tod);
  let newPage = page;
  if (direction === 'prev') newPage = Math.max(1, page - 1);
  if (direction === 'next') newPage = Math.min(totalPages, page + 1);

  await interaction
    .update({
      embeds: [buildTodListEmbed(null, newPage)],
      components: buildTodListComponents(ownerId, newPage),
    })
    .catch((err) => console.error('!tod nav: failed to update prompt book page:', err));
}

// Show Full List — dumps every truth and dare, untruncated, as a text file in a normal (public,
// non-ephemeral) reply. Posted in the same mod channel the book lives in, so any mod can request
// it and the rest of the mod chat sees exactly what was pulled up.
async function handleTodShowFlow(interaction) {
  const tod = loadTod();
  const truthLines = tod.truths.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const dareLines = tod.dares.map((d, i) => `${i + 1}. ${d}`).join('\n');
  const fullText =
    `TRUTH OR DARE — FULL PROMPT BOOK\n` +
    `Requested by ${interaction.user.tag} (${interaction.user.id})\n\n` +
    `=== TRUTHS (${tod.truths.length}) ===\n${truthLines || '(none on file)'}\n\n` +
    `=== DARES (${tod.dares.length}) ===\n${dareLines || '(none on file)'}\n`;

  const attachment = new AttachmentBuilder(Buffer.from(fullText, 'utf-8'), { name: 'tod-prompt-book-full.txt' });

  await interaction
    .reply({
      content: `📜 Full prompt book — requested by <@${interaction.user.id}>.`,
      files: [attachment],
      allowedMentions: { users: [] },
    })
    .catch((err) => console.error('!tod show: failed to post full list:', err));
}

// Add: the button already says which list, so this goes straight to a modal for the new prompt,
// then a preview + Yes/No before it's actually saved. Runs start-to-finish off the original
// button click (awaitModalSubmit), so `interaction.message` still points at the public
// prompt-book message the whole way through, letting the final step refresh it in place.
async function handleTodAddFlow(interaction, category, ownerId, page = 1) {
  const categoryLabel = category === 'truths' ? 'Truths' : 'Dares';

  const modal = new ModalBuilder().setCustomId('todadd:modal').setTitle(`Add a ${category === 'truths' ? 'Truth' : 'Dare'}`);
  const textInput = new TextInputBuilder()
    .setCustomId('text')
    .setLabel(category === 'truths' ? 'The truth question' : 'The dare')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder(
      category === 'truths'
        ? 'e.g. What\'s your most embarrassing wipe?'
        : 'e.g. Type your next message backwards.'
    )
    .setRequired(true)
    .setMaxLength(300);
  modal.addComponents(new ActionRowBuilder().addComponents(textInput));

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'todadd:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!tod add modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await interaction.followUp({ content: 'Timed out waiting for the new prompt — nothing was added.', flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const text = submitted.fields.getTextInputValue('text').trim();
  if (!text) {
    await submitted.reply({ content: 'Empty prompt — nothing was added.', flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('todadd:confirm:yes').setLabel('Yes, add it').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('todadd:confirm:no').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  );

  // Public, not ephemeral — the rest of the mod chat should see what's about to be added and who
  // confirmed it, same as the result once it's saved.
  await submitted.reply({
    content: `${submitted.user} is about to add this to **${categoryLabel}**:\n\n> ${text}\n\nAdd it?`,
    components: [confirmRow],
  });

  const confirmPicker = await submitted.fetchReply().catch(() => null);
  if (!confirmPicker) return;

  const confirmClick = await confirmPicker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && ['todadd:confirm:yes', 'todadd:confirm:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'todadd:confirm:no') {
    await submitted.editReply({ content: 'Cancelled — nothing was added.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const tod = loadTod();
  tod[category].push(text);
  todDirty = true;
  flushTodToDisk();

  await confirmClick.update({ content: `✅ Added to **${categoryLabel}**:\n\n> ${text}`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  await interaction.message
    .edit({
      embeds: [buildTodListEmbed(`✅ Added a new ${category === 'truths' ? 'truth' : 'dare'} to the book.`, page)],
      components: buildTodListComponents(ownerId, page),
    })
    .catch((err) => console.error('!tod add: failed to refresh prompt book message:', err));
}

// Edit: one modal asks for the # (within the already-picked list) AND the replacement text
// together — same shape as the Grimoire's edit modal — then a preview showing old vs. new and a
// Yes/No before anything is overwritten.
async function handleTodEditFlow(interaction, category, ownerId, page = 1) {
  const categoryLabel = category === 'truths' ? 'Truths' : 'Dares';

  const modal = new ModalBuilder().setCustomId('todedit:modal').setTitle(`Edit a ${category === 'truths' ? 'Truth' : 'Dare'}`);
  const numberInput = new TextInputBuilder()
    .setCustomId('number')
    .setLabel(`Which # in ${categoryLabel}?`)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 5')
    .setRequired(true);
  const textInput = new TextInputBuilder()
    .setCustomId('text')
    .setLabel('New text (replaces it completely)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(300);
  modal.addComponents(
    new ActionRowBuilder().addComponents(numberInput),
    new ActionRowBuilder().addComponents(textInput)
  );

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'todedit:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!tod edit modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await interaction.followUp({ content: 'Timed out waiting for the edit — nothing was changed.', flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const raw = submitted.fields.getTextInputValue('number').trim();
  const newText = submitted.fields.getTextInputValue('text').trim();
  const resolved = resolveTodLocalTarget(category, raw);
  if (resolved.index === -1) {
    await submitted.reply({ content: resolved.error, flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  if (!newText) {
    await submitted.reply({ content: 'Empty replacement text — nothing was changed.', flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const { localIndex, text: oldText } = resolved;

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('todedit:confirm:yes').setLabel('Yes, save it').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('todedit:confirm:no').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  );

  // Public, not ephemeral — the mod chat should be able to see who's editing what, and to what.
  await submitted.reply({
    content: `${submitted.user} is about to change **${categoryLabel} #${raw}**:\n\n> ${truncateForPreview(oldText)}\n\n**to:**\n\n> ${newText}\n\nSave it?`,
    components: [confirmRow],
  });

  const confirmPicker = await submitted.fetchReply().catch(() => null);
  if (!confirmPicker) return;

  const confirmClick = await confirmPicker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && ['todedit:confirm:yes', 'todedit:confirm:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'todedit:confirm:no') {
    await submitted.editReply({ content: 'Cancelled — nothing was changed.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const tod = loadTod();
  tod[category][localIndex] = newText;
  todDirty = true;
  flushTodToDisk();

  await confirmClick.update({ content: `✏️ Updated **${categoryLabel} #${raw}**:\n\n> ${newText}`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  await interaction.message
    .edit({
      embeds: [buildTodListEmbed(`✏️ Edited a ${category === 'truths' ? 'truth' : 'dare'} in the book.`, page)],
      components: buildTodListComponents(ownerId, page),
    })
    .catch((err) => console.error('!tod edit: failed to refresh prompt book message:', err));
}

// Remove: the button already says which list, so this goes straight to a modal for the number,
// preview exactly what it maps to, then Yes/No before it's deleted.
async function handleTodRemoveFlow(interaction, category, ownerId, page = 1) {
  const categoryLabel = category === 'truths' ? 'Truths' : 'Dares';

  const modal = new ModalBuilder().setCustomId('todremove:modal').setTitle(`Remove a ${category === 'truths' ? 'Truth' : 'Dare'}`);
  const numberInput = new TextInputBuilder()
    .setCustomId('number')
    .setLabel(`Which # in ${categoryLabel}?`)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 5')
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(numberInput));

  await interaction.showModal(modal);

  const submitted = await interaction
    .awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'todremove:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!tod remove modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await interaction.followUp({
      content: 'Timed out waiting for a number — nothing was removed.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const raw = submitted.fields.getTextInputValue('number').trim();
  const resolved = resolveTodLocalTarget(category, raw);
  if (resolved.index === -1) {
    await submitted.reply({ content: resolved.error, flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const { localIndex, text } = resolved;

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('todremove:confirm:yes').setLabel('Yes, remove it').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('todremove:confirm:no').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  );

  // Public, not ephemeral — the mod chat should see what's about to be deleted and by whom.
  await submitted.reply({
    content: `${submitted.user} is about to remove **#${raw}** from **${categoryLabel}**:\n\n> ${truncateForPreview(text)}\n\nRemove it?`,
    components: [confirmRow],
  });

  const confirmPicker = await submitted.fetchReply().catch(() => null);
  if (!confirmPicker) return;

  const confirmClick = await confirmPicker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && ['todremove:confirm:yes', 'todremove:confirm:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'todremove:confirm:no') {
    await submitted.editReply({ content: 'Cancelled — nothing was removed.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const tod = loadTod();
  tod[category].splice(localIndex, 1);
  todDirty = true;
  flushTodToDisk();

  await confirmClick.update({ content: `🗑️ Removed from **${categoryLabel}**:\n\n> ${truncateForPreview(text)}`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  await interaction.message
    .edit({
      embeds: [buildTodListEmbed(`🗑️ Removed a ${category === 'truths' ? 'truth' : 'dare'} from the book.`, page)],
      components: buildTodListComponents(ownerId, page),
    })
    .catch((err) => console.error('!tod remove: failed to refresh prompt book message:', err));
}

// ---------- Guild Lore (!lore) — stored in lore.json, cached in memory ----------
//
// The tale of every traveller who's earned a page in the grimoire. Used to live as a hardcoded
// array right here in the source — now lives in its own file instead (same cache-then-flush
// pattern as drinks.json/warnings.json/igns.json below), so Council/Knight can add, remove, and
// edit entries live via the buttons on `!lore list` without anyone touching or redeploying the
// bot's code. `id` is the lookup key (lowercase, no spaces) — !lore matches against id, name, and
// aliases. If lore.json is ever missing, the bot just starts with an empty grimoire instead of
// crashing — drop the shipped lore.json next to this file to restore the existing roster.

const LORE_FILE = path.join(__dirname, 'lore.json');

let loreCache = null;
let loreDirty = false;

function readLoreFromDisk() {
  if (!fs.existsSync(LORE_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LORE_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read lore.json, starting fresh.', err);
    return [];
  }
}

function loadLore() {
  if (!loreCache) loreCache = readLoreFromDisk();
  return loreCache;
}

// No longer writes to disk immediately — just updates the cache and flags it dirty.
// flushLoreToDisk() (called on an interval, see bottom of file) does the actual write.
function saveLore(data) {
  loreCache = data;
  loreDirty = true;
}

function flushLoreToDisk() {
  if (!loreDirty || !loreCache) return;
  try {
    atomicWriteFileSync(LORE_FILE, JSON.stringify(loreCache, null, 2));
    loreDirty = false;
  } catch (err) {
    console.error('Failed to write lore.json:', err);
  }
}

function findLoreEntry(query) {
  const entries = loadLore();
  const q = query.trim().toLowerCase().replace(/\s+/g, '');
  if (!q) return { match: null, candidates: [] };

  // Exact match on id, name, or alias first (String(...) guards against hand-edited entries
  // that are missing an id/name, which would otherwise throw and break lookups for everyone)
  const squash = (s) => String(s || '').toLowerCase().replace(/\s+/g, '');
  const exact = entries.find(
    (e) =>
      squash(e.id) === q ||
      squash(e.name) === q ||
      (e.aliases || []).some((a) => squash(a) === q)
  );
  if (exact) return { match: exact, candidates: [] };

  // Otherwise, fall back to a "starts with" search — only resolve automatically if unambiguous
  const partial = entries.filter(
    (e) =>
      squash(e.id).startsWith(q) ||
      squash(e.name).startsWith(q) ||
      (e.aliases || []).some((a) => squash(a).startsWith(q))
  );
  if (partial.length === 1) return { match: partial[0], candidates: [] };
  return { match: null, candidates: partial };
}

// ---------- Guild Lore mod controls (Add / Remove / Edit buttons on !lore list) ----------
//
// Same tier as the !user directory's mod controls — Council or the Guildn
// Knight. Gates both the buttons showing up and the modals they open (re-checked on submit in
// case roles changed between the click and the submit, same idea as the IGN directory above).
function loreModControlsVisible(member) {
  return isCouncil(member);
}

// Resolves a mod-typed target — either the roster number shown next to each name on !lore list,
// or a name/id/alias lookup (same matching as plain !lore <name>) — to a concrete array index +
// entry. Used by the Remove/Edit modals so mods can grab the number off the list instead of
// retyping a name.
function resolveLoreTarget(raw) {
  const trimmed = raw.trim();
  const entries = loadLore();

  if (/^\d+$/.test(trimmed)) {
    // The # shown on !lore list is the position in the DISPLAYED roster (grouped by category),
    // which isn't always the same as the raw array order — so look it up the same way the list does.
    const item = getLoreDisplayList().find((it) => it.num === parseInt(trimmed, 10));
    if (!item) return { index: -1, error: `There's no #${trimmed} on the roster right now.` };
    return { index: entries.indexOf(item.entry), entry: item.entry };
  }

  const { match, candidates } = findLoreEntry(trimmed);
  if (match) {
    return { index: entries.indexOf(match), entry: match };
  }
  if (candidates.length > 1) {
    return {
      index: -1,
      error: `A few names match "${raw}": ${candidates.map((c) => c.name).join(', ')}. Try being more specific, or use their number.`,
    };
  }
  return { index: -1, error: `No page for **${raw}** in the grimoire.` };
}

// "-" clears aliases entirely on Edit; blank means "leave unchanged" (checked by the caller
// before this ever runs); anything else is parsed into a trimmed, comma-separated list.
function parseLoreAliases(raw) {
  const trimmed = raw.trim();
  if (trimmed === '-') return [];
  return trimmed.split(',').map((a) => a.trim()).filter(Boolean);
}

// Same tradeoff as IGN_PAGE_SIZE below — enough entries per page to feel complete at a glance,
// small enough that the list never brushes up against Discord's embed size limits as the roster
// keeps growing.
const LORE_PAGE_SIZE = 15;

const LORE_CATEGORIES = ['Council', 'Guild Officers & Members', 'Guild Guests'];

// Category is free text in the Add/Edit modals, so "council", "Guild Officer", "guests" etc. all
// need to land on one of the real categories — otherwise the entry never shows on !lore list.
// Returns the canonical category name, or null if it can't be recognised.
function normalizeLoreCategory(raw) {
  const q = String(raw || '').toLowerCase().replace(/[^a-z]/g, '');
  if (!q) return null;
  for (const cat of LORE_CATEGORIES) {
    if (cat.toLowerCase().replace(/[^a-z]/g, '') === q) return cat;
  }
  if (q.includes('council')) return LORE_CATEGORIES[0];
  if (q.includes('guest')) return LORE_CATEGORIES[2];
  if (q.includes('officer') || q.includes('member')) return LORE_CATEGORIES[1];
  return null;
}

function loreCategoryLabel(entry) {
  return normalizeLoreCategory(entry.category) || String(entry.category || '').trim() || 'Uncategorized';
}

// The roster exactly as it's shown on !lore list: grouped by category (known categories first, in
// order, then anything unrecognised), original order kept within each group, numbered 1..N in that
// order. Pagination slices THIS list, so every entry appears on exactly one page and the numbers
// run in sequence down the pages. The Remove/Edit "#" lookups use this same list.
function getLoreDisplayList() {
  const entries = loadLore();
  const rank = (label) => {
    const i = LORE_CATEGORIES.indexOf(label);
    return i === -1 ? LORE_CATEGORIES.length : i;
  };
  return entries
    .map((entry, idx) => ({ entry, idx, label: loreCategoryLabel(entry) }))
    .sort((a, b) => {
      const ra = rank(a.label);
      const rb = rank(b.label);
      if (ra !== rb) return ra - rb;
      if (ra === LORE_CATEGORIES.length && a.label !== b.label) return a.label.localeCompare(b.label);
      return a.idx - b.idx;
    })
    .map((item, i) => ({ ...item, num: i + 1 }));
}

// Which page of !lore list a given entry lives on (used to jump to it after Add/Edit).
function lorePageOf(entry) {
  const i = getLoreDisplayList().findIndex((it) => it.entry === entry);
  return i === -1 ? 0 : Math.floor(i / LORE_PAGE_SIZE);
}

function loreNumberOf(entry) {
  const item = getLoreDisplayList().find((it) => it.entry === entry);
  return item ? item.num : null;
}

// Discord rejects an embed outright if any field value passes 1024 characters, which would make
// the whole list silently fail to show. Split long groups into several fields instead.
function chunkLoreLines(lines, max = 1000) {
  const chunks = [];
  let cur = '';
  for (const line of lines) {
    if (cur && cur.length + line.length + 1 > max) {
      chunks.push(cur);
      cur = line;
    } else {
      cur = cur ? `${cur}\n${line}` : line;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

function buildLoreListEmbed(page, note) {
  const list = getLoreDisplayList();
  const totalPages = Math.max(1, Math.ceil(list.length / LORE_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * LORE_PAGE_SIZE;
  const pageItems = list.slice(start, start + LORE_PAGE_SIZE);

  const embed = new EmbedBuilder()
    .setTitle('📖 The Grimoire of the Guild')
    .setColor(0x6b4f8f)
    .setDescription(
      (note ? `${note}\n\n` : '') +
        'Every name here has a tale behind it, traveller. Ask with `!lore <name>` and the ' +
        'Tavernkeep will tell it — or just `!lore` for a random page. Mods can use the ' +
        '`#` next to a name with the Edit/Add Tale/Remove buttons below. *Remove lets you pick one ' +
        'specific paragraph to delete (with a preview + confirm) — it won\'t wipe someone\'s whole ' +
        'page unless you deliberately choose that option.*'
    )
    .setFooter({ text: `Page ${clampedPage + 1} of ${totalPages} • ${list.length} on file` });

  // Group this page's slice by category (already contiguous, since the list is sorted by it).
  const groups = [];
  for (const item of pageItems) {
    const last = groups[groups.length - 1];
    if (last && last.label === item.label) last.items.push(item);
    else groups.push({ label: item.label, items: [item] });
  }

  for (const group of groups) {
    const lines = group.items.map(({ num, entry }) => {
      const name = String(entry.name || '(unnamed)');
      return `\`${num}.\` ${name.length > 60 ? `${name.slice(0, 57)}...` : name}`;
    });
    chunkLoreLines(lines).forEach((chunk, i) => {
      embed.addFields({ name: i === 0 ? group.label : `${group.label} (cont.)`, value: chunk });
    });
  }

  if (pageItems.length === 0) {
    embed.addFields({ name: 'Empty page', value: 'Nothing here — try the ◀ Prev button.' });
  }

  return { embed, page: clampedPage, totalPages };
}

// Nav row (Prev / page indicator / Next) always shows, same as the IGN directory book, so every
// traveller — not just mods — can page through the full roster. Edit/Add/Add Tale/Remove stay
// Council/Knight only, appended as a second row when applicable.
function buildLoreListComponents(ownerId, page, totalPages, showModControls) {
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`lorectl:prev:${ownerId}:${page}`)
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`lorectl:noop:${ownerId}:${page}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`lorectl:next:${ownerId}:${page}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );

  const rows = [navRow];

  if (showModControls) {
    const modRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`lorectl:add:${ownerId}:${page}`).setLabel('Add').setEmoji('➕').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`lorectl:edit:${ownerId}:${page}`).setLabel('Edit Details').setEmoji('✏️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`lorectl:addtale:${ownerId}:${page}`).setLabel('Add Tale').setEmoji('📜').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`lorectl:remove:${ownerId}:${page}`).setLabel('Remove Paragraph').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
    );
    rows.push(modRow);
  }

  return rows;
}

// Handles Add/Remove/Edit button clicks on !lore list — each just opens the matching modal.
// Only the traveller who ran !lore list can press their own copy's buttons.
async function handleLoreListButton(interaction) {
  const [, action, ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'This isn\'t your copy of the grimoire — run `!lore list` to get your own.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'prev' || action === 'next') {
    const newPage = action === 'prev' ? page - 1 : page + 1;
    const { embed, page: clampedPage, totalPages } = buildLoreListEmbed(newPage);
    const showModControls = loreModControlsVisible(interaction.member);
    await interaction.update({
      embeds: [embed],
      components: buildLoreListComponents(ownerId, clampedPage, totalPages, showModControls),
    });
    return;
  }

  if (!loreModControlsVisible(interaction.member)) {
    await interaction.reply({
      content: "You don't have permission to manage the grimoire here.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'add') {
    const modal = new ModalBuilder().setCustomId(`lorectl:addmodal:${ownerId}:${page}`).setTitle('Add Lore Entry');
    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Name')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Thorin')
      .setRequired(true);
    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Title (optional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Founder, Vice Guildmaster, Guild Officer')
      .setRequired(false);
    const categoryInput = new TextInputBuilder()
      .setCustomId('category')
      .setLabel('Category')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Council / Guild Officers & Members / Guild Guests')
      .setRequired(true);
    const aliasesInput = new TextInputBuilder()
      .setCustomId('aliases')
      .setLabel('Aliases (optional, comma-separated)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Gigi, G-man')
      .setRequired(false);
    const taleInput = new TextInputBuilder()
      .setCustomId('tale')
      .setLabel('First tale')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('A short story/fact about them, e.g. "Thorin, Founder of the Guild, raised these walls..."')
      .setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(nameInput),
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(categoryInput),
      new ActionRowBuilder().addComponents(aliasesInput),
      new ActionRowBuilder().addComponents(taleInput)
    );
    await interaction.showModal(modal);
    return;
  }

  if (action === 'remove') {
    const modal = new ModalBuilder().setCustomId(`lorectl:removemodal:${ownerId}:${page}`).setTitle('Remove a Paragraph');
    const targetInput = new TextInputBuilder()
      .setCustomId('target')
      .setLabel('Whose page? Name or # from the list')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 3  or  Guildmaster — next you\'ll pick which paragraph')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(targetInput));
    await interaction.showModal(modal);
    return;
  }

  // Add Tale — just the target + the new paragraph (split out of Edit so Edit has room for Name).
  if (action === 'addtale') {
    const modal = new ModalBuilder().setCustomId(`lorectl:talemodal:${ownerId}:${page}`).setTitle('Add a Tale');
    const targetInput = new TextInputBuilder()
      .setCustomId('target')
      .setLabel('Whose page? Name or # from the list')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. 3  or  Guildmaster')
      .setRequired(true);
    const taleInput = new TextInputBuilder()
      .setCustomId('tale')
      .setLabel('New tale (added as a new paragraph)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('A new paragraph to ADD to their page, e.g. "These days he also leads..."')
      .setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(targetInput),
      new ActionRowBuilder().addComponents(taleInput)
    );
    await interaction.showModal(modal);
    return;
  }

  // edit (details: name, title, category, aliases)
  const modal = new ModalBuilder().setCustomId(`lorectl:editmodal:${ownerId}:${page}`).setTitle('Edit Lore Entry');
  const targetInput = new TextInputBuilder()
    .setCustomId('target')
    .setLabel('Name or # from the list')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 3  or  Guildmaster')
    .setRequired(true);
  const nameInput = new TextInputBuilder()
    .setCustomId('newname')
    .setLabel('New name (blank = unchanged)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Thorin the Bold  (this RENAMES the page)')
    .setRequired(false);
  const titleInput = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('New title (blank=unchanged, "-"=clear)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Guild Officer  (this REPLACES the current title)')
    .setRequired(false);
  const categoryInput = new TextInputBuilder()
    .setCustomId('category')
    .setLabel('New category (blank = unchanged)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Council / Guild Officers & Members / Guild Guests')
    .setRequired(false);
  const aliasesInput = new TextInputBuilder()
    .setCustomId('aliases')
    .setLabel('New aliases (blank=unchanged, "-"=clear)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Gigi, G-man  (comma-separated, REPLACES the current list)')
    .setRequired(false);
  modal.addComponents(
    new ActionRowBuilder().addComponents(targetInput),
    new ActionRowBuilder().addComponents(nameInput),
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(categoryInput),
    new ActionRowBuilder().addComponents(aliasesInput)
  );
  await interaction.showModal(modal);
}

// Shared permission re-check for the three mod modals below — the buttons that open them are
// already gated by loreModControlsVisible, but roles could theoretically change between the
// click and the submit, same idea as the IGN directory's ignModalPermissionError.
function loreModalPermissionError(interaction, ownerId) {
  if (interaction.user.id !== ownerId) {
    return 'This isn\'t your copy of the grimoire — run `!lore list` to get your own.';
  }
  if (!loreModControlsVisible(interaction.member)) {
    return "You don't have permission to manage the grimoire here.";
  }
  return null;
}

async function handleLoreAddModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;
  const permError = loreModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const name = interaction.fields.getTextInputValue('name').trim();
  const title = interaction.fields.getTextInputValue('title').trim();
  const category = interaction.fields.getTextInputValue('category').trim();
  const aliasesRaw = interaction.fields.getTextInputValue('aliases').trim();
  const tale = interaction.fields.getTextInputValue('tale').trim();

  if (!name || !category || !tale) {
    await interaction.reply({ content: 'Name, category, and a first tale are all required.', flags: MessageFlags.Ephemeral });
    return;
  }

  const normalizedCategory = normalizeLoreCategory(category);
  if (!normalizedCategory) {
    await interaction.reply({
      content: `I don't recognise the category "${category}". Use one of: ${LORE_CATEGORIES.map((c) => `**${c}**`).join(', ')}.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const id = name.toLowerCase().replace(/\s+/g, '');
  const entries = loadLore();
  if (entries.some((e) => e.id === id || String(e.name || '').toLowerCase().replace(/\s+/g, '') === id)) {
    await interaction.reply({
      content: `**${name}** already has a page in the grimoire — use Edit instead.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const entry = { id, name, category: normalizedCategory, lore: [tale] };
  if (title) entry.title = title;
  const aliases = aliasesRaw ? parseLoreAliases(aliasesRaw) : [];
  if (aliases.length) entry.aliases = aliases;

  entries.push(entry);
  saveLore(entries);

  // Jump to the page the new entry landed on (it's sorted into its category, not tacked on the end).
  const num = loreNumberOf(entry);
  const { embed, page: clampedPage, totalPages } = buildLoreListEmbed(
    lorePageOf(entry),
    `✅ Added **${name}** to the grimoire${num ? ` as \`#${num}\`` : ''}.`
  );
  await interaction.update({
    embeds: [embed],
    components: buildLoreListComponents(ownerId, clampedPage, totalPages, true),
  });
}

// Truncates a preview block so a very long entry can never blow past Discord's message length
// limit while it's shown for confirmation.
function truncateForPreview(text, max = 1500) {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

// Removal is a two-step, fully previewed flow: the mod first picks WHICH paragraph to remove
// (or opts to remove the whole page) from a select menu, then sees the exact text that will be
// deleted and has to confirm with Yes/No before anything actually happens. Nothing is ever
// deleted on the strength of the typed target alone.
async function handleLoreRemoveModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;
  const permError = loreModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const resolved = resolveLoreTarget(raw);
  if (resolved.index === -1) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const entry = resolved.entry;

  const paragraphOptions = entry.lore.map((tale, i) => ({
    label: `Paragraph ${i + 1}`,
    description: tale.length > 100 ? `${tale.slice(0, 97)}...` : tale,
    value: `p:${i}`,
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('loreremove:paragraph')
    .setPlaceholder('Choose a paragraph to remove...')
    .addOptions([
      ...paragraphOptions,
      {
        label: '⚠️ Remove the ENTIRE page instead',
        description: `Deletes all ${entry.lore.length} paragraph(s) for ${entry.name}`,
        value: 'ALL',
      },
    ]);

  await interaction.reply({
    content: `Which paragraph from **${entry.name}**'s page do you want to remove, traveller?`,
    components: [new ActionRowBuilder().addComponents(selectMenu)],
    flags: MessageFlags.Ephemeral,
  });

  const picker = await interaction.fetchReply().catch(() => null);
  if (!picker) return;

  const pick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'loreremove:paragraph',
      time: 60000,
    })
    .catch(() => null);

  if (!pick) {
    await interaction.editReply({ content: 'Timed out waiting for a paragraph choice — nothing was removed.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const choice = pick.values[0];
  const isWholeEntry = choice === 'ALL';
  const paragraphIndex = isWholeEntry ? -1 : parseInt(choice.split(':')[1], 10);
  const previewText = isWholeEntry
    ? entry.lore.map((t, i) => `**${i + 1}.** ${t}`).join('\n\n')
    : entry.lore[paragraphIndex];

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('loreremove:yes').setLabel('Yes, remove it').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('loreremove:no').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  );

  await pick.update({
    content:
      (isWholeEntry
        ? `⚠️ You're about to remove **ALL ${entry.lore.length} paragraph(s)** for **${entry.name}**:\n\n`
        : `You're about to remove this paragraph from **${entry.name}**'s page:\n\n`) +
      `> ${truncateForPreview(previewText).replace(/\n/g, '\n> ')}\n\nRemove it?`,
    components: [confirmRow],
  });

  const confirmClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && ['loreremove:yes', 'loreremove:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'loreremove:no') {
    const cancelMsg = confirmClick ? 'Cancelled — nothing was removed.' : 'Timed out — nothing was removed.';
    if (confirmClick) {
      await confirmClick.update({ content: cancelMsg, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    } else {
      await picker.edit({ content: cancelMsg, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }
    return;
  }

  // Re-load in case anything changed elsewhere while the mod was deliberating.
  const freshEntries = loadLore();
  const freshIndex = freshEntries.findIndex((e) => e.id === entry.id);
  if (freshIndex === -1) {
    await confirmClick.update({ content: `**${entry.name}**'s page is already gone — nothing to remove.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  let resultText;
  if (isWholeEntry) {
    freshEntries.splice(freshIndex, 1);
    resultText = `✅ Removed **${entry.name}**'s entire page from the grimoire.`;
  } else {
    const freshEntry = freshEntries[freshIndex];
    if (paragraphIndex < 0 || paragraphIndex >= freshEntry.lore.length) {
      await confirmClick.update({ content: 'That paragraph no longer exists — nothing was removed.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }
    freshEntry.lore.splice(paragraphIndex, 1);
    if (freshEntry.lore.length === 0) {
      freshEntries.splice(freshIndex, 1);
      resultText = `✅ Removed the paragraph — that was **${entry.name}**'s last one, so the whole page was removed too.`;
    } else {
      resultText = `✅ Removed one paragraph from **${entry.name}**'s page (${freshEntry.lore.length} remaining).`;
    }
  }

  saveLore(freshEntries);
  await confirmClick.update({ content: resultText, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  // Refresh the underlying !lore list embed/buttons that opened this modal in the first place.
  if (interaction.message) {
    const { embed, page: clampedPage, totalPages } = buildLoreListEmbed(page, resultText);
    await interaction.message
      .edit({ embeds: [embed], components: buildLoreListComponents(ownerId, clampedPage, totalPages, true) })
      .catch((err) => console.error('Discord API call failed (non-critical):', err));
  }
}

async function handleLoreEditModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const permError = loreModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const resolved = resolveLoreTarget(raw);
  if (resolved.index === -1) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const newName = interaction.fields.getTextInputValue('newname').trim();
  const newTitle = interaction.fields.getTextInputValue('title').trim();
  const newCategory = interaction.fields.getTextInputValue('category').trim();
  const aliasesRaw = interaction.fields.getTextInputValue('aliases').trim();

  const entries = loadLore();
  const entry = entries[resolved.index];

  // Validate everything BEFORE touching the entry so a bad field never leaves a half-applied edit.
  let normalizedCategory = null;
  if (newCategory) {
    normalizedCategory = normalizeLoreCategory(newCategory);
    if (!normalizedCategory) {
      await interaction.reply({
        content: `I don't recognise the category "${newCategory}". Use one of: ${LORE_CATEGORIES.map((c) => `**${c}**`).join(', ')}.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  const oldName = entry.name;
  let newId = null;
  if (newName && newName !== entry.name) {
    newId = newName.toLowerCase().replace(/\s+/g, '');
    const clash = entries.find(
      (e) => e !== entry && (e.id === newId || String(e.name || '').toLowerCase().replace(/\s+/g, '') === newId)
    );
    if (clash) {
      await interaction.reply({
        content: `**${clash.name}** already has a page — pick a different name, or edit that page instead.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  if (newId) {
    entry.name = newName;
    entry.id = newId;
  }
  if (newTitle === '-') delete entry.title;
  else if (newTitle) entry.title = newTitle;
  if (normalizedCategory) entry.category = normalizedCategory;
  if (aliasesRaw) {
    const aliases = parseLoreAliases(aliasesRaw);
    if (aliases.length) entry.aliases = aliases;
    else delete entry.aliases;
  }

  saveLore(entries);

  const renamed = newId ? ` (was **${oldName}**)` : '';
  const { embed, page: clampedPage, totalPages } = buildLoreListEmbed(
    lorePageOf(entry),
    `✅ Updated **${entry.name}**'s page${renamed}.`
  );
  await interaction.update({
    embeds: [embed],
    components: buildLoreListComponents(ownerId, clampedPage, totalPages, true),
  });
}

async function handleLoreAddTaleModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;
  const permError = loreModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const resolved = resolveLoreTarget(raw);
  if (resolved.index === -1) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const tale = interaction.fields.getTextInputValue('tale').trim();
  if (!tale) {
    await interaction.reply({ content: 'A tale can\'t be empty.', flags: MessageFlags.Ephemeral });
    return;
  }

  const entries = loadLore();
  const entry = entries[resolved.index];
  if (!Array.isArray(entry.lore)) entry.lore = [];
  entry.lore.push(tale);
  saveLore(entries);

  const { embed, page: clampedPage, totalPages } = buildLoreListEmbed(
    page,
    `✅ Added a new tale to **${entry.name}**'s page (${entry.lore.length} total).`
  );
  await interaction.update({
    embeds: [embed],
    components: buildLoreListComponents(ownerId, clampedPage, totalPages, true),
  });
}


// ---------- Recruit Ticket Board (!recruit / !rec) — stored in recruits.json, cached in memory ----------
//
// A running ticket list of names waiting on an invite, kept in one shared message that the whole
// Council/Emissary tier can see and maintain together — same cache-then-flush pattern as
// drinks.json/warnings.json/igns.json above. `!recruit <username>` (and its `!rec` shortcut) both
// adds the name AND posts/refreshes the paged board in the same reply. Unlike !user/!lore's
// personal "book" (buttons locked to whoever ran the command), this board's ◀ Prev / Next ▶ nav
// and Add/Remove buttons have no ownerId lock at all — any Council/Knight/Emissary/Guild Leader
// can page through or edit the SAME message, and every add/remove refreshes that one message in
// place instead of posting a new one, so the mod channel doesn't flood every time someone edits it.

const RECRUITS_FILE = path.join(__dirname, 'recruits.json');

let recruitsCache = null;
let recruitsDirty = false;

function readRecruitsFromDisk() {
  if (!fs.existsSync(RECRUITS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(RECRUITS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read recruits.json, starting fresh.', err);
    return [];
  }
}

function loadRecruits() {
  if (!recruitsCache) recruitsCache = readRecruitsFromDisk();
  return recruitsCache;
}

// No longer writes to disk immediately — just updates the cache and flags it dirty.
// flushRecruitsToDisk() (called on an interval, see bottom of file) does the actual write.
function saveRecruits(data) {
  recruitsCache = data;
  recruitsDirty = true;
}

function flushRecruitsToDisk() {
  if (!recruitsDirty || !recruitsCache) return;
  try {
    atomicWriteFileSync(RECRUITS_FILE, JSON.stringify(recruitsCache, null, 2));
    recruitsDirty = false;
  } catch (err) {
    console.error('Failed to write recruits.json:', err);
  }
}

// Who may use !recruit/!rec at all, and see/press the board's buttons — Council of the
// Council, Knight, Emissary, and the Guild Leader (same tier
// isCouncil() gates everywhere else).
function recruitControlsVisible(member) {
  return isCouncil(member);
}

// Same tradeoff as IGN_PAGE_SIZE/LORE_PAGE_SIZE above.
const RECRUIT_PAGE_SIZE = 15;

function buildRecruitListEmbed(page, note) {
  const entries = loadRecruits();
  const totalPages = Math.max(1, Math.ceil(entries.length / RECRUIT_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * RECRUIT_PAGE_SIZE;
  const pageEntries = entries.slice(start, start + RECRUIT_PAGE_SIZE);

  const listBody = entries.length === 0
    ? 'No open recruit tickets right now. Add one with `!recruit <username>` (or `!rec`), or the ➕ Add button below.'
    : pageEntries
        .map((e, i) => `\`${start + i + 1}.\` **${e.name}** — added by <@${e.addedBy}>`)
        .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x3a9d5d)
    .setTitle('📋 Recruit Ticket Board')
    .setDescription(note ? `${note}\n\n${listBody}` : listBody)
    .setFooter({ text: `Page ${clampedPage + 1} of ${totalPages} • ${entries.length} waiting` });

  return { embed, page: clampedPage, totalPages };
}

// Nav (Prev/Next) and Add/Remove are all open to anyone Council-tier looking at the message, not
// just whoever typed !recruit — this is a shared ticket board, not a personal book, so there's no
// ownerId baked into these customIds the way !user/!lore's are.
function buildRecruitListComponents(page, totalPages) {
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`recruitctl:prev:${page}`)
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`recruitctl:noop:${page}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`recruitctl:next:${page}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );

  const modRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`recruitctl:add:${page}`).setLabel('Add').setEmoji('➕').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`recruitctl:remove:${page}`).setLabel('Remove').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
  );

  return [navRow, modRow];
}

// Resolves a mod-typed target — either the ticket's number on the board (positional, 1-based, in
// storage order) or a name match — to a concrete array index. Used by the Remove modal so mods
// can grab the number off the board instead of retyping a name.
function resolveRecruitTarget(raw) {
  const trimmed = raw.trim();
  const entries = loadRecruits();

  if (/^\d+$/.test(trimmed)) {
    const index = parseInt(trimmed, 10) - 1;
    const entry = entries[index];
    if (!entry) return { index: -1, error: `There's no #${trimmed} on the board right now.` };
    return { index, entry };
  }

  const key = trimmed.toLowerCase();
  const exactIndex = entries.findIndex((e) => e.name.toLowerCase() === key);
  if (exactIndex !== -1) return { index: exactIndex, entry: entries[exactIndex] };

  const candidates = entries.filter((e) => e.name.toLowerCase().startsWith(key));
  if (candidates.length === 1) {
    return { index: entries.findIndex((e) => e.name === candidates[0].name), entry: candidates[0] };
  }
  if (candidates.length > 1) {
    return {
      index: -1,
      error: `A few names match "${raw}": ${candidates.map((c) => c.name).join(', ')}. Try being more specific, or use their number.`,
    };
  }
  return { index: -1, error: `No open ticket for **${raw}**.` };
}

// Shared permission re-check for the recruit board's modals — mirrors the button gate in case
// roles changed between the click and the submit (same idea as the IGN/Lore boards' modal checks).
function recruitModalPermissionError(interaction) {
  if (!recruitControlsVisible(interaction.member)) {
    return "You don't have permission to manage the recruit board.";
  }
  return null;
}

// Handles ◀ Prev / Next ▶ / ➕ Add / 🗑️ Remove clicks on the recruit board. Every action re-checks
// isCouncil() live (no ownerId lock) since this is a shared board any mod can operate.
async function handleRecruitListButton(interaction) {
  const [, action, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  if (!recruitControlsVisible(interaction.member)) {
    await interaction.reply({
      content: "You don't have permission to manage the recruit board.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'prev' || action === 'next') {
    const newPage = action === 'prev' ? page - 1 : page + 1;
    const { embed, page: clampedPage, totalPages } = buildRecruitListEmbed(newPage);
    await interaction.update({
      embeds: [embed],
      components: buildRecruitListComponents(clampedPage, totalPages),
    });
    return;
  }

  if (action === 'add') {
    const modal = new ModalBuilder().setCustomId(`recruitctl:addmodal:${page}`).setTitle('Add Recruit Ticket');
    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Username (plain text, no @mention)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. SomeUsername')
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
    await interaction.showModal(modal);
    return;
  }

  // remove
  const modal = new ModalBuilder().setCustomId(`recruitctl:removemodal:${page}`).setTitle('Remove Recruit Ticket');
  const targetInput = new TextInputBuilder()
    .setCustomId('target')
    .setLabel('Username or # from the board')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. 3  or  SomeUsername')
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder().addComponents(targetInput));
  await interaction.showModal(modal);
  // 'noop' (the disabled page-counter button) falls through here with nothing to do — harmless.
}

async function handleRecruitAddModal(interaction) {
  const [, , pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  const permError = recruitModalPermissionError(interaction);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const name = interaction.fields.getTextInputValue('name').trim();
  if (!name) {
    await interaction.reply({ content: 'A username is required.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (MENTION_RE.test(name)) {
    await interaction.reply({ content: 'Just the plain username, no @mention.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (/\s/.test(name)) {
    await interaction.reply({ content: 'Username needs to be a single word, no spaces.', flags: MessageFlags.Ephemeral });
    return;
  }

  const entries = loadRecruits();
  if (entries.some((e) => e.name.toLowerCase() === name.toLowerCase())) {
    await interaction.reply({ content: `**${name}** is already on the board.`, flags: MessageFlags.Ephemeral });
    return;
  }

  entries.push({ name, addedBy: interaction.user.id, addedAt: new Date().toISOString() });
  saveRecruits(entries);

  const { embed, page: clampedPage, totalPages } = buildRecruitListEmbed(page, `✅ Added **${name}** to the board.`);
  await interaction.update({
    embeds: [embed],
    components: buildRecruitListComponents(clampedPage, totalPages),
  });
}

async function handleRecruitRemoveModal(interaction) {
  const [, , pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  const permError = recruitModalPermissionError(interaction);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const resolved = resolveRecruitTarget(raw);
  if (resolved.index === -1) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const entries = loadRecruits();
  const removedName = entries[resolved.index].name;
  entries.splice(resolved.index, 1);
  saveRecruits(entries);

  const { embed, page: clampedPage, totalPages } = buildRecruitListEmbed(page, `✅ Removed **${removedName}** from the board.`);
  await interaction.update({
    embeds: [embed],
    components: buildRecruitListComponents(clampedPage, totalPages),
  });
}

// ---------- Guild settings (simple JSON file, cached in memory) ----------
//
// Currently holds one flag: whether officers (Knight) are allowed to use the channel-wide
// spell cast (`!cast #channel`), which is otherwise Council (and Guild Leader)
// only. Toggled via !enable / !disable — same cache-then-flush pattern as warnings/drinks below.

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

let settingsCache = null;
let settingsDirty = false;

function readSettingsFromDisk() {
  if (!fs.existsSync(SETTINGS_FILE)) return { officerChannelCastEnabled: false };
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read settings.json, starting fresh.', err);
    return { officerChannelCastEnabled: false };
  }
}

function loadSettings() {
  if (!settingsCache) settingsCache = readSettingsFromDisk();
  return settingsCache;
}

function saveSettings(data) {
  settingsCache = data;
  settingsDirty = true;
}

function flushSettingsToDisk() {
  if (!settingsDirty || !settingsCache) return;
  try {
    atomicWriteFileSync(SETTINGS_FILE, JSON.stringify(settingsCache, null, 2));
    settingsDirty = false;
  } catch (err) {
    console.error('Failed to write settings.json:', err);
  }
}

// ---------- Member IGN directory (!user / !name) — simple JSON file, cached in memory ----------
//
// Mod-maintained lookup of a plain-text name -> in-game username (IGN). Deliberately NOT tied to
// Discord member IDs/mentions — mods type whatever name someone's known by, so it still works for
// members who've left the server or whose Discord nickname doesn't match their in-game name.
// Keyed by the name lowercased (single word, no spaces); original casing is kept for display.
// Same cache-then-flush pattern as settings/warnings/drinks below.

const IGNS_FILE = path.join(__dirname, 'igns.json');

let ignsCache = null;
let ignsDirty = false;

function readIgnsFromDisk() {
  if (!fs.existsSync(IGNS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(IGNS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read igns.json, starting fresh.', err);
    return {};
  }
}

function loadIgns() {
  if (!ignsCache) ignsCache = readIgnsFromDisk();
  return ignsCache;
}

function saveIgns(data) {
  ignsCache = data;
  ignsDirty = true;
}

function flushIgnsToDisk() {
  if (!ignsDirty || !ignsCache) return;
  try {
    atomicWriteFileSync(IGNS_FILE, JSON.stringify(ignsCache, null, 2));
    ignsDirty = false;
  } catch (err) {
    console.error('Failed to write igns.json:', err);
  }
}

// ---------- IGN directory "book" UI (!user / !name list) ----------
//
// Same paged-book idea as !menu (buildMenuPages/buildMenuComponents above) and the same
// edit-the-one-message-in-place idea as the Party Up! "Server" modal — Prev/Next flip pages,
// Search opens a modal, and submitting it swaps the same message over to show that one result
// instead of posting a new message. customIds carry the owner ID + current page, so no
// server-side session state is needed to handle clicks — igns.json is re-read fresh each time.

const IGN_PAGE_SIZE = 15;

function sortedIgnEntries() {
  return Object.values(loadIgns()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildIgnListEmbed(page, note) {
  const entries = sortedIgnEntries();
  const totalPages = Math.max(1, Math.ceil(entries.length / IGN_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * IGN_PAGE_SIZE;
  const pageEntries = entries.slice(start, start + IGN_PAGE_SIZE);

  // Numbers are positional (1-based) in the same alphabetical order the book displays, so mods
  // can reference "#7" instead of typing a name — same tradeoff the Party Up! kick modal already
  // makes with roster numbers. They can shift if entries are added/removed between lookups.
  const listBody = entries.length === 0
    ? 'No IGNs on file yet. Mods can add one with the ➕ Add button below (or `!user add <name> <username>`).'
    : '`Discord Username` — In-Game Username\n\n' +
      pageEntries.map((e, i) => `\`${start + i + 1}.\` **${e.name}** — ${e.ign}`).join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle('🧾 Member IGN Directory')
    .setDescription(note ? `${note}\n\n${listBody}` : listBody)
    .setFooter({ text: `Page ${clampedPage + 1} of ${totalPages} • ${entries.length} on file` });

  return { embed, page: clampedPage, totalPages };
}

// Mod add/remove/edit controls only show up for Council/Knight. Unlike the rest of the
// Moderation menu, this is intentionally allowed in the Tavern and at the Bartop too — mods
// asked to be able to maintain the IGN directory from those channels, not just elsewhere.
function ignModControlsVisible(member) {
  return isCouncil(member);
}

function buildIgnListComponents(ownerId, page, totalPages, showModControls) {
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`userlist:prev:${ownerId}:${page}`)
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 0),
    new ButtonBuilder()
      .setCustomId(`userlist:noop:${ownerId}:${page}`)
      .setLabel(`${page + 1} / ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`userlist:next:${ownerId}:${page}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages - 1)
  );
  const searchRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`userlist:search:${ownerId}:${page}`)
      .setLabel('Search')
      .setEmoji('🔎')
      .setStyle(ButtonStyle.Primary)
  );

  const rows = [navRow, searchRow];

  if (showModControls) {
    const modRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`userlist:modadd:${ownerId}:${page}`)
        .setLabel('Add')
        .setEmoji('➕')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`userlist:modremove:${ownerId}:${page}`)
        .setLabel('Remove')
        .setEmoji('🗑️')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`userlist:modedit:${ownerId}:${page}`)
        .setLabel('Edit')
        .setEmoji('✏️')
        .setStyle(ButtonStyle.Primary)
    );
    rows.push(modRow);
  }

  return rows;
}

// Resolves a mod-typed target — either the entry's number from the book (positional, 1-based,
// same order as displayed) or its name — to a concrete storage key + entry. Used by remove/edit
// so mods can grab the number off the list instead of retyping a name.
function resolveIgnTarget(raw) {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const entries = sortedIgnEntries();
    const entry = entries[parseInt(trimmed, 10) - 1];
    if (!entry) return { key: null, error: `There's no #${trimmed} on the list right now.` };
    return { key: entry.name.toLowerCase(), entry };
  }

  const key = trimmed.toLowerCase();
  const igns = loadIgns();
  if (igns[key]) return { key, entry: igns[key] };

  const candidates = Object.entries(igns).filter(([, e]) => e.name.toLowerCase().startsWith(key));
  if (candidates.length === 1) return { key: candidates[0][0], entry: candidates[0][1] };
  if (candidates.length > 1) {
    return {
      key: null,
      error: `A few names match "${raw}": ${candidates.map(([, e]) => `**${e.name}**`).join(', ')}. Try being more specific, or use their number.`,
    };
  }
  return { key: null, error: `No entry for **${raw}** on file.` };
}

// Looks up a single query the same way the plain `!user <name>` text command does (exact match,
// falling back to an unambiguous prefix match) and renders it as one line for the search-result view.
function ignSearchResultLine(query) {
  const igns = loadIgns();
  const key = query.toLowerCase().replace(/\s+/g, '');
  const exact = igns[key];
  if (exact) return `**${exact.name}** — ${exact.ign}`;

  const candidates = Object.values(igns).filter((e) => e.name.toLowerCase().startsWith(key));
  if (candidates.length === 1) return `**${candidates[0].name}** — ${candidates[0].ign}`;
  if (candidates.length > 1) {
    return `A few names match "${query}": ${candidates.map((e) => `**${e.name}**`).join(', ')}. Try being more specific.`;
  }
  return `No IGN on file for **${query}**.`;
}

function buildIgnSearchResultEmbed(query) {
  return new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle('🧾 Member IGN Directory — Search')
    .setDescription(`\`Discord Username\` — In-Game Username\n\n${ignSearchResultLine(query)}`)
    .setFooter({ text: 'Search again, or head back to the full list' });
}

function buildIgnSearchComponents(ownerId, returnPage) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`userlist:back:${ownerId}:${returnPage}`)
      .setLabel('Back to List')
      .setEmoji('🔙')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`userlist:search:${ownerId}:${returnPage}`)
      .setLabel('Search Again')
      .setEmoji('🔎')
      .setStyle(ButtonStyle.Primary)
  );
  return [row];
}

// Handles Prev / Next / Search / Back clicks on the !user list book. Only the traveller who ran
// the command can flip their own copy — same ownership rule as the !menu book above.
async function handleIgnListButton(interaction) {
  const [, action, ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'This isn\'t your copy of the directory — run `!user` (or `!name`) to get your own.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (action === 'search') {
    const modal = new ModalBuilder()
      .setCustomId(`userlist:searchmodal:${ownerId}:${page}`)
      .setTitle('Search IGN Directory');

    const nameInput = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Name to look up')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Reng')
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
    await interaction.showModal(modal);
    return;
  }

  if (action === 'back') {
    const { embed, page: clampedPage, totalPages } = buildIgnListEmbed(page);
    const showModControls = ignModControlsVisible(interaction.member);
    await interaction.update({
      embeds: [embed],
      components: buildIgnListComponents(ownerId, clampedPage, totalPages, showModControls),
    });
    return;
  }

  if (action === 'prev' || action === 'next') {
    const newPage = action === 'prev' ? page - 1 : page + 1;
    const { embed, page: clampedPage, totalPages } = buildIgnListEmbed(newPage);
    const showModControls = ignModControlsVisible(interaction.member);
    await interaction.update({
      embeds: [embed],
      components: buildIgnListComponents(ownerId, clampedPage, totalPages, showModControls),
    });
    return;
  }

  if (action === 'modadd' || action === 'modremove' || action === 'modedit') {
    if (!ignModControlsVisible(interaction.member)) {
      await interaction.reply({
        content: "You don't have permission to manage the IGN directory here.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (action === 'modadd') {
      const modal = new ModalBuilder()
        .setCustomId(`userlist:addmodal:${ownerId}:${page}`)
        .setTitle('Add IGN Entry');
      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Discord Username (single word, no spaces)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const usernameInput = new TextInputBuilder()
        .setCustomId('username')
        .setLabel('In-Game Username')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(usernameInput)
      );
      await interaction.showModal(modal);
      return;
    }

    if (action === 'modremove') {
      const modal = new ModalBuilder()
        .setCustomId(`userlist:removemodal:${ownerId}:${page}`)
        .setTitle('Remove IGN Entry');
      const targetInput = new TextInputBuilder()
        .setCustomId('target')
        .setLabel('Name or # from the list')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(targetInput));
      await interaction.showModal(modal);
      return;
    }

    // modedit
    const modal = new ModalBuilder()
      .setCustomId(`userlist:editmodal:${ownerId}:${page}`)
      .setTitle('Edit IGN Entry');
    const targetInput = new TextInputBuilder()
      .setCustomId('target')
      .setLabel('Name or # from the list')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const usernameInput = new TextInputBuilder()
      .setCustomId('username')
      .setLabel('New In-Game Username')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    modal.addComponents(
      new ActionRowBuilder().addComponents(targetInput),
      new ActionRowBuilder().addComponents(usernameInput)
    );
    await interaction.showModal(modal);
    return;
  }

  // 'noop' (the disabled page-counter button) — nothing to do.
}

// Handles the name submitted from the Search modal — swaps the same book message over to a
// single search-result view, same "edit this one message in place" idea as the Party Up!
// server modal.
async function handleIgnSearchModal(interaction) {
  const [, , ownerId, returnPageStr] = interaction.customId.split(':');
  const returnPage = parseInt(returnPageStr, 10) || 0;

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'This isn\'t your copy of the directory — run `!user` (or `!name`) to get your own.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const query = interaction.fields.getTextInputValue('name').trim();
  if (!query) {
    await interaction.reply({ content: 'You need to actually type a name to search for.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.update({
    embeds: [buildIgnSearchResultEmbed(query)],
    components: buildIgnSearchComponents(ownerId, returnPage),
  });
}

// Shared permission re-check for the three mod modals below — the buttons that open them are
// already gated by ignModControlsVisible, but roles/channel could theoretically change between
// the click and the submit, so this mirrors how handlePartyServerModal re-checks the leader.
function ignModalPermissionError(interaction, ownerId) {
  if (interaction.user.id !== ownerId) {
    return 'This isn\'t your copy of the directory — run `!user` (or `!name`) to get your own.';
  }
  if (!ignModControlsVisible(interaction.member)) {
    return "You don't have permission to manage the IGN directory here.";
  }
  return null;
}

async function handleIgnAddModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  const permError = ignModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const name = interaction.fields.getTextInputValue('name').trim();
  const username = interaction.fields.getTextInputValue('username').trim();
  if (!name || !username) {
    await interaction.reply({ content: 'Both a name and a username are required.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (/\s/.test(name)) {
    await interaction.reply({ content: 'Name needs to be a single word, no spaces.', flags: MessageFlags.Ephemeral });
    return;
  }

  const igns = loadIgns();
  const key = name.toLowerCase();
  if (igns[key]) {
    await interaction.reply({
      content: `**${igns[key].name}** is already on file with IGN **${igns[key].ign}** — use Edit instead.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  igns[key] = { name, ign: username, addedBy: interaction.user.tag, updatedAt: new Date().toISOString() };
  saveIgns(igns);

  const { embed, page: clampedPage, totalPages } = buildIgnListEmbed(page, `✅ Added **${name}** — ${username}.`);
  await interaction.update({
    embeds: [embed],
    components: buildIgnListComponents(ownerId, clampedPage, totalPages, true),
  });
}

async function handleIgnRemoveModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  const permError = ignModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const resolved = resolveIgnTarget(raw);
  if (!resolved.key) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const igns = loadIgns();
  const removedName = igns[resolved.key].name;
  delete igns[resolved.key];
  saveIgns(igns);

  const { embed, page: clampedPage, totalPages } = buildIgnListEmbed(page, `✅ Removed **${removedName}**.`);
  await interaction.update({
    embeds: [embed],
    components: buildIgnListComponents(ownerId, clampedPage, totalPages, true),
  });
}

async function handleIgnEditModal(interaction) {
  const [, , ownerId, pageStr] = interaction.customId.split(':');
  const page = parseInt(pageStr, 10) || 0;

  const permError = ignModalPermissionError(interaction, ownerId);
  if (permError) {
    await interaction.reply({ content: permError, flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  const username = interaction.fields.getTextInputValue('username').trim();
  if (!username) {
    await interaction.reply({ content: 'You need to type the new username.', flags: MessageFlags.Ephemeral });
    return;
  }

  const resolved = resolveIgnTarget(raw);
  if (!resolved.key) {
    await interaction.reply({ content: resolved.error, flags: MessageFlags.Ephemeral });
    return;
  }

  const igns = loadIgns();
  const displayName = igns[resolved.key].name;
  igns[resolved.key] = {
    ...igns[resolved.key],
    ign: username,
    addedBy: interaction.user.tag,
    updatedAt: new Date().toISOString(),
  };
  saveIgns(igns);

  const { embed, page: clampedPage, totalPages } = buildIgnListEmbed(page, `✅ Updated **${displayName}** — now ${username}.`);
  await interaction.update({
    embeds: [embed],
    components: buildIgnListComponents(ownerId, clampedPage, totalPages, true),
  });
}

// ---------- Warning storage (simple JSON file, cached in memory) ----------
//
// !warn is Council-only and low-frequency, but we cache it the same way as the drinks store
// below for consistency — one read at startup, writes batched instead of hitting disk every call.

const WARNINGS_FILE = path.join(__dirname, 'warnings.json');

let warningsCache = null;
let warningsDirty = false;

function readWarningsFromDisk() {
  if (!fs.existsSync(WARNINGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read warnings.json, starting fresh.', err);
    return {};
  }
}

function loadWarnings() {
  if (!warningsCache) warningsCache = readWarningsFromDisk();
  return warningsCache;
}

function saveWarnings(data) {
  warningsCache = data;
  warningsDirty = true;
}

function flushWarningsToDisk() {
  if (!warningsDirty || !warningsCache) return;
  try {
    atomicWriteFileSync(WARNINGS_FILE, JSON.stringify(warningsCache, null, 2));
    warningsDirty = false;
  } catch (err) {
    console.error('Failed to write warnings.json:', err);
  }
}

// Sweeps every stored warning once an hour and quietly wipes any that have passed
// WARNING_EXPIRY_MS (30 days) since they were issued. A user's warning *count* (and therefore
// which WARNING_TIERS penalty they're currently sitting at) is just warnings[userId].length, so
// removing an old entry here naturally "de-escalates" them the same way !warn remove would.
// Each user who loses at least one warning this sweep gets a single announcement (grouped, not
// one message per expired warning) — publicly in the tavern (anonymous, same as a normal warning
// post) and in full detail (with reasons/dates) in the secret grimoire log.
async function sweepExpiredWarnings() {
  const warnings = loadWarnings();
  const now = Date.now();
  const clearedByUser = new Map(); // userId -> array of expired warning entries

  for (const [userId, entries] of Object.entries(warnings)) {
    if (!Array.isArray(entries) || entries.length === 0) continue;
    const stillActive = [];
    const expired = [];
    for (const entry of entries) {
      const age = now - (entry?.timestamp || 0);
      if (age >= WARNING_EXPIRY_MS) expired.push(entry);
      else stillActive.push(entry);
    }
    if (expired.length === 0) continue;
    if (stillActive.length > 0) warnings[userId] = stillActive;
    else delete warnings[userId];
    clearedByUser.set(userId, expired);
  }

  if (clearedByUser.size === 0) return;
  saveWarnings(warnings);
  flushWarningsToDisk();

  const tavern = await client.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  const grimoire = await client.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);

  for (const [userId, expired] of clearedByUser.entries()) {
    const remaining = warnings[userId]?.length || 0;
    if (tavern) {
      tavern.send({
        content: `<@${userId}>`,
        embeds: [
          new EmbedBuilder()
            .setColor(0x77dd77)
            .setDescription(
              `The dust settles and an old slate gets wiped clean, nya. **${expired.length}** warning${expired.length > 1 ? 's' : ''} `
              + `against <@${userId}> ${expired.length > 1 ? 'have' : 'has'} expired after 30 days.`
            )
            .setFooter({ text: `Warnings remaining: ${remaining}/${MAX_DEFINED_WARNING_TIER}` }),
        ],
        allowedMentions: { users: [userId] },
      }).catch((err) => console.error('Failed to announce expired warning(s):', err));
    }
    if (grimoire) {
      const lines = expired.map((e) => `• *${e.reason}* — warned by ${e.moderator || 'unknown'} on <t:${Math.floor((e.timestamp || 0) / 1000)}:D>`).join('\n');
      grimoire.send(`⌛ **${expired.length}** warning${expired.length > 1 ? 's' : ''} for <@${userId}> auto-expired (30 days old):\n${lines}\nRemaining: ${remaining}`)
        .catch((err) => console.error('Failed to log expired warning(s) to grimoire:', err));
    }
  }
}

setInterval(() => {
  sweepExpiredWarnings().catch((err) => console.error('Warning expiry sweep failed:', err));
}, 60 * 60 * 1000);

// ---------- Member activity tracker (inactivity detection) ----------
//
// Tracks the last time every member sent a message, across every channel handleMessageCreate sees
// (i.e. anywhere the bot has access, subject to the same bot-account/DM filtering already applied
// there). Cached in memory and flushed on the same timer as warnings/drinks/etc — see recordActivity.
//
// An hourly sweep (sweepInactiveMembers) flags anyone who's passed ACTIVITY_INACTIVE_MS (30 days)
// since their last tracked message and hasn't already been flagged, posting ONE notice per member
// (not one per sweep) to MODERATION_PRIVATE_CHANNEL_ID (bold name + username + avatar, no role
// pings). The `flagged` bit only clears when that member posts again (recordActivity), so someone
// who stays silent doesn't get re-announced every hour — but a fresh 30-day countdown starts the
// moment they're flagged again after posting.
//
// IMPORTANT CAVEAT: this can only track activity from the moment this code goes live onward — it
// has no way to know anyone's last message from before today. A member who simply never posts after
// deploy will NOT be auto-flagged (there's no entry for them to sweep), not because they're active,
// but because there's nothing on file yet. Treat "not in activity.json" as "unknown", not "active" —
// worth cross-checking against the member list manually until everyone's posted at least once.
const ACTIVITY_FILE = path.join(__dirname, 'activity.json');
const ACTIVITY_INACTIVE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let activityCache = null;
let activityDirty = false;

function readActivityFromDisk() {
  if (!fs.existsSync(ACTIVITY_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(ACTIVITY_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read activity.json, starting fresh.', err);
    return {};
  }
}

function loadActivity() {
  if (!activityCache) activityCache = readActivityFromDisk();
  return activityCache;
}

function saveActivity(data) {
  activityCache = data;
  activityDirty = true;
}

function flushActivityToDisk() {
  if (!activityDirty || !activityCache) return;
  try {
    atomicWriteFileSync(ACTIVITY_FILE, JSON.stringify(activityCache, null, 2));
    activityDirty = false;
  } catch (err) {
    console.error('Failed to write activity.json:', err);
  }
}

// Called from handleMessageCreate for every non-bot guild message. Clearing `flagged` here means a
// member who was called out and then comes back gets a clean slate for the next 30-day window,
// instead of silently staying marked as already-flagged forever.
function recordActivity(userId) {
  const activity = loadActivity();
  activity[userId] = { lastActive: Date.now(), flagged: false };
  saveActivity(activity);
}

async function sweepInactiveMembers() {
  const activity = loadActivity();
  const now = Date.now();
  const newlyFlagged = [];

  for (const [userId, entry] of Object.entries(activity)) {
    if (!entry || entry.flagged) continue;
    const age = now - (entry.lastActive || 0);
    if (age >= ACTIVITY_INACTIVE_MS) {
      entry.flagged = true;
      newlyFlagged.push({ userId, lastActive: entry.lastActive });
    }
  }

  if (newlyFlagged.length === 0) return;
  saveActivity(activity);
  flushActivityToDisk();

  const modChannel = await client.channels.fetch(MODERATION_PRIVATE_CHANNEL_ID).catch(() => null);
  if (!modChannel) {
    console.error('Inactivity sweep: could not reach MODERATION_PRIVATE_CHANNEL_ID.');
    return;
  }

  for (const { userId, lastActive } of newlyFlagged) {
    const member = await modChannel.guild.members.fetch(userId).catch(() => null);
    const user = member ? member.user : await client.users.fetch(userId).catch(() => null);
    const displayName = member ? member.displayName : (user ? user.username : 'Unknown member');
    const username = user ? user.username : 'unknown';
    const daysInactive = Math.floor((now - lastActive) / (24 * 60 * 60 * 1000));

    const embed = new EmbedBuilder()
      .setColor(0xaaaaaa)
      .setTitle('🕸️ Member gone quiet')
      .setDescription(`**${displayName}** (**@${username}**) has been inactive for **${daysInactive} days** — no tracked messages since then.`)
      .setFooter({ text: `Last seen: ${lastActive ? new Date(lastActive).toLocaleDateString() : 'unknown'}` });

    const avatarURL = member ? member.displayAvatarURL({ size: 256 }) : (user ? user.displayAvatarURL({ size: 256 }) : null);
    if (avatarURL) embed.setThumbnail(avatarURL);

    // No role pings — just the embed. allowedMentions is emptied so nothing can notify anyone.
    modChannel.send({
      embeds: [embed],
      allowedMentions: { parse: [] },
    }).catch((err) => console.error('Failed to post inactivity notice:', err));
  }
}

setInterval(() => {
  sweepInactiveMembers().catch((err) => console.error('Inactivity sweep failed:', err));
}, 24 * 60 * 60 * 1000);

// ---- !activity — paginated "who's been active" book (Council/Knight/Emissary/Guild Leader) ----
//
// Reads the same activity.json data the inactivity sweep uses (see recordActivity above), but
// shows it directly instead of only alerting once someone crosses the 30-day threshold. Every
// non-bot guild member is listed, most-recently-active first; anyone with no entry on file at all
// (see the IMPORTANT CAVEAT above sweepInactiveMembers — untracked, not necessarily inactive)
// sinks to the bottom shown as "No tracked messages" rather than a misleading date. Already-flagged
// members (past 30 days quiet, per sweepInactiveMembers) get a 🕸️ marker so mods don't have to
// cross-reference the sweep notices by hand.
const ACTIVITY_LIST_PAGE_SIZE = 15;

async function buildActivityRows(guild) {
  const activity = loadActivity();
  const members = await guild.members.fetch();

  return members
    .filter((m) => !m.user.bot)
    .map((m) => {
      const entry = activity[m.id];
      return {
        id: m.id,
        label: m.displayName || m.user.username,
        lastActive: entry ? entry.lastActive || 0 : 0,
        tracked: Boolean(entry),
        flagged: Boolean(entry && entry.flagged),
      };
    })
    // Most recently active first; untracked members (lastActive 0) naturally fall to the bottom.
    .sort((a, b) => b.lastActive - a.lastActive);
}

function buildActivityListPage(rows, page) {
  const totalPages = Math.max(1, Math.ceil(rows.length / ACTIVITY_LIST_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * ACTIVITY_LIST_PAGE_SIZE;
  const pageRows = rows.slice(start, start + ACTIVITY_LIST_PAGE_SIZE);

  const lines = pageRows.map((r, i) => {
    const when = r.tracked ? new Date(r.lastActive).toLocaleDateString() : 'No tracked messages';
    const flag = r.flagged ? ' 🕸️' : '';
    return `**${start + i + 1}.** ${r.label} — ${when}${flag}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x556b2f)
    .setTitle('📅 Member Activity')
    .setDescription(lines.join('\n') || 'No members to show.')
    .setFooter({
      text: `Page ${clampedPage + 1}/${totalPages} • ${rows.length} member${rows.length === 1 ? '' : 's'} • 🕸️ = flagged inactive (30+ days quiet)`,
    });

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('activitylist:prev').setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(clampedPage === 0),
    new ButtonBuilder().setCustomId('activitylist:next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(clampedPage >= totalPages - 1)
  );

  return { embed, navRow, totalPages, page: clampedPage };
}

async function runActivityCommand(message) {
  const rows = await buildActivityRows(message.guild);
  let page = 0;
  let { embed, navRow, totalPages } = buildActivityListPage(rows, page);

  const sent = await message.reply({
    embeds: [embed],
    components: totalPages > 1 ? [navRow] : [],
    allowedMentions: { repliedUser: false },
  }).catch((err) => {
    console.error('Discord API call failed (non-critical):', err);
    return null;
  });
  if (!sent || totalPages <= 1) return;

  // Only the mod who ran the command can page through it; a 2 min idle timeout then clears the
  // buttons, matching the !warn history book's behavior.
  while (true) {
    const navClick = await sent
      .awaitMessageComponent({
        filter: (i) => i.user.id === message.author.id && ['activitylist:prev', 'activitylist:next'].includes(i.customId),
        time: 120000,
      })
      .catch(() => null);

    if (!navClick) {
      await sent.edit({ components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    await navClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
    page = navClick.customId === 'activitylist:prev' ? Math.max(0, page - 1) : Math.min(totalPages - 1, page + 1);

    ({ embed, navRow, totalPages } = buildActivityListPage(rows, page));
    await sent.edit({ embeds: [embed], components: [navRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }
}

// ---- !guild — browse guild members by role (Council/Knight/Emissary/Guild Leader) ----
//
// Same idea as Discord's own "members by role" view, but inside the bot: pick a role from a
// dropdown (pulled live from the server, highest role first, with a member count) and the bot
// lists everyone holding it as a paged book. Fully STATELESS, like the !menu book: the owner's ID,
// the role, and the target page are baked into each button/dropdown customId and handled by the
// global interactionCreate listener (handleGuildInteraction). There is no idle timer that strips
// the buttons and the controls keep working after a bot restart. Only the mod who ran the command
// can use them. Members are listed as plain text (never pinged).
const GUILD_ROLES_PER_PAGE = 24;   // +1 "everyone" option = Discord's 25-option select limit
const GUILD_MEMBERS_PER_PAGE = 20;

function buildGuildRoleList(guild) {
  return [...guild.roles.cache.values()]
    .filter((r) => r.id !== guild.id && !r.managed)
    .sort((a, b) => b.position - a.position);
}

function buildGuildRolesView(guild, roles, rolePage, totalMembers, ownerId) {
  const totalPages = Math.max(1, Math.ceil(roles.length / GUILD_ROLES_PER_PAGE));
  const page = Math.min(Math.max(rolePage, 0), totalPages - 1);
  const slice = roles.slice(page * GUILD_ROLES_PER_PAGE, (page + 1) * GUILD_ROLES_PER_PAGE);

  const options = [
    { label: 'Everyone (all members)', description: `${totalMembers} members`, value: 'all', emoji: '🗺️' },
    ...slice.map((r) => ({
      label: r.name.slice(0, 100),
      description: `${r.members.size} member${r.members.size === 1 ? '' : 's'}`,
      value: r.id,
    })),
  ];

  const embed = new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle('🏰 The Guild Roll')
    .setDescription(
      'Pick a role from the dropdown to see everyone who holds it.\n' +
      `-# ${guild.name} — ${totalMembers} members, ${roles.length} roles` +
      (totalPages > 1 ? ` (role page ${page + 1}/${totalPages})` : '')
    );

  const rows = [
    new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`guildlist:role:${ownerId}`)
        .setPlaceholder('Choose a role...')
        .addOptions(options)
    ),
    // Always shown (greyed out when there's only one page). The :prev/:next suffix keeps the two
    // customIds distinct even when both point at the same page — Discord rejects duplicates.
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`guildlist:rpage:${ownerId}:${Math.max(0, page - 1)}:prev`).setLabel('◀ Prev roles').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
      new ButtonBuilder().setCustomId(`guildlist:rnoop:${ownerId}`).setLabel(`Roles ${page + 1} / ${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId(`guildlist:rpage:${ownerId}:${Math.min(totalPages - 1, page + 1)}:next`).setLabel('Next roles ▶').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1)
    ),
  ];
  return { embed, rows, page };
}

function buildGuildMembersView(title, members, memberPage, ownerId, roleKey) {
  const sorted = [...members].sort((a, b) =>
    (a.displayName || a.user.username).localeCompare(b.displayName || b.user.username, undefined, { sensitivity: 'base' })
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / GUILD_MEMBERS_PER_PAGE));
  const page = Math.min(Math.max(memberPage, 0), totalPages - 1);
  const start = page * GUILD_MEMBERS_PER_PAGE;
  const slice = sorted.slice(start, start + GUILD_MEMBERS_PER_PAGE);

  const lines = slice.map((m, i) => {
    const display = m.displayName || m.user.username;
    const uname = m.user.username !== display ? ` (${m.user.username})` : '';
    return `**${start + i + 1}.** ${m.user.bot ? '🤖 ' : ''}${display}${uname}`.slice(0, 150);
  });

  const embed = new EmbedBuilder()
    .setColor(0x8b4513)
    .setTitle(`🏰 ${title}`.slice(0, 256))
    .setDescription(lines.length ? lines.join('\n') : '*Nobody holds this role.*')
    .setFooter({ text: `${sorted.length} member${sorted.length === 1 ? '' : 's'} — page ${page + 1} of ${totalPages}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`guildlist:mpage:${ownerId}:${roleKey}:${Math.max(0, page - 1)}:prev`).setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
    new ButtonBuilder().setCustomId(`guildlist:mnoop:${ownerId}`).setLabel(`Page ${page + 1} / ${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId(`guildlist:mpage:${ownerId}:${roleKey}:${Math.min(totalPages - 1, page + 1)}:next`).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1),
    new ButtonBuilder().setCustomId(`guildlist:back:${ownerId}`).setLabel('Back to roles').setEmoji('↩️').setStyle(ButtonStyle.Primary)
  );
  return { embed, rows: [row], page };
}

// Resolves "!guild <text>" to a role: a role mention/ID, "all"/"everyone", or a role name
// (exact match first, then starts-with, then contains). Returns { role | all | matches | none }.
function resolveGuildQuery(guild, roles, query) {
  const q = query.trim();
  if (/^(all|everyone)$/i.test(q)) return { all: true };

  const idMatch = q.match(/^<@&(\d+)>$/) || q.match(/^(\d{15,20})$/);
  if (idMatch) {
    const role = guild.roles.cache.get(idMatch[1]);
    return role && role.id !== guild.id ? { role } : { none: true };
  }

  const lower = q.toLowerCase();
  const exact = roles.filter((r) => r.name.toLowerCase() === lower);
  if (exact.length === 1) return { role: exact[0] };
  if (exact.length > 1) return { matches: exact };
  const starts = roles.filter((r) => r.name.toLowerCase().startsWith(lower));
  if (starts.length === 1) return { role: starts[0] };
  if (starts.length > 1) return { matches: starts };
  const contains = roles.filter((r) => r.name.toLowerCase().includes(lower));
  if (contains.length === 1) return { role: contains[0] };
  if (contains.length > 1) return { matches: contains };
  return { none: true };
}

// Reuse the cache when it already holds everyone — avoids hammering Discord's member-chunk
// rate limit if mods click around or run !guild repeatedly.
async function getGuildMemberCollection(guild) {
  const cacheComplete = guild.memberCount > 0 && guild.members.cache.size >= guild.memberCount;
  if (cacheComplete) return guild.members.cache;
  return guild.members.fetch().catch((err) => {
    console.error('!guild: failed to fetch members:', err);
    return null;
  });
}

// Builds the { embeds, components } payload for either screen. state is
// { view: 'roles', page } or { view: 'members', roleKey: 'all' | <roleId>, page }.
// Returns null if the requested role no longer exists.
function renderGuildView(guild, allMembers, ownerId, state) {
  const roles = buildGuildRoleList(guild);
  if (state.view === 'members') {
    let title;
    let members;
    if (state.roleKey === 'all') {
      title = 'Everyone';
      members = [...allMembers.values()];
    } else {
      const role = guild.roles.cache.get(state.roleKey);
      if (!role) return null;
      title = role.name;
      members = [...role.members.values()];
    }
    const v = buildGuildMembersView(title, members, state.page, ownerId, state.roleKey);
    return { embeds: [v.embed], components: v.rows };
  }
  const v = buildGuildRolesView(guild, roles, state.page, allMembers.size, ownerId);
  return { embeds: [v.embed], components: v.rows };
}

async function runGuildCommand(message, query = '') {
  const guild = message.guild;
  const allMembers = await getGuildMemberCollection(guild);
  if (!allMembers) {
    message.reply({ content: "The Tavernkeep couldn't open the guild roll right now — try again in a moment.", allowedMentions: { repliedUser: false } });
    return;
  }

  let state = { view: 'roles', page: 0 };

  // "!guild <role>" skips the dropdown and opens that role's member list directly.
  if (query) {
    const found = resolveGuildQuery(guild, buildGuildRoleList(guild), query);
    if (found.matches) {
      const names = found.matches.slice(0, 10).map((r) => `**${r.name}**`).join(', ');
      message.reply({
        content: `That matches more than one role (${names}${found.matches.length > 10 ? ', …' : ''}) — be more specific, or just type \`!guild\` and pick from the dropdown.`,
        allowedMentions: { repliedUser: false, parse: [] },
      });
      return;
    }
    if (found.none) {
      message.reply({
        content: "I couldn't find a role by that name — type `!guild` on its own to pick from the dropdown.",
        allowedMentions: { repliedUser: false, parse: [] },
      });
      return;
    }
    state = { view: 'members', roleKey: found.all ? 'all' : found.role.id, page: 0 };
  }

  const payload = renderGuildView(guild, allMembers, message.author.id, state);
  await message.reply({ ...payload, allowedMentions: { repliedUser: false } })
    .catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Handles every guildlist:* button and the role dropdown. customId shapes:
//   guildlist:role:<owner>                       (select — value is 'all' or a role ID)
//   guildlist:rpage:<owner>:<page>:<prev|next>   (role dropdown paging)
//   guildlist:mpage:<owner>:<roleKey>:<page>:<prev|next>  (member list paging)
//   guildlist:back:<owner>                       (member list -> role dropdown)
//   guildlist:rnoop / mnoop:<owner>              (disabled page counters)
async function handleGuildInteraction(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const ownerId = parts[2];

  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: "This guild roll isn't yours to flip through — run `!guild` to get your own copy.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  // Re-checked on every click in case the mod lost their role since running the command.
  if (!isCouncil(interaction.member)) {
    await interaction.reply({ content: "You no longer have permission to browse the guild roll.", flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferUpdate();
  if (action === 'rnoop' || action === 'mnoop') return;

  const allMembers = await getGuildMemberCollection(interaction.guild);
  if (!allMembers) {
    await interaction.followUp({ content: "Couldn't load the member list right now — try again in a moment.", flags: MessageFlags.Ephemeral });
    return;
  }

  let state;
  if (action === 'role') {
    state = { view: 'members', roleKey: interaction.values[0], page: 0 };
  } else if (action === 'rpage') {
    state = { view: 'roles', page: Number(parts[3]) || 0 };
  } else if (action === 'mpage') {
    state = { view: 'members', roleKey: parts[3], page: Number(parts[4]) || 0 };
  } else if (action === 'back') {
    state = { view: 'roles', page: 0 };
  } else {
    return;
  }

  // If the role was deleted since the card was posted, fall back to the role dropdown.
  const payload =
    renderGuildView(interaction.guild, allMembers, ownerId, state) ||
    renderGuildView(interaction.guild, allMembers, ownerId, { view: 'roles', page: 0 });
  await interaction.editReply(payload);
}

// ---- !vote — quick mod-channel vote prompt (Council/Knight/Emissary/Guild Leader) ----
//
// Deliberately the simplest possible flow: no vote-tracking, no storage, no counting, nothing
// written to disk or memory beyond the single Discord message itself. `!vote` in a mod channel or
// the Tavern posts a one-button prompt; clicking it opens a modal for the reason; submitting turns
// that same message into the final vote card (reason bolded so it's easy to spot) and seeds
// ✅/❌ reactions on it. From that point on the bot does nothing else with it — it's just a
// message sitting in the channel that people react to by hand, same as manually posting something
// and reacting to your own message. Compare this to !game's vote system (buildVoteEmbed/voteStore
// above), which DOES track selections/counts/finish state — !vote is intentionally the
// lightweight, un-tracked alternative for quick calls.
async function handleVoteCommand(message) {
  const allowedChannelIds = [...MOD_PRIVATE_CHANNEL_IDS, TAVERN_CHANNEL_ID];
  if (!allowedChannelIds.includes(message.channel.id)) {
    message.reply({
      content: '🗳️ `!vote` only works in the mod channels or the Tavern.',
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  const promptRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`modvote:reason:${message.author.id}`)
      .setLabel('📝 Enter reason')
      .setStyle(ButtonStyle.Primary)
  );

  await message.reply({
    content: '🗳️ Preparing a vote — click below to enter what it\'s for.',
    components: [promptRow],
    allowedMentions: { repliedUser: false },
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Only the mod who ran !vote can fill in the prompt they started.
async function handleModVotePromptButton(interaction) {
  const [, , authorId] = interaction.customId.split(':');

  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This vote prompt isn\'t yours to fill in.', flags: MessageFlags.Ephemeral });
    return;
  }

  const modal = new ModalBuilder().setCustomId(`modvote:modal:${authorId}`).setTitle('Start a Vote');
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('What is this vote for?')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('e.g. Should we open a new dungeon channel?')
    .setRequired(true)
    .setMaxLength(1000);
  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
  await interaction.showModal(modal);
}

// Turns the prompt message into the final vote card in place (one message total, never a second
// post) and seeds the two reactions. Nothing about the reason or the vote is kept anywhere after
// this — Discord's own reaction counts on the message are the only record, exactly as asked.
async function handleModVoteModalSubmit(interaction) {
  const reason = interaction.fields.getTextInputValue('reason').trim();
  const callerName = interaction.member?.displayName || interaction.user.username;

  const embed = new EmbedBuilder()
    .setColor(0x2f3136)
    .setTitle('🗳️ Vote')
    .setDescription(`**${reason}**`)
    .setFooter({ text: `Called by ${callerName} • React ✅ or ❌ below` });

  await interaction.update({ content: null, embeds: [embed], components: [] });

  const card = await interaction.fetchReply().catch(() => null);
  if (!card) return;
  await card.react('✅').catch((err) => console.error('!vote: failed to seed ✅ reaction:', err));
  await card.react('❌').catch((err) => console.error('!vote: failed to seed ❌ reaction:', err));
}

// ---------- Brewable drinks & drunk meter ----------
//
// IMPORTANT: this is a purely fictional, in-character tavern mechanic for members to have fun with.
// It doesn't condone or encourage real-world drinking — see the disclaimer surfaced in !help and
// the first time anyone runs !serve, !toast, or !drink.

// Drinks !serve and !toast can randomly pour for you (the brewing/mixing system that used to sit
// on top of this — !brew — was removed since nobody used it; !serve/!toast auto-pour from here directly).
const RECIPES = [
  { combo: ['goblinroot', 'emberash'], id: 'goblinmoonshine', name: 'Goblin Moonshine', strength: 8, flair: 'goblin', desc: 'Distilled somewhere no one wants to ask about. Burns going down, keeps burning after.' },
  { combo: ['trollfat', 'sunfruit'], id: 'dwarvenstout', name: 'Dwarven Stout', strength: 5, flair: 'viking', desc: 'Thick, dark, and brewed by dwarves who take their ale more seriously than their taxes.' },
  { combo: ['moonberry', 'honeycomb'], id: 'moonberrywine', name: 'Moonberry Wine', strength: 4, flair: 'royal', desc: 'Sweet, pale purple, and stronger than the color lets on.' },
  { combo: ['frostpetal', 'honeycomb'], id: 'frostberrymead', name: 'Frostberry Mead', strength: 3, flair: 'bee', desc: 'Cold going down, warm on the way through. A tavern classic.' },
  { combo: ['trollfat', 'dragonpepper'], id: 'trollbrewedale', name: 'Troll-Brewed Ale', strength: 6, flair: 'troll', desc: 'Nobody\'s asked a troll for a recipe before or since. Best not to start now.' },
  { combo: ['sunfruit', 'dragonpepper'], id: 'spicedcider', name: 'Spiced Cider (Special Reserve)', strength: 2, flair: 'bird', desc: 'Barely alcoholic, mostly just warm and cinnamon-y. A gentle start.' },
  { combo: ['cheeserind', 'moonberry'], id: 'cursedcheesewine', name: 'Cursed Cheese Wine', strength: 7, flair: 'ghost', desc: 'Don\'t ask. The cheese insisted.' },
  { combo: ['griffinfeather', 'emberash'], id: 'griffinbrandy', name: 'Griffin Brandy', strength: 9, flair: 'dragon', desc: 'Aged in a barrel that used to be a griffin\'s nest. Somehow.' },
  { combo: ['shadowleaf', 'stardustmoss'], id: 'shadownectar', name: 'Shadow Nectar', strength: 6, flair: 'vampire', desc: 'Tastes faintly of starlight. Best not to drink it and look directly at anything important afterward.' },
  { combo: ['frostpetal', 'dragonpepper'], id: 'emberfrosttonic', name: 'Ember-Frost Tonic', strength: 4, flair: 'wizard', desc: 'Somehow both freezing and on fire. The tavern still hasn\'t figured out how.' },
  { combo: ['honeycomb', 'griffinfeather'], id: 'purrfectcream', name: 'Cat Drink (Purrfect Cream)', strength: 3, flair: 'cat', desc: 'Warm cream, a drizzle of honey, and something the Tavernkeep won\'t name. Drink it and you might start talking like him, nya.' },
  { combo: ['shadowleaf', 'sunfruit'], id: 'foxfirenightcap', name: 'Foxfire Nightcap', strength: 4, flair: 'fox', desc: 'Sly, quick, and gone before you notice the bottle\'s empty.' },
  { combo: ['honeycomb', 'trollfat'], id: 'honeypawale', name: 'Honeypaw Ale', strength: 5, flair: 'bear', desc: 'Thick and sweet, brewed the way a bear would if a bear could brew.' },
  { combo: ['frostpetal', 'stardustmoss'], id: 'lilypadlager', name: 'Lilypad Lager', strength: 3, flair: 'frog', desc: 'Cool, green-tinted, and prone to sudden hopping thoughts.' },
  { combo: ['dragonpepper', 'shadowleaf'], id: 'serpentscoil', name: "Serpent's Coil", strength: 6, flair: 'snake', desc: 'Slithers down smooth, then bites on the way.' },
  { combo: ['trollfat', 'honeycomb'], id: 'stablehandsstout', name: "Stablehand's Stout", strength: 5, flair: 'horse', desc: 'Earthy, oat-heavy, and best enjoyed standing up.' },
  { combo: ['shadowleaf', 'cheeserind'], id: 'webspunwine', name: 'Web-Spun Wine', strength: 6, flair: 'spider', desc: 'Strung together from eight different rumors. Sticky aftertaste.' },
  { combo: ['sunfruit', 'honeycomb'], id: 'acorncider', name: 'Acorn Cider', strength: 2, flair: 'squirrel', desc: "Nutty, a little frantic, and never quite finished before it's stashed away." },
  { combo: ['shadowleaf', 'frostpetal'], id: 'inkwellale', name: 'Inkwell Ale', strength: 5, flair: 'octopus', desc: 'Changes color depending on the light. Nobody\'s sure why.' },
  { combo: ['emberash', 'sunfruit'], id: 'phoenixembercordial', name: 'Phoenix Ember Cordial', strength: 7, flair: 'phoenix', desc: 'Warm going down, warmer coming back. Rises from every hangover.' },
  { combo: ['moonberry', 'stardustmoss'], id: 'unicornsblessing', name: "Unicorn's Blessing", strength: 3, flair: 'unicorn', desc: 'Impossibly pure. The tavern still isn\'t sure how they source it.' },
  { combo: ['honeycomb', 'stardustmoss'], id: 'fairydustfizz', name: 'Fairy Dust Fizz', strength: 2, flair: 'fairy', desc: 'Sparkles on the way down. Giggles on the way out.' },
  { combo: ['frostpetal', 'shadowleaf'], id: 'bansheeswail', name: "Banshee's Wail", strength: 6, flair: 'banshee', desc: 'A single sip and the room goes quiet for entirely the wrong reasons.' },
  { combo: ['dragonpepper', 'trollfat'], id: 'minotaursmazemead', name: "Minotaur's Maze Mead", strength: 8, flair: 'minotaur', desc: 'Strong enough that finding your way home afterward is its own quest.' },
  { combo: ['cheeserind', 'emberash'], id: 'gargoylesgrit', name: "Gargoyle's Grit", strength: 7, flair: 'gargoyle', desc: 'Tastes like stone. Somehow also popular.' },
  { combo: ['dragonpepper', 'emberash'], id: 'cyclopssingleshot', name: "Cyclops' Single Shot", strength: 9, flair: 'cyclops', desc: 'One eye, one shot, no depth perception afterward.' },
  { combo: ['shadowleaf', 'stardustmoss'], id: 'wraithsvapor', name: "Wraith's Vapor", strength: 6, flair: 'wraith', desc: 'Cold, pale, and gone from the glass before you\'ve finished pouring.' },
  { combo: ['moonberry', 'sunfruit'], id: 'satyrsrevelwine', name: "Satyr's Revel Wine", strength: 5, flair: 'satyr', desc: 'Bright, fruity, and impossible to drink just one of.' },
  { combo: ['moonberry', 'frostpetal'], id: 'elvenwoodwine', name: 'Elvenwood Wine', strength: 3, flair: 'elf', desc: 'Aged for a century in a cellar nobody remembers building.' },
  { combo: ['honeycomb', 'frostpetal'], id: 'secondbreakfastcider', name: 'Second Breakfast Cider', strength: 2, flair: 'halfling', desc: 'Meant for one glass. Never stays that way.' },
  { combo: ['emberash', 'cheeserind'], id: 'tieflingstwist', name: "Tiefling's Twist", strength: 6, flair: 'tiefling', desc: 'A little sinful, a little sweet, entirely on purpose.' },
  { combo: ['trollfat', 'dragonpepper'], id: 'giantsbarrelbrew', name: "Giant's Barrel Brew", strength: 9, flair: 'giant', desc: 'Comes in a mug sized for someone much, much larger than you.' },
];

// Dedicated pool for !throw — these are potions you chuck AT someone rather than pour for them,
// so they get their own (slightly more chaotic) flavor text and lean on the flairs the RECIPES
// above don't already cover.
const THROW_POTIONS = [
  { id: 'lizardtonguebrew', name: 'a Vial of Lizardtongue Brew', strength: 4, flair: 'lizard', desc: 'Small, green, and hisses faintly when uncorked.' },
  { id: 'pupserum', name: 'a Flask of Slobbering Pup Serum', strength: 3, flair: 'dog', desc: 'Smells like wet fur. Nobody knows why the Tavernkeep keeps a shelf of these.' },
  { id: 'buccaneersgrog', name: 'a Bottle of Buccaneer\'s Grog', strength: 5, flair: 'pirate', desc: 'Salty, sharp, and comes with a tiny paper skull on the cork.' },
  { id: 'warpaintfury', name: 'a Vial of Warpaint Fury', strength: 6, flair: 'orc', desc: 'Thick and red. The Tavernkeep insists it\'s just berries.' },
  { id: 'gravedirttonic', name: 'a Jar of Grave-Dirt Tonic', strength: 5, flair: 'zombie', desc: 'Tastes like soil. Somehow still popular.' },
  { id: 'sirensperfume', name: 'a Bottle of Siren\'s Bubbling Perfume', strength: 4, flair: 'siren', desc: 'Smells like sea spray. Fizzes ominously when shaken.' },
  { id: 'vertigodraught', name: 'a Vial of Vertigo Draught', strength: 4, flair: 'falling', desc: 'One sip and the floor stops being where you left it.' },
  { id: 'howlingflask', name: 'a Flask of Howling Brew', strength: 5, flair: 'wolf', desc: 'Smells like pine and distant moonlight.' },
  { id: 'nightwatchvial', name: 'a Vial of Nightwatch Oil', strength: 3, flair: 'owl', desc: 'Faintly luminous. Best thrown after dark.' },
  { id: 'twitchberrytonic', name: 'a Vial of Twitchberry Tonic', strength: 2, flair: 'rabbit', desc: 'Fizzes nervously the moment it\'s uncorked.' },
  { id: 'muckjar', name: 'a Jar of Mudwallow Muck', strength: 4, flair: 'pig', desc: 'Smells like a farm. Somehow still sells out.' },
  { id: 'bleatflask', name: 'a Flask of Bleating Draught', strength: 4, flair: 'goat', desc: 'Bitter, chalky, and vaguely offended to be opened.' },
  { id: 'ravensinkvial', name: "a Vial of Raven's Ink", strength: 5, flair: 'raven', desc: 'Pitch black. Whispers something as it splashes.' },
  { id: 'shellbackbrew', name: 'a Jar of Shellback Brew', strength: 3, flair: 'turtle', desc: 'Takes forever to open. Worth the wait, eventually.' },
  { id: 'crowfeatherflask', name: 'a Flask of Crow-Feather Tonic', strength: 4, flair: 'crow', desc: 'Glints like something stolen. Probably was.' },
  { id: 'griffintalontonic', name: "a Vial of Griffin's Talon Tonic", strength: 6, flair: 'griffin', desc: 'Sharp, soaring, and faintly feathered around the cork.' },
  { id: 'krakensdepthdraught', name: "a Jar of Kraken's Depth Draught", strength: 8, flair: 'kraken', desc: 'Pulls you under before you\'ve finished the first sip.' },
  { id: 'tinkertonic', name: 'a Vial of Gnome Tinker Tonic', strength: 4, flair: 'gnome', desc: 'Ticks faintly. The Tavernkeep insists that\'s normal.' },
  { id: 'frostbitedraught', name: 'a Flask of Frostbite Draught', strength: 7, flair: 'yeti', desc: 'Cold enough to fog the bottle from the inside.' },
  { id: 'centaurscharge', name: "a Bottle of Centaur's Charge", strength: 6, flair: 'centaur', desc: 'Kicks like it\'s got four legs behind it.' },
  { id: 'golemsstonebrew', name: "a Jar of Golem's Stonebrew", strength: 6, flair: 'golem', desc: 'Heavy, grey, and faintly humming with old runes.' },
  { id: 'impsmischief', name: "a Vial of Imp's Mischief", strength: 5, flair: 'imp', desc: 'Small bottle, big consequences. Giggles when shaken.' },
  { id: 'merfolkstide', name: "a Bottle of Merfolk's Tide", strength: 4, flair: 'merfolk', desc: 'Smells of salt and somewhere far away.' },
  { id: 'harpysscreech', name: "a Vial of Harpy's Screech", strength: 6, flair: 'harpy', desc: 'Shrieks faintly if you shake it. Best not to.' },
  { id: 'dwarvenforgebrew', name: 'a Flask of Dwarven Forgebrew', strength: 7, flair: 'dwarf', desc: 'Smells like a mine. Tastes like a good decision at the time.' },
  { id: 'gnollsnarl', name: "a Jar of Gnoll's Snarl", strength: 5, flair: 'gnoll', desc: 'Yips faintly. Best thrown quickly.' },
  { id: 'drowshadowdraught', name: 'a Vial of Drow Shadow Draught', strength: 6, flair: 'drow', desc: 'Violet, cold, and impossible to see coming.' },
  { id: 'guildmasterstash', name: "a Flask of the Guildmaster's Secret Stash", strength: 5, flair: 'guildmaster', desc: 'Smells vaguely of strawberries and forty years of stories.' },
];
const DRINKS_FILE = path.join(__dirname, 'drinks.json');

let drinksCache = null;
let drinksDirty = false;

function readDrinksFromDisk() {
  if (!fs.existsSync(DRINKS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DRINKS_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read drinks.json, starting fresh.', err);
    return {};
  }
}

// Loaded from disk once, then served straight from memory — the decay check on every single
// chat message in the tavern/bartop channels used to mean a disk read on every message, even
// from people not using the drinking system at all.
function loadDrinks() {
  if (!drinksCache) drinksCache = readDrinksFromDisk();
  return drinksCache;
}

// No longer writes to disk immediately — just updates the cache and flags it dirty.
// flushDrinksToDisk() (called on an interval, see bottom of file) does the actual write.
function saveDrinks(data) {
  // Compact (no indentation) and rounded meters keep the file small — this can grow with every
  // member the bot tracks, and drunkMeter is otherwise a long decaying float.
  for (const userId of Object.keys(data)) {
    data[userId].drunkMeter = Math.round(data[userId].drunkMeter * 100) / 100;
  }
  drinksCache = data;
  drinksDirty = true;
}

function flushDrinksToDisk() {
  if (!drinksDirty || !drinksCache) return;
  try {
    atomicWriteFileSync(DRINKS_FILE, JSON.stringify(drinksCache));
    drinksDirty = false;
  } catch (err) {
    console.error('Failed to write drinks.json:', err);
  }
}

// The meter drains on its own so nobody's stuck hammered forever — a full 100 meter clears in
// ~25 minutes. (Previously 1pt/5min, which meant a maxed meter took over 8 hours to clear —
// combined with how much a single drink added, that's what made people "always drunk".)
const DRUNK_DECAY_PER_MS = 1 / (15 * 1000);

// Fetches (and decays) a player's record. Mutates + returns the record; caller is responsible for saveDrinks().
function getPlayer(drinks, userId) {
  if (!drinks[userId]) {
    drinks[userId] = {
      drunkMeter: 0, lastUpdate: Date.now(), seenDisclaimer: false, activeFlair: null,
      lastWaterUse: null, lastThrowUse: null, lastCastUse: null, lastParryUse: null,
      lastAttack: null, stats: { castCount: 0, throwCount: 0, parryCount: 0 },
      waterCharges: MAX_WATER_CHARGES, waterRefillAt: null, golemCurse: null,
      warnFlairs: [], curseFlairs: [],
    };
  }
  const player = drinks[userId];
  if (player.activeFlair === undefined) player.activeFlair = null;
  // Warning-penalty flairs (see applyWarnPenaltyFlair) — a separate stack from activeFlair so
  // !drink/!parry/other-people's-casts can never touch them. Prune expired ones here, same as
  // activeFlair just above.
  if (!Array.isArray(player.warnFlairs)) player.warnFlairs = [];
  player.warnFlairs = player.warnFlairs.filter((f) => f && f.expiresAt > Date.now());
  // Mod-cast curses (see applyModCurseFlair / !curse) — same non-drinkable/non-parryable/
  // stacking contract as warnFlairs, but kept in a separate array so a !warn penalty and a
  // !curse never get mixed up with each other in logs or behavior.
  if (!Array.isArray(player.curseFlairs)) player.curseFlairs = [];
  player.curseFlairs = player.curseFlairs.filter((f) => f && f.expiresAt > Date.now());
  if (player.lastWaterUse === undefined) player.lastWaterUse = null;
  if (player.waterCharges === undefined) player.waterCharges = MAX_WATER_CHARGES;
  if (player.waterRefillAt === undefined) player.waterRefillAt = null;
  if (player.golemCurse === undefined) player.golemCurse = null;
  // Self-heal if a curse's expiry was missed (e.g. the bot restarted and lost its timer) —
  // otherwise this player would be stuck cursed forever with no timer left to clear it.
  if (player.golemCurse && Date.now() >= player.golemCurse.expiresAt) {
    clearGolemCurse(player);
  }
  // The refill timer may have finished since we last looked — top the bottle back up to full.
  if (player.waterRefillAt !== null && Date.now() >= player.waterRefillAt) {
    player.waterCharges = MAX_WATER_CHARGES;
    player.waterRefillAt = null;
  }
  if (player.lastThrowUse === undefined) player.lastThrowUse = null;
  if (player.lastCastUse === undefined) player.lastCastUse = null;
  if (player.lastParryUse === undefined) player.lastParryUse = null;
  if (player.lastAttack === undefined) player.lastAttack = null;
  if (!player.stats) player.stats = { castCount: 0, throwCount: 0, parryCount: 0 };
  const elapsed = Date.now() - (player.lastUpdate || Date.now());
  player.drunkMeter = Math.max(0, player.drunkMeter - elapsed * DRUNK_DECAY_PER_MS);
  player.lastUpdate = Date.now();
  if (player.activeFlair && player.activeFlair.expiresAt <= Date.now()) {
    player.activeFlair = null;
  }
  return player;
}

const DRUNK_METER_PER_STRENGTH = 10; // meter gained per drink = recipe.strength * this — tuned so weak
// drinks (strength ~2) land around Tipsy and the strongest (strength ~9) land around Hammered,
// instead of every single round instantly maxing the meter out.

const DRINKING_DISCLAIMER =
  '⚠️ `!serve`/`!toast`/`!drink` is a fictional, in-character tavern potion game for fun — it\'s all fantasy brews and speech-flairs, not a stand-in for real drinking. In-game, take it easy too: nobody needs to max out the meter, and it\'s just as fun to not drink at all, tbh.';

const DRINK_INSTRUCTIONS =
  '💧 `!drink` or `!drink water` = sober up instantly, on your own, any time.';

// The magical water bottle isn't bottomless in the truest sense — it holds 2 charges, and once
// both are drained it needs a moment to refill, so nobody can just spam `!drink water` to
// permanently sit at 0 and ignore the drunk minigame. Both charges refill together on one shared
// cooldown once the bottle runs dry.
const MAX_WATER_CHARGES = 2;
const WATER_COOLDOWN_MS = 6 * 60 * 1000;

// The Tavernkeep himself is off-limits as a target — nobody throws a potion or casts a spell at
// the bartender. Try it, and it backfires: whatever was meant for him lands back on the sender
// at full (100%) strength and lingers for a long 20 minutes, well past the usual 10-minute cap.
const TAVERNKEEP_ID = cfgId('users', 'botSelf');
const TAVERNKEEP_BOUNCE_MS = 20 * 60 * 1000;

// ---------- Golems — protected role, retaliates hard on !throw/!cast ----------
//
// Anyone holding the Golem role is off-limits the same way the Tavernkeep is, except the
// backfire here is much heavier: instead of a normal timed flair, the attacker gets a Golem's
// Curse — a status that ignores the usual 10-minute auto-sober cap entirely, locks their water
// bottle's refill to match the curse's own 5-hour timer (instead of the normal 6 minutes), and
// can only be broken early by drinking water twice while it's active. `!parry` doesn't work on
// it either — see the golemCurse check up top of the !parry handler below.
const GOLEM_ROLE_ID = cfgId('roles', 'protected');
const GOLEM_CURSE_MS = 5 * 60 * 60 * 1000; // 5 hours
const GOLEM_CURSE_WATERS_NEEDED = 2;

function isGolemProtected(member) {
  return !!member?.roles?.cache?.has(GOLEM_ROLE_ID);
}

// Applies (or refreshes, if they're dumb enough to try twice) the curse on the attacker's own
// player record. Caller still owns saveDrinks() same as everywhere else.
function applyGolemCurse(player, now = Date.now()) {
  const expiresAt = now + GOLEM_CURSE_MS;
  player.golemCurse = { appliedAt: now, expiresAt, watersDrunk: 0 };
  // Water is locked, not just slow — charges zero out and the shared refill timer is pushed
  // all the way out to match the curse, so the only way to a working bottle again is drinking
  // through the curse itself (see the !drink water interception) or waiting the full 5 hours.
  player.waterCharges = 0;
  player.waterRefillAt = expiresAt;
  player.activeFlair = { id: 'golemcursed', expiresAt, guaranteed: true };
  player.lastAttack = null; // nothing left to parry away
}

function isGolemCursed(player, now = Date.now()) {
  if (!player.golemCurse) return false;
  if (now >= player.golemCurse.expiresAt) {
    clearGolemCurse(player);
    return false;
  }
  return true;
}

function clearGolemCurse(player) {
  player.golemCurse = null;
  player.waterCharges = MAX_WATER_CHARGES;
  player.waterRefillAt = null;
  if (player.activeFlair && player.activeFlair.id === 'golemcursed') {
    player.activeFlair = null;
  }
}

const pendingGolemCurseTimers = new Map(); // userId -> Timeout

function cancelGolemCurseTimer(userId) {
  if (pendingGolemCurseTimers.has(userId)) {
    clearTimeout(pendingGolemCurseTimers.get(userId));
    pendingGolemCurseTimers.delete(userId);
  }
}

// Mirrors scheduleAutoSober, but tailored to the curse's own bookkeeping (water lock + the
// golemCurse record itself) instead of just drunkMeter/activeFlair.
function scheduleGolemCurseExpiry(userId, channel, durationMs = GOLEM_CURSE_MS) {
  cancelGolemCurseTimer(userId);
  const timer = setTimeout(async () => {
    pendingGolemCurseTimers.delete(userId);
    const drinks = loadDrinks();
    const player = getPlayer(drinks, userId);
    if (!player.golemCurse) return; // already broken early by drinking
    clearGolemCurse(player);
    saveDrinks(drinks);
    let name = 'They';
    try {
      const m = await channel.guild.members.fetch(userId);
      name = m.displayName || m.user.username;
    } catch (err) {
      // Fall back to "They" if the member can't be resolved (left the guild, etc.)
    }
    try {
      await channel.send({
        content: `🗿 The golem's curse finally lifts from **${name}** — the stone weight fades, and their water bottle starts refilling normally again.`,
        allowedMentions: { parse: [] },
      });
    } catch (err) {
      console.error('Failed to send golem-curse-expired message:', err);
    }
  }, durationMs);
  pendingGolemCurseTimers.set(userId, timer);
}

const GOLEM_CURSE_BACKFIRE_LINES = [
  (name) => `The golem doesn't even shift its stone weight — the magic recoils off its hide and slams straight back into **${name}**!`,
  (name) => `Runes flare across the golem's chest, and whatever **${name}** sent its way comes roaring right back at them!`,
  (name) => `The golem stands motionless. Whatever was meant for it rebounds instead and crashes down on **${name}**.`,
  (name) => `Stone doesn't feel potions or spells — it just reflects them, and **${name}** takes the full weight of their own attack.`,
];

function buildGolemCurseAnnouncement() {
  const hours = Math.round(GOLEM_CURSE_MS / 3600000);
  return (
    `🗿 A crushing weight settles in — cursed for **${hours} hours**. Your water won't refill on its own until it lifts, ` +
    `and \`!parry\` won't shake it loose. Only drinking water **${GOLEM_CURSE_WATERS_NEEDED} times** while cursed will break it early.`
  );
}

// !throw is open to everyone, on everyone (no Council/Knight gate) — but a thrower has to wait
// this long between throws so it can't be spammed at one poor soul over and over.
const THROW_COOLDOWN_MS = 3 * 60 * 1000;

// Members get a stripped-down `!cast @user` (random flair only, no self-casting) — same idea as
// !throw, same cooldown. Council/Knight use the full !cast below instead, which has no cooldown.
const MEMBER_CAST_COOLDOWN_MS = 3 * 60 * 1000;

// Parrying reflects whatever just hit you back at whoever cast/threw it — but doing so leaves you
// fatigued, so regular members have to wait this long between parries. Council/Knight parry for free.
const PARRY_COOLDOWN_MS = 3 * 60 * 1000;

function getDrunkTier(meter) {
  if (meter >= 70) return { label: 'Hammered', interceptChance: 0.75 };
  if (meter >= 40) return { label: 'Drunk', interceptChance: 0.4 };
  if (meter >= 15) return { label: 'Tipsy', interceptChance: 0.15 };
  return { label: 'Sober', interceptChance: 0 };
}

// Drink-specific speech quirks. A recipe can carry `flair: '<id>'` (see the Cat Drink above) —
// drinking it applies this quirk to a member's intercepted messages for a while, stacking on top
// of (or independent from) the general drunk-meter slurring. To add a new one, add an entry here
// and set `flair: '<id>'` on any recipe in RECIPES.
// Builds a simple "sprinkle a random interjection after sentence-ending punctuation" flair,
// same shape as the original catspeak effect — just swap in a different word bank.
function makeInterjectionFlair(label, suffixes) {
  return {
    label,
    apply(text) {
      let touched = false;
      let result = text.replace(/([.!?]+)(\s|$)/g, (match, punct, ws) => {
        if (Math.random() < 0.7) {
          touched = true;
          const s = suffixes[Math.floor(Math.random() * suffixes.length)];
          return `${punct} ${s}${ws}`;
        }
        return match;
      });
      if (!touched) {
        const s = suffixes[Math.floor(Math.random() * suffixes.length)];
        result = `${result} ${s}`;
      }
      return result;
    },
  };
}

const FLAIR_EFFECTS = {
  // Golem's Curse — the backfire from !throw/!cast against a Golem-role member. Not part of any
  // RECIPE/potion/spell pool; only ever applied directly via applyGolemCurse().
  golemcursed: makeInterjectionFlair('Golem-Cursed', ['*stone-heavy*', '*grinds like shifting rock*', '*movements feel leaden*', '*a low stone rumble*', '*cracks settle across their voice*']),
  cat: makeInterjectionFlair('Cat-Tongued', ['Nya!', 'nya~', 'Nya nya!', '*mrow*', 'nya nya~', '*purrs*', 'mrrp?', '*headbutts your hand*', 'nyaa~', '*flicks tail*', 'mew!', '*kneads the air*', '*slow blink*']),
  troll: {
    label: 'Troll-Tongued',
    apply(text) {
      // Trolls keep every word said — just yell it, and toss a caveman-ish word in front
      // of a few of them for flavor. Nothing gets cut, only added.
      const fillers = ['ME', 'TROLL', 'UGH', 'GRR', 'SMASH'];
      const words = text.split(/\s+/).map((w) => {
        if (Math.random() < 0.2) {
          return `${fillers[Math.floor(Math.random() * fillers.length)]} ${w}`;
        }
        return w;
      });
      const result = words.join(' ').toUpperCase();
      const grunts = ['GRR!', 'SMASH!', 'ME STRONG!', 'UGH.', 'ROAR!', 'TROLL SAY SO.', 'ME BIG!', 'BASH GOOD!'];
      return `${result} ${grunts[Math.floor(Math.random() * grunts.length)]}`;
    },
  },
  dragon: makeInterjectionFlair('Dragon-Tongued', ['*RAWR*', 'hear me roar!', '*smoke curls from nostrils*', 'grrrrr...', '*wings flare*', '*hoards it jealously*', '*embers crackle*', 'bow before me!', '*tail sweeps the floor*']),
  dog: makeInterjectionFlair('Dog-Tongued', ['*woof!*', 'bark!', '*tail wags furiously*', 'ARF!', '*pants happily*', '*zoomies*', 'good talk!', '*ears perk up*', 'ruff ruff!']),
  lizard: makeInterjectionFlair('Lizard-Tongued', ['*tongue flicksss*', 'ssss...', '*blinks sideways*', 'hsssss~', '*basks on the nearest rock*', '*tail twitches*']),
  bird: makeInterjectionFlair('Bird-Brained', ['*tweet*', 'squawk!', '*chirp chirp*', 'caw!', '*flaps wildly*', '*preens a feather*', 'polly wants a mug!', '*tilts head*']),
  bee: makeInterjectionFlair("Bee-Bee'd", ['bzzz~', '*buzzes*', 'bzzzzz!', 'buzz buzz!', '*orbits the mug*', '*does a little waggle dance*', 'to the hive!']),
  pirate: {
    label: 'Pirate-Tongued',
    apply(text) {
      let result = text
        .replace(/\byou\b/gi, 'ye')
        .replace(/\bmy\b/gi, 'me')
        .replace(/\bis\b/gi, "be");
      const suffixes = ['arrr!', 'yarrr har!', 'shiver me timbers!', 'aye aye!', 'or walk the plank!', 'savvy?', 'yo ho ho!', 'batten down the hatches!'];
      return `${result} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },
  },
  ghost: makeInterjectionFlair('Ghost-Voiced', ['*woooOOoo*', '(from beyond the walls)', '*rattles*', 'boooo...', '*fades in and out*', '*chains clink*', '*drifts through the wall*', 'join me...']),
  goblin: makeInterjectionFlair('Goblin-Smiled', ['heh heh!', '*cackles*', 'shiny shiny!', '*sniffs the air*', 'gimme gimme!', '*GOLD GOLD*', '*me greedy me want GOLD*', '*pockets something*']),
  orc: makeInterjectionFlair('Orc-Throated', ['WAAAGH!', '*bares tusks*', 'HRAAAH!', 'grrnk!', 'SMASH LATER!', '*flexes*', 'FOR DA CLAN!']),
  vampire: makeInterjectionFlair('Vampire-Fanged', ['*bares fangs*', 'mortal...', '*hisses softly*', 'the night calls...', '*cape flourish*', '*eyes gleam red*', 'care for a taste?']),
  wizard: makeInterjectionFlair('Wizard-Tongued', ['*arcane mumbling*', 'by the ancient tomes!', '*sparks fly from fingertips*', 'abracadabra!', '*robe swishes dramatically*', '*consults a dusty scroll*', 'the runes foretell it!']),
  royal: {
    label: 'Royalty',
    apply(text) {
      // Nobles don't drop consonants, they drop entire centuries — swap in a little
      // archaic flourish and cap it off with something suitably haughty.
      let result = text
        .replace(/\byou're\b/gi, 'thou art')
        .replace(/\byour\b/gi, 'thy')
        .replace(/\byou\b/gi, 'thee');
      const suffixes = ['indeed, good sir or madam.', 'how utterly common.', 'one simply must insist.', 'quite so, quite so.', 'as is only proper.', 'a most vexing affair.', 'summon the servants at once.'];
      return `${result} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    },
  },
  zombie: makeInterjectionFlair('Zombie-Groaned', ['*groooaaans*', 'braaains...', '*shambles*', 'uuuurgh...', '*drags foot*', '*brains*', '*limb falls off*', 'unnnliiiife...']),
  viking: makeInterjectionFlair('Viking-Bellowed', ['SKÅL!', "BY ODIN'S BEARD!", '*raises axe*', 'VALHALLA AWAITS!', '*thunderous laugh*', 'ONWARD, RAIDERS!', '*slams horned mug on the table*']),
  siren: makeInterjectionFlair('Siren-Sung', ['*melodic hum*', '~♪~', 'the tides call...', '*bubbles rise*', 'come closer...', '*shalalalala*', '*combs seafoam from hair*']),
  // Starts loud and capitalized, trails off small and stretched-out — like a voice falling
  // away down a hole.
  falling: makeInterjectionFlair('Falling (mid-tumble)', [
    'OOHHH NOoooo whereeeee amm iiiiiiiiiiiiii',
    'WAAAAIT no no nooooo...',
    'AAAAH falling, faaaaalling....',
    'HELP meeee i think im going dowwwwwn',
    'OH NO OH NO ohh noo... nooo....',
    'WHOAAA whyyy is the floor goneeee...',
  ]),

  // ---- Animals ----
  fox: makeInterjectionFlair('Fox-Tongued', ['*screech-bark!*', '*ears swivel*', 'yip!', '*tail curls smugly*', '*side-eyes the henhouse*', '*pounces playfully*']),
  wolf: makeInterjectionFlair('Wolf-Tongued', ['*AWOOO!*', '*howls at the moon*', 'the pack hears you.', '*bares teeth*', '*hackles raise*', 'ruuun with us...']),
  bear: makeInterjectionFlair('Bear-Tongued', ['*GRAWR*', '*i am winnie the pooh!*', 'grrrmble...', '*sniffs for honey*', '*mighty paw swipe*']),
  owl: makeInterjectionFlair('Owl-Eyed', ['*hoot hoot*', '*head spins nearly all the way around*', 'whooo goes there?', '*blinks slowly, wisely*', '*ruffles feathers*']),
  frog: makeInterjectionFlair('Frog-Throated', ['*ribbit*', '*croaaaak*', '*tongue snaps out*', '*puffs throat sac*', 'gulp!', '*hops onto the bar*']),
  rabbit: makeInterjectionFlair('Rabbit-Eared', ['*twitches nose*', '*ears perk straight up*', 'thump thump!', '*hops nervously*', 'eep!', '*already planned three escape routes*']),
  snake: makeInterjectionFlair('Serpent-Tongued', ['*ssslithers closer*', 'sssay again?', '*tongue tastes the air*', '*coils up*', 'hsssss...', "*sssssssimple dimple pop it squisssssshh*"]),
  pig: makeInterjectionFlair('Pig-Snouted', ['*oink!*', '*snuffles for scraps*', 'oink oink!', '*rolls in the mud happily*', '*snorts*']),
  horse: makeInterjectionFlair('Horse-Tongued', ['*neighhh!*', '*whinnies*', '*stamps a hoof*', '*tosses its mane*', 'giddyup!']),
  goat: makeInterjectionFlair('Goat-Bleated', ['*me-e-e-e*', '*headbutts the nearest chair*', 'maaa!', '*chews on a menu*', '*climbs onto the table*']),
  spider: makeInterjectionFlair('Spider-Legged', ['*skitters sideways*', '*spins a thread*', '*all eight eyes blink*', '*clicks fangs*', '*drops from the ceiling*']),
  raven: makeInterjectionFlair('Raven-Voiced', ['*caws ominously*', 'nevermore...', '*perches on your shoulder*', '*eyes something shiny*', '*ruffles jet-black feathers*']),
  squirrel: makeInterjectionFlair('Squirrel-Cheeked', ['*chitters*', '*stuffs cheeks with acorns*', '*darts up the wall*', 'chrrr!', '*buries the tab for later*']),
  turtle: makeInterjectionFlair('Turtle-Paced', ['*slowly...*', '*retreats into shell mid-sentence*', '...eventually continues.', '*plods onward at great personal cost*', 'no rush. seriously. none.', "*i'm old*"]),
  octopus: makeInterjectionFlair('Ink-Tongued', ['*squirts a cloud of ink*', '*eight arms gesture at once*', '*changes color*', 'blub blub!', '*ripples across the bar*']),
  crow: makeInterjectionFlair('Crow-Cawed', ['*caw!*', '*eyes your shiny buttons*', '*hops closer*', '*steals a coin*', '*mocking caw*']),

  // ---- Mythical / fantasy creatures ----
  phoenix: makeInterjectionFlair('Phoenix-Voiced', ['*bursts into gentle flame*', '*rises from the ashes*', 'reborn anew!', '*trailing embers*', '*wings of fire unfurl*']),
  griffin: makeInterjectionFlair('Griffin-Screeched', ['*shrieks like an eagle*', '*talons click on the floor*', '*fluffs lion fur and feathers*', 'SKREEEE!', '*wings mantle proudly*']),
  unicorn: makeInterjectionFlair('Unicorn-Spoken', ['*horn glimmers*', '~sparkles~', '*prances daintily*', 'only the pure of heart may pass.', '*mane shimmers rainbow*']),
  kraken: makeInterjectionFlair('Kraken-Voiced', ['*tentacles rise from the depths*', 'BLORGHHH', '*the tavern floor creaks ominously*', '*drags something under*', '*ink clouds the water*']),
  fairy: makeInterjectionFlair('Fairy-Voiced', ['*tiny wings flutter*', '~teehee~', '*sprinkles pixie dust*', '*giggles from somewhere unseen*', 'catch me if you can!']),
  gnome: makeInterjectionFlair('Gnome-Tinkered', ['*tinkers with a gadget*', '*adjusts tiny spectacles*', 'one moment, one moment!', '*pockets full of gears*', '*mutters mechanical nonsense*']),
  banshee: makeInterjectionFlair('Banshee-Wailed', ['*wails mournfully*', '*a chill fills the room*', 'wooooOOOOoooe...', '*hair drifts as if underwater*', '*keening cry echoes*']),
  yeti: makeInterjectionFlair('Yeti-Grunted', ['*mighty roar echoes off snow*', '*fur bristles in the cold*', 'GROOAAR!', '*stomps a massive foot*', '*breath fogs in the air*']),
  minotaur: makeInterjectionFlair('Minotaur-Snorted', ["*snorts through a bull's nose*", '*paws the ground*', 'HRNNGH!', '*horns lower threateningly*', '*labyrinthine mutter*']),
  centaur: makeInterjectionFlair('Centaur-Spoken', ['*hooves clop on the floorboards*', '*stamps impatiently*', '*tail swishes*', 'the stars foretell it.', '*NGHH nGHH*']),
  gargoyle: makeInterjectionFlair('Gargoyle-Grated', ['*stone grinds on stone*', '*perches motionless, then blinks*', 'grrrrnk...', '*wings creak open*', '*watches from the rafters*']),
  golem: makeInterjectionFlair('Golem-Rumbled', ['*clay grinds together*', 'MUST. OBEY.', '*rune on forehead glows faintly*', '*heavy footsteps thud*', '...command received.']),
  cyclops: makeInterjectionFlair('Cyclops-Roared', ['*single eye narrows*', 'RAAAGH!', '*ground shakes with each step*', '*squints suspiciously*', '*club drags along the floor*']),
  imp: makeInterjectionFlair('Imp-Cackled', ['*mischievous cackle*', '*tiny wings flap*', 'hehehe, mischief managed!', '*tail flicks with glee*', '*vanishes in a puff of smoke*']),
  wraith: makeInterjectionFlair('Wraith-Whispered', ['*a cold whisper passes by*', '...join us in the dark...', '*shadow flickers unnaturally*', '*temperature drops suddenly*', '*form wavers like smoke*']),
  merfolk: makeInterjectionFlair('Merfolk-Spoken', ['*tail fin splashes*', '*gills flutter*', 'the deep sea sends greetings.', '*scales shimmer*', '*bubbles trail from a laugh*']),
  satyr: makeInterjectionFlair('Satyr-Piped', ['*panpipes trill playfully*', '*hooves click a little jig*', 'to the revel!', '*grins roguishly*', '*plucks a grape from nowhere*']),
  harpy: makeInterjectionFlair('Harpy-Shrieked', ['*shrill screech*', '*feathers ruffle indignantly*', 'SKREE!', '*swoops low over the bar*', '*talons tap the counter*']),

  // ---- Fantasy races ----
  elf: makeInterjectionFlair('Elf-Spoken', ['*ears twitch elegantly*', 'for Lothlorien.', '*graceful bow*', '*hums an ancient tune*', 'the forest remembers.', "*judges your posture, silently*"]),
  dwarf: makeInterjectionFlair('Dwarf-Bellowed', ['*strokes beard thoughtfully*', 'BY MY BEARD!', '*slams tankard on the table*', 'more ale!', '*mutters about the mines*']),
  halfling: makeInterjectionFlair('Halfling-Chirped', ['*checks pockets for second breakfast*', '*bare feet pad softly*', 'ooh, is that a snack?', '*grins cheerfully*', '*hums a cozy little tune*']),
  gnoll: makeInterjectionFlair('Gnoll-Yipped', ['*hyena-like cackle*', 'yip yip!', '*sniffs the air hungrily*', '*ears flick back*', '*bares jagged teeth*']),
  tiefling: makeInterjectionFlair('Tiefling-Tailed', ['*tail flicks with a sly curl*', '*small horns catch the candlelight*', 'heh, careful now.', '*eyes glint an unnatural color*', '*smirks knowingly*']),
  drow: makeInterjectionFlair('Drow-Whispered', ['*speaks low and precise*', '*eyes adjust to catch every shadow*', 'the underdark remembers all.', '*silent as a blade*', '*a faint violet glow lingers*']),
  giant: makeInterjectionFlair('Giant-Boomed', ['*booming voice shakes the rafters*', 'SMALL FOLK!', '*ducks to avoid the ceiling*', '*footsteps like thunder*', '*picks up the mug like a thimble*']),

  // ---- Named individuals ----
  guildmaster: makeInterjectionFlair('Guildmaster-Voiced', ['*strokes beard*', 'back in my day...', 'my aching back', 'where are my donuts', '*leans back in chair*', 'ohoho', 'welp', 'gahdam', 'noice']),
};

// Every drunk-ish state now comes with a speech flair — no more generic hiccup/slur fallback.
const FLAIR_POOL = Object.keys(FLAIR_EFFECTS);

// ---------- Mixing chaos ----------
//
// If !serve or !throw would apply a flair to someone who's already mid-flair from something
// else, there's a chance the two brews collide instead of the new one just overwriting the old.
// The result is a synthesized combo flair (e.g. "Pirate-Dragon") that runs both effects' apply()
// in sequence. Combo flairs are built lazily and cached in FLAIR_EFFECTS so repeat combos of the
// same two flairs reuse the same object instead of rebuilding it every time.
const MIXING_CHAOS_CHANCE = 0.35; // 35% chance to blend instead of overwrite, when eligible

// A combo flair id is just its base flair ids joined with '__' (see comboFlairId below), so the
// number of '__'-separated parts tells us how many base flairs are already stacked into it. Once
// a combo hits this cap, further hits just overwrite instead of merging in a 4th+ flavor.
const MAX_FLAIR_MIX_COMPONENTS = 3;

// Formats a remaining-cooldown duration as a short label for user-facing messages, e.g.
// "2m 30s" or, once under a minute, just "45s". Rounds up to the next whole second so a
// cooldown never displays as "0s" while still technically active.
// Was previously copy-pasted at every cooldown check (!throw, !cast, !drink water, !parry);
// centralized here so there's one place to change the format.
function formatRemaining(ms) {
  const remainingSec = Math.ceil(ms / 1000);
  const remainingMin = Math.floor(remainingSec / 60);
  const remainingRestSec = remainingSec % 60;
  return remainingMin > 0 ? `${remainingMin}m ${remainingRestSec}s` : `${remainingRestSec}s`;
}

// Shared cooldown check used by !throw, !cast, and !parry. Each of those commands stores its own
// "lastXUse" timestamp field on the player object and used to repeat the same
// "compute elapsed -> compare to limit -> format remaining" block at every call site (4+ places).
// Now each caller just passes the player, the field name, and the cooldown length in ms, and gets
// back whether they're on cooldown plus a pre-formatted remaining-time label. Callers still own
// their own flavor text and still need to set player[field] = now themselves once the action goes
// through (this helper only checks, it doesn't record).
function checkCooldown(player, field, cooldownMs, now = Date.now()) {
  const lastUse = player[field];
  const elapsed = lastUse ? now - lastUse : Infinity;
  const onCooldown = elapsed < cooldownMs;
  const remainingMs = onCooldown ? cooldownMs - elapsed : 0;
  return {
    onCooldown,
    remainingMs,
    remainingLabel: onCooldown ? formatRemaining(remainingMs) : null,
  };
}

// Shared Council-denial flavor lines, used by !warn, !unmute, and !shout when a non-Council/Knight
// member tries a moderation command. Previously each command had its own near-identical array of
// ~5-7 lines (three of which were copy-pasted verbatim across all three, plus one that only swapped
// the action word). Now each caller supplies just the action verb and any command-specific extra
// flavor lines, and gets the full randomized set built for it.
const COUNCIL_DENIAL_COMMON_LINES = [
  'The Tavernkeep squints at you, ears flat. "Nice try, traveller. You\'re not on the Council."',
  'The Tavernkeep slides your mug away. "That\'s Council business. Finish your drink and sit back down."',
  'The Tavernkeep points a claw at the door. "Come back when you\'ve got a seat at the Council table."',
];

function replyCouncilDenied(message, actionVerb, extraLines = []) {
  const denials = [
    ...COUNCIL_DENIAL_COMMON_LINES,
    `The Tavernkeep laughs — a real, hearty laugh. "You? ${actionVerb}? That's a good one, nya~"`,
    ...extraLines,
  ];
  message.reply(denials[Math.floor(Math.random() * denials.length)]);
}

function comboFlairId(idA, idB) {
  return [idA, idB].sort().join('__');
}

// Pulls the "core" word off a flair label so combo labels don't end up double-suffixed
// (e.g. "Pirate-Tongued" + "Dragon-Tongued" -> "Pirate-Dragon", not "Pirate-Tongued-Dragon-Tongued").
function flairLabelCore(label) {
  return label.split(/[-(]/)[0].trim();
}

// Combo flairs (created by getOrCreateComboFlair) are cached in FLAIR_EFFECTS forever once
// created, alongside the fixed set of base flairs — nothing ever removed them. In practice the
// combo id-space is bounded by the base flair count and MAX_FLAIR_MIX_COMPONENTS, but over a
// long-running bot that's still an ever-growing in-memory object. MAX_CACHED_COMBO_FLAIRS caps
// it with simple FIFO eviction: oldest combo evicted first. Individual flairs expire within
// AUTO_SOBER_MS (well under an hour) in practice, so with a cap this size eviction essentially
// never touches a combo that's still active on someone.
const MAX_CACHED_COMBO_FLAIRS = 500;
const comboFlairInsertOrder = [];

function getOrCreateComboFlair(idA, idB) {
  if (idA === idB) return idA;
  const comboId = comboFlairId(idA, idB);
  if (FLAIR_EFFECTS[comboId]) return comboId;
  const effectA = FLAIR_EFFECTS[idA];
  const effectB = FLAIR_EFFECTS[idB];
  if (!effectA || !effectB) return null;
  FLAIR_EFFECTS[comboId] = {
    label: `${flairLabelCore(effectA.label)}-${flairLabelCore(effectB.label)}`,
    apply(text) {
      return effectB.apply(effectA.apply(text));
    },
  };
  comboFlairInsertOrder.push(comboId);
  if (comboFlairInsertOrder.length > MAX_CACHED_COMBO_FLAIRS) {
    const oldestComboId = comboFlairInsertOrder.shift();
    delete FLAIR_EFFECTS[oldestComboId];
  }
  return comboId;
}

const MIXING_CHAOS_LINES = [
  (label) => `The two brews collide in your gut, and something new comes out sideways — you're talking **${label}** now.`,
  (label) => `That really shouldn't have mixed, but here you are, sounding like some tangled-up **${label}**.`,
  (label) => `The flavors clash and fuse all at once — a fresh, chaotic **${label}** has taken hold.`,
  (label) => `Your tongue can't decide which drink to listen to, so it's doing both: **${label}**.`,
];

// Applies a new flair to a player, factoring in mixing chaos. Returns the flair id that actually
// ended up active (which may be a combo id) and whether a mix happened, so callers can pick the
// right announcement line. `player.activeFlair` is mutated directly; caller still owns saveDrinks().
function applyFlairToPlayer(player, newFlairId, durationMs, guaranteed = false) {
  const existing = player.activeFlair;
  const existingStillActive = existing && existing.expiresAt > Date.now();
  const existingComponentCount = existingStillActive ? existing.id.split('__').length : 0;

  if (
    existingStillActive &&
    existing.id !== newFlairId &&
    existingComponentCount < MAX_FLAIR_MIX_COMPONENTS &&
    Math.random() < MIXING_CHAOS_CHANCE
  ) {
    const comboId = getOrCreateComboFlair(existing.id, newFlairId);
    if (comboId) {
      player.activeFlair = { id: comboId, expiresAt: Date.now() + durationMs, guaranteed };
      return { flairId: comboId, mixed: true };
    }
  }

  player.activeFlair = { id: newFlairId, expiresAt: Date.now() + durationMs, guaranteed };
  return { flairId: newFlairId, mixed: false };
}

// Picks a random *base* flair id — deliberately reads from FLAIR_POOL (snapshotted at load time,
// before any runtime combo flairs exist) rather than Object.keys(FLAIR_EFFECTS), so a warning
// penalty never rolls a combo flair.
function pickRandomBaseFlairId() {
  return FLAIR_POOL[Math.floor(Math.random() * FLAIR_POOL.length)];
}

// Applies a warning-penalty speech flair to a player's warnFlairs stack (see WARNING_TIERS).
// Deliberately separate from activeFlair/applyFlairToPlayer:
//   - stacks instead of overwriting — every call adds its own timed entry, so a 2nd/3rd warning
//     piles a new flair on top rather than replacing the last one
//   - non-drinkable — !drink/!drink water only ever clears drunkMeter/activeFlair, never this
//   - non-parryable — !parry only ever reads/clears lastAttack/activeFlair, never this
//   - can't be removed by someone else casting/throwing a flair at this player — !cast/!throw/
//     !serve/!toast all write to activeFlair only, so they simply coexist alongside these
// getPlayer() prunes expired entries automatically, same as activeFlair.
function applyWarnPenaltyFlair(player, durationMs) {
  if (!Array.isArray(player.warnFlairs)) player.warnFlairs = [];
  const entry = { id: pickRandomBaseFlairId(), appliedAt: Date.now(), expiresAt: Date.now() + durationMs };
  player.warnFlairs.push(entry);
  return entry;
}

// How long a mod-cast !curse lasts — a full day, deliberately much longer than any other flair
// in the game (10 min cap for !cast/!throw, a few hours for warn-penalty flairs).
const MOD_CURSE_MS = 24 * 60 * 60 * 1000;

// Applies a mod-cast curse (see !curse below) to a player's curseFlairs stack. Same contract as
// applyWarnPenaltyFlair just above — non-drinkable, non-parryable, stacks instead of overwriting,
// and can't be removed by someone else casting/throwing a flair at this player (!cast/!throw/
// !serve/!toast only ever write to activeFlair) — kept as its own array purely so a !warn penalty
// and a !curse never get confused with each other in logs/behavior. getPlayer() prunes expired
// entries automatically, same as warnFlairs/activeFlair.
function applyModCurseFlair(player, durationMs) {
  if (!Array.isArray(player.curseFlairs)) player.curseFlairs = [];
  const entry = { id: pickRandomBaseFlairId(), appliedAt: Date.now(), expiresAt: Date.now() + durationMs };
  player.curseFlairs.push(entry);
  return entry;
}

// Builds a short, flavorful line announcing that a flair has just kicked in — used any time
// !serve/!toast pours something with a flair, or !cast spell applies one directly. Paraphrases
// the plain "you are now drunk, you now speak like X" into something a bit more tavern-appropriate.
function buildFlairAnnouncement(flairId) {
  const effect = FLAIR_EFFECTS[flairId];
  if (!effect) return '';
  const templates = [
    `The drink takes hold — you're properly drunk now, and it seems you'll be talking **${effect.label}** for a while.`,
    `You're drunk, all right, and something's changed in how the words come out... **${effect.label}**, it would seem.`,
    `Drunk as a lord, and your tongue's picked up a strange new habit: **${effect.label}**.`,
    `The haze settles in — drunk, and your speech has taken a turn for the **${effect.label}**.`,
    `You feel the drink take hold. Properly drunk now, and talking **${effect.label}** besides.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Used for !throw — the potions there are fantasy liquids/tonics, not alcohol, so the flavor
// text leans on "drenched/soaked" instead of "drunk".
function buildPotionFlairAnnouncement(flairId) {
  const effect = FLAIR_EFFECTS[flairId];
  if (!effect) return '';
  const templates = [
    `The potion takes hold — drenched to the bone, and it seems you'll be talking **${effect.label}** for a while.`,
    `Soaked through, and something's changed in how the words come out... **${effect.label}**, it would seem.`,
    `Dripping from head to toe, your tongue's picked up a strange new habit: **${effect.label}**.`,
    `The tonic settles in — drenched, and your speech has taken a turn for the **${effect.label}**.`,
    `You feel the potion take hold. Properly soaked now, and talking **${effect.label}** besides.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Used for !cast spell — a magical effect, so no "drunk" or "drenched" wording, just the spell
// taking hold.
function buildSpellFlairAnnouncement(flairId) {
  const effect = FLAIR_EFFECTS[flairId];
  if (!effect) return '';
  const templates = [
    `The spell takes hold, and it seems you'll be talking **${effect.label}** for a while.`,
    `Something's changed in how the words come out... **${effect.label}**, it would seem.`,
    `Your tongue's picked up a strange new habit: **${effect.label}**.`,
    `The magic settles in, and your speech has taken a turn for the **${effect.label}**.`,
    `You feel the spell take hold, talking **${effect.label}** besides.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// How long a drink's flair lingers after finishing it (minutes per point of recipe strength)
const FLAIR_MINUTES_PER_STRENGTH = 3;

// ---------- Spells (Council/Knight only, via !cast) ----------
//
// Spells operate on the same per-player record used by !serve/!toast/!drink (drunkMeter + activeFlair),
// so a cast shows up in !menu just like a real drink would.
//
// To add a new spell: add an entry below with a `cast(player, statusId)` that mutates the player
// record and returns the applied status (or null). If the spell supports named variants, list
// them in `statuses` (id -> { label, ...whatever cast() needs }); `randomPool` controls which of
// those ids get picked when no status effect is specified in the command. A spell with no
// statuses/randomPool always does the same thing regardless of args.
const SPELLS = {
  spell: {
    name: 'Spell',
    emoji: '✨',
    description: 'Casts a randomized speech-flair on a target (or a specific one if named).',
    statuses: {
      cat: { label: 'Cat-Tongued (nya~)', flair: 'cat', flairMinutes: 20 },
      troll: { label: 'Troll-Tongued (SMASH!)', flair: 'troll', flairMinutes: 20 },
      dragon: { label: 'Dragon-Tongued (RAWR)', flair: 'dragon', flairMinutes: 20 },
      dog: { label: 'Dog-Tongued (woof!)', flair: 'dog', flairMinutes: 20 },
      lizard: { label: 'Lizard-Tongued (ssss~)', flair: 'lizard', flairMinutes: 20 },
      bird: { label: 'Bird-Brained (tweet!)', flair: 'bird', flairMinutes: 20 },
      bee: { label: "Bee-Bee'd (bzzz~)", flair: 'bee', flairMinutes: 20 },
      pirate: { label: 'Pirate-Tongued (arrr!)', flair: 'pirate', flairMinutes: 20 },
      ghost: { label: 'Ghost-Voiced (wooOOoo)', flair: 'ghost', flairMinutes: 20 },
      goblin: { label: 'Goblin-Smiled (heh heh!)', flair: 'goblin', flairMinutes: 20 },
      orc: { label: 'Orc-Throated (WAAAGH!)', flair: 'orc', flairMinutes: 20 },
      vampire: { label: 'Vampire-Fanged (mortal...)', flair: 'vampire', flairMinutes: 20 },
      wizard: { label: 'Wizard-Tongued (abracadabra!)', flair: 'wizard', flairMinutes: 20 },
      royal: { label: 'Royalty (thee/thy)', flair: 'royal', flairMinutes: 20 },
      zombie: { label: 'Zombie-Groaned (braaains...)', flair: 'zombie', flairMinutes: 20 },
      viking: { label: 'Viking-Bellowed (SKÅL!)', flair: 'viking', flairMinutes: 20 },
      siren: { label: 'Siren-Sung (~♪~)', flair: 'siren', flairMinutes: 20 },
      falling: { label: 'Falling (OOHHH NOoooo...)', flair: 'falling', flairMinutes: 20 },
      guildmaster: { label: 'Guildmaster-Voiced (back in my day...)', flair: 'guildmaster', flairMinutes: 20 },
      // ---- Animals ----
      fox: { label: 'Fox-Tongued (yip!)', flair: 'fox', flairMinutes: 20 },
      wolf: { label: 'Wolf-Tongued (AWOOO!)', flair: 'wolf', flairMinutes: 20 },
      bear: { label: 'Bear-Tongued (GRAWR)', flair: 'bear', flairMinutes: 20 },
      owl: { label: 'Owl-Eyed (hoot hoot)', flair: 'owl', flairMinutes: 20 },
      frog: { label: 'Frog-Throated (ribbit)', flair: 'frog', flairMinutes: 20 },
      rabbit: { label: 'Rabbit-Eared (thump thump!)', flair: 'rabbit', flairMinutes: 20 },
      snake: { label: 'Serpent-Tongued (hsssss...)', flair: 'snake', flairMinutes: 20 },
      pig: { label: 'Pig-Snouted (oink!)', flair: 'pig', flairMinutes: 20 },
      horse: { label: 'Horse-Tongued (neighhh!)', flair: 'horse', flairMinutes: 20 },
      goat: { label: 'Goat-Bleated (maaa!)', flair: 'goat', flairMinutes: 20 },
      spider: { label: 'Spider-Legged (*skitters sideways*)', flair: 'spider', flairMinutes: 20 },
      raven: { label: 'Raven-Voiced (nevermore...)', flair: 'raven', flairMinutes: 20 },
      squirrel: { label: 'Squirrel-Cheeked (*chitters*)', flair: 'squirrel', flairMinutes: 20 },
      turtle: { label: 'Turtle-Paced (*slowly...*)', flair: 'turtle', flairMinutes: 20 },
      octopus: { label: 'Ink-Tongued (blub blub!)', flair: 'octopus', flairMinutes: 20 },
      crow: { label: 'Crow-Cawed (caw!)', flair: 'crow', flairMinutes: 20 },
      // ---- Mythical / fantasy creatures ----
      phoenix: { label: 'Phoenix-Voiced (reborn anew!)', flair: 'phoenix', flairMinutes: 20 },
      griffin: { label: 'Griffin-Screeched (SKREEEE!)', flair: 'griffin', flairMinutes: 20 },
      unicorn: { label: 'Unicorn-Spoken (~sparkles~)', flair: 'unicorn', flairMinutes: 20 },
      kraken: { label: 'Kraken-Voiced (BLORGHHH)', flair: 'kraken', flairMinutes: 20 },
      fairy: { label: 'Fairy-Voiced (~teehee~)', flair: 'fairy', flairMinutes: 20 },
      gnome: { label: 'Gnome-Tinkered (one moment!)', flair: 'gnome', flairMinutes: 20 },
      banshee: { label: 'Banshee-Wailed (woooOOOoo...)', flair: 'banshee', flairMinutes: 20 },
      yeti: { label: 'Yeti-Grunted (GROOAAR!)', flair: 'yeti', flairMinutes: 20 },
      minotaur: { label: 'Minotaur-Snorted (HRNNGH!)', flair: 'minotaur', flairMinutes: 20 },
      centaur: { label: 'Centaur-Spoken (*hooves clop*)', flair: 'centaur', flairMinutes: 20 },
      gargoyle: { label: 'Gargoyle-Grated (grrrrnk...)', flair: 'gargoyle', flairMinutes: 20 },
      golem: { label: 'Golem-Rumbled (MUST. OBEY.)', flair: 'golem', flairMinutes: 20 },
      cyclops: { label: 'Cyclops-Roared (RAAAGH!)', flair: 'cyclops', flairMinutes: 20 },
      imp: { label: 'Imp-Cackled (hehehe!)', flair: 'imp', flairMinutes: 20 },
      wraith: { label: 'Wraith-Whispered (join us...)', flair: 'wraith', flairMinutes: 20 },
      merfolk: { label: 'Merfolk-Spoken (*bubbles rise*)', flair: 'merfolk', flairMinutes: 20 },
      satyr: { label: 'Satyr-Piped (to the revel!)', flair: 'satyr', flairMinutes: 20 },
      harpy: { label: 'Harpy-Shrieked (SKREE!)', flair: 'harpy', flairMinutes: 20 },
      // ---- Fantasy races ----
      elf: { label: 'Elf-Spoken (the forest remembers.)', flair: 'elf', flairMinutes: 20 },
      dwarf: { label: 'Dwarf-Bellowed (BY MY BEARD!)', flair: 'dwarf', flairMinutes: 20 },
      halfling: { label: 'Halfling-Chirped (second breakfast?)', flair: 'halfling', flairMinutes: 20 },
      gnoll: { label: 'Gnoll-Yipped (yip yip!)', flair: 'gnoll', flairMinutes: 20 },
      tiefling: { label: 'Tiefling-Tailed (heh, careful now.)', flair: 'tiefling', flairMinutes: 20 },
      drow: { label: 'Drow-Whispered (the underdark remembers all.)', flair: 'drow', flairMinutes: 20 },
      giant: { label: 'Giant-Boomed (SMALL FOLK!)', flair: 'giant', flairMinutes: 20 },
    },
    // No status arg given -> roll randomly across every speech flair below, so a plain
    // `!cast spell @user` can land on anything from Cat-Tongued to full Siren-Sung.
    randomPool: [
      'cat', 'troll', 'dragon', 'dog', 'lizard', 'bird', 'bee', 'pirate', 'ghost',
      'goblin', 'orc', 'vampire', 'wizard', 'royal', 'zombie', 'viking', 'siren', 'falling',
      'guildmaster',
      'fox', 'wolf', 'bear', 'owl', 'frog', 'rabbit', 'snake', 'pig', 'horse', 'goat',
      'spider', 'raven', 'squirrel', 'turtle', 'octopus', 'crow',
      'phoenix', 'griffin', 'unicorn', 'kraken', 'fairy', 'gnome', 'banshee', 'yeti',
      'minotaur', 'centaur', 'gargoyle', 'golem', 'cyclops', 'imp', 'wraith', 'merfolk',
      'satyr', 'harpy',
      'elf', 'dwarf', 'halfling', 'gnoll', 'tiefling', 'drow', 'giant',
    ],
    // Purely a speech-disability spell now — no drunk meter involved at all, just the flair.
    cast(player, statusId) {
      const status = this.statuses[statusId];
      const flairId = status.flair || FLAIR_POOL[Math.floor(Math.random() * FLAIR_POOL.length)];
      const flairMinutes = status.flairMinutes || 20;
      player.activeFlair = { id: flairId, expiresAt: Date.now() + flairMinutes * 60 * 1000, guaranteed: true };
      return { ...status, flair: flairId };
    },
  },
  clear: {
    name: 'Clear',
    emoji: '🧹',
    description: 'Clears all active status effects from a target (drunk meter reset, flairs removed).',
    statuses: {},
    randomPool: [],
    cast(player) {
      player.drunkMeter = 0;
      player.activeFlair = null;
      return null;
    },
  },
};


// ---------- Cast flavor text ----------
//
// Whoever casts a spell gets attributed by name in the announcement. The Guild Leader plays a
// Paladin and gets their exact Paladin skill names/lines below; everyone else (any
// other Council/Knight) gets a generic fantasy version under their own display name.
const LEADER_NAME = 'Guildmaster';

function getCasterName(member) {
  if (member.roles.cache.has(GUILD_LEADER_ROLE_ID)) return LEADER_NAME;
  return member.displayName || member.user.username;
}

// Guildmaster's randomized clear-spell flavor — picked fresh each cast.
const LEADER_CLEAR_VARIANTS = [
  { spell: 'Prayer of Comfort', flavor: 'your drunken state was removed through a prayer. truly a miracle . . .' },
  { spell: 'Smite', flavor: 'you were hit on the head by a smite spell. a light sword aura passes through you . . . you suddenly sobered up . . .' },
  { spell: 'Consecrate', flavor: 'you were hit by consecrate. your surroundings suddenly start to become clearer . . .' },
  { spell: 'Rebuke', flavor: 'you were hit by a holy sword crashing down. you should probably stop drinking . . .' },
];

// Everyone else's randomized clear-spell flavor (generic Council/Knight caster, not Guildmaster).
const GENERIC_CLEAR_VARIANTS = [
  { spellLabel: 'a healing spell', flavor: 'your drunken state was removed due to the spell. drink with precaution next time . . .' },
  { spellLabel: 'a cleansing spell', flavor: 'the haze lifts as if swept away by unseen hands. your head feels clear again . . .' },
  { spellLabel: 'a ward of sobriety', flavor: 'a faint light passes over you, and the room finally stops spinning . . .' },
  { spellLabel: 'a purifying chant', flavor: 'the fog in your mind burns away like morning mist over the tavern floor . . .' },
];

// Randomized flavor lines for a spell cast, picked fresh each time — replaces the old
// single fixed "You feel a little dizzy . . ." line.
const SPELL_CAST_FLAVORS = [
  'You feel a little dizzy . . .',
  'The room gives a slow, lazy spin . . .',
  'A warm haze creeps up from your toes . . .',
  'Your thoughts go soft and syrupy . . .',
  'The floor tilts just slightly under your feet . . .',
  'Everything blurs pleasantly at the edges . . .',
  'A tingling warmth spreads through your chest . . .',
  'The candlelight starts to swim a little . . .',
];

// Closing lines for the channel-wide clear, appended after the affected-member count.
const CHANNEL_CLEAR_CLOSERS = [
  'The tavern falls quiet as the air clears.',
  'A cool breeze sweeps through, and the haze lifts from every corner of the room.',
  'The barkeep nods approvingly as the room steadies itself.',
  'The last of the fog rolls out the door, and the tavern feels sober once more.',
];

// Builds the { header, flavor } text for a cast. targetLabel is whatever the spell lands on —
// a member mention for a single-target cast, a channel mention for a channel-wide clear.
function buildCastFlavor(spellId, casterName, targetLabel) {
  const isLeaderCaster = casterName === LEADER_NAME;

  if (spellId === 'spell') {
    return {
      header: `${casterName} casts a mischievous spell on ${targetLabel}`,
      flavor: SPELL_CAST_FLAVORS[Math.floor(Math.random() * SPELL_CAST_FLAVORS.length)],
    };
  }

  if (spellId === 'clear') {
    if (isLeaderCaster) {
      const variant = LEADER_CLEAR_VARIANTS[Math.floor(Math.random() * LEADER_CLEAR_VARIANTS.length)];
      return { header: `${casterName} casts ${variant.spell} on ${targetLabel}`, flavor: variant.flavor };
    }
    const variant = GENERIC_CLEAR_VARIANTS[Math.floor(Math.random() * GENERIC_CLEAR_VARIANTS.length)];
    return {
      header: `${casterName} casts ${variant.spellLabel} on ${targetLabel}`,
      flavor: variant.flavor,
    };
  }

  return { header: `${casterName} casts ${spellId} on ${targetLabel}`, flavor: '' };
}

// ---------- Auto-sober timer ----------
//
// A spell-forced flair wears off on its own after 10 minutes so nobody has to track down a mod
// to get cleared. (This is separate from the slow passive decay that normal drinking
// uses — that's an intentional, much slower part of the drinking minigame.)
const AUTO_SOBER_MS = 10 * 60 * 1000;
const pendingSoberTimers = new Map(); // userId -> Timeout

const SOBER_UP_LINES = [
  'blinks, and just like that the fog lifts — sobered up on their own.',
  'shakes their head as the dizziness fades. Sober again.',
  'feels the spell wear off, and the room stops spinning. Back to normal.',
  'lets out a long breath as the haze clears. Sober once more.',
  'steadies themself as the last of the spell fades away. All clear.',
];

function cancelSoberTimer(userId) {
  if (pendingSoberTimers.has(userId)) {
    clearTimeout(pendingSoberTimers.get(userId));
    pendingSoberTimers.delete(userId);
  }
}

function scheduleAutoSober(userId, channel, durationMs = AUTO_SOBER_MS) {
  cancelSoberTimer(userId);
  const timer = setTimeout(async () => {
    pendingSoberTimers.delete(userId);
    const drinks = loadDrinks();
    const player = getPlayer(drinks, userId);
    if (player.drunkMeter <= 0 && !player.activeFlair) return; // already cleared some other way
    player.drunkMeter = 0;
    player.activeFlair = null;
    saveDrinks(drinks);
    const line = SOBER_UP_LINES[Math.floor(Math.random() * SOBER_UP_LINES.length)];
    let soberName = 'They';
    try {
      const soberMember = await channel.guild.members.fetch(userId);
      soberName = soberMember.displayName || soberMember.user.username;
    } catch (err) {
      // Fall back to "They" if the member can't be resolved (left the guild, etc.)
    }
    try {
      await channel.send({ content: `**${soberName}** ${line}`, allowedMentions: { parse: [] } });
    } catch (err) {
      console.error('Failed to send auto-sober message:', err);
    }
  }, durationMs);
  pendingSoberTimers.set(userId, timer);
}

// Clears drunk state for every tracked player (used by !cast clear #channel). Returns how many
// players actually had something to clear.
function clearAllDrunkStates() {
  const drinks = loadDrinks();
  let affected = 0;
  for (const userId of Object.keys(drinks)) {
    const player = getPlayer(drinks, userId);
    if (player.drunkMeter > 0 || player.activeFlair) affected++;
    player.drunkMeter = 0;
    player.activeFlair = null;
    cancelSoberTimer(userId);
  }
  saveDrinks(drinks);
  return affected;
}

// Gets (or creates) the webhook used to repost drunk members' messages under their own name/avatar.
// Requires the Manage Webhooks permission in that channel.
async function getOrCreateDrunkWebhook(channel) {
  try {
    const webhooks = await channel.fetchWebhooks();
    let hook = webhooks.find((w) => w.name === 'Tavernkeep Drunk Relay');
    if (!hook) {
      hook = await channel.createWebhook({
        name: 'Tavernkeep Drunk Relay',
        reason: 'Relays slurred messages from drunk members',
      });
    }
    return hook;
  } catch (err) {
    console.error('Could not get/create drunk-relay webhook:', err);
    return null;
  }
}

// ---------- Attack effects (for !parry) ----------
//
// Any time a !cast (spell) or !throw lands on someone, the caller records the resulting effect
// on the target's player record as `lastAttack`. That's what lets !parry reverse the effect on
// the defender and slap the exact same effect onto whoever cast/threw it — and since the target
// of THAT bounce also gets a fresh `lastAttack`, the caster can turn around and parry it right
// back, chain-style, until someone's cooldown catches up with them.
//
// `effect` shape is shared by cast and throw: { meterDelta, flairId, flairDurationMs }.
function applyAttackEffect(player, effect) {
  if (effect.meterDelta) {
    player.drunkMeter = Math.min(100, Math.max(0, player.drunkMeter + effect.meterDelta));
  }
  if (effect.flairId) {
    player.activeFlair = { id: effect.flairId, expiresAt: Date.now() + effect.flairDurationMs, guaranteed: true };
  }
}

function removeAttackEffect(player, effect) {
  if (effect.meterDelta) {
    player.drunkMeter = Math.max(0, player.drunkMeter - effect.meterDelta);
  }
  if (effect.flairId && player.activeFlair && player.activeFlair.id === effect.flairId) {
    player.activeFlair = null;
  }
}

function recordAttack(target, casterId, effect, kind) {
  target.lastAttack = { casterId, effect, kind, timestamp: Date.now() };
}

// A pending attack can only be parried while it's still "live" — past AUTO_SOBER_MS it would've
// worn off on its own anyway, so there's nothing left to reflect.
function getParryableAttack(player) {
  if (!player.lastAttack) return null;
  if (Date.now() - player.lastAttack.timestamp > AUTO_SOBER_MS) return null;
  return player.lastAttack;
}

// ---------- Helpers ----------

// Council, Knight, Emissary, and the Guild Leader all
// share the same moderation-tier access: !curse, the IGN/lore directory (add/edit/remove),
// giveaway/rsvp management, the full !cast spellbook, and no-cooldown !parry. Guild Leader was
// previously only exempt from being warned (GUILD_LEADER_ROLE_ID checks elsewhere) but didn't
// inherit this full tier — added here so the Guild Leader has the same edit/remove/all access as
// Council everywhere isCouncil() gates. NOTE: warn issuing/removal and mute/unmute are NOT part
// of this tier — see isPunitiveModerator()/canMuteMembers() below, where Emissary can mute but
// can no longer warn.
function isCouncil(member) {
  if (!member || !member.roles) return false; // e.g. DMs / partial members
  return (
    isLeadershipUser(member) ||
    member.roles.cache.has(ETHEREAL_ROLE_ID) ||
    member.roles.cache.has(COUNCIL_ROLE_ID) ||
    member.roles.cache.has(KNIGHT_ROLE_ID) ||
    member.roles.cache.has(EMISSARY_ROLE_ID) ||
    member.roles.cache.has(GUILD_LEADER_ROLE_ID)
  );
}

// Punitive actions: Council, Knight/Sentinel, and the Guild Leader.
// Emissary was previously included here too, but no longer is — Emissary keeps its
// isCouncil() access (cast spellbook, parry, the IGN directory, !shout/!message, !tod, !curse)
// but can no longer issue/remove/edit warnings. canMuteMembers() re-adds EMISSARY_ROLE_ID
// directly below so mute/unmute access for Emissary is unaffected by this change.
function isPunitiveModerator(member) {
  if (!member || !member.roles) return false; // e.g. DMs / partial members
  return (
    isLeadershipUser(member) ||
    member.roles.cache.has(ETHEREAL_ROLE_ID) ||
    member.roles.cache.has(COUNCIL_ROLE_ID) ||
    member.roles.cache.has(KNIGHT_ROLE_ID) ||
    member.roles.cache.has(GUILD_LEADER_ROLE_ID)
  );
}

// Gate for the !warn menu's Edit button specifically: same tier as isPunitiveModerator() (Council
// of the Council, Knight/Sentinel, and the Guild Leader — NOT Emissary). There's no
// separate Sovereign/Sentinel Discord role (they're rank/title names within Council and Knight),
// so in practice this is identical to isPunitiveModerator() — kept as its own named function so
// the Edit permission reads clearly at the call site and can be narrowed independently later if a
// dedicated role ever gets added.
function canEditWarnings(member) {
  return isPunitiveModerator(member);
}

// Whether the issuing moderator's name should be redacted on a `!warn show`/`!warn history`
// line. Hidden inside the moderation-private channel (so mods stay anonymous to each other
// there too), and ALWAYS hidden from anyone who isn't a punitive moderator — regular members
// browsing warning history should see who was warned, the reason, and the date, but never who
// issued it. Only a punitive moderator viewing outside moderation-private sees the full line.
function shouldHideWarnModerator(message) {
  return message.channel.id === MODERATION_PRIVATE_CHANNEL_ID || !isPunitiveModerator(message.member);
}

// Stricter than isCouncil(): true only for Council, NOT Knight/Sentinel. Used to
// gate the channel-wide spell cast (`!cast spell #channel`), which is reserved for the Council even
// though Knight/Sentinel otherwise has full access to everything else under !cast.
function isHighCouncil(member) {
  return isLeadershipUser(member) || member.roles.cache.has(ETHEREAL_ROLE_ID) || member.roles.cache.has(COUNCIL_ROLE_ID);
}

// ---- Warn-target resolution: a mention, a raw ID, or just a name all work — none of them
// require pinging the target. Name lookups check the cache first and only fall back to a live
// member search if nothing's found there.
async function resolveWarnTarget(guild, rawArg) {
  if (!rawArg) return null;

  const mentionMatch = rawArg.match(/^<@!?(\d+)>$/);
  const snowflake = mentionMatch ? mentionMatch[1] : (/^\d{15,20}$/.test(rawArg) ? rawArg : null);

  if (snowflake) {
    const member = await guild.members.fetch(snowflake).catch(() => null);
    return { id: snowflake, member };
  }

  const query = rawArg.toLowerCase();
  let found = guild.members.cache.find(
    (m) => m.user.username.toLowerCase() === query || m.displayName.toLowerCase() === query
  );
  if (!found) {
    found = guild.members.cache.find(
      (m) => m.user.username.toLowerCase().includes(query) || m.displayName.toLowerCase().includes(query)
    );
  }
  if (!found) {
    // Cache miss — fall back to a live search for members not yet in the local cache.
    const results = await guild.members.fetch({ query: rawArg, limit: 5 }).catch(() => null);
    found = results?.first();
  }
  return found ? { id: found.id, member: found } : null;
}

// Plain, non-pinging label for a warn target — display name if the member's still around,
// otherwise just the raw ID so old records for departed members still show something useful.
function warnTargetLabel(userId, member) {
  if (member) return member.displayName || member.user.username;
  return `Unknown member (${userId})`;
}

// Delivers a !warn show/!warn history payload to the right place: MODERATION_PRIVATE_CHANNEL_ID
// posts right there (in-place, no redirect), anywhere else posts to/redirects to
// WARN_SHOW_CHANNEL_ID (the admin channel). Visibility is the same in both places — this just
// picks the channel. Which moderator issued each warning is redacted or shown per line; see
// formatWarnLine() below.
async function deliverWarnHistoryOutput(message, payload) {
  const showChannel = message.channel.id === MODERATION_PRIVATE_CHANNEL_ID
    ? message.channel
    : await message.guild.channels.fetch(WARN_SHOW_CHANNEL_ID).catch(() => null);

  if (showChannel) showChannel.send(payload);
  else message.reply(payload);
}

// Formats one warning-history line. Whether the moderator's name is redacted here comes from
// shouldHideWarnModerator() at the call site — see that function for exactly when.
function formatWarnLine(item, hideModerator) {
  const dateStr = new Date(item.record.timestamp).toLocaleDateString();
  return hideModerator
    ? `**#${item.number}.** ${item.record.reason} — *${dateStr}*`
    : `**#${item.number}.** ${item.record.reason} — *by ${item.record.moderator}, ${dateStr}*`;
}

// Full "!warn show" listing — every member with at least one warning, most-warned first, with
// reasons/dates (moderator name shown or redacted per shouldHideWarnModerator()). Shared by the
// direct `!warn show` text command and the History button non-mods get from bare `!warn` (see
// startMemberWarnHistoryMenu()), so both paths can't drift out of sync.
async function renderWarnShowList(message) {
  const warnings = loadWarnings();
  const flat = buildFlattenedWarnings(warnings);
  const hideModerator = shouldHideWarnModerator(message);

  if (flat.length === 0) {
    await deliverWarnHistoryOutput(message, 'The grimoire is empty — no warnings recorded.');
    return;
  }

  // Discord embeds cap out at 25 fields and 1024 chars per field value — with enough
  // members and warnings this would eventually hit that ceiling and start erroring or
  // silently truncating. Show the most-warned members first (most actionable for Council),
  // and only the most recent warnings per member, with a note when something's hidden. The
  // numbers shown stay true to each entry's global position even when hidden by truncation.
  const MAX_WARN_SHOW_USERS = 24;
  const MAX_RECORDS_PER_USER = 10;

  const byUser = new Map();
  for (const item of flat) {
    if (!byUser.has(item.userId)) byUser.set(item.userId, []);
    byUser.get(item.userId).push(item);
  }
  const sortedUsers = [...byUser.entries()].sort((a, b) => b[1].length - a[1].length);
  const shownUsers = sortedUsers.slice(0, MAX_WARN_SHOW_USERS);
  const hiddenUserCount = sortedUsers.length - shownUsers.length;

  const embed = new EmbedBuilder()
    .setTitle('📖 The Grimoire of Warnings')
    .setColor(0x8b0000);

  for (const [userId, items] of shownUsers) {
    const recordsToShow = items.slice(-MAX_RECORDS_PER_USER);
    const omittedCount = items.length - recordsToShow.length;
    const member = await message.guild.members.fetch(userId).catch(() => null);
    const label = warnTargetLabel(userId, member);
    const lines = recordsToShow
      .map((it) => formatWarnLine(it, hideModerator))
      .join('\n');
    const value = omittedCount > 0
      ? `${lines}\n*(+${omittedCount} earlier warning${omittedCount === 1 ? '' : 's'} not shown)*`
      : lines;
    embed.addFields({ name: `${label} (${items.length} warning${items.length > 1 ? 's' : ''})`, value });
  }

  if (hiddenUserCount > 0) {
    embed.setFooter({ text: `+${hiddenUserCount} more member${hiddenUserCount === 1 ? '' : 's'} with warnings not shown here — use !warn history <name> for a specific member.` });
  }

  await deliverWarnHistoryOutput(message, { embeds: [embed] });
}

// Bare `!warn` from a member who isn't a punitive moderator — they can't issue/remove/edit
// warnings, but they can still browse warning history (same as typing `!warn show` or
// `!warn history <name>` directly, both of which stay open to everyone). This just gives them
// the same button-driven entry point mods get from startWarnMenu(), scoped to a single "History"
// option instead of the full Warn/History/Remove/Edit set.
async function startMemberWarnHistoryMenu(message) {
  message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnmemberhistory:view').setLabel('View Warning History').setEmoji('📖').setStyle(ButtonStyle.Secondary)
  );

  const picker = await message.channel.send({
    content: '📖 The grimoire is Council/Knight business to write in — but anyone can read it. Want to see the warning history?',
    components: [row],
  }).catch(() => null);
  if (!picker) return;

  const click = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnmemberhistory:view',
      time: 60000,
    })
    .catch(() => null);

  if (!click) {
    await picker.edit({ content: '🕰️ No response — the grimoire stays closed.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  await click.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await picker.edit({ content: '📖 Fetching the grimoire...', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  await renderWarnShowList(message);
}


// Flattens the warnings store into one globally-numbered list, most-warned member first and
// each member's own warnings kept in the order they were issued. `!warn show` / `!warn history`
// display these numbers, and `!warn remove <number>` reads them back — keeping the numbering in
// one shared place means the two can never disagree about what "#7" refers to.
function buildFlattenedWarnings(warnings) {
  const sorted = Object.entries(warnings).sort((a, b) => b[1].length - a[1].length);
  const flat = [];
  let n = 1;
  for (const [userId, records] of sorted) {
    records.forEach((record, idxInUser) => {
      flat.push({ number: n++, userId, idxInUser, record });
    });
  }
  return flat;
}

// Sends a Yes/No button prompt and waits up to 30s for the same author to click one. Used
// before any warning removal actually happens, so a mistyped number or name never silently
// deletes history. Returns true/false, or null on timeout — and always disables the buttons
// on the sent prompt once resolved (or once it times out), so a stale click can't fire twice.
async function awaitYesNoButtons(message, promptText, promptOptions = {}) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('confirm:yes').setLabel('Yes').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('confirm:no').setLabel('No').setStyle(ButtonStyle.Danger)
  );

  const prompt = await message.reply({
    content: promptText,
    components: [row],
    ...promptOptions,
  });

  const click = await prompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && ['confirm:yes', 'confirm:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  const disabledRow = new ActionRowBuilder().addComponents(
    ButtonBuilder.from(row.components[0]).setDisabled(true),
    ButtonBuilder.from(row.components[1]).setDisabled(true)
  );

  if (!click) {
    await prompt.edit({ components: [disabledRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  const confirmed = click.customId === 'confirm:yes';
  await click.update({ components: [disabledRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  return confirmed;
}

// Same shape, but for the officer !warn announce prompt: "Announce" (📣)
// vs "No". Posted as its own message (the mod's command message is already gone by the time
// this runs) so anyone re-checking later can see the prompt and its outcome. Only the mod who
// ran the command can press a button; times out to "No" after 30s so a warning never gets stuck
// half-issued.
async function awaitAnnounceButtons(channel, userId, promptText, promptOptions = {}) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnannounce:yes').setLabel('Announce').setEmoji('📣').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('warnannounce:no').setLabel('No').setStyle(ButtonStyle.Secondary)
  );

  const prompt = await channel.send({
    content: promptText,
    components: [row],
    ...promptOptions,
  });

  const click = await prompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === userId && ['warnannounce:yes', 'warnannounce:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!click) {
    return { confirmed: false, prompt, timedOut: true };
  }

  const confirmed = click.customId === 'warnannounce:yes';
  await click.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  return { confirmed, prompt, timedOut: false };
}

// Pre-ban "are you sure" gate — same Yes/No shape as awaitYesNoButtons, but posted straight to a
// channel (like awaitAnnounceButtons) instead of message.reply(), since by the time this runs the
// mod's own command message has already been deleted (both the !ban text path and the interactive
// picker delete it up front, same as !warn). Banning is permanent, so this confirmation is asked
// even on the direct `!ban @user reason` path, unlike !warn which applies immediately.
async function awaitBanConfirmButtons(channel, userId, promptText) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('banconfirm:yes').setLabel('Yes, banish').setEmoji('🔨').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('banconfirm:no').setLabel('No').setStyle(ButtonStyle.Secondary)
  );

  const prompt = await channel.send({ content: promptText, components: [row] }).catch(() => null);
  if (!prompt) return { confirmed: false, prompt: null, timedOut: false };

  const click = await prompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === userId && ['banconfirm:yes', 'banconfirm:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  const disabledRow = new ActionRowBuilder().addComponents(
    ButtonBuilder.from(row.components[0]).setDisabled(true),
    ButtonBuilder.from(row.components[1]).setDisabled(true)
  );

  if (!click) {
    await prompt.edit({ components: [disabledRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return { confirmed: false, prompt, timedOut: true };
  }

  const confirmed = click.customId === 'banconfirm:yes';
  await click.update({ components: [disabledRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  return { confirmed, prompt, timedOut: false };
}

// Bans a member: confirms (this can't be undone), actually bans, then gates the public post
// behind the same Announce/No prompt !warn uses, and logs to the secret grimoire either way.
// Shared by the text-command path (`!ban @user reason`) and the interactive picker (bare `!ban`)
// below, exactly like issueWarning() is shared by !warn's two entry points.
async function issueBan(message, grimoire, targetMember, reason, opts = {}) {
  const { targetChannel } = opts;
  const targetTag = targetMember.user.tag;
  const targetId = targetMember.id;
  const targetDisplay = targetMember.displayName || targetMember.user.username;

  const { confirmed: wantsBan, prompt: confirmPrompt, timedOut: confirmTimedOut } = await awaitBanConfirmButtons(
    message.channel,
    message.author.id,
    `🔨 Banish **${targetDisplay}** (${targetTag}) for: "${reason}"?\nThis cannot be undone.`
  );

  if (!wantsBan) {
    const note = confirmTimedOut ? ' *(no response — defaulted to not banning)*' : '';
    if (confirmPrompt) {
      await confirmPrompt.edit({ content: `🕊️ Banishment of **${targetDisplay}** cancelled — nothing happened.${note}`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }
    return;
  }
  await confirmPrompt.edit({ content: `🔨 Banishing **${targetDisplay}**...`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  try {
    await targetMember.ban({ reason: `${reason} — banned by ${message.author.tag}` });
  } catch (err) {
    console.error('Failed to ban member:', err);
    message.channel.send(`⚠️ Tried to banish **${targetDisplay}** but the Tavernkeep's paw slipped — check my role permissions/hierarchy.`).catch((e) => console.error('Discord API call failed (non-critical):', e));
    return;
  }

  // Public message from Tavernkeep — deliberately anonymous, same rule as !warn's public post:
  // no mention of which mod issued it (that only appears in the secret grimoire log below).
  const banEmbed = new EmbedBuilder()
    .setColor(0x8b0000)
    .setDescription(`was banished from the guild.\n\n**Reason:**\n${reason}`)
    .setFooter({ text: 'Banished' });
  const banPayload = { content: `**${targetDisplay}** (${targetTag})`, embeds: [banEmbed] };

  async function postBan() {
    if (targetChannel) return targetChannel.send(banPayload).catch(() => null);
    return null;
  }

  // Every ban gets an Announce/No prompt, same as !warn — the ban itself, its grimoire log, are
  // unconditional; this prompt only gates the public Tavern message.
  const { confirmed, prompt, timedOut } = await awaitAnnounceButtons(
    message.channel,
    message.author.id,
    `📣 **${targetDisplay}** has been banished — announce it publicly in ${targetChannel}?`
  );

  if (confirmed) {
    await postBan();
    await prompt.edit({ content: `📣 Banishment of **${targetDisplay}** announced in ${targetChannel}.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  } else {
    const declineNote = timedOut ? ' *(no response — defaulted to not announcing)*' : '';
    await prompt.edit({ content: `🤫 **${targetDisplay}** was banished quietly — not announced.${declineNote}`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  // Secret log — this one DOES name the moderator; anonymity is only for the public post above.
  if (grimoire) {
    const logEmbed = new EmbedBuilder()
      .setTitle('🔨 Member Banished')
      .setColor(0x8b0000)
      .addFields(
        { name: 'User', value: `${targetTag} (${targetId})` },
        { name: 'Reason', value: reason },
        { name: 'Moderator', value: message.author.tag },
        { name: 'Posted In', value: confirmed ? `${targetChannel}` : '*(not announced — mod chose No)*' },
        { name: 'Announced', value: confirmed ? 'Yes' : 'No' }
      )
      .setTimestamp();
    grimoire.send({ embeds: [logEmbed] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }
}

// Records a warning, posts it (immediately for full Council, gated behind an Announce/No prompt
// for officers), logs it secretly to the grimoire, and applies any tier action (mute/Council
// ping). Shared by the text-command path (`!warn @user ...`) and the interactive picker (bare
// `!warn`) below, so the two entry points can't drift out of sync.
async function issueWarning(message, grimoire, targetMember, reason, opts = {}) {
  const {
    targetChannel,
    linkedMessage = null,
    linkArg = null,
    warnAttachments = [],
    // autoPosted is still accepted from callers (harmless if passed) but no longer changes
    // behavior — the public post never self-deletes anymore, see postWarning() below.
  } = opts;

  const warnings = loadWarnings();
  const userId = targetMember.id;
  if (!warnings[userId]) warnings[userId] = [];

  warnings[userId].push({
    reason,
    moderator: message.author.tag,
    timestamp: Date.now(),
  });
  saveWarnings(warnings);

  const warnCount = warnings[userId].length;
  const MAX_DEFINED_TIER = MAX_DEFINED_WARNING_TIER;

  // Public message from Tavernkeep — deliberately anonymous (no mention of which mod issued it;
  // that only appears in the secret grimoire log below) so members can't pinpoint who warned who.
  // It also no longer self-deletes: the point of posting it publicly is so people can see who was
  // warned and why, for clarity, and so they don't repeat whatever got the warning issued.
  const warnCountLabel = warnCount <= MAX_DEFINED_TIER
    ? `${warnCount}/${MAX_DEFINED_TIER}`
    : `${warnCount} — past the max defined tier (${MAX_DEFINED_TIER})`;
  const warnEmbed = new EmbedBuilder()
    .setColor(0xffa500)
    .setDescription(`was warned.\n\n**Reason:**\n${reason}`)
    .setFooter({ text: `Warning ${warnCountLabel}` });
  const warnPayload = {
    content: `${targetMember}`,
    embeds: [warnEmbed],
    ...(warnAttachments.length ? { files: warnAttachments.map((a) => a.url) } : {}),
  };

  // Actually sends warnPayload to its resolved destination (linkedMessage reply, or targetChannel).
  // Shared by both the immediate Council path and the officer path below (after they've confirmed
  // via the Announce prompt).
  async function postWarning() {
    if (linkedMessage) {
      return linkedMessage
        .reply({ ...warnPayload, allowedMentions: { repliedUser: false } })
        .catch(() => targetChannel.send(warnPayload).catch(() => null));
    }
    if (targetChannel) {
      return targetChannel.send(warnPayload).catch(() => null);
    }
    return null;
  }

  // Every warning now gets an Announce/No prompt — Council and officers alike — before anything
  // public goes out. The warning record, grimoire log, and any tier action (mute/Council ping)
  // still happen either way; this prompt only gates the public Tavern message.
  const { confirmed, prompt, timedOut } = await awaitAnnounceButtons(
    message.channel,
    message.author.id,
    `📣 Warning logged for ${targetMember} — announce it publicly in ${targetChannel}?`,
    // This prompt is only ever seen by the mod (posted wherever they ran the command) — the
    // mention still renders as a normal @-pill for clarity, but suppressed here so picking
    // "No" (or just testing the flow) never actually pings the target. The real ping only goes
    // out from postWarning() below, and only once Announce is actually pressed.
    { allowedMentions: { users: [] } }
  );
  const announced = confirmed;
  if (confirmed) {
    await postWarning();
    await prompt.edit({ content: `📣 Warning for ${targetMember} announced in ${targetChannel}.`, components: [], allowedMentions: { users: [] } }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  } else {
    const declineNote = timedOut ? ' *(no response — defaulted to not announcing)*' : '';
    await prompt.edit({ content: `🤫 Warning for ${targetMember} logged quietly — not announced.${declineNote}`, components: [], allowedMentions: { users: [] } }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  // Secret log — this one DOES name the moderator; anonymity is only for the public post above.
  if (grimoire) {
    const logEmbed = new EmbedBuilder()
      .setTitle('⚠️ Warning Logged')
      .setColor(0xffa500)
      .addFields(
        { name: 'User', value: `${targetMember} (${targetMember.id})` },
        { name: 'Reason', value: reason },
        { name: 'Moderator', value: message.author.tag },
        { name: 'Posted In', value: announced ? `${targetChannel}` : '*(not announced — mod chose No)*' },
        { name: 'Total Warnings', value: `${warnCount}` },
        { name: 'Announced', value: announced ? 'Yes' : 'No' },
        ...(linkedMessage ? [{ name: 'Replied To', value: `[Jump to message](${linkArg})` }] : []),
        ...(warnAttachments.length ? [{ name: 'Attached', value: `${warnAttachments.length} image${warnAttachments.length > 1 ? 's' : ''}` }] : [])
      )
      .setTimestamp();
    grimoire.send({ embeds: [logEmbed] });
  }

  // Apply this warning tier's action, if any (1/2 = flair only; 3/4/5 = mute; 5 also pings
  // Council for a manual removal decision). Anything past 5 has no dedicated entry, so it
  // repeats tier 5's action (5-day mute + Council ping) every time, since silently doing nothing
  // at 6+ warnings would mean the bot stops enforcing right when things are most serious.
  const tier = WARNING_TIERS[warnCount] || (warnCount > MAX_DEFINED_TIER ? WARNING_TIERS[MAX_DEFINED_TIER] : null);
  if (tier) {
    try {
      if (tier.action === 'mute') {
        await targetMember.timeout(tier.durationMs, `Reached ${warnCount} warnings`);
        targetChannel.send(
          `The Tavernkeep has had enough, nya. With a swipe of his paw, ${targetMember} is banished to the cellar for ${tier.durationLabel}. Think on your manners down there.`
        );
        if (grimoire) {
          grimoire.send(`🔇 <@${userId}> was auto-muted for ${tier.durationLabel} after reaching ${warnCount} warnings.`);
          if (tier.pingCouncil) {
            grimoire.send(`🚨 <@&${COUNCIL_ROLE_ID}> <@${userId}> has reached ${warnCount} warnings — please review and decide whether removal is warranted.`);
          }
        }
      }

      // 'flair' (tiers 1 and 2) stacks a warning-penalty speech flair on top of the target's
      // warnFlairs — non-drinkable, non-parryable, and immune to being washed out by anyone
      // else's !cast/!throw (see applyWarnPenaltyFlair).
      if (tier.action === 'flair') {
        const drinks = loadDrinks();
        const player = getPlayer(drinks, userId);
        const flairEntry = applyWarnPenaltyFlair(player, tier.flairDurationMs);
        saveDrinks(drinks);
        const flairLabel = FLAIR_EFFECTS[flairEntry.id]?.label || flairEntry.id;
        targetChannel.send(
          `A shameful hex settles over ${targetMember} — for the next **${tier.flairDurationLabel}**, they'll be talking **${flairLabel}**, nya. It won't wash off, and no one can spell it away.`
        );
        if (grimoire) {
          grimoire.send(`🗣️ <@${userId}> was hit with a **${tier.flairDurationLabel} ${flairLabel}** warning-penalty flair after reaching ${warnCount} warnings (non-drinkable, non-parryable, stacks).`);
        }
      }
    } catch (err) {
      console.error(`Failed to apply warning tier action (${tier.action}):`, err);
      if (grimoire) {
        grimoire.send(`⚠️ Tried to ${tier.action} <@${userId}> but failed — check my role permissions/hierarchy.`);
      }
    }
  }
}

// Shared search step used by every branch of the `!warn` button menu (Warn/History/Remove) below.
// Shows the "search for a member" modal on the given button-click interaction, resolves it against
// the whole guild (auto-continuing on a single match, or showing a disambiguation dropdown for
// several), and edits `picker` with a status message on every dead end. Returns
// { targetMember, targetUser } on success, or null if the caller should stop (picker has already
// been updated to explain why). Doesn't post anything about what happens next — callers take it
// from there.
//
// This used to be Discord's native UserSelectMenu, but that component only lazily loads a
// partial member list client-side until you type into it — for a guild of any real size it
// reliably left people out of the initial dropdown. Searching via guild.members.fetch({ query })
// instead hits the bot's own guild-wide member cache (GuildMembers intent is already enabled
// above), so it finds anyone in the guild by username/nickname prefix regardless of which
// channel the command was run from — member lookups aren't scoped to channel visibility.
async function interactiveMemberSearch(message, picker, click, modName) {
  const searchModal = new ModalBuilder().setCustomId('warnpick:search-modal').setTitle('Search for a member');
  const queryInput = new TextInputBuilder()
    .setCustomId('query')
    .setLabel('Username or nickname')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Type all or part of their name...')
    .setRequired(true)
    .setMaxLength(100);
  searchModal.addComponents(new ActionRowBuilder().addComponents(queryInput));

  await click.showModal(searchModal);

  const searchSubmitted = await click
    .awaitModalSubmit({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnpick:search-modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!warn interactive search modal await failed:', err);
      return null;
    });

  if (!searchSubmitted) {
    await picker.edit({ content: `🕰️ **${modName}** didn't type a search term in time — nothing happened.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  const query = searchSubmitted.fields.getTextInputValue('query').trim();
  await searchSubmitted.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));

  if (!query) {
    await picker.edit({ content: `**${modName}** gave no search term — nothing happened.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  await picker.edit({ content: `🔍 **${modName}** is searching for "${query}"...`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const matches = await message.guild.members.fetch({ query, limit: 25 }).catch((err) => {
    console.error('!warn interactive member search failed:', err);
    return null;
  });

  if (!matches) {
    await picker.edit({ content: `**${modName}**'s search for "${query}" failed — couldn't reach the guild's member list.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }
  if (matches.size === 0) {
    await picker.edit({ content: `**${modName}** found no members matching "${query}".`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  if (matches.size === 1) {
    const targetMember = matches.first();
    return { targetMember, targetUser: targetMember.user };
  }

  const options = [...matches.values()].slice(0, 25).map((m) => ({
    label: m.displayName.slice(0, 100),
    description: m.user.tag.slice(0, 100),
    value: m.id,
  }));
  const disambiguateSelect = new StringSelectMenuBuilder()
    .setCustomId('warnpick:disambiguate')
    .setPlaceholder(`${matches.size} matches — pick one...`)
    .addOptions(options);

  await picker.edit({
    content: `**${modName}** found ${matches.size} matches for "${query}" — picking one:`,
    components: [new ActionRowBuilder().addComponents(disambiguateSelect)],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const disambiguated = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnpick:disambiguate',
      time: 60000,
    })
    .catch(() => null);

  if (!disambiguated) {
    await picker.edit({ content: `🕰️ **${modName}** didn't pick a member in time — nothing happened.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  const targetMember = matches.get(disambiguated.values[0]);
  await disambiguated.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  if (!targetMember) {
    await picker.edit({ content: `**${modName}**'s pick couldn't be found in the guild anymore.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return null;
  }

  return { targetMember, targetUser: targetMember.user };
}

// Warn branch of the !warn menu — search for a member, write a reason, then hand off to
// issueWarning() (Announce/No prompt, grimoire log, tier action) exactly like the text-command
// path. Kept the "route through a button click before any showModal()" pattern — a select-menu
// interaction handing off to showModal() directly was flaky in this codebase (see the !tod
// mod-flow notes above).
async function runWarnMenuWarn(message, picker, click, modName) {
  const result = await interactiveMemberSearch(message, picker, click, modName);
  if (!result) return;
  const { targetMember, targetUser } = result;

  if (targetUser.bot) {
    await picker.edit({ content: `**${modName}** — the Tavernkeep tilts his head. "That one's made of gears, not manners — no warning needed."`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  if (targetMember.roles.cache.has(GUILD_LEADER_ROLE_ID)) {
    await picker.edit({
      content: `**${modName}** — the Tavernkeep's paws freeze mid-swipe. "Warn ${targetMember}? I know my place, traveller — and it isn't that."`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const continueRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnpick:continue').setLabel(`Add reason for ${targetUser.username}`).setEmoji('📝').setStyle(ButtonStyle.Primary)
  );
  await picker.edit({
    content: `**${modName}** is warning **${targetUser.tag}** — tap below to write the reason.`,
    components: [continueRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const continueClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnpick:continue',
      time: 60000,
    })
    .catch(() => null);

  if (!continueClick) {
    await picker.edit({ content: `🕰️ **${modName}** didn't continue in time — nothing was warned.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const modal = new ModalBuilder().setCustomId('warnpick:modal').setTitle(`Warn ${targetUser.username}`.slice(0, 45));
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Reason for the warning')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('e.g. Repeated spam in #general after being asked to stop.')
    .setRequired(true)
    .setMaxLength(400);
  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

  await continueClick.showModal(modal);

  const submitted = await continueClick
    .awaitModalSubmit({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnpick:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!warn interactive modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await picker.edit({ content: `🕰️ **${modName}** didn't type a reason in time — nothing was warned.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const reason = submitted.fields.getTextInputValue('reason').trim() || 'No reason given';
  await submitted.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await picker.edit({ content: `📋 **${modName}** warned **${targetUser.tag}** for: "${reason}"`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
  const targetChannel = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null) || message.channel;

  await issueWarning(message, grimoire, targetMember, reason, { targetChannel });
}

// Bare `!ban` (no @mention) — Council/Guild Leader ONLY (isHighCouncilOrGuildLeader,
// checked by the caller before this runs). There's no Warn/History/Remove menu tier here like !warn
// has — !ban only ever issues a ban, so this goes straight to a single "search for a member" button,
// then reuses interactiveMemberSearch() (same guild-wide search/disambiguation as !warn and
// !curse search), a reason modal, and finally issueBan() (confirm -> ban -> Announce/No -> grimoire
// log), exactly mirroring runWarnMenuWarn() above.
async function startBanMenu(message) {
  message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
  const modName = message.member?.displayName || message.author.username;

  const searchRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('banmenu:search').setLabel('Search for a member').setEmoji('🔨').setStyle(ButtonStyle.Danger)
  );

  const instructions =
    `🔨 **${modName}** is reaching for the banhammer, traveller.\n\n` +
    'You can still type it directly:\n' +
    '`!ban <user> reason`\n\n' +
    'Or search below:';

  const picker = await message.channel.send({
    content: instructions,
    components: [searchRow],
  }).catch(() => null);
  if (!picker) return;

  const searchClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'banmenu:search',
      time: 60000,
    })
    .catch(() => null);

  if (!searchClick) {
    await picker.edit({ content: `🕰️ **${modName}** didn't start a search in time.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const result = await interactiveMemberSearch(message, picker, searchClick, modName);
  if (!result) return;
  const { targetMember, targetUser } = result;

  if (targetUser.bot) {
    await picker.edit({ content: `**${modName}** — the Tavernkeep tilts his head. "That one's made of gears, not manners — no banishing needed."`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  if (targetMember.roles.cache.has(GUILD_LEADER_ROLE_ID)) {
    await picker.edit({
      content: `**${modName}** — the Tavernkeep's paws freeze mid-swipe. "Banish ${targetMember}? I know my place, traveller — and it isn't that."`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const continueRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('banpick:continue').setLabel(`Add reason for ${targetUser.username}`).setEmoji('📝').setStyle(ButtonStyle.Danger)
  );
  await picker.edit({
    content: `**${modName}** is banishing **${targetUser.tag}** — tap below to write the reason.`,
    components: [continueRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const continueClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'banpick:continue',
      time: 60000,
    })
    .catch(() => null);

  if (!continueClick) {
    await picker.edit({ content: `🕰️ **${modName}** didn't continue in time — nothing was banned.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const modal = new ModalBuilder().setCustomId('banpick:modal').setTitle(`Ban ${targetUser.username}`.slice(0, 45));
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Reason for the ban')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('e.g. Repeated scamming reports, confirmed by screenshots.')
    .setRequired(true)
    .setMaxLength(400);
  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

  await continueClick.showModal(modal);

  const submitted = await continueClick
    .awaitModalSubmit({
      filter: (i) => i.user.id === message.author.id && i.customId === 'banpick:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!ban interactive modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await picker.edit({ content: `🕰️ **${modName}** didn't type a reason in time — nothing was banned.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const reason = submitted.fields.getTextInputValue('reason').trim() || 'No reason given';
  await submitted.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await picker.edit({ content: `📋 **${modName}** is banning **${targetUser.tag}** for: "${reason}"`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
  const targetChannel = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null) || message.channel;

  await issueBan(message, grimoire, targetMember, reason, { targetChannel });
}

// History branch of the !warn menu — button label/name stays "History", but the operation it
// performs is now a list rather than a single-member lookup: it shows every member who currently
// has at least one warning (name + count, most-warned first), paginated with Prev/Next buttons
// once the list is longer than one page fits. (For one member's full numbered history, mods still
// have `!warn history <name>` as a typed command — that path is unchanged.)
const WARN_LIST_PAGE_SIZE = 10;

// Builds the embed + nav row for one page of the warned-members list. Resolves each userId to a
// display label the same way `!warn show` does, so departed members still show something useful.
async function buildWarnListPage(guild, sortedUsers, page) {
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / WARN_LIST_PAGE_SIZE));
  const pageUsers = sortedUsers.slice(page * WARN_LIST_PAGE_SIZE, page * WARN_LIST_PAGE_SIZE + WARN_LIST_PAGE_SIZE);

  const lines = await Promise.all(pageUsers.map(async ([userId, items]) => {
    const member = await guild.members.fetch(userId).catch(() => null);
    const label = warnTargetLabel(userId, member);
    return `**${label}** — ${items.length} warning${items.length > 1 ? 's' : ''}`;
  }));

  const embed = new EmbedBuilder()
    .setTitle('📖 Warning History — Members with Warnings')
    .setColor(0x8b0000)
    .setDescription(lines.join('\n') || 'No warnings recorded.')
    .setFooter({ text: `Page ${page + 1}/${totalPages} • ${sortedUsers.length} member${sortedUsers.length > 1 ? 's' : ''} with warnings — use !warn history <name> for one member's full history` });

  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnlist:prev').setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
    new ButtonBuilder().setCustomId('warnlist:next').setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1)
  );

  return { embed, navRow, totalPages };
}

async function runWarnMenuHistory(message, picker, click, modName) {
  const warnings = loadWarnings();
  const flat = buildFlattenedWarnings(warnings);

  if (flat.length === 0) {
    await picker.edit({ content: 'The grimoire is empty — no member currently has any warnings.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const byUser = new Map();
  for (const item of flat) {
    if (!byUser.has(item.userId)) byUser.set(item.userId, []);
    byUser.get(item.userId).push(item);
  }
  // Most-warned member first, same ordering as `!warn show`.
  const sortedUsers = [...byUser.entries()].sort((a, b) => b[1].length - a[1].length);

  let page = 0;
  let { embed, navRow, totalPages } = await buildWarnListPage(message.guild, sortedUsers, page);
  await picker.edit({
    content: `**${modName}** is browsing the grimoire:`,
    embeds: [embed],
    components: totalPages > 1 ? [navRow] : [],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  if (totalPages <= 1) return;

  // Pagination loop — keeps listening for Prev/Next clicks from the same mod until they stop
  // clicking (2 min idle) or run out of pages to move to; then the buttons are cleared so a stale
  // click can't fire after the picker's effectively done.
  while (true) {
    const navClick = await picker
      .awaitMessageComponent({
        filter: (i) => i.user.id === message.author.id && ['warnlist:prev', 'warnlist:next'].includes(i.customId),
        time: 120000,
      })
      .catch(() => null);

    if (!navClick) {
      await picker.edit({ components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    await navClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
    page = navClick.customId === 'warnlist:prev' ? Math.max(0, page - 1) : Math.min(totalPages - 1, page + 1);

    ({ embed, navRow, totalPages } = await buildWarnListPage(message.guild, sortedUsers, page));
    await picker.edit({ embeds: [embed], components: [navRow] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }
}

// Remove branch of the !warn menu — search for a member, then a Yes/No confirm before wiping
// their whole warning history (mirrors the member-based branch of `!warn remove` in the text-
// command path). For removing a single numbered warning instead of a member's whole history, mods
// still have `!warn remove <number>` — the menu only offers the all-at-once version. Logs to the
// grimoire with the mod's name, then offers to announce the clean slate in the Tavern (never
// naming the mod, same as everywhere else public-facing).
async function runWarnMenuRemove(message, picker, click, modName) {
  const result = await interactiveMemberSearch(message, picker, click, modName);
  if (!result) return;
  const { targetMember } = result;

  const label = warnTargetLabel(targetMember.id, targetMember);
  const warnings = loadWarnings();
  const records = warnings[targetMember.id] || [];

  if (records.length === 0) {
    await picker.edit({ content: `**${label}** has no warnings recorded.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnmenu:remove-yes').setLabel('Yes').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('warnmenu:remove-no').setLabel('No').setStyle(ButtonStyle.Danger)
  );
  await picker.edit({
    content: `Remove all **${records.length}** warning${records.length > 1 ? 's' : ''} from **${label}**? *(for a single numbered warning instead, use* \`!warn remove <number>\` *)*`,
    components: [confirmRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const confirmClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && ['warnmenu:remove-yes', 'warnmenu:remove-no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'warnmenu:remove-no') {
    if (confirmClick) await confirmClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
    await picker.edit({ content: `Cancelled — **${label}**'s warnings were left alone.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  await confirmClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));

  const freshWarnings = loadWarnings();
  delete freshWarnings[targetMember.id];
  saveWarnings(freshWarnings);

  await picker.edit({ content: `The Tavernkeep tears the pages from the grimoire. **${label}**'s slate is clean.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
  if (grimoire) {
    grimoire.send(`🗑️ All warnings for ${label} (${targetMember.id}) removed by ${message.author.tag}.`);
  }

  const announceRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnmenu:announce-yes').setLabel('Announce').setEmoji('📣').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('warnmenu:announce-no').setLabel('No').setStyle(ButtonStyle.Secondary)
  );
  const announcePrompt = await message.channel.send({
    content: `Announce **${label}**'s clean slate in the tavern?`,
    components: [announceRow],
  }).catch(() => null);
  if (!announcePrompt) return;

  const announceClick = await announcePrompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && ['warnmenu:announce-yes', 'warnmenu:announce-no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!announceClick || announceClick.customId === 'warnmenu:announce-no') {
    if (announceClick) await announceClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
    await announcePrompt.edit({ content: 'Kept quiet — not announced.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  await announceClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await announcePrompt.edit({ content: 'Announced in the tavern.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const tavern = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (tavern) {
    tavern.send(`🕯️ The Tavernkeep clears the air — **${label}**'s warnings have been wiped clean. A fresh start, traveller.`);
  }
}

// Edit branch of the !warn menu — Council/Knight/Sentinel/Guild Leader only, NOT Emissary (canEditWarnings()).
// Search for a member, pick one of their existing warnings from a select menu, edit its reason in
// a pre-filled popup, then a Yes/No confirm before the change is actually saved — nothing gets
// overwritten on a single misclick. Logs the before/after to the grimoire like every other warn
// mutation. The outer !warn command already gates the whole interactive menu to punitive
// moderators before startWarnMenu() ever runs, but this re-checks canEditWarnings() directly on
// the button click too, since Edit is meant to be the narrowest of the four branches.
async function runWarnMenuEdit(message, picker, click, modName) {
  if (!canEditWarnings(message.member)) {
    await picker.edit({
      content: `**${modName}** — the Tavernkeep pulls the grimoire's quill just out of reach. "Editing the ink isn't for every hand, traveller."`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const result = await interactiveMemberSearch(message, picker, click, modName);
  if (!result) return;
  const { targetMember } = result;

  const label = warnTargetLabel(targetMember.id, targetMember);
  const warnings = loadWarnings();
  const flat = buildFlattenedWarnings(warnings).filter((it) => it.userId === targetMember.id);

  if (flat.length === 0) {
    await picker.edit({ content: `**${label}** has no warnings recorded.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // Select menus cap out at 25 options — same ceiling the disambiguation picker above already
  // works within. Most recent warnings first is more useful here than oldest-first.
  const options = flat.slice(-25).reverse().map((it) => ({
    label: `#${it.number} — ${it.record.reason}`.slice(0, 100),
    description: `by ${it.record.moderator}, ${new Date(it.record.timestamp).toLocaleDateString()}`.slice(0, 100),
    value: String(it.number),
  }));

  const pickRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('warnedit:pick')
      .setPlaceholder(`Choose one of ${label}'s warnings to edit...`)
      .addOptions(options)
  );

  await picker.edit({
    content: `**${modName}** is editing **${label}**'s warnings — pick one:`,
    embeds: [],
    components: [pickRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const picked = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnedit:pick',
      time: 60000,
    })
    .catch(() => null);

  if (!picked) {
    await picker.edit({ content: `🕰️ **${modName}** didn't pick a warning in time — nothing was edited.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const warnNumber = Number(picked.values[0]);
  const item = flat.find((it) => it.number === warnNumber);
  await picked.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));

  if (!item) {
    await picker.edit({ content: `Warning **#${warnNumber}** couldn't be found anymore — nothing was edited.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const editRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnedit:continue').setLabel(`Edit reason for #${warnNumber}`).setEmoji('📝').setStyle(ButtonStyle.Primary)
  );
  await picker.edit({
    content: `Editing warning **#${warnNumber}** for **${label}** — current reason: "${item.record.reason}"`,
    components: [editRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const continueClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnedit:continue',
      time: 60000,
    })
    .catch(() => null);

  if (!continueClick) {
    await picker.edit({ content: `🕰️ **${modName}** didn't continue in time — nothing was edited.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const modal = new ModalBuilder().setCustomId('warnedit:modal').setTitle(`Edit warning #${warnNumber}`.slice(0, 45));
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('New reason')
    .setStyle(TextInputStyle.Paragraph)
    .setValue(item.record.reason.slice(0, 4000))
    .setRequired(true)
    .setMaxLength(400);
  modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

  await continueClick.showModal(modal);

  const submitted = await continueClick
    .awaitModalSubmit({
      filter: (i) => i.user.id === message.author.id && i.customId === 'warnedit:modal',
      time: 5 * 60 * 1000,
    })
    .catch((err) => {
      console.error('!warn interactive edit modal await failed:', err);
      return null;
    });

  if (!submitted) {
    await picker.edit({ content: `🕰️ **${modName}** didn't type a new reason in time — nothing was edited.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const newReason = submitted.fields.getTextInputValue('reason').trim() || item.record.reason;
  await submitted.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));

  if (newReason === item.record.reason) {
    await picker.edit({ content: `No change — warning **#${warnNumber}** already reads that reason.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // Confirm before the edit is actually written — same pattern as every other warn mutation
  // (Remove already asks Yes/No; Edit gets the same treatment now).
  const confirmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnedit:confirm-yes').setLabel('Yes').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('warnedit:confirm-no').setLabel('No').setStyle(ButtonStyle.Danger)
  );
  await picker.edit({
    content: `Save this change to warning **#${warnNumber}** for **${label}**?\n\n**Old:** ${item.record.reason}\n**New:** ${newReason}`,
    components: [confirmRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const confirmClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && ['warnedit:confirm-yes', 'warnedit:confirm-no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!confirmClick || confirmClick.customId === 'warnedit:confirm-no') {
    if (confirmClick) await confirmClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));
    await picker.edit({ content: `Cancelled — warning **#${warnNumber}** was left unchanged.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }
  await confirmClick.deferUpdate().catch((err) => console.error('Discord API call failed (non-critical):', err));

  const oldReason = item.record.reason;
  const freshWarnings = loadWarnings();
  const records = freshWarnings[item.userId] || [];
  if (records[item.idxInUser]) {
    records[item.idxInUser].reason = newReason;
    records[item.idxInUser].editedBy = message.author.tag;
    records[item.idxInUser].editedAt = Date.now();
    freshWarnings[item.userId] = records;
    saveWarnings(freshWarnings);
  }

  await picker.edit({ content: `📝 Warning **#${warnNumber}** for **${label}** has been updated.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
  if (grimoire) {
    grimoire.send(`📝 Warning #${warnNumber} for ${label} (${item.userId}) edited by ${message.author.tag}.\nOld: "${oldReason}"\nNew: "${newReason}"`);
  }
}

// Entry point for bare `!warn` (no @mention given). Posts both the typed-command syntax (still
// fully supported for mods who prefer it — `!warn @user reason`) and a Warn / History / Remove
// button menu as an alternative. This flow only ever runs in mod-only channels, so — unlike the
// public-facing warning post itself — there's no need to hide who's running it. Still delete the
// raw command message, just to keep the channel tidy rather than for anonymity.
async function startWarnMenu(message) {
  message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
  const modName = message.member?.displayName || message.author.username;

  const menuRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('warnmenu:warn').setLabel('Warn').setEmoji('⚠️').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('warnmenu:history').setLabel('History').setEmoji('📖').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('warnmenu:remove').setLabel('Remove').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('warnmenu:edit').setLabel('Edit').setEmoji('📝').setStyle(ButtonStyle.Secondary)
  );

  const instructions =
    `⚠️ **${modName}** is opening the grimoire, traveller.\n\n` +
    'You can still type it directly:\n' +
    '`!warn <user> reason`\n' +
    '`!warn <user> #channel reason`\n\n' +
    'Or pick below:';

  const picker = await message.channel.send({
    content: instructions,
    components: [menuRow],
  }).catch(() => null);
  if (!picker) return;

  const menuClick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === message.author.id && ['warnmenu:warn', 'warnmenu:history', 'warnmenu:remove', 'warnmenu:edit'].includes(i.customId),
      time: 60000,
    })
    .catch(() => null);

  if (!menuClick) {
    await picker.edit({ content: `🕰️ **${modName}** didn't pick an option in time.`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  if (menuClick.customId === 'warnmenu:warn') {
    await runWarnMenuWarn(message, picker, menuClick, modName);
  } else if (menuClick.customId === 'warnmenu:history') {
    await runWarnMenuHistory(message, picker, menuClick, modName);
  } else if (menuClick.customId === 'warnmenu:edit') {
    await runWarnMenuEdit(message, picker, menuClick, modName);
  } else {
    await runWarnMenuRemove(message, picker, menuClick, modName);
  }
}



// After a removal/clear, asks whether to announce it — and if so, always posts to the Tavern,
// regardless of which channel the removal itself was actioned from.
async function maybeAnnounceRemoval(message, announcementText) {
  const announce = await awaitYesNoButtons(message, 'Announce this in the tavern?', {
    allowedMentions: { repliedUser: false },
  });
  if (!announce) return;

  const tavern = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (tavern) tavern.send(announcementText);
}

function isGuildLeader(member) {
  return isLeadershipUser(member) || member.roles.cache.has(GUILD_LEADER_ROLE_ID);
}

// Who may use !ban — deliberately the NARROWEST tier in this file: Council and
// the Guild Leader ONLY. Unlike every other moderation command (!warn, !curse, !mute, etc.),
// Knight and Emissary do NOT get access here on purpose — banning is
// permanent, so it's kept to just the two highest tiers instead of riding along on isCouncil()/
// isPunitiveModerator().
function isHighCouncilOrGuildLeader(member) {
  return isHighCouncil(member) || isGuildLeader(member);
}

// Who may use !mute / !unmute — Council, Sentinels (KNIGHT_ROLE_ID, same
// role as before, just renamed/called "officers" most of the time now), Emissary,
// and the Guild Leader. Emissary was dropped from isPunitiveModerator() (warning-related
// permissions), so it's added directly here to keep mute/unmute access for Emissary unchanged.
function canMuteMembers(member) {
  return isPunitiveModerator(member) || member.roles.cache.has(EMISSARY_ROLE_ID) || isGuildLeader(member);
}

// Who may flip the officer channel-cast setting with !enable / !disable.
function canToggleOfficerCast(member) {
  return isGuildLeader(member) || isHighCouncil(member);
}

// Who may actually run the channel-wide spell cast (!cast #channel) right now. Guild Leader and
// Council always can; Knight/officers only when the setting has been enabled.
function canChannelWideCast(member, officerCastEnabled) {
  if (isGuildLeader(member)) return true;
  if (isHighCouncil(member)) return true;
  return Boolean(officerCastEnabled) && member.roles.cache.has(KNIGHT_ROLE_ID);
}

// True boundary-safe command matching — `!cast` must be followed by whitespace or end-of-string,
// so `!castle`, `!drinking`, `!warning`, `!shoutout`, `!rollback`, etc. no longer misfire as the
// commands they happen to start with.
function matchesCommand(content, cmd) {
  const lower = content.toLowerCase();
  const c = cmd.toLowerCase();
  if (!lower.startsWith(c)) return false;
  const next = lower[c.length];
  return next === undefined || /\s/.test(next);
}

// Every command word actually handled below. Used to tell a real command apart from a message
// that merely starts with "!" — previously the drunk-speech intercept skipped ANY "!"-prefixed
// message outright, which meant typing something like "!this bypasses my flair" dodged the
// slurred-speech relay entirely without needing to match a real command at all.
const KNOWN_COMMAND_WORDS = [
  '!serve', '!fortune', '!gossip', '!toast', '!throw', '!tod', '!lore', '!help', '!menu', '!drink',
  '!warn', '!ban', '!mute', '!unmute', '!shout', '!message', '!enable', '!disable', '!cast', '!parry',
  '!stats', '!roll', '!flip', '!party', '!user', '!name', '!curse', '!game', '!gn',
  '!recruit', '!rec', '!activity', '!vote', '!guild',
];

// ---- Command-shape validators ----
// A prefix match alone isn't enough: "!cast <a whole real sentence>" also starts with "!cast",
// so it used to count as "a known command" and skip the drunk intercept even though the !cast
// handler just replies "Usage: !cast @user" and does nothing with the rest of the text — the
// sentence was never actually processed, it was just riding along to dodge the slur relay. The
// same trick works with any mod-only command typed by a non-mod (e.g. "!warn <real message>"
// just bounces back "you don't have permission," but still counted as "handled").
//
// These checks mirror what each handler actually accepts (without duplicating its full side
// effects) so a message only counts as "a command" if it would genuinely be treated as one —
// either a real, on-topic attempt at that command's own shape, or a use by someone who's
// actually allowed to run it.
const MENTION_RE = /^<@!?\d+>$/;
const CHANNEL_MENTION_RE = /^<#\d+>$/;

function argsAfter(content, cmd) {
  return content.slice(cmd.length).trim();
}

function tokenize(rest) {
  return rest.length ? rest.split(/\s+/) : [];
}

// Commands that take no arguments at all.
const NO_ARG_COMMANDS = new Set(['!serve', '!fortune', '!toast', '!help', '!menu', '!parry', '!roll', '!flip', '!party', '!game', '!gn', '!activity', '!vote']);
// Commands whose only valid argument is a single @mention (or none).
const MENTION_ONLY_COMMANDS = new Set(['!gossip', '!stats']);
// Mod-gated commands — a non-mod typing these never actually gets to run them, so they
// shouldn't count as "handled" for a non-mod author. Maps command word -> permission check.
const MOD_ONLY_COMMANDS = {
  '!shout': isCouncil,
  '!message': isCouncil,
  '!mute': canMuteMembers,
  '!unmute': canMuteMembers,
  '!enable': canToggleOfficerCast,
  '!disable': canToggleOfficerCast,
  '!recruit': isCouncil,
  '!rec': isCouncil,
  '!activity': isCouncil,
  '!vote': isCouncil,
  '!guild': isCouncil,
};

// !cast has the most complex grammar: no args (self-cast), a single reserved word
// (clear/spell/spells/list/variants), or some combination of @mentions, #channel mentions,
// and a known spell-status word. Free text anywhere in there means it isn't a real cast attempt.
function castLooksValid(rest) {
  const tokens = tokenize(rest);
  if (tokens[0] && tokens[0].toLowerCase() === 'spell') tokens.shift(); // "cast spell @user" === "cast @user"
  if (tokens.length === 0) return true;

  const RESERVED = new Set(['clear', 'spell', 'spells', 'list', 'variants']);
  if (tokens.length === 1 && RESERVED.has(tokens[0].toLowerCase())) return true;

  const statusNames = new Set(Object.keys(SPELLS.spell.statuses));
  let sawStatus = false;
  for (const tok of tokens) {
    if (MENTION_RE.test(tok)) continue;
    if (CHANNEL_MENTION_RE.test(tok)) continue;
    if (!sawStatus && statusNames.has(tok.toLowerCase())) { sawStatus = true; continue; }
    return false; // anything else — stray words, a hidden sentence, etc. — isn't a real cast
  }
  return true;
}

// !lore intentionally takes free-text name queries, so shape alone can't validate it — instead
// we check it would actually resolve to something (a match, or an ambiguous "did you mean"),
// the same way the real handler does. Gibberish dragged along to dodge the intercept won't
// match anything and correctly falls through to being treated as chatter.
function loreLooksValid(rest) {
  if (rest.length === 0) return true;
  const lower = rest.toLowerCase();
  if (lower === 'list' || lower === 'all') return true;
  const nameQuery = lower.startsWith('all ') ? rest.slice(3).trim() : rest;
  if (!nameQuery) return false;
  const { match, candidates } = findLoreEntry(nameQuery);
  return Boolean(match) || candidates.length > 0;
}

// !warn's public sub-commands (show/history) work for anyone; issuing, removing, or clearing a
// warning require Council. This mirrors the real handler's own gating so `!warn show` from a
// non-Council member still counts as a genuine command instead of falling through to chatter —
// while a mod-only attempt by a non-mod (e.g. a fake "!warn @user reason") correctly doesn't.
function warnLooksValid(rest, member) {
  const tokens = tokenize(rest);
  const sub = (tokens[0] || '').toLowerCase();

  if (sub === 'show') return tokens.length === 1;
  if (sub === 'history') return tokens.length <= 5; // "history" alone, or + a short name/mention/ID

  if (!isPunitiveModerator(member)) return false;

  // Bare `!warn` (no args at all) opens the interactive picker — pick a member, type a reason in
  // a popup, then the same Announce/No prompt as the text-command path — so it counts as a real
  // attempt too, same as everything else past this point.
  if (tokens.length === 0) return true;

  if (sub === 'remove') return tokens.length === 2;
  if (sub === 'clear') return tokens.length === 2 && MENTION_RE.test(tokens[1]);

  // Otherwise this is an attempt to issue a warning: `!warn @user [#channel] reason`
  return tokens.length >= 1 && MENTION_RE.test(tokens[0]);
}

// !ban: Council/Guild Leader ONLY (isHighCouncilOrGuildLeader — narrower than
// isCouncil, on purpose). Bare `!ban` opens the interactive picker; `!ban @user [reason]` is a
// genuine attempt to issue one. Mirrors warnLooksValid's shape but simpler — !ban has no public
// show/history sub-commands.
function banLooksValid(rest, member) {
  if (!isHighCouncilOrGuildLeader(member)) return false;
  const tokens = tokenize(rest);
  if (tokens.length === 0) return true;
  return MENTION_RE.test(tokens[0]);
}

// !curse: mods/Sentinel/Emissary/Leader only (isCouncil). Either a single target token — "search"
// (opens the interactive member search) or a name/ID/mention — or "clear <name/ID/mention>" to
// lift an existing curse. Free text or extra tokens don't count as a real attempt, same idea as
// warnLooksValid above.
function curseLooksValid(rest, member) {
  if (!isCouncil(member)) return false;
  const tokens = tokenize(rest);
  if (tokens.length === 0) return false;
  if (tokens[0].toLowerCase() === 'clear') return tokens.length === 2;
  return tokens.length === 1;
}

// !user/!name: the plain lookup ("!user <name>", bare, or "list") works for anyone; add/remove/
// edit/change require Council. Mirrors the real handler's own gating, same idea as warnLooksValid
// above — a genuine attempt (or a mod-only attempt by an actual mod) counts as a real command, a
// fake one dragging along free text to dodge the drunk intercept does not.
function userLooksValid(rest, member) {
  const tokens = tokenize(rest);
  const sub = (tokens[0] || '').toLowerCase();

  if (rest.length === 0) return true;
  if (sub === 'list') return tokens.length === 1;

  if (sub === 'add' || sub === 'remove' || sub === 'edit' || sub === 'change') {
    if (!isCouncil(member)) return false;
    if (sub === 'remove') return tokens.length === 2;
    return tokens.length >= 3; // add/edit/change <name> <username...>
  }

  // Plain lookup — a single name, no spaces (matches how entries are keyed).
  return tokens.length === 1;
}

function isKnownCommand(content, member) {
  for (const cmd of KNOWN_COMMAND_WORDS) {
    if (!matchesCommand(content, cmd)) continue;
    const rest = argsAfter(content, cmd);

    if (NO_ARG_COMMANDS.has(cmd)) {
      if (rest.length === 0) return true;
      continue;
    }

    if (MENTION_ONLY_COMMANDS.has(cmd)) {
      const tokens = tokenize(rest);
      if (tokens.length === 0 || (tokens.length === 1 && MENTION_RE.test(tokens[0]))) return true;
      continue;
    }

    if (cmd === '!throw' || cmd === '!tod') {
      const tokens = tokenize(rest);
      if (tokens.length === 1 && MENTION_RE.test(tokens[0])) return true;
      continue;
    }

    if (cmd === '!drink') {
      if (rest.length === 0 || rest.toLowerCase() === 'water') return true;
      continue;
    }

    if (cmd === '!lore') {
      if (loreLooksValid(rest)) return true;
      continue;
    }

    if (cmd === '!warn') {
      if (warnLooksValid(rest, member)) return true;
      continue;
    }

    if (cmd === '!ban') {
      if (banLooksValid(rest, member)) return true;
      continue;
    }

    if (cmd === '!curse') {
      if (curseLooksValid(rest, member)) return true;
      continue;
    }

    if (cmd === '!user' || cmd === '!name') {
      if (userLooksValid(rest, member)) return true;
      continue;
    }

    if (cmd in MOD_ONLY_COMMANDS) {
      if (MOD_ONLY_COMMANDS[cmd](member)) return true;
      continue;
    }

    if (cmd === '!cast') {
      if (castLooksValid(rest)) return true;
      continue;
    }
  }
  return false;
}

// Builds the ordered list of !menu pages for the given member/channel. Each page is
// { key, label, embed }. The moderation/spell pages are only included for Council/Knight,
// and only outside the tavern/bartop channels — same gating the old single-embed menu used.
function buildMenuPages(member, channelId) {
  const pages = [
    {
      key: 'cover',
      label: '🕯️ Cover',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🕯️ The Tavernkeep\'s Menu')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          'Here\'s what I can do, traveller.\n\n' +
          'Flip through with the buttons below, or jump straight to a page with the dropdown.'
        ),
    },
    {
      key: 'tavern',
      label: '🍽️ Tavern Fun',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🍽️ Tavern Fun')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '🍹 `!serve` — random food/drink for yourself; pours & drinks a round too\n\n' +
          '🔮 `!fortune` — tea-leaf fortune\n' +
          '🗯️ `!gossip` [@user] — hear a rumor\n\n' +
          '🥂 `!toast` — toast the room *(self-only drink)*\n' +
          '🧪 `!throw @user` — chuck a random potion at someone *(3 min cooldown)*\n' +
          '🎭 `!tod @user` — put someone on the spot with Truth or Dare *(2 min cooldown per target)*\n' +
          '✨ `!cast @user` — cast a random spell on someone *(3 min cooldown, can\'t self-cast)*\n' +
          '🛡️ `!parry` — reflect the spell/potion currently on you back at whoever cast it *(3 min cooldown)*\n' +
          '📊 `!stats` [@user] — see cast/throw/parry counts\n\n' +
          '🎲 `!roll` / `!flip` — die roll or coin flip'
        ),
    },
    {
      key: 'party',
      label: '⚔️ Party Up!',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('⚔️ Party Up!')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '🗺️ `!party` — pick a dungeon from a dropdown, choose Yes/No on pinging that dungeon\'s role, ' +
          'then opens that dungeon\'s Party Up! card *(30s cooldown between new parties)*\n\n' +
          '🔼 `b` / `bump` — instantly bumps your current party card(s) back to the bottom of the ' +
          'thread *(only works while you\'re in a live party; 30s cooldown per party, shared by everyone in it)*\n\n' +
          '-# 💡 @mentioning a dungeon role directly does the same thing as `!party` — if you\'re ' +
          'already in a live party for that dungeon it bumps it, otherwise it opens a fresh card.'
        ),
    },
    {
      key: 'lore',
      label: '📖 Lore & Grimoire',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('📖 Lore & Grimoire')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '📜 `!lore` [name] — random tale, or about someone specific\n' +
          '📚 `!lore all <name>` — every known tale about them\n' +
          '🗺️ `!lore list` — full guild roster\n\n' +
          '🧾 `!user <name>` (or `!name <name>`) — look up a member\'s in-game username by their Discord name, no ping needed\n' +
          '📋 `!user list` — browse everyone on file (Discord Username — In-Game Username) as a paged book, with a Search button'
        ),
    },
    {
      key: 'sobering',
      label: '💧 Sobering Up',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('💧 Sobering Up')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '💧 `!drink` / `!drink water` — sobers you up instantly, no mod needed *(2 charges, both refill together in 6 min)*\n\n' +
          `-# ${DRINKING_DISCLAIMER}`
        ),
    },
    {
      key: 'giveaways',
      label: '🎉 Giveaways & Events',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🎉 Giveaways & Events')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          `🎉 \`!giveaway\` *(Council/Knight/Emissary)* — click the prompt, enter what you're giving away (1 required + 4 more optional prize fields), and it posts in <#${GIVEAWAY_CHANNEL_ID}> with a ping to the Giveaway role; anyone can hit Join, mods manage prizes and roll winners\n` +
          `🧹 \`!giveaway cleanup\` (or \`clear\`) *(same access)* — removes ended giveaways from storage so they stop showing up on bot restart; doesn't touch the posted messages\n` +
          `📅 \`!rsvp\` *(Council/Knight)* — creates an event card in <#${GIVEAWAY_CHANNEL_ID}>; members respond with a simple ✅ Going / ❌ Can't Make It`
        ),
    },
    {
      key: 'general',
      label: '🧾 General',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🧾 General')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '📋 `!warn show` — view all warning history\n' +
          '🔍 `!warn history <name>` — view one person\'s history (no ping needed)\n' +
          '❓ `!help` — show this menu'
        ),
    },
  ];

  // Even a Council/Knight member shouldn't have mod commands surfaced in the tavern or at the
  // bartop — those channels are public/casual, so only add these pages elsewhere.
  if (isCouncil(member) && !DRUNK_CHANNELS.includes(channelId)) {
    pages.push({
      key: 'moderation',
      label: '🛡️ Moderation',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🛡️ Moderation')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '🖱️ `!warn` *(no @mention)* — opens a Warn / History / Remove menu: Warn searches the whole guild for a member and walks you through reason -> Announce/No; History and Remove also start with a member search\n' +
          '⚠️ `!warn @user reason` — warn a user *(3 = 3d mute, 4 = 7d mute, 5 = 7d mute + Council ping)* — your command message is auto-deleted; you\'ll get an Announce/No prompt before anything posts publicly (default channel: the Tavern if no `#channel` given), and the public post stays up and never names who warned them\n' +
          '📣 `!warn @user #channel reason` — same, posts publicly elsewhere\n' +
          '🔗 `!warn @user <message link> reason` — same, but replies directly to that message instead of posting fresh (paste a Discord message link anywhere in the command; takes priority over `#channel`)\n' +
          '🖼️ Attach an image to any `!warn` command — it gets carried over onto the public warning post\n' +
          '🙋 Officers (Knight): issuing a warning shows an Announce/No prompt instead of posting right away — the warning is logged either way, only the public post is gated\n\n' +
          '🗑️ `!warn remove <name/number>` — remove one warning, or all of someone\'s, after a yes/no confirmation *(no ping needed)*\n' +
          '🧹 `!warn clear @user` — wipe a user\'s warning history *(legacy shortcut for `!warn remove`, now asks yes/no first)*\n' +
          '🔇 `!mute <duration> @user` — timeout a user *(e.g. `!mute 3 @user` = 3 days, or `30s`/`10m`/`2h`/`3d`)*\n' +
          '🔓 `!unmute @user` — remove an active mute\n\n' +
          (isHighCouncilOrGuildLeader(member)
            ? '🔨 `!ban` *(no @mention)* — opens a search-for-a-member button, walks you through reason -> "banish? yes/no" -> Announce/No *(Council/Guild Leader ONLY — not Knight, not Emissary)*\n' +
              '🔨 `!ban @user reason` — same, but skips straight to the search — your command message is auto-deleted, and this can\'t be undone\n\n'
            : ''
          ) +
          '🔮 `!curse <name/ID/mention>` — force a random speech-flair on someone for **24 hours**, non-drinkable, non-parryable, and immune to anyone else\'s `!cast`/`!throw`/`!serve`/`!toast` — stacks instead of refreshing if cast again *(Council/Sentinel/Emissary/Guild Leader)*\n' +
          '🔍 `!curse search` — same, but searches the whole guild for a member first\n' +
          '🧹 `!curse clear <name/ID/mention>` — lift every active curse from someone at once, including cursed speech from warning penalties, after a yes/no confirmation *(not anonymous — logged and replied to normally, like `!warn remove`)*\n' +
          '-# 🤫 `!curse` is fully anonymous — your command message is deleted instantly, the whole flow (and the Announce/No prompt) runs in the private grimoire channel, and even a public Tavern announcement never says who cast it. Only the secret grimoire log names the caster.\n\n' +
          ''
        ),
    });
    pages.push({
      key: 'moderation2',
      label: '🛡️ Moderation II',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('🛡️ Moderation (continued)')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '📢 `!shout #channel message` — speak as the Tavernkeep *(alias: `!message`)*\n\n' +
          '🧾 `!user add <name> <username>` — add a Discord Username → In-Game Username entry to the IGN directory *(➕ Add button on `!user` does the same)*\n' +
          '✏️ `!user edit <name/#> <username>` — update an entry\'s In-Game Username *(or the ✏️ Edit button)*\n' +
          '🗑️ `!user remove <name/#>` — remove an entry *(or the 🗑️ Remove button)*\n\n' +
          '🎭 `!tod` *(no @user)* — opens the Truth or Dare prompt book: Truths/Dares numbered separately, with ➕ Add / ✏️ Edit / 🗑️ Remove buttons for each list *(all confirm Yes/No before saving)*\n' +
          '-# 💡 The Add/Remove/Edit buttons on `!user` also work in the Tavern and at the Bartop, unlike the rest of this page.\n\n' +
          '📅 `!activity` — paginated book of every member and the date of their last tracked message, most recent first *(🕸️ = flagged inactive by the 30-day sweep; "No tracked messages" means untracked, not necessarily inactive — see the caveat on the sweep)*\n\n' +
          '🏰 `!guild` — browse the whole guild by role: pick a role from the dropdown (pulled live from the server, with member counts) and it lists everyone who holds it *(Council/Knight/Emissary/Guild Leader)*\n' +
          '🏰 `!guild <role name>` — skip the dropdown and jump straight to one role\'s member list *(e.g. `!guild honored`; `!guild all` lists everyone)*\n\n' +
          '🗳️ `!vote` *(mod channels or the Tavern)* — click Enter reason, type what it\'s for, and that message becomes the vote card (reason shown in bold) with ✅/❌ reactions seeded on it — nothing is tracked or stored, it\'s just a message\n\n' +
          '📋 `!recruit <username>` (or `!rec`) — adds a plain-text username to the shared Recruit Ticket Board and posts/refreshes it in the same reply *(Council/Knight/Emissary)*\n' +
          '📖 `!recruit` / `!recruit list` — just shows the current board\n' +
          '-# 💡 The board\'s ◀ Prev / Next ▶ / ➕ Add / 🗑️ Remove buttons work for any Council/Knight/Emissary/Guild Leader viewing the message, not just whoever ran the command.'
        ),
    });
    pages.push({
      key: 'spells',
      label: '✨ Spell Commands',
      embed: new EmbedBuilder()
        .setColor(0x8b4513)
        .setTitle('✨ Spell Commands (`!cast`)')
        .setThumbnail(MENU_PARCHMENT_URL)
        .setDescription(
          '✨ `!cast @user` / `!cast spell @user` — random speech-flair *(name one yourself — see `!cast spells`; "spell" is optional)*\n' +
          '📢 `!cast #channel` *(Council/Guild Leader; officers if `!enable`\'d)* — no @user = cast on everyone who can see that channel\n' +
          '🙈 `!cast #channel #channel` *(same access)* — same, but the announcement posts in the 2nd channel instead, so the cast channel never sees it\n' +
          '🧹 `!cast clear @user` / `!cast clear #channel` — sober up one, or everyone at once\n' +
          '🛡️ `!parry` — unlimited, no cooldown, for Council/Knight\n' +
          '⚙️ `!enable` / `!disable` *(Guild Leader/Council only)* — toggle whether officers can use the channel-wide cast\n\n' +
          '-# 💡 Omit @user to test on yourself. No cooldown for Council/Knight. Wears off on its own after 10 minutes.'
        ),
    });
  }

  pages.forEach((page, i) => {
    // Safety net: Discord rejects embed descriptions over 4096 chars, and the thrown error used to
    // crash the whole bot. Trim instead of crashing if a page ever grows past the limit again.
    const desc = page.embed.data?.description;
    if (typeof desc === 'string' && desc.length > 4096) {
      console.warn(`Menu page "${page.key}" is ${desc.length} chars (limit 4096) — truncating.`);
      page.embed.setDescription(desc.slice(0, 4090) + '…');
    }
    page.embed.setFooter({ text: `Page ${i + 1} of ${pages.length} — The Tavernkeep's Grimoire` });
  });

  return pages;
}

// Builds the Prev/Next/page-counter button row for a given page index. customIds encode
// the owning user's ID and the current index, so no server-side session state is needed
// to handle the next/prev button clicks.
function buildMenuComponents(ownerId, index, pages) {
  const navRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu:prev:${ownerId}:${index}`)
      .setLabel('◀ Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId(`menu:noop:${ownerId}:${index}`)
      .setLabel(`${index + 1} / ${pages.length}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`menu:next:${ownerId}:${index}`)
      .setLabel('Next ▶')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === pages.length - 1)
  );

  return [navRow];
}

// ---------- Party Up! ----------
//
// See the big comment above DUNGEON_HUB_CHANNEL_ID for the overview. Everything below builds
// and drives one interactive "party card" — an embed with a numbered roster plus Join/Leave/
// Full Party/Complete/Kick buttons, backed by a `party` object shaped like:
//   {
//     dungeonName, leaderId, leaderName, maxSize,
//     channelId,   // hub channel ID — where the Party Up! card itself lives
//     threadId,    // that dungeon's persistent run-chat thread ID (null if unconfigured)
//     members: [{ id, name }, ...],   // members[0] is not special — leaderId is source of truth
//     closed: bool,      // leader hit "Full Party" early
//     completed: bool,   // leader hit "Complete", or the leader left with no one to inherit
//     disbanded: bool,   // kept in sync with `completed` for back-compat with older checks —
//                         // there's no separate Disband action anymore, Complete covers it
//     lastBumpAt: number, // Date.now() of the last successful bump, for the bump cooldown
//     server: string|null, // leader-set via the "Server" button; null/undefined until first set
//     serverNoticeMessageId: string|null, // the one server-change notice message; edited in
//                                          // place on every change instead of posting a new one
//   }

// A "Filled" slot represents an adventurer who's already grouped up outside the bot (a friend on
// voice, someone who doesn't use this Discord, etc.) — it eats a roster slot and counts toward
// X/maxSize same as a real member, but has no real Discord user behind it. `id` is a synthetic,
// never-colliding value (Discord snowflakes are purely numeric, this never is) so none of the
// existing "does this id match the clicking user" checks (join/leave/leaderId) can ever match it.
let filledIdCounter = 0;
function makeFilledMember() {
  filledIdCounter += 1;
  return { id: `filled-${Date.now()}-${filledIdCounter}`, name: 'Filled Slot', filled: true };
}

// Leadership handoff (on Leave, or a leader going leaderless — see reassignLeaderlessParties)
// should never crown a "Filled" placeholder, since there's no real person behind it to hold the
// leader-only buttons. Returns the first real member, or null if only Filled slots are left.
function nextRealLeader(members) {
  return members.find((m) => !m.filled) || null;
}

function buildPartyEmbed(party) {
  const slotLines = [];
  for (let i = 0; i < party.maxSize; i++) {
    const member = party.members[i];
    if (member && member.filled) {
      slotLines.push(`\`${String(i + 1).padStart(2, '0')}\` ⬛ **Slot Already Filled by a Player** _(kickable)_`);
    } else if (member) {
      const crown = member.id === party.leaderId ? '👑 ' : '⚔️ ';
      slotLines.push(`\`${String(i + 1).padStart(2, '0')}\` ${crown}${member.name}`);
    } else {
      slotLines.push(`\`${String(i + 1).padStart(2, '0')}\` *— open slot —*`);
    }
  }

  let statusLine;
  let color;
  if (party.completed) {
    statusLine = '✅ **Run Complete!** Rest up and split the loot, adventurers.';
    color = 0x2ecc71;
  } else if (party.disbanded) {
    statusLine = '💀 **Party Disbanded.** This call has been stood down.';
    color = 0x555555;
  } else if (party.closed) {
    statusLine = `🔒 **Recruitment closed** by the party leader — ${party.members.length}/${party.maxSize} riding out.`;
    color = 0xc9a227;
  } else if (party.members.length >= party.maxSize) {
    statusLine = '🔥 **Party Full!** Ready to head in.';
    color = 0xc9a227;
  } else {
    statusLine = `🗺️ Recruiting adventurers — **${party.members.length}/${party.maxSize}** ready so far.`;
    color = 0x6b4f8f;
  }

  const serverLine = party.server ? `🗺️ Server : **${party.server}**\n\n` : '';
  const generalChatLine = `💬 Dungeon Chat: <#${DUNGEON_GENERAL_CHAT_THREAD_ID}>\n\n`;
  const threadLine = party.threadId ? `🧵 Run Chat: <#${party.threadId}>\n\n` : '';
  const calledAtLine = party.createdAt ? `🕰️ Called: <t:${Math.floor(party.createdAt / 1000)}:f>\n\n` : '';
  const fastRunLine = party.fastRunOnly ? `⚡ **Exclusive Fast Run** — Expert/Seasoned Adventurers only\n\n` : '';
  // Fast runs already state their Expert/Seasoned-only requirement via fastRunLine above, so
  // skip the redundant requirement line in that case.
  const tierLine = !party.fastRunOnly && party.requiredTier && party.requiredTier !== 'open'
    ? `🎯 **Requires:** ${partyTierLabel(party.requiredTier)} to Join\n\n`
    : '';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`⚔️ Party Up! — ${party.dungeonName}`)
    .setDescription(`${fastRunLine}${tierLine}${calledAtLine}${serverLine}${generalChatLine}${threadLine}${statusLine}\n\n${slotLines.join('\n')}`)
    .setFooter({ text: `Party called by ${party.leaderName} • Kick/Add/Complete/Full Party/Server are leader-only` })
    .setTimestamp(party.createdAt);
}

function buildPartyComponents(party) {
  const over = party.disbanded || party.completed;
  const full = party.closed || party.members.length >= party.maxSize;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('party:join').setLabel('Join').setEmoji('🛡️').setStyle(ButtonStyle.Success).setDisabled(over || full),
    new ButtonBuilder().setCustomId('party:leave').setLabel('Leave').setEmoji('🚪').setStyle(ButtonStyle.Secondary).setDisabled(over),
    party.closed
      ? new ButtonBuilder().setCustomId('party:full').setLabel('Reopen').setEmoji('🔓').setStyle(ButtonStyle.Secondary).setDisabled(over)
      : new ButtonBuilder().setCustomId('party:full').setLabel('Full Party').setEmoji('🔒').setStyle(ButtonStyle.Secondary).setDisabled(over),
    new ButtonBuilder().setCustomId('party:server').setLabel('Server').setEmoji('🗺️').setStyle(ButtonStyle.Secondary).setDisabled(over),
    new ButtonBuilder().setCustomId('party:reping').setLabel('Re-ping').setEmoji('📣').setStyle(ButtonStyle.Secondary).setDisabled(over)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('party:complete').setLabel('Complete & Disband Party').setEmoji('🏆').setStyle(ButtonStyle.Primary).setDisabled(over),
    // Lets the leader mark an open slot "Filled" in one click — for a friend who's already
    // grouped up outside the bot and doesn't need to press Join themselves. Kick works on these
    // the same way it does on real members (target by roster number or the name "Filled").
    new ButtonBuilder().setCustomId('party:add').setLabel('Add').setEmoji('➕').setStyle(ButtonStyle.Secondary).setDisabled(over || full),
    new ButtonBuilder().setCustomId('party:kick').setLabel('Kick').setEmoji('👢').setStyle(ButtonStyle.Danger).setDisabled(over || party.members.length <= 1)
  );
  return [row1, row2];
}

// Handles every `party:*` button click. Looked up by the card message's own ID, so no session
// state needs encoding into the customId itself.
async function handlePartyButton(interaction) {
  const parts = interaction.customId.split(':');
  const action = parts[1];

  const party = partyStore.get(interaction.message.id);

  if (!party) {
    const isMod = interaction.member ? canMuteMembers(interaction.member) : false;

    if (!isMod) {
      await interaction.reply({
        content: 'This party has faded into legend — it no longer exists (the bot may have restarted, or it was already closed out).',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Mods get an out: the card is still sitting in the channel looking live (buttons enabled,
    // roster visible) even though partyStore — in-memory only, see the big comment above it —
    // has no record of it, almost always because the bot/host restarted mid-run. Anyone who
    // thought they were still in this party is already partyless as far as the bot's concerned
    // (partyStore came back empty for everyone, not just this card), so the only actual mess
    // left to clean up is the stale card itself. Offer to force it down instead of leaving it
    // cluttering the hub looking active forever.
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`partyrecover:confirm:${interaction.message.id}`)
        .setLabel('Force Disband This Card')
        .setEmoji('💀')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('partyrecover:cancel').setLabel('Leave It').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
      content:
        'This party has faded into legend — the bot has no record of it (almost always a restart wiped it, since ' +
        'party state is in-memory only). Everyone who was on it is already treated as partyless — but this card ' +
        'itself is stuck looking live. Force-disband it to lock it down and free up its run chat?',
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (party.disbanded || party.completed) {
    await interaction.reply({
      content: party.completed
        ? 'This run has already wrapped up — nothing left to do here, adventurer.'
        : 'This party has already been disbanded.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const isLeader = interaction.user.id === party.leaderId;
  // Council/Knight/Guild Leader — same "mods" group !mute/!unmute uses (see canMuteMembers).
  // Mods can always wrap a run up via Complete, on top of the leader, even if they're not in
  // the party themselves.
  const isMod = interaction.member ? canMuteMembers(interaction.member) : false;
  const memberIndex = party.members.findIndex((m) => m.id === interaction.user.id);
  const displayName = interaction.member?.displayName || interaction.user.username;

  switch (action) {
    case 'join': {
      if (memberIndex !== -1) {
        await interaction.reply({ content: 'You\'re already in this party, traveller.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (party.closed || party.members.length >= party.maxSize) {
        await interaction.reply({ content: 'This party is already full — better luck on the next run!', flags: MessageFlags.Ephemeral });
        return;
      }
      if (!meetsPartyTierRequirement(interaction.member, party.requiredTier)) {
        await interaction.reply({
          content:
            `This party requires **${partyTierLabel(party.requiredTier)}** to Join. If the leader wants you in anyway, ` +
            `they can seat you with the **Add** button.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      party.members.push({ id: interaction.user.id, name: displayName });
      touchParty(party);
      ensureGeneralDungeonChatOpen();
      addUserToGeneralDungeonChat(interaction.user.id);
      if (party.threadId) addUserToDungeonThread(party.threadId, interaction.user.id);
      await interaction.update({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
      if (party.threadId) {
        const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${party.threadId}`;
        await interaction.followUp({
          content: `🧵 You're in the party! Hop into the run chat: ${jumpUrl}`,
          flags: MessageFlags.Ephemeral,
        }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      }
      return;
    }

    case 'add': {
      if (!isLeader) {
        await interaction.reply({ content: 'Only the party leader can mark a slot Filled.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (party.closed || party.members.length >= party.maxSize) {
        await interaction.reply({ content: 'There\'s no open slot left to fill.', flags: MessageFlags.Ephemeral });
        return;
      }
      party.members.push(makeFilledMember());
      touchParty(party);
      await interaction.update({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
      return;
    }

    case 'leave': {
      if (memberIndex === -1) {
        await interaction.reply({ content: 'You aren\'t part of this party.', flags: MessageFlags.Ephemeral });
        return;
      }
      party.members.splice(memberIndex, 1);
      touchParty(party);

      const heir = isLeader ? nextRealLeader(party.members) : null;
      if (isLeader && heir) {
        // Hand leadership to whoever's been waiting longest (skipping any Filled placeholders —
        // there's no real person behind those to hold the leader-only buttons) rather than
        // leaving the party leaderless — they can still hit Complete if they'd rather just end
        // the call.
        party.leaderId = heir.id;
        party.leaderName = heir.name;
        await interaction.update({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
        await interaction.followUp({ content: `👑 ${party.leaderName} has inherited leadership of the party!` });
        return;
      }

      if (isLeader && !heir) {
        // No real person left to inherit (empty, or only Filled placeholders remain) — auto-close
        // the run as Complete (there's no separate Disband action anymore, so a leaderless party
        // wraps up the same way a manual Complete would).
        party.completed = true;
        deactivateParty(party, interaction.message.id, 'leaderless-auto-complete');
        await lockDungeonThreadIfNowIdle(party);
        await interaction.update({ content: buildPartyClosingLine(party, 'completed'), embeds: [], components: [] });
        return;
      }

      await interaction.update({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
      return;
    }

    case 'full': {
      if (!isLeader) {
        await interaction.reply({ content: 'Only the party leader can open or close recruitment.', flags: MessageFlags.Ephemeral });
        return;
      }
      // Toggle rather than one-way lock — otherwise a party that drops under max size after a
      // leader closed it early has no way back in short of a full Complete + re-ping.
      party.closed = !party.closed;
      touchParty(party);
      await interaction.update({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
      return;
    }

    case 'complete': {
      if (!isLeader && !isMod) {
        await interaction.reply({ content: 'Only the party leader (or a mod) can mark the run complete.', flags: MessageFlags.Ephemeral });
        return;
      }
      party.completed = true;
      touchParty(party);
      deactivateParty(party, interaction.message.id, 'completed');
      await lockDungeonThreadIfNowIdle(party);
      await interaction.update({ content: buildPartyClosingLine(party, 'completed'), embeds: [], components: [] });
      return;
    }

    case 'server': {
      if (!isLeader) {
        await interaction.reply({ content: 'Only the party leader can set the server.', flags: MessageFlags.Ephemeral });
        return;
      }

      // Same modal for both the first-ever set and any later change — pre-filling the current
      // value with setValue makes "change" just look like editing what's already there.
      const modal = new ModalBuilder()
        .setCustomId(`party:servermodal:${interaction.message.id}`)
        .setTitle(`Set Server — ${party.dungeonName}`);

      const serverInput = new TextInputBuilder()
        .setCustomId('server')
        .setLabel('Server name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g. Nil 123')
        .setValue(party.server || '')
        .setRequired(true)
        .setMaxLength(50);

      modal.addComponents(new ActionRowBuilder().addComponents(serverInput));
      await interaction.showModal(modal);
      return;
    }

    case 'reping': {
      if (!isLeader) {
        await interaction.reply({ content: 'Only the party leader can re-ping the call.', flags: MessageFlags.Ephemeral });
        return;
      }

      const sinceLastBump = Date.now() - (party.lastBumpAt || party.createdAt || 0);
      if (sinceLastBump < PARTY_REPING_COOLDOWN_MS) {
        const waitLabel = formatRemaining(PARTY_REPING_COOLDOWN_MS - sinceLastBump);
        await interaction.reply({
          content: `⚔️ This party was called for recently — try again in ${waitLabel}.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferUpdate();
      const newMessage = await bumpParty(party, interaction.message.id, party.roleId);
      if (!newMessage) {
        await interaction.followUp({
          content: "⚠️ Couldn't re-ping — the party card failed to repost.",
          flags: MessageFlags.Ephemeral,
        });
      }
      return;
    }

    case 'kick': {
      if (!isLeader) {
        await interaction.reply({ content: 'Only the party leader can kick a member.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (party.members.length <= 1) {
        await interaction.reply({ content: 'There\'s no one else in the party to kick.', flags: MessageFlags.Ephemeral });
        return;
      }

      const rosterText = party.members
        .map((m, i) => `\`${i + 1}\` ${m.id === party.leaderId ? '👑 ' : ''}${m.name}`)
        .join('\n');

      // A modal instead of the old awaitMessages-on-a-bare-number approach: it's scoped to this
      // exact button click (no risk of an unrelated digit-only chat message — a loot count, a
      // page number — getting silently swallowed as the kick target), and two rapid Kick clicks
      // just open two independent modals instead of racing two collectors against each other.
      const modal = new ModalBuilder()
        .setCustomId(`party:kickmodal:${interaction.message.id}`)
        .setTitle(`Kick from ${party.dungeonName}`);

      const targetInput = new TextInputBuilder()
        .setCustomId('target')
        .setLabel('Roster number or name to kick')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(rosterText.slice(0, 100))
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(targetInput));
      await interaction.showModal(modal);
      return;
    }

    default:
      return;
  }
}

// Cleans up a Party Up! card that has outlived partyStore's memory of it — see the mod-only
// branch in handlePartyButton above for how a mod lands here. Since there's no party object
// left to work from (partyStore has already lost it, almost always to a bot/host restart), this
// works purely off the card message itself: it edits the embed/buttons directly, and — for the
// dungeon-thread re-lock — parses the dungeon name back out of the embed title. Mirrors what a
// normal disband does (dead card + re-hidden run chat), just recovering from further back.
async function handleOrphanPartyRecovery(interaction) {
  if (interaction.customId === 'partyrecover:cancel') {
    await interaction.update({ content: 'Left as-is.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const isMod = interaction.member ? canMuteMembers(interaction.member) : false;
  if (!isMod) {
    await interaction.reply({ content: 'Council/Sentinel/Emissary/Guild Leader only.', flags: MessageFlags.Ephemeral });
    return;
  }

  const [, , cardMessageId] = interaction.customId.split(':');

  // If a party somehow DOES exist under this ID by the time this fires (someone else already
  // force-disbanded it, or — extremely unlikely — a fresh party got keyed to the same message
  // ID), don't clobber it. Just report and bail.
  if (partyStore.has(cardMessageId)) {
    await interaction.update({
      content: 'Never mind — this party is actually still tracked by the bot. No changes made.',
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const cardMessage = await interaction.channel.messages.fetch(cardMessageId).catch(() => null);
  if (!cardMessage) {
    await interaction.update({
      content: "Couldn't even find the original card message anymore — it may have already been deleted.",
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const oldEmbed = cardMessage.embeds[0];
  const dungeonName = oldEmbed?.title ? oldEmbed.title.replace(/^⚔️ Party Up! — /, '') : null;

  const newEmbed = oldEmbed
    ? EmbedBuilder.from(oldEmbed)
        .setColor(0x555555)
        .setDescription(
          `💀 **Force-disbanded by staff** — this party's data was lost (almost always a bot/host restart) and has ` +
          `been manually stood down.\n\n${oldEmbed.description || ''}`
        )
    : new EmbedBuilder().setColor(0x555555).setTitle('⚔️ Party Up!').setDescription('💀 **Force-disbanded by staff.**');

  const deadRow1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('party:join').setLabel('Join').setEmoji('🛡️').setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setCustomId('party:leave').setLabel('Leave').setEmoji('🚪').setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId('party:full').setLabel('Full Party').setEmoji('🔒').setStyle(ButtonStyle.Secondary).setDisabled(true),
    new ButtonBuilder().setCustomId('party:server').setLabel('Server').setEmoji('🗺️').setStyle(ButtonStyle.Secondary).setDisabled(true)
  );
  const deadRow2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('party:complete').setLabel('Complete & Disband Party').setEmoji('🏆').setStyle(ButtonStyle.Primary).setDisabled(true),
    new ButtonBuilder().setCustomId('party:kick').setLabel('Kick').setEmoji('👢').setStyle(ButtonStyle.Danger).setDisabled(true)
  );

  await cardMessage.edit({ embeds: [newEmbed], components: [deadRow1, deadRow2] }).catch((err) => {
    console.error('Force-disband: failed to edit the orphaned party card:', err);
  });

  // Re-lock the dungeon's run-chat thread too, same as a normal disband would. No party object
  // survives to give us a roleId/threadId directly, so this goes by the dungeon name parsed out
  // of the card's own title instead. Only re-lock if nothing else currently claims that dungeon —
  // an orphaned card doesn't mean the dungeon has no OTHER live party right now.
  let threadNote = '';
  if (dungeonName && THREAD_ID_BY_DUNGEON_NAME.has(dungeonName)) {
    const threadId = THREAD_ID_BY_DUNGEON_NAME.get(dungeonName);
    const roleId = ROLE_ID_BY_THREAD_ID.get(threadId);
    if (roleId && !activePartyByRole.has(roleId) && !pendingPartyCreations.has(roleId)) {
      const thread = await client.channels.fetch(threadId).catch(() => null);
      if (thread) {
        await lockDungeonThread(thread);
        threadNote = ' Its run chat has been re-hidden too.';
      }
    }
  }

  await interaction.update({
    content: `💀 Force-disbanded. The card is now locked down, and anyone who was on it is treated as partyless.${threadNote}`,
    components: [],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Handles the roster-number-or-name submission from the Kick modal above. Kept separate from
// handlePartyButton since it's driven by a modalSubmit interaction, not a button click.
async function handlePartyKickModal(interaction) {
  const cardMessageId = interaction.customId.split(':')[2];
  const party = partyStore.get(cardMessageId);

  if (!party || party.disbanded || party.completed) {
    await interaction.reply({ content: 'This party no longer exists.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (interaction.user.id !== party.leaderId) {
    await interaction.reply({ content: 'Only the party leader can kick a member.', flags: MessageFlags.Ephemeral });
    return;
  }

  const raw = interaction.fields.getTextInputValue('target').trim();
  let target = null;

  if (/^\d+$/.test(raw)) {
    target = party.members[parseInt(raw, 10) - 1] || null;
  } else {
    const needle = raw.toLowerCase();
    const matches = party.members.filter((m) => m.name.toLowerCase().includes(needle));
    if (matches.length > 1) {
      await interaction.reply({
        content: `That name matches more than one adventurer in the party — use the roster **number** instead.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    target = matches[0] || null;
  }

  if (!target) {
    await interaction.reply({ content: 'That doesn\'t match anyone currently in the party.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (target.id === party.leaderId) {
    await interaction.reply({ content: 'You can\'t kick yourself — use Disband instead if you want to end the call.', flags: MessageFlags.Ephemeral });
    return;
  }

  const idx = party.members.findIndex((m) => m.id === target.id);
  party.members.splice(idx, 1);
  touchParty(party);

  try {
    const channel = await client.channels.fetch(party.channelId).catch(() => null);
    const cardMessage = channel ? await channel.messages.fetch(cardMessageId).catch(() => null) : null;
    if (cardMessage) {
      await cardMessage.edit({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
    }
  } catch (err) {
    console.error('Failed to update the party card after a kick:', err);
  }

  // Name only, no mention — the kicked adventurer doesn't need a ping to know they're out.
  await interaction.reply({ content: `👢 **${target.name}** was kicked from the party.`, allowedMentions: { parse: [] } });
}

// Handles the server-name submission from the Server modal above. Kept separate from
// handlePartyButton since it's driven by a modalSubmit interaction, not a button click. Covers
// both the first-ever server being set and any later change to it — the notice text below is
// the only thing that differs between the two. Unlike the Kick notice, this doesn't post a fresh
// message every time: it edits the one tracked serverNoticeMessageId in place (posting it once,
// the first time a server's set), so repeated changes don't spam the thread. This is independent
// of Bump — the notice is edited where it already sits, the card itself isn't reposted.
async function handlePartyServerModal(interaction) {
  const cardMessageId = interaction.customId.split(':')[2];
  const party = partyStore.get(cardMessageId);

  if (!party || party.disbanded || party.completed) {
    await interaction.reply({ content: 'This party no longer exists.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (interaction.user.id !== party.leaderId) {
    await interaction.reply({ content: 'Only the party leader can set the server.', flags: MessageFlags.Ephemeral });
    return;
  }

  const newServer = interaction.fields.getTextInputValue('server').trim();
  if (!newServer) {
    await interaction.reply({ content: 'You need to actually type a server name, adventurer.', flags: MessageFlags.Ephemeral });
    return;
  }

  const previousServer = party.server;
  if (previousServer === newServer) {
    await interaction.reply({ content: `The party's already mustered at **${newServer}** — nothing to change.`, flags: MessageFlags.Ephemeral });
    return;
  }

  party.server = newServer;
  touchParty(party);

  // Acknowledge the modal itself with no visible reply of its own — the only visible output is
  // the single notice message edited/posted below. Falls back to a quiet ephemeral ack if this
  // modal submission somehow can't be deferred as a component update (e.g. it wasn't tied back
  // to the card message for some reason).
  try {
    await interaction.deferUpdate();
  } catch (err) {
    await interaction.reply({ content: `🗺️ Server set to **${newServer}**.`, flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  let channel = null;
  try {
    channel = await client.channels.fetch(party.channelId).catch(() => null);
    const cardMessage = channel ? await channel.messages.fetch(cardMessageId).catch(() => null) : null;
    if (cardMessage) {
      await cardMessage.edit({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
    }
  } catch (err) {
    console.error('Failed to update the party card after setting the server:', err);
  }

  // Small fantasy-flavored notice, no ping — same shape whether this is the first time a server's
  // been named or the leader's moving the party to a new one. One message per party, edited in
  // place on every subsequent change rather than reposted.
  const notice = previousServer
    ? `🗺️ **${party.leaderName}** has shifted the party's muster to **${newServer}**!`
    : `🗺️ **${party.leaderName}** is forming a party at **${newServer}**!`;

  if (!channel) return;

  try {
    const existingNotice = party.serverNoticeMessageId
      ? await channel.messages.fetch(party.serverNoticeMessageId).catch(() => null)
      : null;

    if (existingNotice) {
      await existingNotice.edit({ content: notice, allowedMentions: { parse: [] } });
    } else {
      const sent = await channel.send({ content: notice, allowedMentions: { parse: [] } });
      party.serverNoticeMessageId = sent.id;
    }
  } catch (err) {
    console.error('Failed to post/edit the server-change notice:', err);
  }
}

// ---------- Events ----------

// Keeps DUNGEON_GENERAL_CHAT_THREAD_ID permanently visible in the dungeon-runs channel's
// thread list. Nothing in the lock/unlock/relock logic above ever touches this thread (it's
// not in DUNGEON_THREAD_IDS), but Discord's own per-thread auto-archive timer can still hide
// it after enough inactivity — this runs on an interval (and once at startup) and pops it
// back open if that ever happens, plus pushes its auto-archive duration out to Discord's max
// (1 week) so it takes that long to even go idle in the first place.
const GENERAL_CHAT_KEEPALIVE_INTERVAL_MS = 60 * 60 * 1000; // hourly is plenty
async function keepGeneralDungeonChatUnarchived() {
  try {
    const thread = await client.channels.fetch(DUNGEON_GENERAL_CHAT_THREAD_ID, { force: true });
    if (!thread) {
      console.error(`Couldn't find the general dungeon-runs chat thread (${DUNGEON_GENERAL_CHAT_THREAD_ID}).`);
      return;
    }
    if (thread.archived) {
      try {
        await thread.setArchived(false, 'General dungeon-runs chat stays permanently available');
      } catch (err) {
        await reportDungeonThreadError('unhide', thread, err);
      }
    }
    if (thread.autoArchiveDuration !== 10080) {
      try {
        await thread.setAutoArchiveDuration(10080, 'General dungeon-runs chat stays permanently available');
      } catch (err) {
        // This used to fail silently (.catch(() => {})). If it's failing — e.g. this server
        // isn't boosted to Level 2, which is required for the 1-week option — the thread is
        // quietly stuck on Discord's shorter default auto-archive timer (as low as 1 day) and
        // WILL keep auto-archiving itself from inactivity between hourly sweeps, which looks
        // exactly like "it closes on its own." Surface it instead of eating it.
        await reportDungeonThreadError('extend the auto-archive duration on', thread, err);
      }
    }
  } catch (err) {
    console.error('Failed to keep the general dungeon-runs chat thread unarchived:', err);
  }
}

// ==================== Giveaway System (merged from giveaway-bot.js) ====================
// Same behavior as the standalone bot: !giveaway (Council/Knight/Emissary only, via the
// existing isCouncil() above) posts a card in GIVEAWAY_CHANNEL_ID; anyone can Join; mods
// manage the prize pool and roll winners. Persists to giveaways.json using the same
// atomic-write + dirty-flag + timer-flush pattern as everything else in this file.

const GIVEAWAY_ENTRANTS_PER_PAGE = 10;
const GIVEAWAYS_FILE = path.join(__dirname, 'giveaways.json');
const giveawayStore = new Map();
let giveawaysRestored = false;

function readGiveawaysFromDisk() {
  if (!fs.existsSync(GIVEAWAYS_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(GIVEAWAYS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read giveaways.json, starting fresh.', err);
    return [];
  }
}

function restoreGiveawaysFromDisk() {
  if (giveawaysRestored) return;
  giveawaysRestored = true;
  const saved = readGiveawaysFromDisk();
  for (const entry of saved) {
    const { messageId, ...giveaway } = entry;
    if (!messageId) continue;
    giveawayStore.set(messageId, giveaway);
  }
  if (saved.length) {
    console.log(`Restored ${saved.length} giveaway${saved.length === 1 ? '' : 's'} from giveaways.json.`);
  }
}

function flushGiveawaysToDisk() {
  try {
    const all = [];
    for (const [messageId, giveaway] of giveawayStore.entries()) {
      all.push({ messageId, ...giveaway });
    }
    atomicWriteFileSync(GIVEAWAYS_FILE, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to write giveaways.json:', err);
  }
}

function giveawayItemSeq(giveaway) {
  giveaway.itemSeq = (giveaway.itemSeq || 0) + 1;
  return giveaway.itemSeq;
}

function giveawayTotalPages(giveaway) {
  return Math.max(1, Math.ceil(giveaway.entrants.length / GIVEAWAY_ENTRANTS_PER_PAGE));
}

// Very light validation for the optional "Image URL" field on the Add/Edit prize modals — just
// enough to reject obvious junk before handing it to EmbedBuilder#setImage (which will silently
// no-op or error on a bad URL). Doesn't require an image-file extension since Discord CDN links,
// imgur, etc. don't always have one.
function isLikelyImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildGiveawayEmbed(giveaway) {
  const itemLines = giveaway.items.length
    ? giveaway.items.map((it, i) => `\`${i + 1}\` 🎁 ${it.text}`).join('\n')
    : '*No prizes added yet — a host will add some shortly.*';

  const totalPages = giveawayTotalPages(giveaway);
  const page = Math.min(giveaway.page || 0, totalPages - 1);
  const start = page * GIVEAWAY_ENTRANTS_PER_PAGE;
  const pageEntrants = giveaway.entrants.slice(start, start + GIVEAWAY_ENTRANTS_PER_PAGE);
  const entrantLines = pageEntrants.length
    ? pageEntrants.map((e, i) => `\`${String(start + i + 1).padStart(2, '0')}\` 🎫 ${e.name}`).join('\n')
    : '*No one has entered yet — be the first!*';

  let statusLine;
  let color;
  if (giveaway.status === 'ended') {
    statusLine = '🔒 **Giveaway closed.**';
    color = 0x555555;
  } else if (giveaway.status === 'rolled') {
    statusLine = '🎲 **Winners drawn!** Awaiting host confirmation.';
    color = 0xc9a227;
  } else {
    statusLine = `🎉 **Giveaway open!** — **${giveaway.entrants.length}** entered so far.`;
    color = 0x8b4513;
  }

  const winnerLine = giveaway.winners && giveaway.winners.length
    ? `\n\n🏆 **Winner${giveaway.winners.length > 1 ? 's' : ''}:** ${giveaway.winners.map((w) => `<@${w.id}>`).join(', ')}`
    : '';

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('🎉 Giveaway!')
    .setDescription(
      `${statusLine}\n\n**Prizes:**\n${itemLines}${winnerLine}\n\n` +
      `**Entrants (page ${page + 1}/${totalPages}):**\n${entrantLines}`
    )
    .setImage(giveaway.imageUrl || null)
    .setFooter({ text: `Hosted by ${giveaway.hostName} • Add/Edit/Remove/Roll are Council/Knight/Emissary-only` })
    .setTimestamp(giveaway.createdAt);
}

function buildGiveawayComponents(giveaway) {
  const over = giveaway.status === 'ended';
  const rolled = giveaway.status === 'rolled';
  const totalPages = giveawayTotalPages(giveaway);
  const page = Math.min(giveaway.page || 0, totalPages - 1);

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('giveaway:join').setLabel('Join Giveaway').setEmoji('🎉').setStyle(ButtonStyle.Success).setDisabled(over || rolled),
    new ButtonBuilder().setCustomId('giveaway:prev').setLabel('Prev').setEmoji('◀️').setStyle(ButtonStyle.Secondary).setDisabled(page <= 0),
    new ButtonBuilder().setCustomId('giveaway:next').setLabel('Next').setEmoji('▶️').setStyle(ButtonStyle.Secondary).setDisabled(page >= totalPages - 1)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('giveaway:add').setLabel('Add').setEmoji('➕').setStyle(ButtonStyle.Secondary).setDisabled(over || rolled),
    new ButtonBuilder().setCustomId('giveaway:edit').setLabel('Edit').setEmoji('✏️').setStyle(ButtonStyle.Secondary).setDisabled(over || rolled),
    new ButtonBuilder().setCustomId('giveaway:remove').setLabel('Remove').setEmoji('🗑️').setStyle(ButtonStyle.Danger).setDisabled(over || rolled),
    new ButtonBuilder().setCustomId('giveaway:roll').setLabel('Roll Winners').setEmoji('🎲').setStyle(ButtonStyle.Primary).setDisabled(over || rolled)
  );
  return [row1, row2];
}

function giveawayPermissionDenied(interaction) {
  return interaction.reply({
    content: "You don't have permission to manage this giveaway — that's Council/Knight/Emissary only.",
    flags: MessageFlags.Ephemeral,
  });
}

// ---- !giveaway creation prompt — asks what's being given away before anything posts ----
//
// `!giveaway` no longer creates an empty card straight away: it first posts a one-button prompt,
// and clicking it opens a modal asking what's being given away. Discord hard-caps modals at 5
// components total, so this is 1 required "what are you giving away" field plus 4 more optional
// fields for additional prizes (5 fields total) rather than a separate headline question on top of
// 5 more boxes — there's no way to fit 6 text inputs in one modal. Any additional prizes beyond
// that can still be added afterward with the card's own ➕ Add button, same as before. Whichever
// fields are actually filled in become the giveaway's starting prize list; the card is then posted
// with a ping to GIVEAWAY_ROLE_ID so members with that role are notified right away.
async function handleGiveawayStartButton(interaction) {
  const [, , authorId] = interaction.customId.split(':');

  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This giveaway prompt isn\'t yours to fill in.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!interaction.member || !isCouncil(interaction.member)) {
    await giveawayPermissionDenied(interaction);
    return;
  }

  const modal = new ModalBuilder().setCustomId(`giveawaystart:modal:${authorId}`).setTitle('Start a Giveaway');
  const fields = [
    { id: 'item1', label: 'What would you like to give away?', required: true },
    { id: 'item2', label: 'Additional prize (optional)', required: false },
    { id: 'item3', label: 'Additional prize (optional)', required: false },
    { id: 'item4', label: 'Additional prize (optional)', required: false },
    { id: 'item5', label: 'Additional prize (optional)', required: false },
  ];
  modal.addComponents(
    ...fields.map(({ id, label, required }) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(id)
          .setLabel(label)
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('e.g. 500 Robux gift card')
          .setRequired(required)
          .setMaxLength(200)
      )
    )
  );
  await interaction.showModal(modal);
}

async function handleGiveawayStartModal(interaction) {
  if (!interaction.member || !isCouncil(interaction.member)) {
    await giveawayPermissionDenied(interaction);
    return;
  }

  const items = ['item1', 'item2', 'item3', 'item4', 'item5']
    .map((id) => interaction.fields.getTextInputValue(id).trim())
    .filter(Boolean);

  if (items.length === 0) {
    await interaction.reply({ content: 'You need to enter at least one prize.', flags: MessageFlags.Ephemeral });
    return;
  }

  const postingFromPrivateChannel = interaction.channelId !== GIVEAWAY_CHANNEL_ID;
  const targetChannel = postingFromPrivateChannel
    ? await interaction.guild.channels.fetch(GIVEAWAY_CHANNEL_ID).catch(() => null)
    : interaction.channel;

  if (!targetChannel) {
    await interaction.update({
      content: `⚠️ Couldn't reach <#${GIVEAWAY_CHANNEL_ID}> to post the giveaway — check the bot's access to that channel.`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const hostName = interaction.member?.displayName || interaction.user.username;
  const giveaway = {
    hostId: interaction.user.id,
    hostName,
    createdAt: Date.now(),
    items: [],
    itemSeq: 0,
    entrants: [],
    page: 0,
    status: 'open',
    winners: [],
  };
  for (const text of items) {
    giveaway.items.push({ id: giveawayItemSeq(giveaway), text, addedBy: interaction.user.id });
  }

  const sent = await targetChannel.send({
    content: `<@&${GIVEAWAY_ROLE_ID}> — **${hostName}** started a giveaway!`,
    embeds: [buildGiveawayEmbed(giveaway)],
    components: buildGiveawayComponents(giveaway),
    allowedMentions: { roles: [GIVEAWAY_ROLE_ID] },
  }).catch((err) => {
    console.error('Discord API call failed (non-critical):', err);
    return null;
  });

  if (!sent) {
    await interaction.update({ content: '⚠️ Something went wrong posting the giveaway — try again.', components: [] })
      .catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  giveawayStore.set(sent.id, giveaway);
  flushGiveawaysToDisk();

  await interaction.update({
    content: postingFromPrivateChannel ? `🎉 Giveaway posted in <#${GIVEAWAY_CHANNEL_ID}>.` : '🎉 Giveaway posted!',
    components: [],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Handles every `giveaway:*` button click on the main card.
async function handleGiveawayButton(interaction) {
  const action = interaction.customId.split(':')[1];
  const giveaway = giveawayStore.get(interaction.message.id);

  if (!giveaway) {
    await interaction.reply({
      content: 'This giveaway has faded into legend — it no longer exists (the bot may have restarted, or it was already closed out).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Blocks stale button presses once a giveaway has moved past 'open' (rolled or ended) —
  // e.g. two mods racing to Roll Winners, or a Join click landing after winners were drawn.
  // Prev/Next stay available at any status since they're just viewing, never mutating.
  if (giveaway.status !== 'open' && action !== 'prev' && action !== 'next') {
    const msg = giveaway.status === 'ended'
      ? 'This giveaway is already closed.'
      : 'Winners have already been drawn for this giveaway — use the Close/Reroll prompt instead.';
    await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
    return;
  }

  const isMod = interaction.member ? isCouncil(interaction.member) : false;
  const displayName = interaction.member?.displayName || interaction.user.username;

  switch (action) {
    case 'join': {
      if (giveaway.status !== 'open') {
        await interaction.reply({ content: 'Winners have already been drawn — this giveaway is no longer accepting entries.', flags: MessageFlags.Ephemeral });
        return;
      }
      if (giveaway.entrants.some((e) => e.id === interaction.user.id)) {
        await interaction.reply({ content: "You're already entered, traveller — good luck!", flags: MessageFlags.Ephemeral });
        return;
      }
      giveaway.entrants.push({ id: interaction.user.id, name: displayName });
      await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
      return;
    }

    case 'prev':
    case 'next': {
      const totalPages = giveawayTotalPages(giveaway);
      const current = Math.min(giveaway.page || 0, totalPages - 1);
      giveaway.page = action === 'prev' ? Math.max(0, current - 1) : Math.min(totalPages - 1, current + 1);
      await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
      return;
    }

    case 'add': {
      if (!isMod) { await giveawayPermissionDenied(interaction); return; }
      const modal = new ModalBuilder().setCustomId(`giveawaymodal:add:${interaction.message.id}`).setTitle('Add Prize');
      const itemInput = new TextInputBuilder()
        .setCustomId('item').setLabel('Prize item').setStyle(TextInputStyle.Short)
        .setPlaceholder('e.g. 500 Robux gift card').setRequired(true).setMaxLength(200);
      const imageInput = new TextInputBuilder()
        .setCustomId('imageUrl').setLabel('Image URL (optional)').setStyle(TextInputStyle.Short)
        .setPlaceholder('Paste a link to a photo of the prize').setRequired(false).setMaxLength(500);
      modal.addComponents(
        new ActionRowBuilder().addComponents(itemInput),
        new ActionRowBuilder().addComponents(imageInput)
      );
      await interaction.showModal(modal);
      return;
    }

    case 'edit': {
      if (!isMod) { await giveawayPermissionDenied(interaction); return; }
      if (!giveaway.items.length) {
        await interaction.reply({ content: 'There are no prizes to edit yet — use Add first.', flags: MessageFlags.Ephemeral });
        return;
      }
      const modal = new ModalBuilder().setCustomId(`giveawaymodal:edit:${interaction.message.id}`).setTitle('Edit Prize');
      const numberInput = new TextInputBuilder()
        .setCustomId('number').setLabel('Prize # to edit').setStyle(TextInputStyle.Short)
        .setPlaceholder(giveaway.items.map((it, i) => `${i + 1}`).join(', ')).setRequired(true).setMaxLength(5);
      const textInput = new TextInputBuilder()
        .setCustomId('item').setLabel('New text').setStyle(TextInputStyle.Short)
        .setRequired(true).setMaxLength(200);
      const imageInput = new TextInputBuilder()
        .setCustomId('imageUrl').setLabel('Image URL (optional)').setStyle(TextInputStyle.Short)
        .setPlaceholder('Paste a link to update the giveaway photo').setRequired(false).setMaxLength(500);
      modal.addComponents(
        new ActionRowBuilder().addComponents(numberInput),
        new ActionRowBuilder().addComponents(textInput),
        new ActionRowBuilder().addComponents(imageInput)
      );
      await interaction.showModal(modal);
      return;
    }

    case 'remove': {
      if (!isMod) { await giveawayPermissionDenied(interaction); return; }
      if (!giveaway.items.length) {
        await interaction.reply({ content: 'There are no prizes to remove.', flags: MessageFlags.Ephemeral });
        return;
      }
      const modal = new ModalBuilder().setCustomId(`giveawaymodal:remove:${interaction.message.id}`).setTitle('Remove Prize');
      const numberInput = new TextInputBuilder()
        .setCustomId('number').setLabel('Prize # to remove').setStyle(TextInputStyle.Short)
        .setPlaceholder(giveaway.items.map((it, i) => `${i + 1}`).join(', ')).setRequired(true).setMaxLength(5);
      modal.addComponents(new ActionRowBuilder().addComponents(numberInput));
      await interaction.showModal(modal);
      return;
    }

    case 'roll': {
      if (!isMod) { await giveawayPermissionDenied(interaction); return; }
      if (!giveaway.entrants.length) {
        await interaction.reply({ content: 'Nobody has entered yet — nothing to roll.', flags: MessageFlags.Ephemeral });
        return;
      }
      const modal = new ModalBuilder().setCustomId(`giveawaymodal:roll:${interaction.message.id}`).setTitle('Roll Winners');
      const countInput = new TextInputBuilder()
        .setCustomId('count').setLabel(`How many winners? (${giveaway.entrants.length} entered)`)
        .setStyle(TextInputStyle.Short).setValue('1').setRequired(true).setMaxLength(4);
      modal.addComponents(new ActionRowBuilder().addComponents(countInput));
      await interaction.showModal(modal);
      return;
    }

    default:
      return;
  }
}

// Purely random selection, no weighting — draws `count` distinct entrants via a Fisher-Yates
// partial shuffle so the same person can't be picked twice in one roll.
function rollGiveawayWinners(giveaway, count) {
  const pool = [...giveaway.entrants];
  const winners = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return winners;
}

function giveawaySleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The public "a mod has started rolling..." moment — a single message that gets EDITED through
// a loading animation, then a drum-roll beat, then the reveal, so members see the suspense
// without the channel filling up with a fresh message per frame. One of these runs per winner.
async function animateGiveawayReveal(channel, itemLabel, winner) {
  const dotFrames = ['.', '. .', '. . .', '. .', '.', '. .', '. . .'];
  const msg = await channel
    .send({ content: `🎲 A mod has started the rolling for the giveaway...\n\n${dotFrames[0]}` })
    .catch((err) => { console.error('Discord API call failed (non-critical):', err); return null; });
  if (!msg) return null;

  for (let i = 1; i < dotFrames.length; i++) {
    await giveawaySleep(550);
    await msg.edit({ content: `🎲 Rolling for **${itemLabel}**...\n\n${dotFrames[i]}` }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  await giveawaySleep(700);
  await msg.edit({ content: `And the winner for **${itemLabel}** is~\n\n🥁 *drum roll* 🥁` }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  await giveawaySleep(1400);
  await msg.edit({ content: `And the winner for **${itemLabel}** is~\n\n🥁 *dun dun dun* 🥁\n\n🎉 **Congratulations, ${winner.name}!** 🎉` }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  return msg;
}

// Ephemeral, mod-only prompt (so this part doesn't flood the channel) asking whether the claim
// message that follows should @mention the winner or just name them.
async function awaitClaimMentionChoice(interaction, winner) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('giveawayclaim:yes').setLabel('Mention them').setEmoji('📣').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('giveawayclaim:no').setLabel('Just their name').setStyle(ButtonStyle.Secondary)
  );

  const prompt = await interaction
    .followUp({
      content: `Mention **${winner.name}** (@ping) in the claim-prize message, or just use their name?`,
      components: [row],
      flags: MessageFlags.Ephemeral,
    })
    .catch((err) => { console.error('Discord API call failed (non-critical):', err); return null; });
  if (!prompt) return false;

  const click = await prompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && ['giveawayclaim:yes', 'giveawayclaim:no'].includes(i.customId),
      time: 30000,
    })
    .catch(() => null);

  if (!click) {
    await prompt.edit({ content: 'Timed out — defaulting to name only for the claim message.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return false;
  }

  const mention = click.customId === 'giveawayclaim:yes';
  await click.update({ content: mention ? 'Mentioning them in the claim message.' : 'Using their name only.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  return mention;
}

// Runs the full public reveal + claim-message flow for every winner, then hands off to the
// ephemeral Close/Reroll prompt.
async function announceGiveawayWinners(interaction, giveaway, messageId) {
  for (let i = 0; i < giveaway.winners.length; i++) {
    const winner = giveaway.winners[i];
    const itemLabel = giveaway.items[i] ? giveaway.items[i].text : `Prize #${i + 1}`;
    await animateGiveawayReveal(interaction.channel, itemLabel, winner);
    const mention = await awaitClaimMentionChoice(interaction, winner);
    await interaction.channel
      .send({
        content: mention
          ? `<@${winner.id}> please claim your prize from one of our officers!`
          : `**${winner.name}** please claim your prize from one of our officers!`,
      })
      .catch((err) => console.error('Discord API call failed (non-critical):', err));
  }
  await postGiveawayEndPrompt(interaction, giveaway, messageId);
}

// After a Roll (or Reroll), sends the mod-facing "giveaway has ended" prompt as an EPHEMERAL
// follow-up — only the mod who triggered it can see the Close/Reroll buttons.
async function postGiveawayEndPrompt(interaction, giveaway, messageId) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`giveawayend:close:${messageId}`).setLabel('Close the giveaway?').setEmoji('🔒').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`giveawayend:reroll:${messageId}`).setLabel('Reroll').setEmoji('🔁').setStyle(ButtonStyle.Secondary)
  );
  await interaction.followUp({
    content: `🎉 **The giveaway has ended!** Winner${giveaway.winners.length > 1 ? 's' : ''}: ${giveaway.winners.map((w) => `<@${w.id}>`).join(', ')}\nClose it out, or reroll if needed:`,
    components: [row],
    flags: MessageFlags.Ephemeral,
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

async function handleGiveawayModal(interaction) {
  const [, kind, messageId] = interaction.customId.split(':');
  const giveaway = giveawayStore.get(messageId);
  if (!giveaway) {
    await interaction.reply({ content: 'This giveaway no longer exists.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!interaction.member || !isCouncil(interaction.member)) {
    await giveawayPermissionDenied(interaction);
    return;
  }

  // Re-check status at submit time, not just at button-click time — a modal can sit open for
  // a while, and the giveaway may have been rolled/closed by someone else in the meantime.
  if (giveaway.status !== 'open') {
    const msg = giveaway.status === 'ended'
      ? 'This giveaway is already closed — that action is no longer available.'
      : 'Winners have already been drawn for this giveaway — that action is no longer available.';
    await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral });
    return;
  }

  if (kind === 'add') {
    const text = interaction.fields.getTextInputValue('item').trim();
    if (!text) { await interaction.reply({ content: 'Prize text can\'t be empty.', flags: MessageFlags.Ephemeral }); return; }
    const imageUrl = interaction.fields.getTextInputValue('imageUrl').trim();
    if (imageUrl && !isLikelyImageUrl(imageUrl)) {
      await interaction.reply({ content: 'That image URL doesn\'t look valid — make sure it starts with http:// or https://.', flags: MessageFlags.Ephemeral });
      return;
    }
    giveaway.items.push({ id: giveawayItemSeq(giveaway), text, addedBy: interaction.user.id });
    if (imageUrl) giveaway.imageUrl = imageUrl;
    await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
    await interaction.followUp({
      content: imageUrl
        ? `✅ Added **${text}** to the prize list and updated the giveaway photo.`
        : `✅ Added **${text}** to the prize list.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  if (kind === 'edit') {
    const num = parseInt(interaction.fields.getTextInputValue('number').trim(), 10);
    const text = interaction.fields.getTextInputValue('item').trim();
    if (!num || num < 1 || num > giveaway.items.length) {
      await interaction.reply({ content: 'That prize number doesn\'t exist.', flags: MessageFlags.Ephemeral });
      return;
    }
    if (!text) { await interaction.reply({ content: 'Prize text can\'t be empty.', flags: MessageFlags.Ephemeral }); return; }
    const imageUrl = interaction.fields.getTextInputValue('imageUrl').trim();
    if (imageUrl && !isLikelyImageUrl(imageUrl)) {
      await interaction.reply({ content: 'That image URL doesn\'t look valid — make sure it starts with http:// or https://.', flags: MessageFlags.Ephemeral });
      return;
    }
    giveaway.items[num - 1].text = text;
    if (imageUrl) giveaway.imageUrl = imageUrl;
    await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
    await interaction.followUp({
      content: imageUrl
        ? `✅ Updated prize #${num} and the giveaway photo.`
        : `✅ Updated prize #${num}.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  if (kind === 'remove') {
    const num = parseInt(interaction.fields.getTextInputValue('number').trim(), 10);
    if (!num || num < 1 || num > giveaway.items.length) {
      await interaction.reply({ content: 'That prize number doesn\'t exist.', flags: MessageFlags.Ephemeral });
      return;
    }
    const removed = giveaway.items.splice(num - 1, 1)[0];
    await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
    await interaction.followUp({ content: `🗑️ Removed **${removed.text}** from the prize list.`, flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  if (kind === 'roll') {
    const raw = interaction.fields.getTextInputValue('count').trim();
    let count = parseInt(raw, 10);
    if (!Number.isFinite(count) || count < 1) count = 1;
    count = Math.min(count, giveaway.entrants.length);

    giveaway.winners = rollGiveawayWinners(giveaway, count);
    giveaway.status = 'rolled';
    await interaction.update({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) });
    await announceGiveawayWinners(interaction, giveaway, messageId);
    return;
  }
}

async function handleGiveawayEndButton(interaction) {
  const [, action, messageId] = interaction.customId.split(':');
  const giveaway = giveawayStore.get(messageId);

  if (!interaction.member || !isCouncil(interaction.member)) {
    await giveawayPermissionDenied(interaction);
    return;
  }

  if (!giveaway) {
    await interaction.update({ content: 'This giveaway no longer exists.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  if (action === 'close') {
    giveaway.status = 'ended';
    await interaction.update({ content: `🔒 **Giveaway closed.** Winner${giveaway.winners.length > 1 ? 's' : ''}: ${giveaway.winners.map((w) => `<@${w.id}>`).join(', ')}`, components: [] });
    const card = await interaction.channel.messages.fetch(messageId).catch(() => null);
    if (card) {
      await card.edit({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }
    return;
  }

  if (action === 'reroll') {
    if (!giveaway.entrants.length) {
      await interaction.reply({ content: 'Nobody has entered — nothing to reroll.', flags: MessageFlags.Ephemeral });
      return;
    }
    const priorCount = giveaway.winners.length || 1;
    giveaway.winners = rollGiveawayWinners(giveaway, priorCount);
    await interaction.update({ content: `🔁 Rerolling...`, components: [] });
    const card = await interaction.channel.messages.fetch(messageId).catch(() => null);
    if (card) {
      await card.edit({ embeds: [buildGiveawayEmbed(giveaway)], components: buildGiveawayComponents(giveaway) }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }
    await announceGiveawayWinners(interaction, giveaway, messageId);
    return;
  }
}

// If a giveaway card gets deleted out-of-band, drop it from giveawayStore so it isn't kept
// alive forever in giveaways.json with no way to interact with it anymore.
function handleGiveawayCardDeleted(messageId) {
  giveawayStore.delete(messageId);
}

// ==================== RSVP / Event System ====================
// !rsvp (Council/Knight only — NOT Emissary, per guild policy) opens a small modal to create
// an event card. It always posts in GIVEAWAY_CHANNEL_ID, same as !giveaway. Members respond
// with a simple Yes/No — no Maybe option. Persists to rsvp.json with the same atomic-write +
// timer-flush pattern as everything else here.

const RSVP_FILE = path.join(__dirname, 'rsvp.json');
const rsvpStore = new Map();
let rsvpsRestored = false;

// Deliberately excludes Emissary — event creation is Council/Knight only, unlike !giveaway.
function isEventHostRole(member) {
  return isLeadershipUser(member) || member.roles.cache.has(ETHEREAL_ROLE_ID) || member.roles.cache.has(COUNCIL_ROLE_ID) || member.roles.cache.has(KNIGHT_ROLE_ID);
}

function readRsvpsFromDisk() {
  if (!fs.existsSync(RSVP_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(RSVP_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read rsvp.json, starting fresh.', err);
    return [];
  }
}

function restoreRsvpsFromDisk() {
  if (rsvpsRestored) return;
  rsvpsRestored = true;
  const saved = readRsvpsFromDisk();
  for (const entry of saved) {
    const { messageId, ...event } = entry;
    if (!messageId) continue;
    rsvpStore.set(messageId, event);
  }
  if (saved.length) {
    console.log(`Restored ${saved.length} event${saved.length === 1 ? '' : 's'} from rsvp.json.`);
  }
}

function flushRsvpsToDisk() {
  try {
    const all = [];
    for (const [messageId, event] of rsvpStore.entries()) {
      all.push({ messageId, ...event });
    }
    atomicWriteFileSync(RSVP_FILE, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to write rsvp.json:', err);
  }
}

function buildRsvpEmbed(event) {
  const yesLines = event.yes.length
    ? event.yes.map((e) => `🟢 ${e.name}`).join('\n')
    : '*Nobody yet.*';
  const noLines = event.no.length
    ? event.no.map((e) => `🔴 ${e.name}`).join('\n')
    : '*Nobody yet.*';

  const statusLine = event.status === 'closed'
    ? '🔒 **RSVPs closed.**'
    : '📅 **RSVPs open!**';
  const color = event.status === 'closed' ? 0x555555 : 0x8b4513;

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`📅 ${event.title}`)
    .setDescription(
      `${statusLine}\n\n` +
      `**When:** ${event.when}\n\n` +
      `${event.details ? `${event.details}\n\n` : ''}` +
      `**✅ Going (${event.yes.length})**\n${yesLines}\n\n` +
      `**❌ Not Going (${event.no.length})**\n${noLines}`
    )
    .setFooter({ text: `Hosted by ${event.hostName} • Yes/No only` })
    .setTimestamp(event.createdAt);
}

function buildRsvpComponents(event) {
  const closed = event.status === 'closed';
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`rsvp:yes:${event.hostId}`).setLabel("I'm Going").setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(closed),
      new ButtonBuilder().setCustomId(`rsvp:no:${event.hostId}`).setLabel("Can't Make It").setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(closed),
      new ButtonBuilder().setCustomId(`rsvp:close:${event.hostId}`).setLabel('Close Event').setEmoji('🔒').setStyle(ButtonStyle.Secondary).setDisabled(closed)
    ),
  ];
}

function rsvpPermissionDenied(interaction) {
  return interaction.reply({
    content: "You don't have permission to manage this event — that's Council/Knight only.",
    flags: MessageFlags.Ephemeral,
  });
}

async function handleRsvpButton(interaction) {
  const action = interaction.customId.split(':')[1];
  const event = rsvpStore.get(interaction.message.id);

  if (!event) {
    await interaction.reply({
      content: 'This event no longer exists (the bot may have restarted, or it was already closed).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (event.status === 'closed') {
    await interaction.reply({ content: 'RSVPs for this event are closed.', flags: MessageFlags.Ephemeral });
    return;
  }

  const displayName = interaction.member?.displayName || interaction.user.username;
  const userId = interaction.user.id;

  if (action === 'close') {
    if (!interaction.member || !isEventHostRole(interaction.member)) {
      await rsvpPermissionDenied(interaction);
      return;
    }
    event.status = 'closed';
    await interaction.update({ embeds: [buildRsvpEmbed(event)], components: buildRsvpComponents(event) });
    return;
  }

  if (action === 'yes' || action === 'no') {
    event.yes = event.yes.filter((e) => e.id !== userId);
    event.no = event.no.filter((e) => e.id !== userId);
    (action === 'yes' ? event.yes : event.no).push({ id: userId, name: displayName });
    await interaction.update({ embeds: [buildRsvpEmbed(event)], components: buildRsvpComponents(event) });
    return;
  }
}

// If an event card gets deleted out-of-band, drop it from rsvpStore so it isn't kept alive
// forever in rsvp.json with no way to interact with it anymore.
function handleRsvpCardDeleted(messageId) {
  rsvpStore.delete(messageId);
}

// Handles the "Create Event" button posted by !rsvp — only the mod who ran !rsvp can press it.
// Shows the actual creation modal (modals can only be opened in response to an interaction,
// not directly from a plain message command, hence this extra click).
async function handleRsvpCreateButton(interaction) {
  const [, authorId] = interaction.customId.split(':');
  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This one wasn\'t addressed to you, traveller.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!isEventHostRole(interaction.member)) {
    await rsvpPermissionDenied(interaction);
    return;
  }

  const modal = new ModalBuilder().setCustomId('rsvpmodal:create').setTitle('Create Event');
  const titleInput = new TextInputBuilder()
    .setCustomId('title').setLabel('Event title').setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Guild Movie Night').setRequired(true).setMaxLength(100);
  const whenInput = new TextInputBuilder()
    .setCustomId('when').setLabel('When').setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Sat Aug 9, 8pm EST').setRequired(true).setMaxLength(100);
  const detailsInput = new TextInputBuilder()
    .setCustomId('details').setLabel('Details (optional)').setStyle(TextInputStyle.Paragraph)
    .setRequired(false).setMaxLength(1000);
  modal.addComponents(
    new ActionRowBuilder().addComponents(titleInput),
    new ActionRowBuilder().addComponents(whenInput),
    new ActionRowBuilder().addComponents(detailsInput)
  );
  await interaction.showModal(modal);
  interaction.message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Handles the modal opened by !rsvp — creates the event and posts the card in
// GIVEAWAY_CHANNEL_ID. The modal can be opened either from GIVEAWAY_CHANNEL_ID itself or from
// one of MOD_PRIVATE_CHANNEL_IDS (see the !rsvp command handler below), so this always fetches
// GIVEAWAY_CHANNEL_ID explicitly rather than posting to interaction.channel — otherwise an
// event started from a private channel would end up posted there instead of publicly.
async function handleRsvpCreateModal(interaction) {
  if (!interaction.member || !isEventHostRole(interaction.member)) {
    await rsvpPermissionDenied(interaction);
    return;
  }

  const title = interaction.fields.getTextInputValue('title').trim();
  const when = interaction.fields.getTextInputValue('when').trim();
  const details = interaction.fields.getTextInputValue('details').trim();

  if (!title || !when) {
    await interaction.reply({ content: 'Both a title and a "when" are required.', flags: MessageFlags.Ephemeral });
    return;
  }

  const targetChannel = interaction.channel?.id === GIVEAWAY_CHANNEL_ID
    ? interaction.channel
    : await interaction.guild.channels.fetch(GIVEAWAY_CHANNEL_ID).catch(() => null);

  if (!targetChannel) {
    await interaction.reply({
      content: `⚠️ Couldn't reach <#${GIVEAWAY_CHANNEL_ID}> to post the event — check the bot's access to that channel.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const hostName = interaction.member?.displayName || interaction.user.username;
  const event = {
    hostId: interaction.user.id,
    hostName,
    title,
    when,
    details,
    createdAt: Date.now(),
    yes: [],
    no: [],
    status: 'open',
  };

  await interaction.reply({
    content: targetChannel.id === interaction.channel?.id
      ? '📅 Event posted!'
      : `📅 Event posted in <#${GIVEAWAY_CHANNEL_ID}>!`,
    flags: MessageFlags.Ephemeral,
  });
  const card = await targetChannel
    .send({ embeds: [buildRsvpEmbed(event)], components: buildRsvpComponents(event) })
    .catch((err) => { console.error('Discord API call failed (non-critical):', err); return null; });
  if (card) {
    rsvpStore.set(card.id, event);
  }
}

// ---- "Other Games" Party Up! system (!game / !gn) ----
// A lighter, sibling system to the dungeon Party Up! cards above — same "ethereal wizard, public
// card" shape (see runPartyCreationWizard/handlePartyStartButton), but for the standalone
// sandbox-game/Game Night roles instead of a DUNGEON_ROLES entry. Two differences from the
// dungeon system on purpose:
//   1. No headcount cap. Dungeon parties gate on party size because dungeon instances are
//      literally capacity-limited; a sandbox-game/Game Night session isn't, so Join is
//      wide open and the roster just paginates (GAME_PARTY_PAGE_SIZE per page) instead.
//   2. It asks "what game" itself, rather than being triggered by @mentioning one specific role
//      — one `!game` (or `!gn`) wizard covers all three games, and only pings the one role that matches
//      whichever the caller picked.
// Everything else — Start-button hop into an ephemeral wizard, card posted in the dungeon hub,
// in-memory store + on-disk backup, Join/Leave buttons — mirrors the dungeon system's approach.
//
// role id -> { name, emoji } for the three current "other game" roles. Add a new game by adding
// an entry here; nothing else needs to change.
const OTHER_GAME_ROLES = Object.fromEntries(
  (CONFIG.games || []).map((g) => [String(g.roleId), { name: g.name, emoji: g.emoji || '🎮' }])
);
// Game Night is the "whatever the evening brings" catch-all role — unlike sandbox-game it
// doesn't say what's actually being played, so picking it in the wizard adds one extra free-text
// field asking that. See runGamePartyWizard/buildGamePartyEmbed.
const GAME_NIGHT_ROLE_ID = cfgId('roles', 'gameNight');

// How long a called session stays live before the Tavernkeep automatically wraps it up — see
// scheduleGamePartyAutoEnd. Counted from the party's scheduled start time (whenUnix), not from
// when the card was posted, so a session called well in advance still only runs 3 hours from when
// it actually kicks off.
const GAME_PARTY_DURATION_MS = 3 * 60 * 60 * 1000;
// messageId -> Timeout handle, so a manual Cancel (or a restart re-scheduling on restore) can
// clear/replace a pending auto-end timer instead of leaving a stray one running.
const gamePartyEndTimers = new Map();

const GAME_PARTY_PAGE_SIZE = 10;
const GAME_PARTIES_FILE = path.join(__dirname, 'gameparties.json');
const gamePartyStore = new Map(); // keyed by the card message's ID, same tradeoff as partyStore/rsvpStore (in-memory, JSON-backed)
let gamePartiesRestored = false;

function readGamePartiesFromDisk() {
  if (!fs.existsSync(GAME_PARTIES_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(GAME_PARTIES_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read gameparties.json, starting fresh.', err);
    return [];
  }
}

function restoreGamePartiesFromDisk() {
  if (gamePartiesRestored) return;
  gamePartiesRestored = true;
  const saved = readGamePartiesFromDisk();
  for (const entry of saved) {
    const { messageId, ...party } = entry;
    if (!messageId) continue;
    gamePartyStore.set(messageId, party);
    // Re-arm the 3-hour auto-end timer for anything that was still open when the bot went down —
    // scheduleGamePartyAutoEnd clamps to "at least 1s from now", so a session whose window already
    // fully elapsed during the downtime still gets closed out promptly instead of silently never
    // finishing.
    if (!isGamePartyClosed(party)) scheduleGamePartyAutoEnd(messageId, party);
  }
  if (saved.length) {
    console.log(`Restored ${saved.length} game part${saved.length === 1 ? 'y' : 'ies'} from gameparties.json.`);
  }
}

function flushGamePartiesToDisk() {
  try {
    const all = [];
    for (const [messageId, party] of gamePartyStore.entries()) {
      all.push({ messageId, ...party });
    }
    atomicWriteFileSync(GAME_PARTIES_FILE, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to write gameparties.json:', err);
  }
}

// ---- Time/timezone parsing for !game / !gn ----
// Fixed-offset lookup, not a real IANA tz database — good enough for "what time should I show up"
// scheduling, and keeps this self-contained (no new npm dependency). DST-named abbreviations
// (EDT vs EST, etc.) are listed separately with their own fixed offset rather than trying to
// compute DST rules, since the caller already knows which one currently applies to them.
const TIMEZONE_ABBREVIATION_OFFSETS = {
  UTC: 0, GMT: 0,
  EST: -5 * 60, EDT: -4 * 60,
  CST: -6 * 60, CDT: -5 * 60,
  MST: -7 * 60, MDT: -6 * 60,
  PST: -8 * 60, PDT: -7 * 60,
  AKST: -9 * 60, AKDT: -8 * 60,
  HST: -10 * 60,
  AST: -4 * 60, ADT: -3 * 60,
  NST: -3 * 60 - 30, NDT: -2 * 60 - 30,
  BST: 1 * 60, // British Summer Time — more common in Discord chat than Bangladesh Standard Time
  WET: 0, WEST: 1 * 60,
  CET: 1 * 60, CEST: 2 * 60,
  EET: 2 * 60, EEST: 3 * 60,
  MSK: 3 * 60,
  IST: 5 * 60 + 30, // India Standard Time
  PKT: 5 * 60,
  GST: 4 * 60, // Gulf Standard Time
  WAT: 1 * 60, CAT: 2 * 60, EAT: 3 * 60, SAST: 2 * 60,
  JST: 9 * 60, KST: 9 * 60,
  AWST: 8 * 60,
  ACST: 9 * 60 + 30, ACDT: 10 * 60 + 30,
  AEST: 10 * 60, AEDT: 11 * 60,
  NZST: 12 * 60, NZDT: 13 * 60,
};

// Accepts a timezone label like "EST", "PST", "UTC", "GMT+2", "UTC-5", "+5:30", "-3". Returns the
// offset in minutes (UTC = local time - offset), or null if it couldn't be parsed.
function parseTimezoneOffsetMinutes(raw) {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return null;

  const abbrevMatch = TIMEZONE_ABBREVIATION_OFFSETS[cleaned];
  if (abbrevMatch !== undefined) return abbrevMatch;

  // UTC/GMT with an explicit offset, e.g. "UTC+2", "GMT-5:30"
  const namedOffsetMatch = cleaned.match(/^(?:UTC|GMT)?([+-]\d{1,2}(?::?\d{2})?)$/);
  if (namedOffsetMatch) {
    const [sign, hourPart, minutePart] = namedOffsetMatch[1].match(/^([+-])(\d{1,2}):?(\d{2})?$/).slice(1);
    const hours = parseInt(hourPart, 10);
    const minutes = minutePart ? parseInt(minutePart, 10) : 0;
    if (hours > 14 || minutes > 59) return null;
    const total = hours * 60 + minutes;
    return sign === '-' ? -total : total;
  }

  return null;
}

// Parses the !game/!gn time modal's three fields into a unix-seconds timestamp for the next
// upcoming occurrence of that local time. Returns { unixSeconds } on success or { error } on
// failure (a short, user-facing reason). Rolls forward to tomorrow if the parsed time has already
// passed today, so "8 PM EST" typed at 9 PM EST means tomorrow, not an hour ago.
function parseGamePartyTime(timeRaw, ampmRaw, tzRaw) {
  const timeMatch = (timeRaw || '').trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!timeMatch) {
    return { error: 'That time didn\'t parse — try something like `8` or `8:30`.' };
  }
  let hour = parseInt(timeMatch[1], 10);
  const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
  if (hour < 1 || hour > 12 || minute > 59) {
    return { error: 'Hours should be 1-12 and minutes 0-59 — like `8` or `8:30`.' };
  }

  const ampm = (ampmRaw || '').trim().toUpperCase();
  if (ampm !== 'AM' && ampm !== 'PM' && ampm !== 'A' && ampm !== 'P') {
    return { error: 'AM/PM should just be `AM` or `PM`.' };
  }
  const isPM = ampm.startsWith('P');
  const hour24 = (hour % 12) + (isPM ? 12 : 0);

  const offsetMinutes = parseTimezoneOffsetMinutes(tzRaw);
  if (offsetMinutes === null) {
    return { error: `Didn't recognize timezone "${tzRaw}" — try an abbreviation like \`EST\`, \`PST\`, \`UTC\`, or an offset like \`UTC+2\`.` };
  }

  const now = new Date();
  // Build "today, at that wall-clock time" using the current UTC calendar date as a stand-in for
  // "today" — close enough for scheduling purposes near a date boundary, and simple to reason
  // about without a real tz database.
  let targetMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour24, minute, 0);
  targetMs -= offsetMinutes * 60 * 1000; // local = UTC + offset, so UTC = local - offset
  if (targetMs < now.getTime() - 60 * 1000) {
    targetMs += 24 * 60 * 60 * 1000; // already passed today — roll to tomorrow
  }

  return { unixSeconds: Math.floor(targetMs / 1000) };
}

function gamePartyTotalPages(party) {
  return Math.max(1, Math.ceil(party.members.length / GAME_PARTY_PAGE_SIZE));
}

// party.cancelled (a host/mod ended it early) and party.ended (it simply ran its full 3-hour
// course — see scheduleGamePartyAutoEnd) both close out the card the same way button-wise, but
// get their own wording below since one's a premature stop and the other's just the natural end.
function isGamePartyClosed(party) {
  return !!(party.cancelled || party.ended);
}

function buildGamePartyEmbed(party, page = 0) {
  const totalPages = gamePartyTotalPages(party);
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const start = clampedPage * GAME_PARTY_PAGE_SIZE;
  const pageMembers = party.members.slice(start, start + GAME_PARTY_PAGE_SIZE);
  const roster = pageMembers.map((m, i) => `\`${start + i + 1}.\` ${m.name}`).join('\n') || '*Nobody yet.*';

  let statusLine = '🎮 **Party\'s open — jump in!**';
  let color = 0x8b4513;
  if (party.cancelled) {
    statusLine = '🔒 **This session was cancelled.**';
    color = 0x555555;
  } else if (party.ended) {
    statusLine = '🌙 *The party has been formed and went on to their conquest.*';
    color = 0x555555;
  }

  const gameLabel = party.specificGame ? `${party.gameName}: ${party.specificGame}` : party.gameName;

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${party.gameEmoji} ${gameLabel} — Party Up!`)
    .setDescription(
      `${statusLine}\n\n` +
      `**When:** <t:${party.whenUnix}:F> (<t:${party.whenUnix}:R>)\n\n` +
      `**Adventurers (${party.members.length})**\n${roster}`
    )
    .setFooter({ text: `Called by ${party.hostName} • Page ${clampedPage + 1} of ${totalPages}` })
    .setTimestamp(party.createdAt);
}

function buildGamePartyComponents(party, page = 0) {
  const totalPages = gamePartyTotalPages(party);
  const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
  const closed = isGamePartyClosed(party);

  const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`gameparty:join:${clampedPage}`).setLabel('Join').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(closed),
    new ButtonBuilder().setCustomId(`gameparty:leave:${clampedPage}`).setLabel('Leave').setEmoji('🚪').setStyle(ButtonStyle.Secondary).setDisabled(closed),
    new ButtonBuilder().setCustomId(`gameparty:cancel:${party.hostId}`).setLabel('Cancel').setEmoji('❌').setStyle(ButtonStyle.Danger).setDisabled(closed)
  );

  const rows = [actionRow];
  if (totalPages > 1) {
    rows.push(new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`gameparty:prev:${clampedPage}`).setLabel('◀ Prev').setStyle(ButtonStyle.Secondary).setDisabled(closed || clampedPage === 0),
      new ButtonBuilder().setCustomId(`gameparty:noop:${clampedPage}`).setLabel(`${clampedPage + 1} / ${totalPages}`).setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder().setCustomId(`gameparty:next:${clampedPage}`).setLabel('Next ▶').setStyle(ButtonStyle.Secondary).setDisabled(closed || clampedPage >= totalPages - 1)
    ));
  }
  return rows;
}

// Fires GAME_PARTY_DURATION_MS after the party's scheduled start time. Called right after a card
// is posted, and again for every still-open party restored from disk on startup (see
// restoreGamePartiesFromDisk) so a bot restart doesn't leave sessions running forever.
function scheduleGamePartyAutoEnd(messageId, party) {
  const existing = gamePartyEndTimers.get(messageId);
  if (existing) clearTimeout(existing);
  if (isGamePartyClosed(party)) return;

  const delay = Math.max(1000, party.whenUnix * 1000 + GAME_PARTY_DURATION_MS - Date.now());
  const timer = setTimeout(() => {
    endGamePartyByTimeout(messageId).catch((err) => console.error('Game party auto-end failed:', err));
  }, delay);
  gamePartyEndTimers.set(messageId, timer);
}

async function endGamePartyByTimeout(messageId) {
  gamePartyEndTimers.delete(messageId);
  const party = gamePartyStore.get(messageId);
  if (!party || isGamePartyClosed(party)) return;

  party.ended = true;
  flushGamePartiesToDisk();

  const hubChannel = await client.channels.fetch(DUNGEON_HUB_CHANNEL_ID).catch(() => null);
  if (!hubChannel) return;
  const card = await hubChannel.messages.fetch(messageId).catch(() => null);
  if (!card) return;
  await card.edit({ embeds: [buildGamePartyEmbed(party, 0)], components: buildGamePartyComponents(party, 0) })
    .catch((err) => console.error('Discord API call failed (non-critical):', err));
}

function canManageGameParty(member, userId, party) {
  if (userId === party.hostId) return true;
  return !!member && isCouncil(member);
}

async function handleGamePartyButton(interaction) {
  const [, action, arg] = interaction.customId.split(':');
  const party = gamePartyStore.get(interaction.message.id);

  if (!party) {
    await interaction.reply({
      content: 'This party card no longer exists (the bot may have restarted, or it was already cancelled).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (isGamePartyClosed(party)) {
    await interaction.reply({
      content: party.cancelled ? 'This session has been cancelled.' : 'This session has already run its course.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const currentPage = parseInt(arg, 10) || 0;

  if (action === 'noop') {
    await interaction.deferUpdate().catch(() => {});
    return;
  }

  if (action === 'prev' || action === 'next') {
    const nextPage = action === 'prev' ? currentPage - 1 : currentPage + 1;
    await interaction.update({ embeds: [buildGamePartyEmbed(party, nextPage)], components: buildGamePartyComponents(party, nextPage) });
    return;
  }

  if (action === 'join') {
    const displayName = interaction.member?.displayName || interaction.user.username;
    if (!party.members.some((m) => m.id === interaction.user.id)) {
      party.members.push({ id: interaction.user.id, name: displayName });
      flushGamePartiesToDisk();
    }
    // Land them on the last page so they can see themselves land in the roster.
    const landingPage = gamePartyTotalPages(party) - 1;
    await interaction.update({ embeds: [buildGamePartyEmbed(party, landingPage)], components: buildGamePartyComponents(party, landingPage) });
    return;
  }

  if (action === 'leave') {
    party.members = party.members.filter((m) => m.id !== interaction.user.id);
    flushGamePartiesToDisk();
    await interaction.update({ embeds: [buildGamePartyEmbed(party, currentPage)], components: buildGamePartyComponents(party, currentPage) });
    return;
  }

  if (action === 'cancel') {
    if (!canManageGameParty(interaction.member, interaction.user.id, party)) {
      await interaction.reply({
        content: "Only whoever called this session (or a Council/Knight/Guild Leader) can cancel it.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    party.cancelled = true;
    flushGamePartiesToDisk();
    const pendingTimer = gamePartyEndTimers.get(interaction.message.id);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      gamePartyEndTimers.delete(interaction.message.id);
    }
    await interaction.update({ embeds: [buildGamePartyEmbed(party, 0)], components: buildGamePartyComponents(party, 0) });
    return;
  }
}

// If a card gets deleted out-of-band, drop it from gamePartyStore so it isn't kept alive forever
// in gameparties.json with no way to interact with it anymore.
function handleGamePartyCardDeleted(messageId) {
  const existingTimer = gamePartyEndTimers.get(messageId);
  if (existingTimer) {
    clearTimeout(existingTimer);
    gamePartyEndTimers.delete(messageId);
  }
  if (gamePartyStore.delete(messageId)) flushGamePartiesToDisk();
}

// ---- "What should we play" votes (!game -> Vote) ----
// A short-lived poll, not a persistent thing like game parties/dungeon parties — created,
// reacted on for a bit, then Finished by its creator, so unlike gamePartyStore/partyStore this
// is kept in-memory only (no JSON backing). A bot restart mid-vote just loses that one open poll,
// same grace-period tradeoff already accepted elsewhere in this file for less-critical state.
const VOTE_NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
const VOTE_MIN_OPTIONS = 2;
const voteStore = new Map(); // keyed by the vote card message's ID -> { creatorId, creatorName, options, pingRole, channelId, finished, createdAt }

// A user can only have one open (not yet Finished) vote going at a time, same "one active thing
// at a time" rule as game parties/dungeon parties above.
function getActiveVoteForUser(userId) {
  for (const [messageId, vote] of voteStore.entries()) {
    if (!vote.finished && vote.creatorId === userId) return { messageId, vote };
  }
  return null;
}

function buildVoteEmbed(vote, tally = null, winnerIndex = null) {
  const lines = vote.options.map((opt, i) => {
    const count = tally ? ` — **${tally[i]}** vote${tally[i] === 1 ? '' : 's'}` : '';
    const marker = winnerIndex === i ? ' 🏆' : '';
    return `${VOTE_NUMBER_EMOJIS[i]} ${opt}${count}${marker}`;
  });

  let statusLine = '🗳️ **Cast your vote by reacting below!**';
  let color = 0x8b4513;
  if (vote.finished) {
    statusLine = tally && tally.some((c) => c > 0)
      ? '🏁 **Voting has closed — here\'s how it landed.**'
      : '🏁 **Voting has closed — no votes were cast.**';
    color = 0x555555;
  }

  return new EmbedBuilder()
    .setColor(color)
    .setTitle('What should we play?')
    .setDescription(`${statusLine}\n\n${lines.join('\n')}`)
    .setFooter({ text: `Started by ${vote.creatorName}` })
    .setTimestamp(vote.createdAt);
}

function buildVoteComponents(vote) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`gamevotefinish:${vote.creatorId}`)
      .setLabel('Finish')
      .setEmoji('🏁')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(vote.finished)
  )];
}

async function handleGameUpStartButton(interaction) {
  const [, authorId] = interaction.customId.split(':');
  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This one wasn\'t addressed to you, traveller.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferUpdate();
  await interaction.message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await runGamePartyWizard(interaction);
}

const GAME_PARTY_WIZARD_STEP_TIMEOUT_MS = 60 * 1000;

// Same "ethereal" shape as runPartyCreationWizard: everything below is an ephemeral reply/update
// on `interaction` (already deferred by the caller — the Create button, or the vote Finish
// button), so only the caller ever sees the game picker or the time popup. Only the finished card
// at the very end is public. `prefillSpecificGame`, when set, comes from a just-finished vote's
// winning option (see handleGameVoteFinishButton) — it seeds the modal's specific-game field
// (shown for every role, not just Game Night, whenever this is set) instead of leaving it blank.
async function runGamePartyWizard(interaction, prefillSpecificGame = null) {
  const authorName = interaction.member?.displayName || interaction.user.username;

  // Same "one active thing at a time" rule the dungeon Party Up! system enforces — creating a
  // second game party while one's still live would leave two separate rosters/pings for the same
  // person, so block it and point them at the existing one instead.
  const activeGameParties = getActiveGamePartiesForUser(interaction.user.id);
  if (activeGameParties.length > 0) {
    const lines = activeGameParties.map(({ messageId, party }) => {
      const isHost = party.hostId === interaction.user.id;
      const guidance = isHost
        ? 'You\'re hosting it — **Cancel** it first before calling a new one.'
        : 'You\'re in it — **Leave** it first if you\'d rather start/join a different one.';
      const label = party.specificGame ? `${party.gameName}: ${party.specificGame}` : party.gameName;
      const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${DUNGEON_HUB_CHANNEL_ID}/${messageId}`;
      return `🎮 You're already in a **${label}** session: ${jumpUrl}\n${guidance}`;
    });
    await interaction.followUp({
      content: lines.join('\n\n'),
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const cooldownRemaining = gamePartyCreateCooldownRemaining(interaction.user.id);
  if (cooldownRemaining > 0) {
    const waitSecs = Math.ceil(cooldownRemaining / 1000);
    await interaction.followUp({
      content: `🕰️ Slow down, traveller — you can call another game party in ~${waitSecs}s.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const gameSelect = new StringSelectMenuBuilder()
    .setCustomId('gameupwizard:game')
    .setPlaceholder('Choose a game...')
    .addOptions(Object.entries(OTHER_GAME_ROLES).map(([roleId, info]) => ({
      label: info.name,
      value: roleId,
      emoji: info.emoji,
    })));

  const picker = await interaction.followUp({
    content: `🎮 What are you looking to play, ${authorName}?`,
    components: [new ActionRowBuilder().addComponents(gameSelect)],
    flags: MessageFlags.Ephemeral,
  }).catch((err) => {
    console.error('!game wizard: failed to post the game picker:', err);
    return null;
  });
  if (!picker) return;

  const pick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'gameupwizard:game',
      time: GAME_PARTY_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!pick) {
    await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
    await interaction.followUp({
      content: '🕰️ Looks like you forgot to pick a game, traveller — run `!game` (or `!gn`) again whenever you\'re ready.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const roleId = pick.values[0];
  const info = OTHER_GAME_ROLES[roleId];
  const isGameNight = roleId === GAME_NIGHT_ROLE_ID;

  // A modal can only be the FIRST response to an interaction that hasn't been deferred/replied
  // to yet — `pick` (this select-menu click) is fresh, so we can show it directly here instead
  // of going through another followUp step.
  const modal = new ModalBuilder()
    .setCustomId(`gameparty:timemodal:${roleId}`)
    .setTitle(`${info.name} — When?`);
  const timeInput = new TextInputBuilder()
    .setCustomId('time')
    .setLabel('Time (e.g. 8 or 8:30)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('8:00')
    .setRequired(true);
  const ampmInput = new TextInputBuilder()
    .setCustomId('ampm')
    .setLabel('AM or PM?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('PM')
    .setMaxLength(2)
    .setRequired(true);
  const tzInput = new TextInputBuilder()
    .setCustomId('timezone')
    .setLabel('Timezone (e.g. EST, PST, UTC, UTC+2)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('EST')
    .setRequired(true);
  const rows = [
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(ampmInput),
    new ActionRowBuilder().addComponents(tzInput),
  ];

  // sandbox-game already say what's being played — Game Night doesn't, so it gets one more
  // free-text field asking. Left as an open text box (not a dropdown) since "whatever the evening
  // brings" could genuinely be anything. Also shown (and pre-filled) for ANY role when this
  // wizard was launched off a just-finished vote's winning option — see prefillSpecificGame.
  const includeSpecificGameField = isGameNight || Boolean(prefillSpecificGame);
  if (includeSpecificGameField) {
    const gameInput = new TextInputBuilder()
      .setCustomId('specificGame')
      .setLabel('What are you playing?')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Jackbox, Among Us, Poker night...')
      .setMaxLength(100)
      .setRequired(true);
    if (prefillSpecificGame) gameInput.setValue(prefillSpecificGame.slice(0, 100));
    rows.push(new ActionRowBuilder().addComponents(gameInput));
  }

  modal.addComponents(...rows);

  await pick.showModal(modal).catch((err) => console.error('!game wizard: failed to show the time modal:', err));

  const submitted = await pick
    .awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id && i.customId === `gameparty:timemodal:${roleId}`,
      time: GAME_PARTY_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!submitted) {
    await interaction.followUp({
      content: '🕰️ Looks like you ran out of time on the time popup, traveller — run `!game` (or `!gn`) again whenever you\'re ready.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const timeRaw = submitted.fields.getTextInputValue('time');
  const ampmRaw = submitted.fields.getTextInputValue('ampm');
  const tzRaw = submitted.fields.getTextInputValue('timezone');
  const specificGame = includeSpecificGameField ? submitted.fields.getTextInputValue('specificGame').trim() : null;
  const parsed = parseGamePartyTime(timeRaw, ampmRaw, tzRaw);

  if (parsed.error) {
    await submitted.reply({
      content: `⚠️ ${parsed.error} Run \`!game\` (or \`!gn\`) again whenever you're ready.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const hubChannel = await interaction.guild.channels.fetch(DUNGEON_HUB_CHANNEL_ID).catch(() => null);
  if (!hubChannel) {
    await submitted.reply({
      content: `⚠️ Couldn't find the dungeon-runs channel — check DUNGEON_HUB_CHANNEL_ID.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const gameLabel = specificGame ? `${info.name}: ${specificGame}` : info.name;

  const party = {
    roleId,
    gameName: info.name,
    gameEmoji: info.emoji,
    specificGame: specificGame || null,
    hostId: interaction.user.id,
    hostName: authorName,
    whenUnix: parsed.unixSeconds,
    members: [{ id: interaction.user.id, name: authorName }],
    cancelled: false,
    ended: false,
    createdAt: Date.now(),
  };

  const card = await hubChannel.send({
    content: `<@&${roleId}> — **${authorName}** is putting together a **${gameLabel}** session!`,
    embeds: [buildGamePartyEmbed(party, 0)],
    components: buildGamePartyComponents(party, 0),
  }).catch((err) => {
    console.error('!game wizard: failed to post the party card:', err);
    return null;
  });

  if (!card) {
    await submitted.reply({
      content: `⚠️ Something went wrong posting the party card — try \`!game\` (or \`!gn\`) again.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  gamePartyStore.set(card.id, party);
  flushGamePartiesToDisk();
  scheduleGamePartyAutoEnd(card.id, party);
  markGamePartyCreated(interaction.user.id);

  const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${hubChannel.id}/${card.id}`;
  await submitted.reply({
    content: `🎮 Party's up! ${jumpUrl}`,
    flags: MessageFlags.Ephemeral,
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

const VOTE_WIZARD_STEP_TIMEOUT_MS = 60 * 1000;

// The Vote button's whole flow, start to finish off the original button click: a modal for up
// to 5 choices (2 required, 3 optional), then an ephemeral Yes/No on pinging Game Night, then the
// public vote card goes up in the tavern with number-emoji reactions pre-seeded so people can
// vote immediately. Mirrors runGamePartyWizard's shape but doesn't need a Start-button hop first
// since a button click (this one) can show a modal directly as its first response.
async function handleGameUpVoteButton(interaction) {
  const [, authorId] = interaction.customId.split(':');
  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This one wasn\'t addressed to you, traveller.', flags: MessageFlags.Ephemeral });
    return;
  }

  const authorName = interaction.member?.displayName || interaction.user.username;

  const activeVote = getActiveVoteForUser(interaction.user.id);
  if (activeVote) {
    const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${TAVERN_CHANNEL_ID}/${activeVote.messageId}`;
    await interaction.reply({
      content: `🗳️ You already have an open vote: ${jumpUrl}\nHit **Finish** on it first before starting another.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const cooldownRemaining = voteCreateCooldownRemaining(interaction.user.id);
  if (cooldownRemaining > 0) {
    const waitSecs = Math.ceil(cooldownRemaining / 1000);
    await interaction.reply({
      content: `🕰️ Slow down, traveller — you can start another vote in ~${waitSecs}s.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // Fresh, unacknowledged button click — a modal can go straight out as the first response here,
  // same as the time-modal step in runGamePartyWizard.
  const modal = new ModalBuilder().setCustomId('gamevote:choicesmodal').setTitle('What should we play?');
  const rows = [1, 2, 3, 4, 5].map((n) => {
    const required = n <= VOTE_MIN_OPTIONS;
    const input = new TextInputBuilder()
      .setCustomId(`option${n}`)
      .setLabel(`Option ${n}${required ? '' : ' (optional)'}`)
      .setStyle(TextInputStyle.Short)
      .setMaxLength(100)
      .setRequired(required);
    return new ActionRowBuilder().addComponents(input);
  });
  modal.addComponents(...rows);

  await interaction.showModal(modal).catch((err) => console.error('!game vote: failed to show the choices modal:', err));

  const submitted = await interaction
    .awaitModalSubmit({
      filter: (i) => i.user.id === interaction.user.id && i.customId === 'gamevote:choicesmodal',
      time: VOTE_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!submitted) {
    await interaction.followUp({
      content: '🕰️ Looks like you ran out of time on the vote setup, traveller — tap **Vote** again whenever you\'re ready.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const options = [1, 2, 3, 4, 5]
    .map((n) => submitted.fields.getTextInputValue(`option${n}`).trim())
    .filter(Boolean);

  if (options.length < VOTE_MIN_OPTIONS) {
    await submitted.reply({
      content: `⚠️ Need at least ${VOTE_MIN_OPTIONS} options to run a vote — tap **Vote** again whenever you're ready.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const pingRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('gamevoteping:yes').setLabel('Yes').setEmoji('📣').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('gamevoteping:no').setLabel('No').setStyle(ButtonStyle.Secondary)
  );

  const pingReplySent = await submitted.reply({
    content: `📣 Ping <@&${GAME_NIGHT_ROLE_ID}> for this vote?`,
    components: [pingRow],
    flags: MessageFlags.Ephemeral,
  }).catch((err) => {
    console.error('!game vote: failed to post the ping prompt:', err);
    return null;
  });
  if (!pingReplySent) return;

  // fetchReply() gets the real Message object — calling awaitMessageComponent() directly on
  // what reply() returns doesn't reliably bind the collector to the click (a known discord.js
  // gotcha), which is what was causing the "didn't respond in time" error: the button press was
  // never actually being caught by anything.
  const pingPrompt = await submitted.fetchReply().catch(() => null);
  if (!pingPrompt) return;

  const pingChoice = await pingPrompt
    .awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith('gamevoteping:'),
      time: VOTE_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!pingChoice) {
    await interaction.followUp({
      content: '🕰️ Looks like you ran out of time on the ping question, traveller — tap **Vote** again whenever you\'re ready.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const pingRole = pingChoice.customId === 'gamevoteping:yes';

  // Acknowledge the button click immediately — the channel fetch, card send, and per-option
  // reaction loop below can easily take longer than Discord's 3-second interaction window,
  // which is what was causing the "didn't respond in time" error even though the vote card
  // still went out. deferUpdate() buys us time; editReply() is used from here on instead of
  // update(), since update() isn't valid anymore once the interaction has been deferred.
  await pingChoice.deferUpdate().catch((err) => console.error('!game vote: failed to defer the ping choice:', err));

  const tavernChannel = await interaction.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (!tavernChannel) {
    await pingChoice.editReply({
      content: `⚠️ Couldn't find the tavern channel — check TAVERN_CHANNEL_ID.`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const vote = {
    creatorId: interaction.user.id,
    creatorName: authorName,
    options,
    pingRole,
    channelId: tavernChannel.id,
    finished: false,
    createdAt: Date.now(),
  };

  const card = await tavernChannel.send({
    content: pingRole ? `<@&${GAME_NIGHT_ROLE_ID}> — **${authorName}** wants to know what to play!` : undefined,
    embeds: [buildVoteEmbed(vote)],
    components: buildVoteComponents(vote),
    allowedMentions: pingRole ? { roles: [GAME_NIGHT_ROLE_ID] } : { parse: [] },
  }).catch((err) => {
    console.error('!game vote: failed to post the vote card:', err);
    return null;
  });

  if (!card) {
    await pingChoice.editReply({
      content: `⚠️ Something went wrong posting the vote card — tap **Vote** again whenever you're ready.`,
      components: [],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  for (let i = 0; i < options.length; i++) {
    await card.react(VOTE_NUMBER_EMOJIS[i]).catch((err) => console.error('!game vote: failed to seed a number-emoji reaction:', err));
  }

  voteStore.set(card.id, vote);
  markVoteCreated(interaction.user.id);

  const jumpUrl = `https://discord.com/channels/${interaction.guild.id}/${tavernChannel.id}/${card.id}`;
  await pingChoice.editReply({
    content: `🗳️ Vote's up! ${jumpUrl}`,
    components: [],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Only the vote's own creator can Finish it. Tallies each option's reactions (minus the
// Tavernkeep's own seed reaction), closes the card in place showing the tally + winner, then —
// same interaction, already ack'd via interaction.update — hands straight off into
// runGamePartyWizard so the creator can turn the winner into an actual game party, with the
// winning option pre-filled as the specific game. A genuine tie just takes the first-listed
// (lowest-numbered) option among the tied ones, same as any other first-past-the-post tiebreak.
async function handleGameVoteFinishButton(interaction) {
  const [, creatorId] = interaction.customId.split(':');
  if (interaction.user.id !== creatorId) {
    await interaction.reply({ content: 'Only the traveller who started this vote can close it out.', flags: MessageFlags.Ephemeral });
    return;
  }

  const vote = voteStore.get(interaction.message.id);
  if (!vote || vote.finished) {
    await interaction.reply({ content: 'This vote is already closed.', flags: MessageFlags.Ephemeral }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // Re-fetch rather than trust interaction.message.reactions.cache — the bot doesn't hold the
  // GuildMessageReactions gateway intent, so that cache only ever reflects the seed reactions we
  // added ourselves at creation, never anyone's actual votes. A fresh fetch's reaction counts come
  // bundled in the REST response regardless of intents, so this is the only reliable read.
  const freshMessage = await interaction.channel.messages.fetch(interaction.message.id).catch((err) => {
    console.error('!game vote finish: failed to re-fetch the vote card for tallying:', err);
    return interaction.message;
  });

  const tally = vote.options.map((_, i) => {
    const reaction = freshMessage.reactions.cache.get(VOTE_NUMBER_EMOJIS[i]);
    // -1 for the Tavernkeep's own seed reaction on every option.
    return reaction ? Math.max(0, reaction.count - 1) : 0;
  });

  let winnerIndex = 0;
  for (let i = 1; i < tally.length; i++) {
    if (tally[i] > tally[winnerIndex]) winnerIndex = i;
  }
  const anyVotes = tally.some((c) => c > 0);
  const winnerText = anyVotes ? vote.options[winnerIndex] : null;

  vote.finished = true;

  await interaction.update({
    embeds: [buildVoteEmbed(vote, tally, anyVotes ? winnerIndex : null)],
    components: buildVoteComponents(vote),
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  if (!anyVotes) {
    await interaction.followUp({
      content: `🏁 No votes were cast, so there's no winner to carry over — pick a game manually below.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  await runGamePartyWizard(interaction, winnerText);
}

// Instant, no-wizard Game Night ping — open to anyone (not just the !game caller), on a shared
// 2-minute cooldown so it can't be spammed. sandbox-game have their own roles that already
// ping the players who want them, so this only ever targets Game Night.
async function handleGameUpPingButton(interaction) {
  const cooldownRemaining = gameNightPingCooldownRemaining();
  if (cooldownRemaining > 0) {
    const waitSecs = Math.ceil(cooldownRemaining / 1000);
    await interaction.reply({
      content: `🕰️ Game Night was just pinged — try again in ~${waitSecs}s.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const authorName = interaction.member?.displayName || interaction.user.username;
  lastGameNightPingAt = Date.now();

  await interaction.reply({
    content: `📣 <@&${GAME_NIGHT_ROLE_ID}> — **${authorName}** is looking for people for Game Night!`,
    allowedMentions: { roles: [GAME_NIGHT_ROLE_ID] },
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

client.once('clientReady', () => {
  console.log(`Tavernkeep is open for business as ${client.user.tag}`);
  restorePartiesFromDisk();
  restoreGiveawaysFromDisk();
  restoreRsvpsFromDisk();
  restoreGamePartiesFromDisk();
  keepGeneralDungeonChatUnarchived();
  setInterval(keepGeneralDungeonChatUnarchived, GENERAL_CHAT_KEEPALIVE_INTERVAL_MS);
});

client.on('guildMemberAdd', async (member) => {
  // No mention yet — that's saved for guildMemberUpdate once they actually get let in.
  // This is just the "someone's arrived" nudge, posted in the tavern itself.
  const channel = await member.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (!channel) {
    console.log('Could not find the tavern channel — check TAVERN_CHANNEL_ID.');
    return;
  }
  const line = DOOR_LINES[Math.floor(Math.random() * DOOR_LINES.length)];
  channel.send(`*${line}*`).catch((err) => {
    console.error('Failed to post the door-arrival line:', err);
  });
});

// A party leader who leaves the guild, or loses the role for that specific dungeon, otherwise
// keeps full Kick/Disband/Complete power until they voluntarily hit Leave — this reassigns
// leadership the same way a manual Leave does (or quietly retires the party if that leaves it
// empty), so stale leadership never lingers.
async function reassignLeaderlessParties(userId, filterRoleId, reasonLabel) {
  for (const [messageId, party] of partyStore.entries()) {
    if (party.disbanded || party.completed) continue;
    if (party.leaderId !== userId) continue;
    if (filterRoleId && party.roleId !== filterRoleId) continue;

    const memberIndex = party.members.findIndex((m) => m.id === userId);
    if (memberIndex !== -1) party.members.splice(memberIndex, 1);
    touchParty(party);

    const heir = nextRealLeader(party.members);
    if (!heir) {
      // Empty, or only Filled placeholders remain — no real person to hand leadership to.
      await quietlyRetireParty(party, messageId, reasonLabel).catch((err) => {
        console.error('Failed to quietly retire a now-empty leaderless party:', err);
      });
      continue;
    }

    party.leaderId = heir.id;
    party.leaderName = heir.name;

    try {
      const channel = await client.channels.fetch(party.channelId).catch(() => null);
      const cardMessage = channel ? await channel.messages.fetch(messageId).catch(() => null) : null;
      if (cardMessage) {
        await cardMessage.edit({ embeds: [buildPartyEmbed(party)], components: buildPartyComponents(party) });
        await cardMessage.reply({
          content: `👑 The previous leader is no longer eligible to lead this party (${reasonLabel}) — ${party.leaderName} has inherited leadership!`,
          allowedMentions: { parse: [] },
        });
      }
    } catch (err) {
      console.error('Failed to update the party card after a forced leadership handoff:', err);
    }
  }
}

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  // If this member just lost a dungeon role while leading that dungeon's active party, they
  // shouldn't keep Kick/Disband/Complete powers for a party they're no longer eligible to be in.
  for (const roleId of Object.keys(DUNGEON_ROLES)) {
    const hadRole = oldMember.roles.cache.has(roleId);
    const hasRole = newMember.roles.cache.has(roleId);
    if (hadRole && !hasRole) {
      await reassignLeaderlessParties(newMember.id, roleId, 'lost the dungeon role').catch((err) => {
        console.error('Leader role-loss reassignment failed:', err);
      });
    }
  }

  // Only fire the moment someone crosses from "no entry role" to "has one" — i.e. the
  // instant the tavern channel actually becomes visible to them.
  const hadEntryRole = ENTRY_ROLE_IDS.some((id) => oldMember.roles.cache.has(id));
  const hasEntryRole = ENTRY_ROLE_IDS.some((id) => newMember.roles.cache.has(id));
  if (hadEntryRole || !hasEntryRole) return;

  const channel = await newMember.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (!channel) {
    console.log('Could not find the tavern channel — check TAVERN_CHANNEL_ID.');
    return;
  }
  const line = WELCOME_LINES[Math.floor(Math.random() * WELCOME_LINES.length)];
  channel.send(`The Tavernkeep greets the newcomer, ${newMember}.\n"${line}"`).catch((err) => {
    console.error('Failed to post the welcome line:', err);
  });
});

// Discord fires the exact same guildMemberRemove event whether a member left on their own,
// got kicked, or got banned — there's no separate "kick" event, and a ban's own guildBanAdd
// event fires independently of this one. So to tell them apart we check the audit log for a
// MemberKick/MemberBanAdd entry targeting this member created in the last few seconds. Only
// entries within RECENT_MS are trusted, so an unrelated older kick/ban of the same person (e.g.
// a rejoin-then-leave later) never gets misattributed to this departure.
async function detectDepartureKind(member) {
  const RECENT_MS = 5000;
  const guild = member.guild;

  const banLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 5 }).catch(() => null);
  if (banLogs?.entries.some((e) => e.target?.id === member.id && Date.now() - e.createdTimestamp < RECENT_MS)) {
    return 'banned';
  }

  const kickLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 5 }).catch(() => null);
  if (kickLogs?.entries.some((e) => e.target?.id === member.id && Date.now() - e.createdTimestamp < RECENT_MS)) {
    return 'kicked';
  }

  return 'left';
}

client.on('guildMemberRemove', async (member) => {
  await reassignLeaderlessParties(member.id, null, 'left the server').catch((err) => {
    console.error('Leader guild-leave reassignment failed:', err);
  });

  const channel = await member.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
  if (!channel) {
    console.log('Could not find the tavern channel — check TAVERN_CHANNEL_ID.');
    return;
  }
  // member can be partial once they've left, so fall back gracefully if the
  // username isn't cached rather than posting "undefined".
  const name = member.user?.username ?? member.displayName ?? 'a traveller';

  const departureKind = await detectDepartureKind(member).catch((err) => {
    console.error('Failed to check the audit log for kick/ban, defaulting to a plain leave:', err);
    return 'left';
  });

  const lines = departureKind === 'banned' ? BANISHED_LINES
    : departureKind === 'kicked' ? KICKED_LINES
    : FAREWELL_LINES;
  const verbPhrase = departureKind === 'banned' ? 'get banished from'
    : departureKind === 'kicked' ? 'get kicked out of'
    : 'leave';

  const line = lines[Math.floor(Math.random() * lines.length)];
  channel.send(`The Tavernkeep watches ${name} ${verbPhrase} the tavern.\n"${line}"`).catch((err) => {
    console.error('Failed to post the farewell line:', err);
  });
});

// If a party card gets deleted out-of-band (someone with Manage Messages nukes it, or it's
// swept up in a bulk-delete), activePartyByRole would otherwise keep pointing at a dead message
// forever, soft-locking that dungeon's @mention until a bot restart. Clean up immediately instead.
function handlePartyCardDeleted(messageId) {
  const party = partyStore.get(messageId);
  if (!party || party.disbanded || party.completed) return;
  quietlyRetireParty(party, messageId, 'card-deleted').catch((err) => {
    console.error('Failed to clean up party state after its card was deleted:', err);
  });
}

client.on('messageDelete', (message) => {
  handlePartyCardDeleted(message.id);
  handleGiveawayCardDeleted(message.id);
  handleRsvpCardDeleted(message.id);
  handleGamePartyCardDeleted(message.id);
});

client.on('messageDeleteBulk', (messages) => {
  for (const message of messages.values()) {
    handlePartyCardDeleted(message.id);
    handleGiveawayCardDeleted(message.id);
    handleRsvpCardDeleted(message.id);
    handleGamePartyCardDeleted(message.id);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isModalSubmit() && interaction.customId.startsWith('party:kickmodal:')) {
    await handlePartyKickModal(interaction).catch((err) => {
      console.error('Party Up! kick modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('party:servermodal:')) {
    await handlePartyServerModal(interaction).catch((err) => {
      console.error('Party Up! server modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('modvote:modal:')) {
    await handleModVoteModalSubmit(interaction).catch((err) => {
      console.error('!vote modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('userlist:searchmodal:')) {
    await handleIgnSearchModal(interaction).catch((err) => {
      console.error('IGN directory search modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('userlist:addmodal:')) {
    await handleIgnAddModal(interaction).catch((err) => {
      console.error('IGN directory add modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('userlist:removemodal:')) {
    await handleIgnRemoveModal(interaction).catch((err) => {
      console.error('IGN directory remove modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('userlist:editmodal:')) {
    await handleIgnEditModal(interaction).catch((err) => {
      console.error('IGN directory edit modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('lorectl:addmodal:')) {
    await handleLoreAddModal(interaction).catch((err) => {
      console.error('Lore add modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('lorectl:removemodal:')) {
    await handleLoreRemoveModal(interaction).catch((err) => {
      console.error('Lore remove modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('giveawaystart:modal:')) {
    await handleGiveawayStartModal(interaction).catch((err) => {
      console.error('Giveaway start modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('giveawaymodal:')) {
    await handleGiveawayModal(interaction).catch((err) => {
      console.error('Giveaway modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('rsvpmodal:')) {
    await handleRsvpCreateModal(interaction).catch((err) => {
      console.error('RSVP create-event modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('lorectl:talemodal:')) {
    await handleLoreAddTaleModal(interaction).catch((err) => {
      console.error('Lore add-tale modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('lorectl:editmodal:')) {
    await handleLoreEditModal(interaction).catch((err) => {
      console.error('Lore edit modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('recruitctl:addmodal:')) {
    await handleRecruitAddModal(interaction).catch((err) => {
      console.error('Recruit board add modal handler failed:', err);
    });
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('recruitctl:removemodal:')) {
    await handleRecruitRemoveModal(interaction).catch((err) => {
      console.error('Recruit board remove modal handler failed:', err);
    });
    return;
  }

  if ((interaction.isButton() || interaction.isStringSelectMenu()) && interaction.customId.startsWith('guildlist:')) {
    await handleGuildInteraction(interaction).catch((err) => {
      console.error('!guild handler failed:', err);
    });
    return;
  }

  if (!interaction.isButton()) return;

  if (interaction.customId.startsWith('tod:')) {
    await handleTodButton(interaction).catch((err) => {
      console.error('!tod Truth/Dare button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('partystart:')) {
    await handlePartyStartButton(interaction).catch((err) => {
      console.error('!party Start button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('party:')) {
    await handlePartyButton(interaction).catch((err) => {
      console.error('Party Up! button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('partyrecover:')) {
    await handleOrphanPartyRecovery(interaction).catch((err) => {
      console.error('Orphaned party recovery button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('modvote:')) {
    await handleModVotePromptButton(interaction).catch((err) => {
      console.error('!vote prompt button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('userlist:')) {
    await handleIgnListButton(interaction).catch((err) => {
      console.error('IGN directory button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('lorectl:')) {
    await handleLoreListButton(interaction).catch((err) => {
      console.error('Lore button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('recruitctl:')) {
    await handleRecruitListButton(interaction).catch((err) => {
      console.error('Recruit board button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('todctl:')) {
    await handleTodListButton(interaction).catch((err) => {
      console.error('!tod prompt book button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('giveawaystart:')) {
    await handleGiveawayStartButton(interaction).catch((err) => {
      console.error('Giveaway start-prompt button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('giveawayend:')) {
    await handleGiveawayEndButton(interaction).catch((err) => {
      console.error('Giveaway end-prompt button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('giveaway:')) {
    await handleGiveawayButton(interaction).catch((err) => {
      console.error('Giveaway button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('rsvpcreate:')) {
    await handleRsvpCreateButton(interaction).catch((err) => {
      console.error('RSVP create-event button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('rsvp:')) {
    await handleRsvpButton(interaction).catch((err) => {
      console.error('RSVP button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('gameupstart:')) {
    await handleGameUpStartButton(interaction).catch((err) => {
      console.error('!game Create button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('gameupvote:')) {
    await handleGameUpVoteButton(interaction).catch((err) => {
      console.error('!game Vote button handler failed:', err);
    });
    return;
  }

  if (interaction.customId === 'gameupping') {
    await handleGameUpPingButton(interaction).catch((err) => {
      console.error('!game Ping button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('gamevotefinish:')) {
    await handleGameVoteFinishButton(interaction).catch((err) => {
      console.error('!game vote Finish button handler failed:', err);
    });
    return;
  }

  if (interaction.customId.startsWith('gameparty:')) {
    await handleGamePartyButton(interaction).catch((err) => {
      console.error('Game Party Up! button handler failed:', err);
    });
    return;
  }

  if (!interaction.customId.startsWith('menu:')) return;

  const [, action, ownerId, indexStr] = interaction.customId.split(':');

  // Only the traveller who ran !menu can flip their own book — everyone else gets their own
  // copy by running !menu themselves, so nobody's buttons fight over one shared message.
  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: 'This menu isn\'t yours to flip through — run `!menu` to get your own copy, traveller.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const pages = buildMenuPages(interaction.member, interaction.channelId);

  let newIndex;
  if (action === 'prev') {
    newIndex = Math.max(0, parseInt(indexStr, 10) - 1);
  } else if (action === 'next') {
    newIndex = Math.min(pages.length - 1, parseInt(indexStr, 10) + 1);
  } else {
    return; // the disabled page-counter button — nothing to do
  }
  newIndex = Math.min(newIndex, pages.length - 1); // clamp in case pages shrank (e.g. lost Council roles)

  await interaction.update({
    embeds: [pages[newIndex].embed],
    components: buildMenuComponents(ownerId, newIndex, pages),
  });
});

async function handleMessageCreate(message) {
  if (message.author.bot || !message.guild) return;
  recordActivity(message.author.id);
  const content = message.content.trim();

  // Auto-join anyone chatting anywhere in the dungeon system into the general dungeon chat
  // thread (see addUserToGeneralDungeonChat) — covers plain conversation in a dungeon thread
  // or the hub that the more specific party-creation/join/bump call sites below wouldn't catch
  // on their own (e.g. just talking in a run chat without touching the party card at all).
  if (
    message.channel?.id === DUNGEON_HUB_CHANNEL_ID ||
    message.channel?.id === DUNGEON_GENERAL_CHAT_THREAD_ID ||
    DUNGEON_THREAD_IDS.has(message.channel?.id)
  ) {
    addUserToGeneralDungeonChat(message.author.id);
  }

  // ---- Dungeon ping redirect ----
  // Someone @mentioned a dungeon sigil role in any channel — redirect the call to the shared
  // dungeon hub channel, where the Party Up! card lives, instead of letting the party-forming
  // chatter clutter wherever it was posted. Each dungeon also has its own persistent run-chat
  // thread (DUNGEON_ROLES[roleId].threadId) that unlocks/unarchives alongside the card and gets
  // a short "party's open, jump back to the card" notice — see unlockDungeonThread.
  // A ping sent directly inside the hub channel (or inside a dungeon's own thread) is handled
  // too: Discord already delivered that ping, so there's nothing to redirect, but a Party Up!
  // card still needs to be created — otherwise pinging from inside the destination silently
  // does nothing.
  const isAtPartyDestination = message.channel.id === DUNGEON_HUB_CHANNEL_ID || DUNGEON_THREAD_IDS.has(message.channel.id);
  if (message.mentions.roles.size > 0) {
    const matched = message.mentions.roles.filter((role) => DUNGEON_ROLES[role.id]);
    if (matched.size > 0) {
      const authorName = message.member?.displayName || message.author.username;

      // Split into dungeons that need a brand-new card vs. ones where the pinger is already a
      // member of a live party for that role. Being IN the party (leader or regular member) gets
      // that card bumped back to the bottom (see PARTY_MENTION_BUMP_COOLDOWN_MS below, no re-ping
      // either) instead of spamming a duplicate or opening the create-wizard; anyone else — a
      // stranger, or someone who left — isn't part of any live party for that role, so they get
      // their own fresh card. Multiple concurrent parties per dungeon are expected as a result.
      const toCreate = [];
      const bumpTargets = [];
      for (const role of matched.values()) {
        const info = DUNGEON_ROLES[role.id];
        const activeIds = activePartyByRole.get(role.id);
        let memberMatch = null;
        if (activeIds) {
          for (const id of activeIds) {
            const p = partyStore.get(id);
            if (p && !p.disbanded && !p.completed && p.members.some((m) => m.id === message.author.id)) {
              memberMatch = { existingParty: p, existingId: id };
              break;
            }
          }
        }
        if (memberMatch) {
          bumpTargets.push({ role, info, ...memberMatch });
        } else {
          toCreate.push({ role, info });
        }
      }

      // Heads-up notice in the origin channel. Role named in plain text (no ** @ ** mention) so
      // this doesn't fire off a second ping on top of the one already sent below.
      // Skipped for the toCreate case when the ping happened inside the hub/a dungeon thread
      // itself — there's no "redirected here" to announce since we're already at the destination.
      const noticeLines = [];
      if (!isAtPartyDestination && toCreate.length > 0) {
        const names = toCreate.map((e) => `**${e.info.name}**`).join(', ');
        noticeLines.push(`🗺️ The ${names} call will be redirected here → <#${DUNGEON_HUB_CHANNEL_ID}>`);
      }

      // Same per-user creation cooldown as !party — otherwise someone could dodge the !party
      // limit entirely by just spamming @dungeon-role pings instead. One check covers this whole
      // message even if it mentions several different roles at once (an intentional single act,
      // not spam) — it only blocks a rapid-fire repeat of the ping itself.
      const createCooldownRemaining = partyCreateCooldownRemaining(message.author.id);
      const creationRateLimited = toCreate.length > 0 && createCooldownRemaining > 0;
      if (creationRateLimited) {
        const waitSecs = Math.ceil(createCooldownRemaining / 1000);
        noticeLines.push(`🕰️ Slow down, adventurer — you can open another party in ~${waitSecs}s.`);
      }

      // Members of their own already-forming party get it bumped back to the bottom of the
      // hub channel — but only once per cooldown window, so re-pinging can't be used to
      // spam-bump. Leadership never changes here; a bump is a repost of the same party, same
      // leader.
      for (const entry of bumpTargets) {
        const { info, existingParty, existingId } = entry;
        const sinceLastBump = Date.now() - (existingParty.lastBumpAt || existingParty.createdAt || 0);
        if (sinceLastBump < PARTY_MENTION_BUMP_COOLDOWN_MS) {
          const waitLabel = formatRemaining(PARTY_MENTION_BUMP_COOLDOWN_MS - sinceLastBump);
          if (isAtPartyDestination) {
            noticeLines.push(`⚔️ Your **${info.name}** party was called for recently — try again in ${waitLabel}.`);
          } else {
            const jumpUrl = `https://discord.com/channels/${message.guild.id}/${existingParty.channelId}/${existingId}`;
            noticeLines.push(
              `⚔️ Your **${info.name}** party was called for recently (try again in ${waitLabel}) — hop in here instead: ${jumpUrl}`
            );
          }
          continue;
        }

        // Already in this party — no new card, and no create-cooldown consumed. Bump it back to
        // the bottom, but don't re-ping the role here: the @mention that triggered this redirect
        // already delivered a real Discord notification to everyone with the role before the bot
        // ever saw the message, so pinging again on the reposted card would just double it up.
        const newMessage = await bumpParty(existingParty, existingId);
        if (!newMessage) {
          const jumpUrl = `https://discord.com/channels/${message.guild.id}/${existingParty.channelId}/${existingId}`;
          noticeLines.push(`⚔️ Couldn't bump **${info.name}**'s party card — hop in here instead: ${jumpUrl}`);
          continue;
        }
        if (!isAtPartyDestination) {
          const jumpUrl = `https://discord.com/channels/${message.guild.id}/${existingParty.channelId}/${newMessage.id}`;
          noticeLines.push(`🔼 **${authorName}** bumped and re-called **${info.name}**'s party: ${jumpUrl}`);
        }
        // Pinged from inside the hub/dungeon thread itself — the fresh bumped card is
        // confirmation enough on its own, no extra notice needed.
      }

      // Same Rookie/Novice nudge the party-creation wizard gives — this direct @role-ping path
      // skips the wizard entirely, so it's the only other place a party actually gets created.
      if (toCreate.length > 0 && !creationRateLimited && isNewAdventurer(message.member) && !isExperiencedAdventurer(message.member)) {
        noticeLines.push(
          `🌱 Rookie/Novice-only parties tend to struggle with these dungeons — try to bring along **at least 1 Seasoned Adventurer**, or **1-2 Expert Adventurers**, to help carry the run.`
        );
      }

      if (noticeLines.length > 0) {
        try {
          await message.channel.send(noticeLines.join('\n'));
        } catch (err) {
          console.error(`Dungeon redirect: failed to post heads-up notice in channel ${message.channel.id}:`, err);
        }
      }

      // Strip any role mentions out of the original text — the role tag is shown fresh (as
      // plain, non-pinging text) below, so leaving the original mention in the quoted body
      // would just be redundant.
      const strippedContent = content.replace(/<@&\d+>/g, '').trim();

      // A fresh Party Up! card for anyone not already in a live party for that role — posted in
      // the hub channel. No ping here either: the @mention that triggered this redirect already
      // notified everyone with the role in real time, before the bot could act on it, so this
      // card shows the role as plain (non-pinging) text purely for reference. This can add
      // another concurrent party for a dungeon that already has one forming. Skipped entirely
      // when creationRateLimited — the notice above already told them why.
      for (const entry of creationRateLimited ? [] : toCreate) {
        const { role, info } = entry;
        try {
          const hubChannel = await message.guild.channels.fetch(DUNGEON_HUB_CHANNEL_ID).catch(() => null);
          if (!hubChannel) {
            console.log(`Dungeon redirect: could not find hub channel ${DUNGEON_HUB_CHANNEL_ID}.`);
            continue;
          }
          const dungeonThread = info.threadId ? await message.guild.channels.fetch(info.threadId, { force: true }).catch(() => null) : null;
          beginPartyCreation(role.id);
          try {
            if (dungeonThread) await unlockDungeonThread(dungeonThread);
            ensureGeneralDungeonChatOpen();
            addUserToGeneralDungeonChat(message.author.id);
            if (info.threadId) addUserToDungeonThread(info.threadId, message.author.id);

            const rolePing = `<@&${role.id}>`;
            const body = strippedContent
              ? isAtPartyDestination
                ? `${rolePing} — **${authorName}** is calling for a party:\n${strippedContent}`
                : `${rolePing} — **${authorName}** is calling from <#${message.channel.id}>:\n${strippedContent}`
              : `${rolePing} — **${authorName}** is calling for a party!`;

            const party = {
              dungeonName: info.name,
              roleId: role.id,
              channelId: hubChannel.id,
              threadId: dungeonThread ? dungeonThread.id : null,
              leaderId: message.author.id,
              leaderName: authorName,
              maxSize: getPartyMaxSize(role.id),
              members: [{ id: message.author.id, name: authorName }],
              closed: false,
              completed: false,
              disbanded: false,
              server: null,
              serverNoticeMessageId: null,
              createdAt: Date.now(),
              lastActivity: Date.now(),
            };

            const partyMessage = await hubChannel.send({
              content: body,
              embeds: [buildPartyEmbed(party)],
              components: buildPartyComponents(party),
              allowedMentions: { parse: [] },
            });
            partyStore.set(partyMessage.id, party);
            if (!activePartyByRole.has(role.id)) activePartyByRole.set(role.id, new Set());
            activePartyByRole.get(role.id).add(partyMessage.id);

            if (dungeonThread) {
              const jumpUrl = `https://discord.com/channels/${message.guild.id}/${hubChannel.id}/${partyMessage.id}`;
              try {
                // Ping the creator directly so Discord's notification drops them straight into
                // the run-chat thread — this IS the "redirect" (there's no way to force-navigate
                // a user's client, so a targeted mention + jump link is the closest equivalent).
                await dungeonThread.send({
                  content: `<@${message.author.id}> ⚔️ **${authorName}** opened a **${info.name}** party! [Jump to the Party Up! card](${jumpUrl})`,
                  allowedMentions: { users: [message.author.id] },
                });
              } catch (err) {
                console.error(`Dungeon redirect: failed to post thread notice for ${info.name}:`, err);
              }
            }
          } finally {
            // Party is now either fully registered or the attempt failed outright — either way
            // this role is no longer "mid-creation", so a concurrent disband elsewhere is safe
            // to re-lock the thread again if this really was the last active party.
            endPartyCreation(role.id);
          }
        } catch (err) {
          console.error(`Dungeon redirect: failed to post party card for ${info.name}:`, err);
        }
      }
      if (toCreate.length > 0 && !creationRateLimited) {
        markPartyCreated(message.author.id);
      }

      // Clean up the original ping. Note: Discord fires the notification the instant the
      // message is posted, so deleting it doesn't recall a push notification that already
      // went out — this just keeps the tavern itself tidy and steers the conversation.
      try {
        await message.delete();
      } catch (err) {
        console.error('Dungeon redirect: failed to delete original ping message:', err);
      }

      return; // handled — don't fall through to the drunk meter or command parsing below
    }
  }

  // ---- Quick party bump: bare "b" or "bump" ----
  // Deliberately NOT added to KNOWN_COMMAND_WORDS/isKnownCommand — these are plain words, not
  // real commands, so they only ever do anything when the author is currently in a live party.
  // If they're not in one, quickBumpForAuthor() sends nothing and returns false, and the message
  // falls straight through to every other handler exactly as if this feature didn't exist (e.g.
  // still eligible for the drunk-meter intercept below). Only an exact, whole-message match
  // triggers this — "bump this" or "b " won't, but a standalone "b"/"bump" typed as normal chat
  // by someone who happens to be in a party will bump it, so heads up if that word comes up a lot.
  const bareContentLower = content.toLowerCase();
  if (bareContentLower === 'b' || bareContentLower === 'bump') {
    const handled = await quickBumpForAuthor(message).catch((err) => {
      console.error('Quick bump shortcut failed:', err);
      return true; // don't fall through into other handling after an unexpected mid-bump error
    });
    if (handled) return;
  }

  // ---- Drunk meter: intercept ordinary chatter (not commands) for tipsy+ members ----
  // Only kicks in when the message itself is posted in the tavern or bartop channel.
  // Gated on isKnownCommand(), not a raw "!" prefix check — see KNOWN_COMMAND_WORDS above for why.
  if (!isKnownCommand(content, message.member) && content.length > 0 && DRUNK_CHANNELS.includes(message.channel.id)) {
    const drinks = loadDrinks();
    const player = getPlayer(drinks, message.author.id);
    const tier = getDrunkTier(player.drunkMeter);
    const flairActive = player.activeFlair && player.activeFlair.expiresAt > Date.now();
    // Warning-penalty flairs (see applyWarnPenaltyFlair/WARNING_TIERS) — already pruned of
    // expired entries by getPlayer(). Unlike every other flair source, these force interception
    // every single message, no roll and no washing out via a high drunk-decay tier.
    const warnFlairsActive = Array.isArray(player.warnFlairs) && player.warnFlairs.length > 0;
    // Mod-cast curses (see applyModCurseFlair / !curse) — same forced-interception treatment as
    // warnFlairs, for the same reason: these are meant to be inescapable, not a roll.
    const curseFlairsActive = Array.isArray(player.curseFlairs) && player.curseFlairs.length > 0;
    const FLAIR_INTERCEPT_CHANCE = 0.35; // lets a flair-only drink (even while Sober) still trigger sometimes
    // Speech is styled entirely by the fantasy flair now — no flair active means nothing to
    // intercept (no more generic alcohol-hiccup fallback), even if the meter itself is still up.
    // A "guaranteed" flair (from !cast or !throw, incl. parry reflections) always talks in
    // flair — every message gets styled, no roll involved. Flairs picked up from !serve/!toast
    // still use the normal chance-based intercept below.
    const interceptChance = (warnFlairsActive || curseFlairsActive)
      ? 1
      : flairActive
        ? (player.activeFlair.guaranteed ? 1 : Math.max(tier.interceptChance, FLAIR_INTERCEPT_CHANCE))
        : 0;
    saveDrinks(drinks); // persist the decay even when we don't intercept

    if (interceptChance > 0 && Math.random() < interceptChance) {
      let styled = content;
      if (flairActive) {
        const effect = FLAIR_EFFECTS[player.activeFlair.id];
        if (effect) styled = effect.apply(styled);
      }
      // Warning-penalty flairs stack — every entry still active gets layered on top, in the
      // order they were issued, instead of only the most recent one applying.
      for (const warnFlair of player.warnFlairs) {
        const warnEffect = FLAIR_EFFECTS[warnFlair.id];
        if (warnEffect) styled = warnEffect.apply(styled);
      }
      // Curses stack too — every entry still active gets layered on top, in the order they were
      // cast, same as warnFlairs above.
      for (const curseFlair of player.curseFlairs) {
        const curseEffect = FLAIR_EFFECTS[curseFlair.id];
        if (curseEffect) styled = curseEffect.apply(styled);
      }
      // Bold the whole thing so the message is still readable under the hiccups/stretching —
      // no more "*grinning too wide, they blurt out,*" style intro line, just their message.
      const finalContent = `**${styled}**`;

      const hook = await getOrCreateDrunkWebhook(message.channel).catch(() => null);
      if (hook) {
        try {
          // Send the repost FIRST, then delete the original only once we know the repost
          // landed. Deleting first (the old order) risked losing the message entirely if
          // hook.send() then threw — the original would already be gone with no replacement
          // ever posted. This order means the worst case is a brief duplicate (both messages
          // visible for a moment) instead of the message vanishing outright.
          await hook.send({
            content: finalContent,
            username: message.member?.displayName || message.author.username,
            avatarURL: message.author.displayAvatarURL(),
            // The original message already delivered any pings it contained before we deleted
            // it below — this repost is a brand-new message, so without this it would fire
            // @everyone/@here/role/user mentions a SECOND time. Suppress all of them here.
            allowedMentions: { parse: [] },
          });
          try {
            await message.delete();
          } catch (deleteErr) {
            // Repost succeeded but the original couldn't be removed (e.g. already deleted,
            // or a permissions hiccup) — not a loss, just a leftover duplicate. Log and move on.
            console.error('Drunk-relay: repost sent but failed to delete original message:', deleteErr);
          }
        } catch (err) {
          console.error('Drunk-relay webhook send failed:', err);
        }
      }
      // Not a command either way, so nothing else to do with this message
      return;
    }
  }

  // ---- !serve (self-serve only) ----
  if (matchesCommand(content, '!serve')) {
    const isRareEvent = Math.random() < RARE_SERVE_CHANCE;
    const rare = isRareEvent
      ? RARE_SERVE_EVENTS[Math.floor(Math.random() * RARE_SERVE_EVENTS.length)]
      : null;
    const item = rare ? rare.item : SERVE_ITEMS[Math.floor(Math.random() * SERVE_ITEMS.length)];

    const authorName = message.member?.displayName || message.author.username;
    const serveSelfLines = [
      `The Tavernkeep sets ${item} down in front of **${authorName}** with a satisfied nod.`,
      `The Tavernkeep serves **${authorName}** ${item}, tail flicking with pride nya~`,
      `Without a word, the Tavernkeep slides ${item} across the bar to **${authorName}**.`,
      `"On the house," purrs the Tavernkeep, presenting **${authorName}** with ${item}.`,
      `The Tavernkeep rummages behind the bar and produces ${item} for **${authorName}**. Don't ask where it was kept.`,
    ];

    let response = serveSelfLines[Math.floor(Math.random() * serveSelfLines.length)];
    if (rare) {
      response += `\n\n${rare.flavor}`;
    }

    // !serve is self-serve only — no more targeting another user with @mention, so there's no
    // way to buy for or otherwise involve anyone but yourself. Every !serve auto-pours AND
    // auto-drinks a real round for whoever typed the command. Named, never pinged.
    const recipientId = message.author.id;

    const drinks = loadDrinks();
    const player = getPlayer(drinks, recipientId);

    const poured = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    player.drunkMeter = Math.min(100, player.drunkMeter + poured.strength * DRUNK_METER_PER_STRENGTH);
    // !serve only lands a speech-flair on a coin flip — half the time it's just the meter going up,
    // no funny voice attached. (!throw and !cast spell stay at a guaranteed flair.)
    const servedFlairRolled = poured.flair && FLAIR_EFFECTS[poured.flair] && Math.random() < 0.5;
    let servedFlairResult = null;
    if (servedFlairRolled) {
      const durationMs = Math.min(poured.strength * FLAIR_MINUTES_PER_STRENGTH * 60 * 1000, AUTO_SOBER_MS);
      servedFlairResult = applyFlairToPlayer(player, poured.flair, durationMs);
    }
    const drinkLine = `🍹 Comes with a round of **${poured.name}**, already poured and downed!`;
    response += `\n\n${drinkLine}`;
    if (servedFlairResult) {
      const minutes = Math.round(Math.min(poured.strength * FLAIR_MINUTES_PER_STRENGTH, AUTO_SOBER_MS / 60000));
      if (servedFlairResult.mixed) {
        const label = FLAIR_EFFECTS[servedFlairResult.flairId].label;
        const mixLine = MIXING_CHAOS_LINES[Math.floor(Math.random() * MIXING_CHAOS_LINES.length)];
        response += ` ✨ ${mixLine(label)} (~${minutes}m)`;
      } else {
        response += ` ✨ ${buildFlairAnnouncement(servedFlairResult.flairId)} (~${minutes}m)`;
      }
    }

    saveDrinks(drinks);
    response = `${response}`;

    // No drunk state lingers past 10 minutes, whether it's just the meter or the meter + a flair.
    scheduleAutoSober(recipientId, message.channel);

    message.reply({ content: response, allowedMentions: { repliedUser: false } });
    return;
  }

  // ---- !fortune ----
  if (matchesCommand(content, '!fortune')) {
    const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
    const fortuneIntros = [
      'The Tavernkeep swirls the dregs of your cup.',
      'The Tavernkeep peers into your teacup, whiskers twitching.',
      'The Tavernkeep squints at the tea leaves like they owe him money.',
      'The Tavernkeep turns your cup thrice, nya, and studies the leaves.',
      'The Tavernkeep sniffs the cup, then the air, then the cup again.',
    ];
    const intro = fortuneIntros[Math.floor(Math.random() * fortuneIntros.length)];
    message.reply({
      content: `${intro} "${fortune}"`,
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !gossip ----
  if (matchesCommand(content, '!gossip')) {
    const target = message.mentions.members?.first();

    let gossip;
    if (target) {
      const template = GOSSIP_TARGET_LINES[Math.floor(Math.random() * GOSSIP_TARGET_LINES.length)];
      gossip = template.replace('{target}', target.toString());
    } else {
      gossip = GOSSIP_LINES[Math.floor(Math.random() * GOSSIP_LINES.length)];
    }
    const gossipIntros = [
      'The Tavernkeep leans in and lowers his voice.',
      'The Tavernkeep glances over both shoulders before whispering.',
      'The Tavernkeep\'s ears perk up. "Oh, you\'ll want to hear this one, nya."',
      'The Tavernkeep polishes a mug, not looking at you, and mutters.',
      'The Tavernkeep beckons you closer with a claw.',
    ];
    const gIntro = gossipIntros[Math.floor(Math.random() * gossipIntros.length)];
    message.reply({
      content: `${gIntro} "${gossip}"`,
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !toast (self-only) ----
  if (matchesCommand(content, '!toast')) {
    const toast = TOAST_LINES[Math.floor(Math.random() * TOAST_LINES.length)];
    const toastVerbs = [
      'raises his mug',
      'lifts his tankard high',
      'thumps his mug on the counter and raises it',
      'stands atop the bar, mug in paw',
    ];
    const verb = toastVerbs[Math.floor(Math.random() * toastVerbs.length)];
    let response = `The Tavernkeep ${verb} to the room: "${toast}"`;

    // A toast is a self-only auto-drink — no more @mentioning another user, so there's no way
    // to toast at or otherwise involve anyone but yourself.
    const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];

    const drinks = loadDrinks();
    const player = getPlayer(drinks, message.author.id);
    player.drunkMeter = Math.min(100, player.drunkMeter + recipe.strength * DRUNK_METER_PER_STRENGTH);
    let toastFlairResult = null;
    if (recipe.flair && FLAIR_EFFECTS[recipe.flair]) {
      const durationMs = Math.min(recipe.strength * FLAIR_MINUTES_PER_STRENGTH * 60 * 1000, AUTO_SOBER_MS);
      toastFlairResult = applyFlairToPlayer(player, recipe.flair, durationMs);
    }
    saveDrinks(drinks);

    const toastAuthorName = message.member?.displayName || message.author.username;
    response += `\n\n🍻 **${toastAuthorName}** downs a round of **${recipe.name}** to seal the toast.`;
    if (toastFlairResult) {
      const minutes = Math.round(Math.min(recipe.strength * FLAIR_MINUTES_PER_STRENGTH, AUTO_SOBER_MS / 60000));
      if (toastFlairResult.mixed) {
        const label = FLAIR_EFFECTS[toastFlairResult.flairId].label;
        const mixLine = MIXING_CHAOS_LINES[Math.floor(Math.random() * MIXING_CHAOS_LINES.length)];
        response += `\n\n✨ ${mixLine(label)} (~${minutes}m)`;
      } else {
        response += `\n\n✨ ${buildFlairAnnouncement(toastFlairResult.flairId)} (~${minutes}m)`;
      }
    }

    if (Math.random() < RARE_TOAST_CHANCE) {
      const rareToast = RARE_TOAST_EVENTS[Math.floor(Math.random() * RARE_TOAST_EVENTS.length)];
      response += `\n\n${rareToast.flavor}`;
    }

    // No drunk state lingers past 10 minutes.
    scheduleAutoSober(message.author.id, message.channel);

    message.reply({
      content: `${response}`,
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !throw @user — chuck a potion at someone. Open to everyone, on everyone, 3 min cooldown ----
  if (matchesCommand(content, '!throw')) {
    const targetMember = message.mentions.members?.first();
    if (!targetMember) {
      message.reply({
        content: 'Usage: `!throw @user` — chuck a potion at someone and see what happens, nya.',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (targetMember.id === message.author.id) {
      message.reply({
        content: 'The Tavernkeep raises an eyebrow. "Throwing potions at yourself now? Pick someone else, nya."',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (isGolemProtected(targetMember)) {
      const drinks = loadDrinks();
      const thrower = getPlayer(drinks, message.author.id);
      const now = Date.now();
      thrower.stats.throwCount++;
      applyGolemCurse(thrower, now);
      saveDrinks(drinks);
      scheduleGolemCurseExpiry(message.author.id, message.channel);

      const casterName = message.member.displayName || message.author.username;
      const bLine = GOLEM_CURSE_BACKFIRE_LINES[Math.floor(Math.random() * GOLEM_CURSE_BACKFIRE_LINES.length)](casterName);
      message.reply({
        content: `${bLine}\n\n${buildGolemCurseAnnouncement()}`,
        allowedMentions: { users: [message.author.id], repliedUser: false },
      });
      return;
    }

    if (targetMember.id === TAVERNKEEP_ID) {
      const drinks = loadDrinks();
      const thrower = getPlayer(drinks, message.author.id);
      const now = Date.now();
      const throwCooldown = checkCooldown(thrower, 'lastThrowUse', THROW_COOLDOWN_MS, now);

      if (throwCooldown.onCooldown) {
        message.reply({
          content: `The Tavernkeep grabs your wrist before you can wind up again. "One potion at a time, traveller."\n-# 🧪 You can throw again **3 minutes** after your last throw — try again in **${throwCooldown.remainingLabel}**.`,
          allowedMentions: { repliedUser: false },
        });
        saveDrinks(drinks);
        return;
      }

      thrower.lastThrowUse = now;
      thrower.stats.throwCount++;

      const strongestPotion = THROW_POTIONS.reduce((a, b) => (b.strength > a.strength ? b : a));
      // Record the delta actually applied (post-clamp), not the raw 100 — so !parry later removes
      // exactly what was gained instead of over/under-correcting if the meter wasn't at 0 already.
      const appliedMeterDelta = 100 - thrower.drunkMeter;
      thrower.drunkMeter = 100;
      const bounceResult = applyFlairToPlayer(thrower, strongestPotion.flair, TAVERNKEEP_BOUNCE_MS, true);
      recordAttack(
        thrower,
        message.author.id,
        { meterDelta: appliedMeterDelta, flairId: bounceResult.flairId, flairDurationMs: TAVERNKEEP_BOUNCE_MS },
        'throw'
      );
      saveDrinks(drinks);
      scheduleAutoSober(message.author.id, message.channel, TAVERNKEEP_BOUNCE_MS);

      const casterName = message.member.displayName || message.author.username;
      const bounceLines = [
        `The Tavernkeep doesn't even look up. With a flick of one claw, ${casterName}'s own potion is deflected — right back into **${casterName}**'s face!`,
        `"Nice try, traveller." The Tavernkeep tilts the bottle away without spilling a drop, and it sails straight back at **${casterName}**!`,
        `The potion bounces clean off the Tavernkeep's apron and comes flying back — **${casterName}** takes the full hit instead.`,
        `The Tavernkeep raises a single paw. The potion freezes mid-air, spins around, and soaks **${casterName}** from head to toe.`,
      ];
      const bLine = bounceLines[Math.floor(Math.random() * bounceLines.length)];
      const minutes = Math.round(TAVERNKEEP_BOUNCE_MS / 60000);
      message.reply({
        content: `${bLine}\n\n✨ ${buildPotionFlairAnnouncement(bounceResult.flairId)} (~${minutes}m, full strength)`,
        allowedMentions: { users: [message.author.id], repliedUser: false },
      });
      return;
    }

    const drinks = loadDrinks();
    const thrower = getPlayer(drinks, message.author.id);
    const now = Date.now();
    const throwCooldown = checkCooldown(thrower, 'lastThrowUse', THROW_COOLDOWN_MS, now);

    if (throwCooldown.onCooldown) {
      const throwCooldownLines = [
        `The Tavernkeep grabs your wrist before you can wind up again. "One potion at a time, traveller."`,
        `The Tavernkeep\'s shelf is still restocking, nya. Nothing left in reach to throw just yet.`,
        `"Already threw one," the Tavernkeep reminds you, "give the shelf a moment to refill."`,
        `The Tavernkeep eyes you warily and slides the potion rack out of reach. Not yet.`,
      ];
      const cLine = throwCooldownLines[Math.floor(Math.random() * throwCooldownLines.length)];

      message.reply({
        content: `${cLine}\n-# 🧪 You can throw again **3 minutes** after your last throw — try again in **${throwCooldown.remainingLabel}**.`,
        allowedMentions: { repliedUser: false },
      });
      saveDrinks(drinks);
      return;
    }

    thrower.lastThrowUse = now;
    thrower.stats.throwCount++;

    const potion = THROW_POTIONS[Math.floor(Math.random() * THROW_POTIONS.length)];
    const target = getPlayer(drinks, targetMember.id);

    const rawMeterDelta = potion.strength * DRUNK_METER_PER_STRENGTH;
    const meterBefore = target.drunkMeter;
    target.drunkMeter = Math.min(100, target.drunkMeter + rawMeterDelta);
    // Record what actually landed (post-clamp), not the raw potion strength — otherwise a target
    // already close to 100 would have more removed by !parry than the potion actually added.
    const appliedMeterDelta = target.drunkMeter - meterBefore;
    let throwFlairResult = null;
    let flairDurationMs = 0;
    if (potion.flair && FLAIR_EFFECTS[potion.flair]) {
      flairDurationMs = Math.min(potion.strength * FLAIR_MINUTES_PER_STRENGTH * 60 * 1000, AUTO_SOBER_MS);
      throwFlairResult = applyFlairToPlayer(target, potion.flair, flairDurationMs, true);
    }
    recordAttack(
      target,
      message.author.id,
      { meterDelta: appliedMeterDelta, flairId: throwFlairResult ? throwFlairResult.flairId : null, flairDurationMs },
      'throw'
    );
    saveDrinks(drinks);

    // No drunk state lingers past 10 minutes.
    scheduleAutoSober(targetMember.id, message.channel);

    // The target is never @-mentioned — everything below just names them, so there's no ping
    // at all, on the hit line or on the "is drenched" follow-up.
    const targetName = targetMember.displayName || targetMember.user.username;
    const throwLines = [
      `${message.author} winds up and hurls ${potion.name} — it shatters right over **${targetName}**'s head!`,
      `${message.author} lobs ${potion.name} across the tavern. Direct hit on **${targetName}**!`,
      `With a mischievous grin, ${message.author} chucks ${potion.name} at **${targetName}**. Splash!`,
      `${message.author} beans **${targetName}** with ${potion.name}, thrown clean across the bar.`,
      `The Tavernkeep barely ducks as ${message.author} sends ${potion.name} flying — it catches **${targetName}** square in the chest.`,
    ];
    let response = `${throwLines[Math.floor(Math.random() * throwLines.length)]}`;

    if (throwFlairResult) {
      const minutes = Math.round(Math.min(potion.strength * FLAIR_MINUTES_PER_STRENGTH, AUTO_SOBER_MS / 60000));
      if (throwFlairResult.mixed) {
        const label = FLAIR_EFFECTS[throwFlairResult.flairId].label;
        const mixLine = MIXING_CHAOS_LINES[Math.floor(Math.random() * MIXING_CHAOS_LINES.length)];
        response += `\n\n✨ ${mixLine(label)} (~${minutes}m)`;
      } else {
        response += `\n\n✨ ${buildPotionFlairAnnouncement(throwFlairResult.flairId)} (~${minutes}m)`;
      }
    }

    if (Math.random() < RARE_THROW_CHANCE) {
      const rareThrow = RARE_THROW_EVENTS[Math.floor(Math.random() * RARE_THROW_EVENTS.length)];
      response += `\n\n${rareThrow.flavor}`;
    }

    message.reply({
      content: response,
      allowedMentions: { users: [message.author.id], repliedUser: false },
    });
    return;
  }

  // ---- !tod @user — Truth or Dare. Open to everyone, on everyone, 2 min cooldown per target ----
  if (matchesCommand(content, '!tod')) {
    const todTarget = message.mentions.members?.first();
    if (!todTarget) {
      // No @user — for Council/Knight this opens the mod-only prompt book instead of the usage
      // reminder, so mods have a way to actually see/edit what's in tod.json without touching
      // the file by hand.
      if (!todModControlsVisible(message.member)) {
        message.reply({
          content: 'Usage: `!tod @user` — puts someone on the spot with Truth or Dare, nya.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      message.reply({
        embeds: [buildTodListEmbed()],
        components: buildTodListComponents(message.author.id),
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (todTarget.id === message.author.id) {
      message.reply({
        content: 'The Tavernkeep tilts his head. "Truth or Dare-ing yourself? Pick someone else, nya."',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (todTarget.user.bot) {
      message.reply({
        content: 'The Tavernkeep shrugs. "That one won\'t blush no matter what you ask, traveller."',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    const todRemaining = todCooldownRemaining(todTarget.id);
    if (todRemaining > 0) {
      const remainingLabel = formatRemaining(todRemaining);
      message.reply({
        content: `The Tavernkeep waves you off. "Give them a breather, traveller — try again in **${remainingLabel}**."`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    markTodUsed(todTarget.id);

    const todRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`tod:truth:${todTarget.id}`).setLabel('Truth').setEmoji('🗣️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`tod:dare:${todTarget.id}`).setLabel('Dare').setEmoji('🔥').setStyle(ButtonStyle.Danger)
    );

    const todTargetName = todTarget.displayName || todTarget.user.username;
    const todBox = new EmbedBuilder()
      .setColor(0x8b4513)
      .setTitle('🎭 Truth or Dare!')
      .setDescription(`${message.author} puts **${todTargetName}** on the spot! 🍺\n\n**${todTargetName}**, choose your fate...`)
      .setFooter({ text: 'Only they can press the buttons below' });

    message.reply({
      embeds: [todBox],
      components: [todRow],
      allowedMentions: { users: [todTarget.id], repliedUser: false },
    });
    return;
  }

  // ---- !lore / !lore <name> / !lore list ----
  if (matchesCommand(content, '!lore')) {
    const query = content.slice('!lore'.length).trim();

    // ---- !lore (no name given) — flip to a random page and share a random member's tale ----
    if (!query) {
      const entries = loadLore();
      if (entries.length === 0) {
        message.reply({
          content: `The Tavernkeep opens the grimoire to find every page blank, nya. Nobody's written in yet — mods can add the first page from \`!lore list\`.`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }
      const entry = entries[Math.floor(Math.random() * entries.length)];
      const snippet = entry.lore[Math.floor(Math.random() * entry.lore.length)];
      const flipIntros = [
        'The Tavernkeep flips the grimoire open to a random page and reads aloud, nya~',
        'The Tavernkeep lets the grimoire fall open wherever it likes.',
        'The Tavernkeep taps the grimoire\'s spine and a page flutters open on its own.',
        'The Tavernkeep\'s claw lands on a page at random.',
      ];
      const intro = flipIntros[Math.floor(Math.random() * flipIntros.length)];
      const embed = new EmbedBuilder()
        .setTitle(entry.title ? `${entry.name} — ${entry.title}` : entry.name)
        .setColor(0x6b4f8f)
        .setDescription(snippet)
        .setFooter({ text: `${entry.category} • !lore <name> for someone specific, !lore all <name> for their full tale, !lore list for the full roster` });
      message.reply({ content: intro, embeds: [embed], allowedMentions: { repliedUser: false } });
      return;
    }

    // ---- !lore all <name> — show every known snippet for a specific member ----
    if (query.toLowerCase().startsWith('all ') || query.toLowerCase().startsWith('all\t')) {
      const nameQuery = query.slice(3).trim();
      if (nameQuery) {
        const { match, candidates } = findLoreEntry(nameQuery);

        if (match) {
          const fullLore = match.lore.join('\n\n');
          const embed = new EmbedBuilder()
            .setTitle(match.title ? `${match.name} — ${match.title}` : match.name)
            .setColor(0x6b4f8f)
            .setDescription(fullLore)
            .setFooter({ text: `${match.category} • the full tale` });
          message.reply({
            embeds: [embed],
            allowedMentions: { repliedUser: false },
          });
          return;
        }

        if (candidates.length > 1) {
          message.reply({
            content: `The Tavernkeep tilts his head. "That could be a few folk, nya — did you mean: ${candidates.map((c) => c.name).join(', ')}?"`,
            allowedMentions: { repliedUser: false },
          });
          return;
        }

        message.reply({
          content: `The Tavernkeep flips through the grimoire, whiskers furrowed. "No page here by that name, traveller. Try \`!lore list\` to see who's written in."`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }
    }

    // ---- !lore list — show the roster, grouped by rank. Council/Knight also get Add/Remove/Edit
    // buttons here so the grimoire can be maintained live, no code redeploy needed. ----
    if (query.toLowerCase() === 'list' || query.toLowerCase() === 'all') {
      const showModControls = loreModControlsVisible(message.member);
      const { embed, page, totalPages } = buildLoreListEmbed(0);
      message.reply({
        embeds: [embed],
        components: buildLoreListComponents(message.author.id, page, totalPages, showModControls),
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // ---- !lore <name> ----
    const { match, candidates } = findLoreEntry(query);

    if (match) {
      const snippet = match.lore[Math.floor(Math.random() * match.lore.length)];
      const embed = new EmbedBuilder()
        .setTitle(match.title ? `${match.name} — ${match.title}` : match.name)
        .setColor(0x6b4f8f)
        .setDescription(snippet)
        .setFooter({ text: match.lore.length > 1 ? `${match.category} • !lore all ${match.name} for the full tale` : match.category });
      message.reply({
        embeds: [embed],
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (candidates.length > 1) {
      message.reply({
        content: `The Tavernkeep tilts his head. "That could be a few folk, nya — did you mean: ${candidates.map((c) => c.name).join(', ')}?"`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    message.reply({
      content: `The Tavernkeep flips through the grimoire, whiskers furrowed. "No page here by that name, traveller. Try \`!lore list\` to see who's written in."`,
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !party ----
  // A menu-driven alternative to @mentioning a dungeon role directly, usable from any channel:
  // pick the dungeon from a dropdown (there are 9 of them — too many for a row of buttons), then
  // party size, then a small popup for the server, then Yes/No on whether to actually ping the
  // role, then it opens that dungeon's Party Up! card exactly like the @mention flow does (or
  // bumps it, if the caller's already in a live one).
  if (matchesCommand(content, '!party')) {
    // Same shortcut as bare "b"/"bump": if the caller's already in a live party for ANY dungeon,
    // bump it instead of running them through the picker wizard below. This means `!party` can't
    // be used to open a second, different dungeon's party while another is still active for you —
    // complete/leave the first, or use the direct @mention-a-role flow instead, which is still
    // per-dungeon and unaffected by this. blockedCreation:true so the notice explains why.
    const bumped = await quickBumpForAuthor(message, { blockedCreation: true }).catch((err) => {
      console.error('!party quick-bump check failed:', err);
      return false;
    });
    if (bumped) return;

    const cooldownRemaining = partyCreateCooldownRemaining(message.author.id);
    if (cooldownRemaining > 0) {
      const waitSecs = Math.ceil(cooldownRemaining / 1000);
      await message.reply({
        content: `🕰️ Slow down, adventurer — you can call another party in ~${waitSecs}s.`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // The wizard itself (dungeon picker, party size, server popup, ping question) needs to be ephemeral so it
    // doesn't clutter the channel — but ephemeral replies only exist on interactions, and `!party`
    // is a plain text message. So we post one small public "Start" button; clicking it gives us
    // the interaction needed to hand off into the same ephemeral runPartyCreationWizard used by
    // the dungeon-hub nudge flow. Only the finished Party Up! card ends up public.
    const startRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`partystart:${message.author.id}`)
        .setLabel('Start')
        .setEmoji('🗺️')
        .setStyle(ButtonStyle.Primary)
    );

    const startPrompt = await message.reply({
      content: `Ready to call a party, traveller? Tap below to get started.`,
      components: [startRow],
      allowedMentions: { repliedUser: false },
    });
    setTimeout(() => {
      startPrompt.delete().catch(() => {});
    }, PARTY_START_PROMPT_LIFETIME_MS);
    return;
  }

  // ---- !game / !gn ----
  // Usable from any channel — the "other games" sibling to !party. Three hops off the same card:
  // Create (-> runGamePartyWizard, sandbox-game/Game Night party same as before), Vote
  // (-> runGameVoteWizard, a quick "what should we play" poll), and Ping (an instant, no-wizard
  // Game Night role ping on a shared cooldown). See handleGameUpCreateButton/
  // handleGameUpVoteButton/handleGameUpPingButton below.
  if (matchesCommand(content, '!game') || matchesCommand(content, '!gn')) {
    const gameUpStartRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`gameupstart:${message.author.id}`)
        .setLabel('Create')
        .setEmoji('🎮')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`gameupvote:${message.author.id}`)
        .setLabel('Vote')
        .setEmoji('🗳️')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('gameupping')
        .setLabel('Ping')
        .setEmoji('📣')
        .setStyle(ButtonStyle.Secondary)
    );

    const gameUpStartPrompt = await message.reply({
      content: `Ready to round up a game party, traveller? Tap below to get started.`,
      components: [gameUpStartRow],
      allowedMentions: { repliedUser: false },
    });
    setTimeout(() => {
      gameUpStartPrompt.delete().catch(() => {});
    }, PARTY_START_PROMPT_LIFETIME_MS);
    return;
  }

  // ---- !help / !menu (same command now — the public menu) ----
  // Renders as a flip-through book: one section per page, Prev/Next buttons, and a
  // dropdown to jump straight to a section. See buildMenuPages/buildMenuComponents below.
  if (matchesCommand(content, '!help') || matchesCommand(content, '!menu')) {
    const pages = buildMenuPages(message.member, message.channel.id);
    message.reply({
      embeds: [pages[0].embed],
      components: buildMenuComponents(message.author.id, 0, pages),
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !drink / !drink water — permanent, always-available: sober up on your own ----
  if (matchesCommand(content, '!drink')) {
    const nameArg = content.slice('!drink'.length).trim().toLowerCase();
    const drinks = loadDrinks();
    const player = getPlayer(drinks, message.author.id);

    // Water needs no name, no mod, and never runs out — `!drink` alone defaults to it.
    // The bottle holds 2 charges. Once both are drained, it needs 6 minutes to refill —
    // and both charges come back together, so it can't be spammed to permanently sit sober.
    if (!nameArg || nameArg === 'water') {
      const now = Date.now();

      // Golem's Curse overrides the normal water system entirely while it's active: charges are
      // locked at 0 (see applyGolemCurse), so the usual "out of charges" branch below would just
      // tell them to wait 5 hours. Intercept here instead — every drink while cursed counts
      // toward breaking it early, and doesn't touch the normal charge pool at all.
      if (isGolemCursed(player, now)) {
        player.golemCurse.watersDrunk += 1;
        const remainingWaters = GOLEM_CURSE_WATERS_NEEDED - player.golemCurse.watersDrunk;

        if (remainingWaters <= 0) {
          clearGolemCurse(player);
          cancelGolemCurseTimer(message.author.id);
          saveDrinks(drinks);
          message.reply({
            content:
              'The Tavernkeep watches closely as you drain the glass — and the stone weight finally cracks and falls away. "There we go, traveller. Curse broken, water\'s back to normal."',
            allowedMentions: { repliedUser: false },
          });
          return;
        }

        saveDrinks(drinks);
        message.reply({
          content: `The Tavernkeep slides over a glass, watching the curse closely as you drink. "One more, traveller — the stone's still got a grip on you." (**${remainingWaters}** more water${remainingWaters === 1 ? '' : 's'} needed to break it.)`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      if (player.waterCharges <= 0) {
        const remainingMs = player.waterRefillAt - now;
        const remainingLabel = formatRemaining(remainingMs);

        const cooldownLines = [
          `The Tavernkeep taps the empty bottle and shakes his head. "Already used up your magic water, traveller — give the bottle a moment to fill back up."`,
          `The Tavernkeep peers into the bottle and frowns. "Bone dry, both charges spent. It'll refill in a bit, nya, but not yet."`,
          `The Tavernkeep holds the bottle up to the light — not a drop left. "That one's still filling, traveller."`,
          `The Tavernkeep sets the empty bottle back on the shelf. "You've had both your charges. The magic needs a few minutes to work, nya~"`,
        ];
        const cLine = cooldownLines[Math.floor(Math.random() * cooldownLines.length)];

        message.reply({
          content: `${cLine}\n-# 💧 The bottle holds **2 charges** and refills both together **6 minutes** after the last one's used — try again in **${remainingLabel}**.`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const wasAffected = player.drunkMeter > 0 || player.activeFlair;
      player.drunkMeter = 0;
      player.activeFlair = null;
      player.lastWaterUse = now;
      player.waterCharges -= 1;
      // Only start the shared refill timer once the bottle actually runs dry.
      if (player.waterCharges <= 0) {
        player.waterRefillAt = now + WATER_COOLDOWN_MS;
      }
      saveDrinks(drinks);

      const waterLines = [
        'The Tavernkeep slides over a tall glass of water, nya. You drink it down in one go.',
        'A cold glass of water lands in front of you. A few gulps later, the room stops swaying.',
        'The Tavernkeep taps the bar. "Drink up, traveller." Cool water, and the fog starts to clear.',
        'The Tavernkeep pours from the pitcher he keeps just for this. You drink deep, and your head clears.',
      ];
      const wLine = waterLines[Math.floor(Math.random() * waterLines.length)];
      const afterNote = wasAffected
        ? ` You're feeling: **Sober**.`
        : ` (Already sober, but no harm in staying hydrated.)`;
      const chargeNote = player.waterCharges > 0
        ? `-# 💧 ${player.waterCharges} charge left.`
        : `-# 💧 Out of charges — refills in 6 minutes.`;

      message.reply({
        content: `${wLine}${afterNote}\n${chargeNote}`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // Anything besides water — the Tavernkeep doesn't pour it.
    message.reply({
      content: `The Tavernkeep checks behind the bar. "All I've got poured for you is water, traveller."\n\n-# ${DRINK_INSTRUCTIONS}`,
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !warn ----
  if (matchesCommand(content, '!warn')) {
    const args = content.split(/\s+/).slice(1);
    const sub = (args[0] || '').toLowerCase();

    // ---- !warn show, or !warn history with no target ---- (open to everyone) — full listing,
    // globally numbered so `!warn remove <number>` can reference exactly what's shown here.
    if (sub === 'show' || (sub === 'history' && !args[1])) {
      await renderWarnShowList(message);
      return;
    }

    // ---- !warn history <name/ID/mention> ---- (open to everyone) — scoped to one person, and
    // never pings them: the target can be typed as a name, so a mention isn't required.
    if (sub === 'history') {
      const target = await resolveWarnTarget(message.guild, args[1]);
      if (!target) {
        message.reply({
          content: 'Couldn\'t find that member. Try `!warn history <name>`, an ID, or a mention.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const historyName = warnTargetLabel(target.id, target.member);
      const warnings = loadWarnings();
      const flat = buildFlattenedWarnings(warnings).filter((it) => it.userId === target.id);
      const hideModerator = shouldHideWarnModerator(message);

      if (flat.length === 0) {
        await deliverWarnHistoryOutput(message, `**${historyName}** has no warnings recorded.`);
        return;
      }

      const MAX_HISTORY_RECORDS = 15;
      const recordsToShow = flat.slice(-MAX_HISTORY_RECORDS);
      const omittedCount = flat.length - recordsToShow.length;
      const lines = recordsToShow
        .map((it) => formatWarnLine(it, hideModerator))
        .join('\n');
      const description = omittedCount > 0
        ? `${lines}\n*(+${omittedCount} earlier warning${omittedCount === 1 ? '' : 's'} not shown)*`
        : lines;

      const embed = new EmbedBuilder()
        .setTitle(`📖 Warning History — ${historyName}`)
        .setColor(0x8b0000)
        .setDescription(description)
        .setFooter({ text: `${flat.length} total warning${flat.length > 1 ? 's' : ''}` });

      await deliverWarnHistoryOutput(message, { embeds: [embed] });

      return;
    }

    // Everything past this point (issuing a warning, removing/clearing history) is gated by
    // isPunitiveModerator() (Council/Knight/Guild Leader — NOT Emissary) rather than the broader
    // isCouncil() tier.
    if (!isPunitiveModerator(message.member)) {
      // Bare `!warn` (no sub, no @mention) from a regular member — instead of a flat denial,
      // give them the History-only button menu (see startMemberWarnHistoryMenu()). Anything else
      // (they typed a sub-command other than show/history, or tried @mentioning someone) is still
      // a genuine attempt to use a moderator-only path, so that still gets denied below.
      if (!sub && !message.mentions.members?.size) {
        await startMemberWarnHistoryMenu(message).catch((err) => {
          console.error('!warn member history menu failed:', err);
        });
        return;
      }
      replyCouncilDenied(message, 'Warn someone', [
        'The Tavernkeep raises an eyebrow. "The grimoire isn\'t for wandering hands, little one."',
        'The Tavernkeep\'s tail lashes once. "The quill stays with the Council. You\'ll have to make do with gossip instead."',
        'The Tavernkeep flicks an ear toward the grimoire, unimpressed. "That book bites paws that don\'t belong to it."',
      ]);
      return;
    }

    const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);

    // ---- !warn remove <name/ID/number> ---- Council/Knight/Sentinel/Guild Leader only — NOT
    // Emissary (isPunitiveModerator(), checked above). A short number (1-4 digits) refers
    // to a specific warning entry, as numbered in !warn show/!warn history; anything else is
    // treated as a member lookup and removes their whole history. Either way, nothing is deleted
    // until the moderator confirms — and neither the prompt nor the result pings the target.
    if (sub === 'remove') {
      const rawTarget = args[1];
      if (!rawTarget) {
        message.reply('Usage: `!warn remove <name/ID/mention>` or `!warn remove <number>`');
        return;
      }

      const isIndexRemoval = /^\d{1,4}$/.test(rawTarget);

      if (isIndexRemoval) {
        const warnings = loadWarnings();
        const flat = buildFlattenedWarnings(warnings);
        const item = flat.find((it) => it.number === Number(rawTarget));
        if (!item) {
          message.reply(`No warning #${rawTarget} found. Check \`!warn show\` for current numbers.`);
          return;
        }
        const member = await message.guild.members.fetch(item.userId).catch(() => null);
        const label = warnTargetLabel(item.userId, member);

        const confirmed = await awaitYesNoButtons(
          message,
          `Remove warning **#${item.number}** from **${label}** — "${item.record.reason}"?`,
          { allowedMentions: { parse: [] } }
        );
        if (confirmed === null) {
          message.reply('No response — cancelled.');
          return;
        }
        if (!confirmed) {
          message.reply('Cancelled — nothing removed.');
          return;
        }

        // Re-load in case anything changed while waiting on confirmation.
        const freshWarnings = loadWarnings();
        const records = freshWarnings[item.userId] || [];
        records.splice(item.idxInUser, 1);
        if (records.length === 0) delete freshWarnings[item.userId];
        else freshWarnings[item.userId] = records;
        saveWarnings(freshWarnings);

        message.reply(`Warning **#${item.number}** removed from **${label}**.`);
        if (grimoire) {
          grimoire.send(`🗑️ Warning #${item.number} ("${item.record.reason}") removed from ${label} (${item.userId}) by ${message.author.tag}.`);
        }
        await maybeAnnounceRemoval(
          message,
          `🕯️ The Tavernkeep flips back a page — a warning against **${label}** has been struck from the grimoire.`
        );
        return;
      }

      // ---- member-based removal (wipes their whole history) ----
      const target = await resolveWarnTarget(message.guild, rawTarget);
      if (!target) {
        message.reply({
          content: 'Couldn\'t find that member. Try a name, ID, or mention.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }
      const label = warnTargetLabel(target.id, target.member);
      const warnings = loadWarnings();
      const records = warnings[target.id] || [];
      if (records.length === 0) {
        message.reply(`**${label}** has no warnings recorded.`);
        return;
      }

      const confirmed = await awaitYesNoButtons(
        message,
        `Remove all **${records.length}** warning${records.length > 1 ? 's' : ''} from **${label}**?`,
        { allowedMentions: { parse: [] } }
      );
      if (confirmed === null) {
        message.reply('No response — cancelled.');
        return;
      }
      if (!confirmed) {
        message.reply('Cancelled — nothing removed.');
        return;
      }

      const freshWarnings = loadWarnings();
      delete freshWarnings[target.id];
      saveWarnings(freshWarnings);

      message.reply(`The Tavernkeep tears the pages from the grimoire. **${label}**'s slate is clean.`);
      if (grimoire) {
        grimoire.send(`🗑️ All warnings for ${label} (${target.id}) removed by ${message.author.tag}.`);
      }
      await maybeAnnounceRemoval(
        message,
        `🕯️ The Tavernkeep clears the air — **${label}**'s warnings have been wiped clean. A fresh start, traveller.`
      );
      return;
    }

    // ---- !warn clear @user ---- (kept for backwards compatibility with `!warn remove <name>`;
    // now routes through the same Yes/No confirmation as every other destructive warn action.)
    if (sub === 'clear') {
      const targetToClear = message.mentions.members?.first();
      if (!targetToClear) {
        message.reply('Usage: `!warn clear @user`');
        return;
      }

      const clearLabel = warnTargetLabel(targetToClear.id, targetToClear);
      const warnings = loadWarnings();
      const hadWarnings = warnings[targetToClear.id] && warnings[targetToClear.id].length > 0;

      if (!hadWarnings) {
        message.reply({ content: `**${clearLabel}** had no warnings recorded.`, allowedMentions: { parse: [] } });
        return;
      }

      const confirmed = await awaitYesNoButtons(
        message,
        `Clear all warnings from **${clearLabel}**?`,
        { allowedMentions: { parse: [] } }
      );
      if (confirmed === null) {
        message.reply('No response — cancelled.');
        return;
      }
      if (!confirmed) {
        message.reply('Cancelled — nothing cleared.');
        return;
      }

      // Re-load in case anything changed while waiting on confirmation.
      const freshWarnings = loadWarnings();
      delete freshWarnings[targetToClear.id];
      saveWarnings(freshWarnings);

      message.reply({
        content: `The Tavernkeep tears the page from the grimoire. **${clearLabel}**'s slate is clean.`,
        allowedMentions: { parse: [] },
      });

      if (grimoire) {
        grimoire.send(`🧹 ${clearLabel} (${targetToClear.id})'s warnings were cleared by ${message.author.tag}.`);
      }
      await maybeAnnounceRemoval(
        message,
        `🕯️ The Tavernkeep clears the air — **${clearLabel}**'s warnings have been wiped clean. A fresh start, traveller.`
      );
      return;
    }

    // ---- !warn @user [#channel] reason ----
    const targetMember = message.mentions.members?.first();
    if (!targetMember) {
      // No @mention given — launch the interactive picker instead of just bouncing back usage
      // text: pick a member from the whole guild via dropdown, type the reason in a popup, then
      // the same Announce/No prompt as below.
      await startWarnMenu(message).catch((err) => {
        console.error('!warn interactive flow failed:', err);
      });
      return;
    }

    if (targetMember.roles.cache.has(GUILD_LEADER_ROLE_ID)) {
      message.reply({
        content: `The Tavernkeep's paws freeze mid-swipe. "Warn ${targetMember}? I know my place, traveller — and it isn't that."`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // Delete the moderator's own command message right away — nobody watching the channel
    // (including the person being warned, if they can see it) should be able to tell who ran it.
    // From here on we use message.channel/message.author directly instead of message.reply(),
    // since replying to a now-deleted message would leave a dangling "original message deleted"
    // reference behind.
    message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));

    // Optional message link — `!warn @user <message link> reason` — if given, the warning is
    // posted as a reply to that exact message instead of a fresh message, so the person (and
    // anyone reviewing later) can see exactly what it was about. Since a reply has to live in the
    // same channel as the message it's replying to, a resolved link takes priority over an
    // explicit #channel below; a bad/unfetchable link just falls back to normal posting.
    const MESSAGE_LINK_RE = /https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/\d+\/(\d+)\/(\d+)/;
    const linkArg = args.find((arg) => MESSAGE_LINK_RE.test(arg));
    let linkedMessage = null;
    if (linkArg) {
      const [, linkChannelId, linkMessageId] = MESSAGE_LINK_RE.exec(linkArg);
      const linkedChannel = await message.guild.channels.fetch(linkChannelId).catch(() => null);
      linkedMessage = linkedChannel ? await linkedChannel.messages.fetch(linkMessageId).catch(() => null) : null;
    }

    // Optional target channel — if a #channel is given, the public message posts there, exactly
    // as chosen. If no channel is given at all, default to the Tavern rather than wherever the
    // command happened to be typed — since that's an implicit choice rather than a deliberate
    // one, the message is deleted again a few seconds later so it doesn't linger publicly; its
    // only job is to get the notification out. A resolved message link overrides both, since the
    // reply has to post in that message's own channel.
    const explicitChannel = message.mentions.channels?.first();
    const targetChannel = linkedMessage
      ? linkedMessage.channel
      : explicitChannel || await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null) || message.channel;
    // Explicit channel AND a resolved message link both count as a deliberate destination —
    // neither should self-delete the way the implicit Tavern default does.
    const autoPosted = !explicitChannel && !linkedMessage;

    // Strip the user mention, channel mention, and message link (if present) from the args to get
    // just the reason
    const reasonParts = args.filter((arg) => !arg.startsWith('<@') && !arg.startsWith('<#') && !MESSAGE_LINK_RE.test(arg));
    const reason = reasonParts.join(' ').trim() || 'No reason given';

    // Optional photo — any image(s) attached directly to the `!warn` command message get carried
    // over onto the public warning post (e.g. a screenshot of the offending message).
    const warnAttachments = [...message.attachments.values()].filter((a) => a.contentType?.startsWith('image/'));

    await issueWarning(message, grimoire, targetMember, reason, {
      targetChannel,
      linkedMessage,
      linkArg,
      autoPosted,
      warnAttachments,
    });

    return;
  }

  // ---- !ban ---- Council/Guild Leader ONLY (isHighCouncilOrGuildLeader — the
  // NARROWEST tier in this file; deliberately excludes Knight and Emissary, unlike every other
  // moderation command). Same shape as !warn: bare `!ban` opens the interactive picker
  // (startBanMenu), `!ban @user reason` runs the direct path below. Either way, issueBan() adds
  // a "banish? yes/no" confirmation (since it's permanent) before the Announce/No prompt.
  if (matchesCommand(content, '!ban')) {
    if (!isHighCouncilOrGuildLeader(message.member)) {
      replyCouncilDenied(message, 'Wield the banhammer', [
        'The Tavernkeep\'s ears flatten. "The banhammer stays behind the bar, little one — that\'s not a toy for wandering paws."',
        'The Tavernkeep steps between you and the door. "Only the Council and its Leader decide who walks out that way."',
      ]);
      return;
    }

    const args = content.split(/\s+/).slice(1);
    const targetMember = message.mentions.members?.first();

    if (!targetMember) {
      // No @mention given — launch the interactive picker (guild-wide member search, reason
      // popup, then the same confirm -> Announce/No flow as the direct path below).
      await startBanMenu(message).catch((err) => {
        console.error('!ban interactive flow failed:', err);
      });
      return;
    }

    if (targetMember.user.bot) {
      message.reply({
        content: 'The Tavernkeep tilts his head. "That one\'s made of gears, not manners — no banishing needed."',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    if (targetMember.roles.cache.has(GUILD_LEADER_ROLE_ID)) {
      message.reply({
        content: `The Tavernkeep's paws freeze mid-swipe. "Banish ${targetMember}? I know my place, traveller — and it isn't that."`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // Delete the moderator's own command message right away — same anonymity rule as !warn:
    // nobody watching the channel should be able to tell who ran it.
    message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));

    const reasonParts = args.filter((arg) => !arg.startsWith('<@'));
    const reason = reasonParts.join(' ').trim() || 'No reason given';

    const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
    const targetChannel = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null) || message.channel;

    await issueBan(message, grimoire, targetMember, reason, { targetChannel });

    return;
  }

  // ---- !curse <name/ID/mention>  or  !curse search ---- Mods/Sentinel/Emissary/Guild Leader
  // only (isCouncil — the same access tier as !cast's full spellbook). Forces a random speech
  // flair onto the target for a full day, using the same curseFlairs stack as applyModCurseFlair
  // (see there): non-drinkable, non-parryable, immune to being overwritten by anyone else's
  // !cast/!throw/!serve/!toast, and stacks — cursing someone already cursed just piles another
  // one on top instead of refreshing/replacing it.
  //
  // The caster is never named publicly. The command message is deleted immediately, the whole
  // search/target-resolution flow (if any) runs privately in the grimoire channel, and the only
  // place the caster's name ever appears is the secret grimoire log below. An optional public
  // Tavern announcement is available via an Announce/No prompt, but even that never says who
  // cast it — only that the curse landed.
  if (matchesCommand(content, '!curse')) {
    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'Curse someone', [
        'The Tavernkeep\'s claws twitch toward the hex-jar, then stop. "That jar isn\'t for wandering paws, traveller."',
        'The Tavernkeep tucks the jar back under the bar. "Curses stay with the Council, the Sentinels, and the Emissaries. You\'ll have to settle for gossip."',
      ]);
      return;
    }

    const curseArgs = content.split(/\s+/).slice(1);
    const curseSub = (curseArgs[0] || '').toLowerCase();

    // ---- !curse clear <name/ID/mention> ---- lifts every active curse on the target at once.
    // Unlike casting a curse, lifting one isn't kept secret — same as !warn remove, the mod's own
    // command message stays up and the log names them without any special anonymity handling.
    if (curseSub === 'clear') {
      const rawTarget = curseArgs[1];
      if (!rawTarget) {
        message.reply('Usage: `!curse clear <name/ID/mention>`');
        return;
      }

      const target = await resolveWarnTarget(message.guild, rawTarget);
      if (!target || !target.member) {
        message.reply({
          content: 'Couldn\'t find that member. Try a name, ID, or mention.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const drinks = loadDrinks();
      // getPlayer() prunes expired entries from both stacks, so these counts only ever reflect
      // curses that are still actually active.
      const player = getPlayer(drinks, target.member.id);
      const modCurseCount = Array.isArray(player.curseFlairs) ? player.curseFlairs.length : 0;
      // !curse clear is meant to be the one command mods reach for whenever someone is visibly
      // still speaking cursed — that includes warnFlairs (the automatic tier-1/2 warning penalty,
      // see applyWarnPenaltyFlair/WARNING_TIERS), not just curses cast via !curse. From a member's
      // perspective both are "the curse"; !warn remove only deletes the warning record and was
      // never able to lift this half of it, which is why a lifted/removed warning could still
      // leave someone stuck cursed for days.
      const warnFlairCount = Array.isArray(player.warnFlairs) ? player.warnFlairs.length : 0;
      const activeCurseCount = modCurseCount + warnFlairCount;
      const label = warnTargetLabel(target.member.id, target.member);

      if (activeCurseCount === 0) {
        message.reply({
          content: `**${label}** isn't currently cursed.`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const confirmed = await awaitYesNoButtons(
        message,
        `Lift **all ${activeCurseCount}** active curse${activeCurseCount === 1 ? '' : 's'} from **${label}**` +
          `${warnFlairCount > 0 ? ` (${modCurseCount} mod-cast, ${warnFlairCount} from warning penalties)` : ''}?`,
        { allowedMentions: { parse: [] } }
      );
      if (confirmed === null) {
        message.reply('No response — cancelled.');
        return;
      }
      if (!confirmed) {
        message.reply('Cancelled — the curse(s) stay as they were.');
        return;
      }

      // Re-load in case anything changed while waiting on confirmation (e.g. another mod cursed
      // or cleared them in the meantime).
      const freshDrinks = loadDrinks();
      const freshPlayer = getPlayer(freshDrinks, target.member.id);
      const clearedModCurses = Array.isArray(freshPlayer.curseFlairs) ? freshPlayer.curseFlairs.length : 0;
      const clearedWarnFlairs = Array.isArray(freshPlayer.warnFlairs) ? freshPlayer.warnFlairs.length : 0;
      const clearedCount = clearedModCurses + clearedWarnFlairs;
      freshPlayer.curseFlairs = [];
      freshPlayer.warnFlairs = [];
      saveDrinks(freshDrinks);

      message.reply(`🔮 Lifted **${clearedCount}** curse${clearedCount === 1 ? '' : 's'} from **${label}**.`);

      const clearGrimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
      if (clearGrimoire) {
        clearGrimoire.send(`🧹 ${clearedCount} curse(s) lifted from ${label} (${target.member.id}) by ${message.author.tag} (${clearedModCurses} mod-cast, ${clearedWarnFlairs} warning-penalty).`);
      }
      await maybeAnnounceRemoval(
        message,
        `🔮 The Tavernkeep waves a paw — the curse over **${label}** lifts at last.`
      );
      return;
    }

    const rawArg = (curseArgs[0] || '').trim();
    if (!rawArg) {
      message.reply('Usage: `!curse <name/ID/mention>` or `!curse search`');
      return;
    }

    // Delete the mod's own command message right away — nobody watching the channel should be
    // able to tell who ran this, same as !warn above.
    message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));

    const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
    const workChannel = grimoire || message.channel;

    let targetMember = null;

    if (rawArg.toLowerCase() === 'search') {
      const searchRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cursepick:search').setLabel('Search for a member').setEmoji('🔍').setStyle(ButtonStyle.Secondary)
      );
      const picker = await workChannel.send({
        content: '🔮 Preparing a curse — search for who it lands on:',
        components: [searchRow],
      }).catch(() => null);
      if (!picker) return;

      const click = await picker
        .awaitMessageComponent({
          filter: (i) => i.user.id === message.author.id && i.customId === 'cursepick:search',
          time: 60000,
        })
        .catch(() => null);

      if (!click) {
        await picker.edit({ content: '🕰️ No response in time — nothing happened.', components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
        return;
      }

      // Reused as-is from the !warn menu — 'The curse-caster' stands in for the mod's name so
      // none of interactiveMemberSearch's own status text (which normally prints the caller's
      // display name) leaks who's actually running the search.
      const result = await interactiveMemberSearch(message, picker, click, 'The curse-caster');
      if (!result) return;
      targetMember = result.targetMember;
    } else {
      const resolved = await resolveWarnTarget(message.guild, rawArg);
      if (!resolved || !resolved.member) {
        workChannel.send('Couldn\'t find that member. Try a name, ID, mention, or `!curse search`.').catch((err) => console.error('Discord API call failed (non-critical):', err));
        return;
      }
      targetMember = resolved.member;
    }

    if (!targetMember) return;

    // Same protected-role treatment as everywhere else a hostile effect can be aimed — the
    // Tavernkeep himself and the Guild Leader are both off-limits (see TAVERNKEEP_ID / !warn's
    // GUILD_LEADER_ROLE_ID guard above).
    if (targetMember.id === TAVERNKEEP_ID) {
      workChannel.send('The Tavernkeep raises an unimpressed eyebrow. Curses don\'t work on the one holding the jar.').catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }
    if (targetMember.roles.cache.has(GUILD_LEADER_ROLE_ID)) {
      workChannel.send('The hex-jar rattles and refuses to open. Not for the Guild Leader, traveller.').catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    const drinks = loadDrinks();
    const player = getPlayer(drinks, targetMember.id);
    const curseEntry = applyModCurseFlair(player, MOD_CURSE_MS);
    saveDrinks(drinks);

    const label = warnTargetLabel(targetMember.id, targetMember);
    const curseHours = Math.round(MOD_CURSE_MS / 3600000);
    const effect = FLAIR_EFFECTS[curseEntry.id];
    const flairLabel = effect ? effect.label : 'a strange new habit';

    // Secret log — always posted, regardless of whether the public announce prompt is used.
    // This is the ONLY place the caster's name ever appears for this action.
    if (grimoire) {
      const logEmbed = new EmbedBuilder()
        .setTitle('🔮 Curse Cast')
        .setColor(0x4b0082)
        .addFields(
          { name: 'User', value: `${targetMember} (${targetMember.id})` },
          { name: 'Flair', value: flairLabel },
          { name: 'Duration', value: `${curseHours} hours (non-drinkable, non-parryable, stacks)` },
          { name: 'Cast By', value: message.author.tag },
        );
      grimoire.send({ embeds: [logEmbed] }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }

    const { confirmed, prompt, timedOut } = await awaitAnnounceButtons(
      workChannel,
      message.author.id,
      `📣 Curse landed on ${targetMember} — announce it publicly in the Tavern? (Stays anonymous either way.)`,
      { allowedMentions: { users: [] } }
    );

    if (confirmed) {
      const tavern = await message.guild.channels.fetch(TAVERN_CHANNEL_ID).catch(() => null);
      if (tavern) {
        tavern.send(
          `🔮 A curse settles over **${label}** from nowhere anyone can see — their words aren't fully their own for the next **${curseHours} hours**. No water will wash it off, and no parry will shake it loose.`
        ).catch((err) => console.error('Discord API call failed (non-critical):', err));
      }
      await prompt.edit({ content: `📣 Curse on ${targetMember} announced in the Tavern — anonymously.`, components: [], allowedMentions: { users: [] } }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    } else {
      const declineNote = timedOut ? ' *(no response — defaulted to not announcing)*' : '';
      await prompt.edit({ content: `🤫 Curse on ${targetMember} logged quietly — not announced.${declineNote}`, components: [], allowedMentions: { users: [] } }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    }

    return;
  }

  // ---- !mute <duration> @user — timeout a member for the given duration ----
  // Accessible to Council, Sentinels (officers), and the Guild Leader.
  if (matchesCommand(content, '!mute')) {
    if (!canMuteMembers(message.member)) {
      replyCouncilDenied(message, 'Mute someone', [
        'The Tavernkeep\'s tail curls around the cellar key, just out of reach. "That door stays shut unless you\'re Council, Sentinel, or the Guild Leader themself."',
      ]);
      return;
    }

    const targetMember = message.mentions.members?.first();
    const args = content.split(/\s+/).slice(1).filter((a) => !a.startsWith('<@'));
    const durationArg = args.find((a) => MUTE_DURATION_ARG_RE.test(a));
    const parsedDuration = durationArg ? parseMuteDuration(durationArg) : null;

    if (!targetMember || !parsedDuration) {
      message.reply({
        content:
          'Usage: `!mute <duration> @user` — e.g. `!mute 3 @test` (days, same as before), or `!mute 30s @test`, ' +
          '`!mute 10m @test`, `!mute 2h @test`, `!mute 3d @test`.',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // Discord caps timeouts at 28 days — clamp instead of letting the API call fail outright.
    const MAX_MUTE_MS = 28 * 24 * 60 * 60 * 1000;
    const durationMs = Math.min(parsedDuration.ms, MAX_MUTE_MS);
    const wasClamped = parsedDuration.ms > MAX_MUTE_MS;
    const durationLabel = wasClamped ? '28 days' : parsedDuration.label;

    // Anything after the duration and the mention is treated as an optional reason.
    // Only drop the single arg that was actually matched as the duration (by index), not
    // every arg that happens to equal that string — e.g. `!mute 3d @user said 3d was fair`
    // should only strip the first `3d`, not both.
    const durationArgIndex = args.indexOf(durationArg);
    const reason = args.filter((_, i) => i !== durationArgIndex).join(' ').trim();

    try {
      await targetMember.timeout(durationMs, reason ? `Muted by ${message.author.tag}: ${reason}` : `Muted by ${message.author.tag}`);
      message.reply({
        content:
          `The Tavernkeep grabs ${targetMember} by the collar and marches them to the cellar for **${durationLabel}**.` +
          (reason ? ` "${reason}," he mutters, locking the door.` : ' Think on your manners down there.') +
          (wasClamped ? `\n-# ⏳ Capped at Discord's 28-day max — you asked for ${parsedDuration.label}.` : ''),
        allowedMentions: { repliedUser: false },
      });

      const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
      if (grimoire) {
        grimoire.send(
          `🔇 <@${targetMember.id}> was muted for ${durationLabel} by ${message.author.tag}${reason ? ` — reason: ${reason}` : ''}.`
        );
      }
    } catch (err) {
      console.error('Failed to apply timeout via !mute:', err);
      message.reply('The cellar door won\'t budge — check my role permissions/hierarchy.');
    }
    return;
  }

  // ---- !unmute @user ----
  if (matchesCommand(content, '!unmute')) {
    if (!canMuteMembers(message.member)) {
      replyCouncilDenied(message, 'Unmute someone', [
        'The Tavernkeep\'s tail curls around the cellar key, just out of reach. "That door stays shut unless you\'re Council, Sentinel, or the Guild Leader themself."',
      ]);
      return;
    }

    const targetMember = message.mentions.members?.first();
    if (!targetMember) {
      message.reply('Usage: `!unmute @user`');
      return;
    }

    if (!targetMember.communicationDisabledUntilTimestamp || targetMember.communicationDisabledUntilTimestamp < Date.now()) {
      message.reply({
        content: `The Tavernkeep tilts his head. "${targetMember} isn't in the cellar to begin with, traveller."`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    try {
      await targetMember.timeout(null, `Unmuted by ${message.author.tag}`);
      message.reply({
        content: `The Tavernkeep jingles the cellar key and unlocks the door. "Out you come, then." ${targetMember} is free to return.`,
        allowedMentions: { repliedUser: false },
      });
      const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
      if (grimoire) {
        grimoire.send(`🔓 <@${targetMember.id}> was unmuted by ${message.author.tag}.`);
      }
    } catch (err) {
      console.error('Failed to remove timeout:', err);
      message.reply('The cellar door won\'t budge — check my role permissions/hierarchy.');
    }
    return;
  }

  // ---- !shout / !message #channel message ----
  if (matchesCommand(content, '!shout') || matchesCommand(content, '!message')) {
    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'Speak through me', [
        'The Tavernkeep\'s whiskers twitch. "My voice isn\'t for borrowing, little traveller. Not without Council leave."',
      ]);
      return;
    }

    const targetChannel = message.mentions.channels?.first();
    if (!targetChannel) {
      message.reply('Usage: `!shout #channel your message here`');
      return;
    }

    // Strip the leading command word and the channel mention to get the message text
    const args = content.split(/\s+/).slice(1);
    const shoutMessage = args.filter((arg) => !arg.startsWith('<#')).join(' ').trim();

    if (!shoutMessage) {
      message.reply('Usage: `!shout #channel your message here`');
      return;
    }

    try {
      await targetChannel.send(`The Tavernkeep speaks: "${shoutMessage}"`);
      message.reply({
        content: `Message delivered to ${targetChannel}.`,
        allowedMentions: { repliedUser: false },
      });
      // Best-effort cleanup so the shout doesn't obviously trace back to the caller's command
      message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));

      const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
      if (grimoire) {
        grimoire.send(`📢 ${message.author.tag} used the Tavernkeep to speak in ${targetChannel}: "${shoutMessage}"`);
      }
    } catch (err) {
      console.error('Failed to send shout message:', err);
      message.reply('The Tavernkeep clears his throat, but nothing comes out — check my permissions in that channel.');
    }
    return;
  }

  // ---- !enable / !disable — toggles whether officers (Knight) can use the channel-wide cast ----
  // Guild Leader or Council only. Council and Guild Leader
  // always have channel-wide cast access regardless of this setting — this only ever extends it
  // down to Knight/officers.
  if (matchesCommand(content, '!enable') || matchesCommand(content, '!disable')) {
    if (!canToggleOfficerCast(message.member)) {
      replyCouncilDenied(message, 'Change that setting', [
        'The Tavernkeep taps the grimoire shut. "That\'s a Guild Leader or Council decision, traveller. Not yours to make."',
      ]);
      return;
    }

    const enabling = matchesCommand(content, '!enable');
    const settings = loadSettings();

    if (settings.officerChannelCastEnabled === enabling) {
      message.reply({
        content: enabling
          ? 'The channel-wide cast is already open to officers.'
          : 'The channel-wide cast is already Council (and Guild Leader) only.',
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    settings.officerChannelCastEnabled = enabling;
    saveSettings(settings);
    flushSettingsToDisk();

    message.reply({
      content: enabling
        ? '🔓 Officers (Knight) can now use the channel-wide cast (`!cast #channel`).'
        : '🔒 The channel-wide cast (`!cast #channel`) is back to Council (and Guild Leader) only.',
      allowedMentions: { repliedUser: false },
    });

    const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);
    if (grimoire) {
      grimoire.send(
        `⚙️ ${message.author.tag} ${enabling ? 'enabled' : 'disabled'} officer access to the channel-wide cast.`
      );
    }
    return;
  }

  // ---- !cast spells | !cast <spell> [status effect] @user [#channel] ----
  if (matchesCommand(content, '!cast')) {
    // ---- Members: stripped-down `!cast @user` — random flair only, can't self-cast, 3 min cooldown.
    // Council/Knight fall through to the full spellbook below instead (no cooldown, any spell/status).
    if (!isCouncil(message.member)) {
      // Reserved subcommand words belong to the Council-only spellbook below (`!cast clear`,
      // `!cast spell`, `!cast spells`, `!cast list`, `!cast variants`). A member typing one of
      // these — e.g. trying `!cast clear @user` to sober a friend up — must NOT fall through to
      // the random-flair path below, or the mentioned user gets accidentally cursed instead of
      // cleared, since that path only looks at message.mentions and ignores this word entirely.
      const memberParts = content.split(/\s+/);
      const memberSub = (memberParts[1] || '').toLowerCase();
      const RESERVED_CAST_WORDS = new Set(['clear', 'spell', 'spells', 'list', 'variants']);
      if (RESERVED_CAST_WORDS.has(memberSub)) {
        if (memberSub === 'clear') {
          message.reply({
            content:
              'The Tavernkeep shakes his head. "That\'s a Council spell, traveller — I can\'t clear someone\'s state for you." ' +
              'If you want to sober up yourself, try `!drink water`. To clear someone else, ask a Council or Knight member for `!cast clear @user`.',
            allowedMentions: { repliedUser: false },
          });
        } else {
          message.reply({
            content: `Usage: \`!cast @user\` — cast a random spell on someone else, nya. ("${memberSub}" is a Council-only spellbook command.)`,
            allowedMentions: { repliedUser: false },
          });
        }
        return;
      }

      const memberTarget = message.mentions.members?.first();
      if (!memberTarget) {
        message.reply({
          content: 'Usage: `!cast @user` — cast a random spell on someone else, nya.',
          allowedMentions: { repliedUser: false },
        });
        return;
      }
      if (memberTarget.id === message.author.id) {
        message.reply({
          content: 'The Tavernkeep raises an eyebrow. "Casting on yourself? Pick someone else, traveller."',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      if (isGolemProtected(memberTarget)) {
        const drinks = loadDrinks();
        const caster = getPlayer(drinks, message.author.id);
        const now = Date.now();
        caster.stats.castCount++;
        applyGolemCurse(caster, now);
        saveDrinks(drinks);
        scheduleGolemCurseExpiry(message.author.id, message.channel);

        const casterName = message.member.displayName || message.author.username;
        const bLine = GOLEM_CURSE_BACKFIRE_LINES[Math.floor(Math.random() * GOLEM_CURSE_BACKFIRE_LINES.length)](casterName);
        try {
          await message.channel.send({
            content: `${bLine}\n${buildGolemCurseAnnouncement()}`,
            allowedMentions: { parse: [] },
          });
        } catch (err) {
          console.error('Failed to announce golem curse backfire:', err);
          message.reply('The spell fizzles — check my permissions in this channel.');
          return;
        }
        return;
      }

      if (memberTarget.id === TAVERNKEEP_ID) {
        const drinks = loadDrinks();
        const caster = getPlayer(drinks, message.author.id);
        const now = Date.now();
        const castCooldown = checkCooldown(caster, 'lastCastUse', MEMBER_CAST_COOLDOWN_MS, now);

        if (castCooldown.onCooldown) {
          message.reply({
            content: `The Tavernkeep holds the spellbook shut. "One spell at a time, traveller — try again in **${castCooldown.remainingLabel}**."`,
            allowedMentions: { repliedUser: false },
          });
          saveDrinks(drinks);
          return;
        }

        caster.lastCastUse = now;
        caster.stats.castCount++;

        const spell = SPELLS.spell;
        const statusId = spell.randomPool[Math.floor(Math.random() * spell.randomPool.length)];
        const appliedStatus = spell.cast(caster, statusId);
        caster.activeFlair = { id: appliedStatus.flair, expiresAt: now + TAVERNKEEP_BOUNCE_MS, guaranteed: true };

        recordAttack(
          caster,
          message.author.id,
          { meterDelta: 0, flairId: appliedStatus.flair, flairDurationMs: TAVERNKEEP_BOUNCE_MS },
          'cast'
        );
        saveDrinks(drinks);

        const casterName = message.member.displayName || message.author.username;
        const bounceLines = [
          `The Tavernkeep doesn't even blink. The spell fizzles off him entirely and snaps right back onto **${casterName}**!`,
          `"You'll have to try harder than that." The Tavernkeep waves a claw, and the spell reverses course, landing square on **${casterName}**.`,
          `The magic slides right off the Tavernkeep's fur and rebounds — **${casterName}** takes the full effect instead.`,
        ];
        const bLine = bounceLines[Math.floor(Math.random() * bounceLines.length)];
        const minutes = Math.round(TAVERNKEEP_BOUNCE_MS / 60000);

        try {
          await message.channel.send({
            content: `${bLine}\n${buildSpellFlairAnnouncement(appliedStatus.flair)} (~${minutes}m, full strength)`,
            allowedMentions: { parse: [] },
          });
        } catch (err) {
          console.error('Failed to announce member spell bounce:', err);
          message.reply('The spell fizzles — check my permissions in this channel.');
          return;
        }

        scheduleAutoSober(message.author.id, message.channel, TAVERNKEEP_BOUNCE_MS);
        return;
      }

      const drinks = loadDrinks();
      const caster = getPlayer(drinks, message.author.id);
      const now = Date.now();
      const castCooldown = checkCooldown(caster, 'lastCastUse', MEMBER_CAST_COOLDOWN_MS, now);

      if (castCooldown.onCooldown) {
        message.reply({
          content: `The Tavernkeep holds the spellbook shut. "One spell at a time, traveller — try again in **${castCooldown.remainingLabel}**."`,
          allowedMentions: { repliedUser: false },
        });
        saveDrinks(drinks);
        return;
      }

      caster.lastCastUse = now;
      caster.stats.castCount++;

      const spell = SPELLS.spell;
      const statusId = spell.randomPool[Math.floor(Math.random() * spell.randomPool.length)];
      const target = getPlayer(drinks, memberTarget.id);
      const appliedStatus = spell.cast(target, statusId);
      // Use the flair's actual configured duration (statuses default to 20m), not the generic
      // 10-minute AUTO_SOBER_MS — otherwise the auto-sober timer below kills the flair early.
      const flairDurationMs = (appliedStatus.flairMinutes || 20) * 60 * 1000;

      recordAttack(
        target,
        message.author.id,
        { meterDelta: 0, flairId: appliedStatus.flair, flairDurationMs },
        'cast'
      );
      saveDrinks(drinks);

      const casterName = message.member.displayName || message.author.username;
      const targetName = memberTarget.displayName || memberTarget.user.username;
      const { header, flavor } = buildCastFlavor('spell', casterName, targetName);
      let resultLine = `${header}\n*${flavor}*`;
      if (appliedStatus.flair) {
        resultLine += `\n${buildSpellFlairAnnouncement(appliedStatus.flair)}`;
      }

      try {
        await message.channel.send({ content: resultLine, allowedMentions: { parse: [] } });
      } catch (err) {
        console.error('Failed to announce member spell cast:', err);
        message.reply('The spell fizzles — check my permissions in this channel.');
        return;
      }

      scheduleAutoSober(memberTarget.id, message.channel, flairDurationMs);
      return;
    }

    const parts = content.split(/\s+/);

    // Alias: `!cast` and `!cast spell` are the same command. If the first argument is already
    // a user/channel mention rather than a subcommand word, it means the "spell" word was
    // skipped (e.g. `!cast @user`, `!cast #channel`, `!cast #channel #channel`) — splice it
    // back in so everything below still parses the same way.
    if (/^<[@#]/.test(parts[1] || '')) {
      parts.splice(1, 0, 'spell');
    }

    const sub = (parts[1] || '').toLowerCase();

    // !cast (bare) -> compact usage guide only, no per-spell fields, to avoid flooding the channel
    if (sub === '') {
      const embed = new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle('📖 The Tavernkeep\'s Spellbook')
        .setDescription(
          '**Usage** *(the word "spell" is optional — `!cast` and `!cast spell` work the same)*\n' +
          '🪄 `!cast @user` — cast on the current channel\n' +
          '📡 `!cast @user #channel` — cast, announced in another channel\n' +
          '📢 `!cast #channel` *(Council/Guild Leader; officers if `!enable`\'d)* — no @user = cast on EVERYONE who can see that channel\n' +
          '🙈 `!cast #channel #channel` *(same access)* — 1st channel is who gets hit, 2nd is where the announcement posts instead\n' +
          '🧍 `!cast` — omit @user to cast on **yourself**, handy for quickly testing\n' +
          '🎯 `!cast <status effect> @user` — cast a specific speech-flair *(any order/channel rules above still apply)*\n\n' +
          '🧹 `!cast clear #channel` — no user mentioned = clears EVERY tracked member\'s drunk state at once\n' +
          '📋 `!cast list` — see everyone currently tracked as drunk, guild-wide\n\n' +
          '📖 `!cast spells` — full list of castable spells and their status effects\n' +
          '🎭 `!cast variants` — list all the randomized clear-spell voicelines\n\n' +
          '💡 A spell-forced flair wears off on its own after 10 minutes.'
        );
      message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      return;
    }

    // !cast spells -> full list of every castable spell and its status effects
    if (sub === 'spells') {
      const embed = new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle('📖 The Tavernkeep\'s Spellbook — Full List')
        .setDescription('Use `!cast` alone for a quick usage reminder.');
      for (const [id, spell] of Object.entries(SPELLS)) {
        const statusIds = Object.keys(spell.statuses);
        const statusLine = statusIds.length
          ? `Status effects: ${statusIds.join(', ')}`
          : 'No status effects — always does the same thing.';
        embed.addFields({ name: `${spell.emoji} ${spell.name} (\`${id}\`)`, value: `${spell.description}\n${statusLine}` });
      }
      message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      return;
    }

    // !cast list -> everyone currently tracked as drunk, guild-wide (companion to !cast clear #channel).
    // Purely informational — nobody gets pinged here, since nothing's being applied to them.
    if (sub === 'list') {
      const drinks = loadDrinks();
      const activeEntries = [];
      for (const userId of Object.keys(drinks)) {
        const trackedPlayer = getPlayer(drinks, userId); // also decays + clears any expired flair
        if (trackedPlayer.drunkMeter > 0 || trackedPlayer.activeFlair) {
          activeEntries.push({ userId, trackedPlayer });
        }
      }
      saveDrinks(drinks); // persist the decay we just applied while scanning

      if (activeEntries.length === 0) {
        message.reply({
          content: 'The Tavernkeep glances around the hall. "Not a single drunk soul in the guild right now, nya."',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const lines = activeEntries.map(({ userId, trackedPlayer }) => {
        const cachedMember = message.guild.members.cache.get(userId);
        const name = cachedMember ? (cachedMember.displayName || cachedMember.user.username) : `Unknown member (${userId})`;
        const tier = getDrunkTier(trackedPlayer.drunkMeter);
        const flairEffect = trackedPlayer.activeFlair ? FLAIR_EFFECTS[trackedPlayer.activeFlair.id] : null;
        let flairPart = '';
        if (flairEffect) {
          const remainingMin = Math.max(1, Math.ceil((trackedPlayer.activeFlair.expiresAt - Date.now()) / 60000));
          flairPart = ` — ${flairEffect.label} (~${remainingMin}m left)`;
        }
        return `**${name}** — ${tier.label} (${Math.round(trackedPlayer.drunkMeter)}/100)${flairPart}`;
      });

      const embed = new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle('🍺 Currently Drunk — Guild-Wide')
        .setDescription(lines.join('\n'))
        .setFooter({ text: `${activeEntries.length} member${activeEntries.length === 1 ? '' : 's'} tracked — !cast clear @user or !cast clear #channel to sober someone up` });

      message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      return;
    }

    // !cast variants -> list every randomized clear-spell voiceline (Council/Knight only, same gate as !cast)
    if (sub === 'variants') {
      const embed = new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle('📖 Clear-Spell Voicelines')
        .setDescription('All the randomized flavor text `!cast clear` can roll, for reference.');

      embed.addFields({
        name: `✨ Guildmaster (Guild Leader)`,
        value: LEADER_CLEAR_VARIANTS
          .map((v, i) => `**${i + 1}. ${v.spell}** — *${v.flavor}*`)
          .join('\n'),
      });
      embed.addFields({
        name: `🪄 Everyone else (Council/Knight)`,
        value: GENERIC_CLEAR_VARIANTS
          .map((v, i) => `**${i + 1}. ${v.spellLabel}** — *${v.flavor}*`)
          .join('\n'),
      });
      embed.addFields({
        name: `🍺 Channel-wide clear closers`,
        value: CHANNEL_CLEAR_CLOSERS.map((line, i) => `**${i + 1}.** ${line}`).join('\n'),
      });

      message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      return;
    }

    const spellId = sub;
    const spell = SPELLS[spellId];
    if (!spell) {
      message.reply('The Tavernkeep flips through the grimoire and frowns. "No such spell, nya. Try `!cast spells` to see what I know."');
      return;
    }

    const casterName = getCasterName(message.member);
    let targetMember = message.mentions.members?.first();
    // Two #channel mentions are supported for channel-wide casts: the 1st is who gets hit,
    // the 2nd (optional) is where the announcement gets posted instead — so mods can cast on
    // a channel without the tell-tale cast message showing up in that same channel.
    const channelMentions = Array.from(message.mentions.channels?.values() || []);
    const mentionedChannel = channelMentions[0] || null;
    const grimoire = await message.guild.channels.fetch(GRIMOIRE_CHANNEL_ID).catch(() => null);

    // ---- Channel-wide clear: !cast clear #channel (no user mentioned) ----
    if (spellId === 'clear' && !targetMember) {
      if (!mentionedChannel) {
        message.reply(`Usage: \`!cast clear @user\` or \`!cast clear #channel\` to clear everyone's drunk state at once.`);
        return;
      }

      const { header, flavor } = buildCastFlavor('clear', casterName, `${mentionedChannel}`);
      const affected = clearAllDrunkStates();
      const closer = CHANNEL_CLEAR_CLOSERS[Math.floor(Math.random() * CHANNEL_CLEAR_CLOSERS.length)];

      try {
        await mentionedChannel.send({
          content: `${header}\n*${flavor}*${affected ? `\n(${affected} drunk member${affected === 1 ? '' : 's'} sobered up.)` : ''}\n${closer}`,
          allowedMentions: { parse: [] },
        });
      } catch (err) {
        console.error('Failed to announce channel-wide clear:', err);
        message.reply('The spell fizzles — check my permissions in that channel.');
        return;
      }

      if (mentionedChannel.id !== message.channel.id) {
        message.reply({ content: `Spell cast — announced in ${mentionedChannel}.`, allowedMentions: { repliedUser: false } });
      }
      if (grimoire) {
        grimoire.send(`🪄 ${message.author.tag} cast a channel-wide **Clear** in ${mentionedChannel} (${affected} member(s) sobered).`);
      }
      return;
    }

    // ---- Channel-wide spell cast: !cast spell #channel [#channel] (no user mentioned) ----
    // Hits every member who can see/talk in that channel with the same flair, guaranteed —
    // everyone affected talks in it on every message until it wears off, no roll involved.
    // Reserved for Council (and Guild Leader) by default — Knight/officers only
    // get this one if it's been opened up via !enable (see canChannelWideCast).
    if (spellId === 'spell' && !targetMember && mentionedChannel) {
      const settings = loadSettings();
      if (!canChannelWideCast(message.member, settings.officerChannelCastEnabled)) {
        message.reply({
          content: settings.officerChannelCastEnabled
            ? 'The Tavernkeep shakes his head. "A room-wide cast is a Council spell, traveller — that\'s not you."'
            : 'The Tavernkeep shakes his head. "A room-wide cast is a Council spell, traveller — it hasn\'t been opened up to officers right now. Ask the Guild Leader or Council for `!enable`."',
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      // Optional 2nd #channel = where the announcement is posted instead of the cast channel,
      // so the cast channel itself never shows the command that triggered it.
      const outputChannel = channelMentions[1] || mentionedChannel;

      const leftoverTokens = parts.slice(2).filter((p) => !p.startsWith('<@') && !p.startsWith('<#'));
      let statusId = null;
      if (leftoverTokens.length > 0) {
        statusId = leftoverTokens[0].toLowerCase();
        if (!spell.statuses[statusId]) {
          const valid = Object.keys(spell.statuses);
          message.reply(
            `The Tavernkeep squints at the grimoire. "\`${statusId}\` isn't a status effect I know for **${spell.name}**. Try one of: ${valid.join(', ')}."`
          );
          return;
        }
      } else {
        statusId = spell.randomPool[Math.floor(Math.random() * spell.randomPool.length)];
      }

      let members;
      try {
        members = await message.guild.members.fetch();
      } catch (err) {
        console.error('Failed to fetch guild members for channel-wide cast:', err);
        message.reply({
          content: "The Tavernkeep can't quite make out who's in that room right now — try again in a moment.",
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const targets = members.filter((m) =>
        !m.user.bot &&
        mentionedChannel.permissionsFor(m)?.has(PermissionsBitField.Flags.ViewChannel) &&
        mentionedChannel.permissionsFor(m)?.has(PermissionsBitField.Flags.SendMessages)
      );

      const drinks = loadDrinks();
      const casterPlayerForStats = getPlayer(drinks, message.author.id);
      casterPlayerForStats.stats.castCount++;

      for (const [, m] of targets) {
        const player = getPlayer(drinks, m.id);
        spell.cast(player, statusId); // sets player.activeFlair with guaranteed: true
      }
      saveDrinks(drinks);

      const affected = targets.size;
      const label = spell.statuses[statusId].label;
      const minutes = spell.statuses[statusId].flairMinutes || 20;
      const { header, flavor } = buildCastFlavor('spell', casterName, `everyone in ${mentionedChannel}`);

      try {
        await outputChannel.send({
          content:
            `${header}\n*${flavor}*\n` +
            `✨ The whole room feels it — everyone here is talking **${label}** now, and it shows in every word. (~${minutes}m)`,
          allowedMentions: { parse: [] },
        });
      } catch (err) {
        console.error('Failed to announce channel-wide spell cast:', err);
        message.reply('The spell fizzles — check my permissions in that channel.');
        return;
      }

      if (outputChannel.id !== message.channel.id) {
        message.reply({
          content:
            outputChannel.id !== mentionedChannel.id
              ? `Spell cast on **${affected}** member${affected === 1 ? '' : 's'} in ${mentionedChannel} — announced in ${outputChannel} instead.`
              : `Spell cast on **${affected}** member${affected === 1 ? '' : 's'} — announced in ${outputChannel}.`,
          allowedMentions: { repliedUser: false },
        });
      }
      if (grimoire) {
        grimoire.send(
          outputChannel.id !== mentionedChannel.id
            ? `🪄 ${message.author.tag} cast **Spell (${label})** on everyone in ${mentionedChannel} (${affected} member(s) affected), announced in ${outputChannel} instead.`
            : `🪄 ${message.author.tag} cast **Spell (${label})** on everyone in ${mentionedChannel} (${affected} member(s) affected).`
        );
      }
      return;
    }

    if (targetMember && isGolemProtected(targetMember)) {
      const drinks = loadDrinks();
      const casterPlayerForStats = getPlayer(drinks, message.author.id);
      casterPlayerForStats.stats.castCount++;
      applyGolemCurse(casterPlayerForStats, Date.now());
      saveDrinks(drinks);
      scheduleGolemCurseExpiry(message.author.id, mentionedChannel || message.channel);

      const bLine = GOLEM_CURSE_BACKFIRE_LINES[Math.floor(Math.random() * GOLEM_CURSE_BACKFIRE_LINES.length)](casterName);
      try {
        await (mentionedChannel || message.channel).send({
          content: `${bLine}\n${buildGolemCurseAnnouncement()}`,
          allowedMentions: { parse: [] },
        });
      } catch (err) {
        console.error('Failed to announce golem curse backfire:', err);
        message.reply('The spell fizzles — check my permissions in that channel.');
        return;
      }
      return;
    }

    if (targetMember && targetMember.id === TAVERNKEEP_ID) {
      if (spellId !== 'spell') {
        message.reply({
          content: `The Tavernkeep chuckles. "No need to cast **${spell.name}** on me, traveller — I'm always sober behind this bar."`,
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      const drinks = loadDrinks();
      const casterPlayerForStats = getPlayer(drinks, message.author.id);
      casterPlayerForStats.stats.castCount++;

      const statusId = spell.randomPool[Math.floor(Math.random() * spell.randomPool.length)];
      const appliedStatus = spell.cast(casterPlayerForStats, statusId);
      casterPlayerForStats.activeFlair = { id: appliedStatus.flair, expiresAt: Date.now() + TAVERNKEEP_BOUNCE_MS, guaranteed: true };

      recordAttack(
        casterPlayerForStats,
        message.author.id,
        { meterDelta: 0, flairId: appliedStatus.flair, flairDurationMs: TAVERNKEEP_BOUNCE_MS },
        'cast'
      );
      saveDrinks(drinks);

      const bounceLines = [
        `The Tavernkeep doesn't even blink. The spell fizzles off him entirely and snaps right back onto **${casterName}**!`,
        `"You'll have to try harder than that." The Tavernkeep waves a claw, and the spell reverses course, landing square on **${casterName}**.`,
        `The magic slides right off the Tavernkeep's fur and rebounds — **${casterName}** takes the full effect instead.`,
      ];
      const bLine = bounceLines[Math.floor(Math.random() * bounceLines.length)];
      const minutes = Math.round(TAVERNKEEP_BOUNCE_MS / 60000);

      try {
        await (mentionedChannel || message.channel).send({
          content: `${bLine}\n${buildSpellFlairAnnouncement(appliedStatus.flair)} (~${minutes}m, full strength)`,
          allowedMentions: { parse: [] },
        });
      } catch (err) {
        console.error('Failed to announce Tavernkeep spell bounce:', err);
        message.reply('The spell fizzles — check my permissions in that channel.');
        return;
      }

      scheduleAutoSober(message.author.id, mentionedChannel || message.channel, TAVERNKEEP_BOUNCE_MS);
      return;
    }

    if (!targetMember) targetMember = message.member; // no one mentioned -> test it on yourself

    const targetChannel = mentionedChannel || message.channel;

    // Anything left over that isn't a user/channel mention is treated as the status-effect name
    const leftoverTokens = parts.slice(2).filter((p) => !p.startsWith('<@') && !p.startsWith('<#'));
    let statusId = null;
    if (leftoverTokens.length > 0) {
      statusId = leftoverTokens[0].toLowerCase();
      if (!spell.statuses[statusId]) {
        const valid = Object.keys(spell.statuses);
        message.reply(
          valid.length
            ? `The Tavernkeep squints at the grimoire. "\`${statusId}\` isn't a status effect I know for **${spell.name}**. Try one of: ${valid.join(', ')}."`
            : `The Tavernkeep tilts his head. "**${spell.name}** doesn't take a status effect, nya."`
        );
        return;
      }
    } else if (spell.defaultStatus) {
      statusId = spell.defaultStatus;
    } else if (spell.randomPool.length > 0) {
      statusId = spell.randomPool[Math.floor(Math.random() * spell.randomPool.length)];
    }

    const drinks = loadDrinks();
    const casterPlayerForStats = getPlayer(drinks, message.author.id);
    casterPlayerForStats.stats.castCount++;
    const player = getPlayer(drinks, targetMember.id);
    const appliedStatus = spell.cast(player, statusId);
    // Use the flair's actual configured duration (statuses default to 20m), not the generic
    // 10-minute AUTO_SOBER_MS — otherwise the auto-sober timer below kills the flair early.
    const flairDurationMs = spellId === 'spell' ? (appliedStatus.flairMinutes || 20) * 60 * 1000 : AUTO_SOBER_MS;
    if (spellId === 'spell') {
      recordAttack(
        player,
        message.author.id,
        { meterDelta: 0, flairId: appliedStatus.flair, flairDurationMs },
        'cast'
      );
    }
    saveDrinks(drinks);

    const targetName = targetMember.displayName || targetMember.user.username;
    const { header, flavor } = buildCastFlavor(spellId, casterName, targetName);
    let resultLine = `${header}\n*${flavor}*`;

    // If the applied status carries a speech-flair, spell it out for the target instead of
    // leaving it buried in the parenthetical status label.
    if (spellId === 'spell' && appliedStatus.flair) {
      resultLine += `\n${buildSpellFlairAnnouncement(appliedStatus.flair)}`;
    }

    try {
      // No @mention in the announcement anymore, so nothing to allow — this also guarantees
      // the target doesn't get pinged even if their display name happens to look mention-like.
      await targetChannel.send({ content: resultLine, allowedMentions: { parse: [] } });
    } catch (err) {
      console.error('Failed to announce spell cast:', err);
      message.reply('The spell fizzles — check my permissions in that channel.');
      return;
    }

    if (spellId === 'spell') {
      scheduleAutoSober(targetMember.id, targetChannel, flairDurationMs);
    } else if (spellId === 'clear') {
      cancelSoberTimer(targetMember.id);
    }

    if (targetChannel.id !== message.channel.id) {
      message.reply({ content: `Spell cast — announced in ${targetChannel}.`, allowedMentions: { repliedUser: false } });
    }

    if (grimoire) {
      grimoire.send(`🪄 ${message.author.tag} (as ${casterName}) cast **${spell.name}**${statusId ? ` (${statusId})` : ''} on <@${targetMember.id}> in ${targetChannel}.`);
    }
    return;
  }

  // ---- !parry — reflect the spell/potion still on you back onto whoever cast/threw it ----
  // Bounces are chainable: once reflected, the original caster gets a fresh `lastAttack`
  // pointing back at the parrier, so they can parry it right back if they're quick (or a mod).
  // Council/Knight: no cooldown. Everyone else: 3 minute cooldown, since parrying is tiring.
  if (matchesCommand(content, '!parry')) {
    const drinks = loadDrinks();
    const parrier = getPlayer(drinks, message.author.id);
    const isMod = isCouncil(message.member);
    const now = Date.now();

    // Golem's Curse can't be parried away, mods included — the magic is bound to the golem's
    // own stone rather than a caster the parry could reflect it back onto, so it just bounces
    // uselessly off whatever ward the golem left behind.
    if (isGolemCursed(parrier, now)) {
      message.reply({
        content: 'You try to parry, but the curse just grinds against stone and lands right back on you. The golem\'s magic isn\'t going anywhere.',
        allowedMentions: { repliedUser: false },
      });
      saveDrinks(drinks);
      return;
    }

    const attack = getParryableAttack(parrier);
    if (!attack) {
      message.reply({
        content: 'The Tavernkeep tilts his head. "Nothing\'s coming at you to parry right now, traveller."',
        allowedMentions: { repliedUser: false },
      });
      saveDrinks(drinks);
      return;
    }

    if (!isMod) {
      const parryCooldown = checkCooldown(parrier, 'lastParryUse', PARRY_COOLDOWN_MS, now);
      if (parryCooldown.onCooldown) {
        message.reply({
          content: `You're too fatigued to parry again yet — try again in **${parryCooldown.remainingLabel}**.`,
          allowedMentions: { repliedUser: false },
        });
        saveDrinks(drinks);
        return;
      }
    }

    removeAttackEffect(parrier, attack.effect);
    parrier.lastAttack = null;
    if (!isMod) parrier.lastParryUse = now;
    parrier.stats.parryCount++;

    let casterMember = null;
    try {
      casterMember = await message.guild.members.fetch(attack.casterId);
    } catch (err) {
      // Caster left the guild or can't be resolved — the parrier still shakes it off below.
    }

    const parrierName = message.member.displayName || message.author.username;

    if (casterMember && casterMember.id !== message.author.id) {
      const casterPlayer = getPlayer(drinks, casterMember.id);
      applyAttackEffect(casterPlayer, attack.effect);
      recordAttack(casterPlayer, message.author.id, attack.effect, attack.kind);
      scheduleAutoSober(casterMember.id, message.channel);
    }
    saveDrinks(drinks);

    const casterName = casterMember ? (casterMember.displayName || casterMember.user.username) : 'someone unseen';
    message.channel.send({
      content: `**${parrierName}** parried **${casterName}**`,
      allowedMentions: { parse: [] },
    });
    return;
  }

  // ---- !stats / !stats @user — cast/throw/parry counts ----
  if (matchesCommand(content, '!stats')) {
    const drinks = loadDrinks();
    const statsTarget = message.mentions.members?.first() || message.member;
    const player = getPlayer(drinks, statsTarget.id);
    saveDrinks(drinks); // persist the decay getPlayer() applies while we're in here

    const name = statsTarget.displayName || statsTarget.user.username;
    const embed = new EmbedBuilder()
      .setColor(0x8e44ad)
      .setTitle(`📊 ${name}'s Stats`)
      .addFields(
        { name: '✨ Casts', value: `${player.stats.castCount}`, inline: true },
        { name: '🧪 Throws', value: `${player.stats.throwCount}`, inline: true },
        { name: '🛡️ Parries', value: `${player.stats.parryCount}`, inline: true },
      );

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    return;
  }

  // ---- !activity — paginated member activity book (Council/Knight/Emissary/Guild Leader) ----
  if (matchesCommand(content, '!activity')) {
    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'View member activity');
      return;
    }
    await runActivityCommand(message);
    return;
  }

  // ---- !guild — browse members by role (Council/Knight/Emissary/Guild Leader) ----
  if (matchesCommand(content, '!guild')) {
    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'Browse the guild roll');
      return;
    }
    await runGuildCommand(message, content.slice('!guild'.length).trim());
    return;
  }

  // ---- !vote — quick mod-channel vote prompt (Council/Knight/Emissary/Guild Leader) ----
  if (matchesCommand(content, '!vote')) {
    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'Call a vote');
      return;
    }
    await handleVoteCommand(message);
    return;
  }

  // ---- !user / !name — mod-maintained IGN directory ----
  //
  // Plain-name lookup, not tied to Discord IDs/mentions. `!user` and `!name` are interchangeable
  // throughout. Names are single words (no spaces) since that's how entries get keyed on add.
  if (matchesCommand(content, '!user') || matchesCommand(content, '!name')) {
    const cmdWord = matchesCommand(content, '!user') ? '!user' : '!name';
    const rest = content.slice(cmdWord.length).trim();

    // Someone @mentioned instead of typing a name — strip it, explain, and stop rather than
    // trying to guess who they meant.
    if (message.mentions.users.size > 0) {
      message.reply({
        content: `No need to ping — just type the name, e.g. \`${cmdWord} SomeName\`.`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    const igns = loadIgns();
    const tokens = tokenize(rest);
    const sub = (tokens[0] || '').toLowerCase();

    // ---- !user / !user list — paged book, same idea as !menu ----
    if (rest.length === 0 || sub === 'list') {
      const { embed, page, totalPages } = buildIgnListEmbed(0);
      const showModControls = ignModControlsVisible(message.member);
      await message.reply({
        embeds: [embed],
        components: buildIgnListComponents(message.author.id, page, totalPages, showModControls),
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // ---- mod-only: add / remove / edit / change ----
    if (sub === 'add' || sub === 'remove' || sub === 'edit' || sub === 'change') {
      if (!isCouncil(message.member)) {
        message.reply({
          content: "You don't have permission to manage the IGN directory.",
          allowedMentions: { repliedUser: false },
        });
        return;
      }

      if (sub === 'remove') {
        const raw = tokens[1];
        if (!raw) {
          message.reply(`Usage: \`${cmdWord} remove <name or #>\``);
          return;
        }
        const resolved = resolveIgnTarget(raw);
        if (!resolved.key) {
          message.reply(resolved.error);
          return;
        }
        const removedName = igns[resolved.key].name;
        delete igns[resolved.key];
        saveIgns(igns);
        message.reply(`Removed **${removedName}** from the IGN directory.`);
        return;
      }

      if (sub === 'edit' || sub === 'change') {
        const raw = tokens[1];
        const username = tokens.slice(2).join(' ');
        if (!raw || !username) {
          message.reply(`Usage: \`${cmdWord} ${sub} <name or #> <username>\``);
          return;
        }
        const resolved = resolveIgnTarget(raw);
        if (!resolved.key) {
          message.reply(resolved.error);
          return;
        }
        const displayName = igns[resolved.key].name;
        igns[resolved.key] = {
          ...igns[resolved.key],
          ign: username,
          addedBy: message.author.tag,
          updatedAt: new Date().toISOString(),
        };
        saveIgns(igns);
        message.reply(`Got it — **${displayName}** is now on file with IGN **${username}**.`);
        return;
      }

      // add — the only sub-command left here, and the only one taking a brand-new <name>
      const name = tokens[1];
      const username = tokens.slice(2).join(' ');
      if (!name || !username) {
        message.reply(`Usage: \`${cmdWord} add <name> <username>\``);
        return;
      }
      if (/\s/.test(name)) {
        message.reply('Name needs to be a single word, no spaces.');
        return;
      }
      const key = name.toLowerCase();

      if (igns[key]) {
        message.reply(`**${igns[key].name}** is already on file with IGN **${igns[key].ign}** — use \`${cmdWord} edit ${name} <username>\` to change it.`);
        return;
      }

      igns[key] = {
        name,
        ign: username,
        addedBy: message.author.tag,
        updatedAt: new Date().toISOString(),
      };
      saveIgns(igns);

      message.reply(`Got it — **${name}** is now on file with IGN **${username}**.`);
      return;
    }

    // ---- !user <name> — look up one member ----
    if (tokens.length !== 1) {
      message.reply(`Usage: \`${cmdWord} <name>\` (single word, no spaces)`);
      return;
    }

    const key = rest.toLowerCase();
    const exact = igns[key];
    if (exact) {
      message.reply({ content: `**${exact.name}** — ${exact.ign}`, allowedMentions: { repliedUser: false } });
      return;
    }

    // Fall back to a prefix match, same idea as !lore — only auto-resolve if unambiguous.
    const candidates = Object.values(igns).filter((e) => e.name.toLowerCase().startsWith(key));
    if (candidates.length === 1) {
      message.reply({ content: `**${candidates[0].name}** — ${candidates[0].ign}`, allowedMentions: { repliedUser: false } });
      return;
    }
    if (candidates.length > 1) {
      message.reply(`A few names match "${rest}": ${candidates.map((e) => `**${e.name}**`).join(', ')}. Try being more specific.`);
      return;
    }

    message.reply(`No IGN on file for **${rest}**. Try \`${cmdWord} list\` to see everyone on record.`);
    return;
  }

  // ---- !recruit / !rec — mod ticket board for people who want to join. Council/Knight/
  // Emissary/Guild Leader only (isCouncil). Typing a username both adds it AND shows the shared,
  // paginated board in the same reply; bare !recruit (or "list") just shows the board. The Prev/
  // Next/Add/Remove buttons on that board work for any Council-tier member, not just whoever ran
  // the command, and every add/remove edits that same message in place — see
  // buildRecruitListComponents/handleRecruitListButton above for why.
  if (matchesCommand(content, '!recruit') || matchesCommand(content, '!rec')) {
    const cmdWord = matchesCommand(content, '!recruit') ? '!recruit' : '!rec';

    if (!isCouncil(message.member)) {
      replyCouncilDenied(message, 'Manage the recruit board');
      return;
    }

    const rest = content.slice(cmdWord.length).trim();

    // Someone @mentioned instead of typing a username — strip it, explain, and stop, same as !user.
    if (message.mentions.users.size > 0) {
      message.reply({
        content: `No need to ping — just type their username, e.g. \`${cmdWord} SomeUsername\`.`,
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // ---- bare !recruit/!rec, or "list" — just show the board ----
    if (rest.length === 0 || rest.toLowerCase() === 'list') {
      const { embed, page, totalPages } = buildRecruitListEmbed(0);
      await message.reply({
        embeds: [embed],
        components: buildRecruitListComponents(page, totalPages),
        allowedMentions: { repliedUser: false },
      });
      return;
    }

    // ---- !recruit <username> / !rec <username> — add a ticket, then show the board ----
    if (/\s/.test(rest)) {
      message.reply(`Usage: \`${cmdWord} <username>\` (single word, no spaces) — or \`${cmdWord} list\` to just view the board.`);
      return;
    }

    const entries = loadRecruits();
    let note;
    if (entries.some((e) => e.name.toLowerCase() === rest.toLowerCase())) {
      note = `⚠️ **${rest}** is already on the board.`;
    } else {
      entries.push({ name: rest, addedBy: message.author.id, addedAt: new Date().toISOString() });
      saveRecruits(entries);
      note = `✅ Added **${rest}** to the board.`;
    }

    const { embed, page, totalPages } = buildRecruitListEmbed(0, note);
    await message.reply({
      embeds: [embed],
      components: buildRecruitListComponents(page, totalPages),
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !roll ----
  if (matchesCommand(content, '!roll')) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const rollLines = [
      `The Tavernkeep cups the die in his paws, gives it a shake, and lets it clatter across the counter: **${roll}**`,
      `A flick of the paw, a bounce off the mug, a wobble, a stop. The die reads: **${roll}**`,
      `The Tavernkeep rolls the die nya~ It settles on: **${roll}**`,
      `Fate rattles across the bar top and settles. The die shows: **${roll}**`,
    ];
    message.reply({
      content: rollLines[Math.floor(Math.random() * rollLines.length)],
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !flip ----
  if (matchesCommand(content, '!flip')) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const flipLines = [
      `The Tavernkeep flicks a coin into the air with a claw... it lands on: **${result}**`,
      `Up spins the coin, catching the firelight, down it comes: **${result}**`,
      `The Tavernkeep bats the coin off the counter like a toy, nya~ It lands on: **${result}**`,
      `A coin spins, a breath is held, a coin falls. **${result}**`,
    ];
    message.reply({
      content: flipLines[Math.floor(Math.random() * flipLines.length)],
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  // ---- !giveaway ----
  // Can be run either in GIVEAWAY_CHANNEL_ID directly, or from one of MOD_PRIVATE_CHANNEL_IDS so
  // mods can set it up without the public channel seeing an empty giveaway card appear and then
  // get filled in live. The card itself always posts in GIVEAWAY_CHANNEL_ID either way.
  if (matchesCommand(content, '!giveaway')) {
    if (!isAllowedGiveawayRsvpChannel(message.channel.id)) {
      message.reply({
        content: `🎉 Giveaways are hosted over in <#${GIVEAWAY_CHANNEL_ID}> — head there to start or enter one!`,
        allowedMentions: { repliedUser: false },
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    if (!isCouncil(message.member)) {
      message.reply({
        content: 'Only Council, Knight, or Emissary can start a giveaway, traveller.',
        allowedMentions: { repliedUser: false },
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    // ---- !giveaway cleanup / !giveaway clear — purge finished giveaways from storage ----
    //
    // Ended giveaways (status: 'ended') stay in giveawayStore/giveaways.json forever otherwise —
    // there's nothing that ever removes them once they're closed out, which is why old, already-
    // resolved giveaways keep showing up in the "Restored N giveaways from giveaways.json" startup
    // log. This only touches the JSON store; it never edits or deletes the actual Discord messages,
    // so the closed giveaway cards stay exactly as they are in the channel.
    const rest = argsAfter(content, '!giveaway').toLowerCase();
    if (rest === 'cleanup' || rest === 'clear') {
      let removed = 0;
      for (const [messageId, giveaway] of [...giveawayStore.entries()]) {
        if (giveaway.status === 'ended') {
          giveawayStore.delete(messageId);
          removed++;
        }
      }
      flushGiveawaysToDisk();
      message.reply({
        content: removed > 0
          ? `🧹 Cleared **${removed}** finished giveaway${removed === 1 ? '' : 's'} from storage — they won't show up on restart anymore. (Their Discord messages are untouched.)`
          : 'No finished giveaways in storage to clear.',
        allowedMentions: { repliedUser: false },
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    const promptRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`giveawaystart:prompt:${message.author.id}`)
        .setLabel('🎁 What are you giving away?')
        .setStyle(ButtonStyle.Primary)
    );
    message.reply({
      content: 'Let\'s set up a giveaway — click below to enter the prize(s).',
      components: [promptRow],
      allowedMentions: { repliedUser: false },
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // ---- !rsvp ----
  // Council/Knight only (not Emissary). Can be run either in GIVEAWAY_CHANNEL_ID directly, or
  // from one of MOD_PRIVATE_CHANNEL_IDS so the "Create Event" click-through can happen out of
  // public view. The event card itself always ends up posted in GIVEAWAY_CHANNEL_ID — see
  // handleRsvpCreateModal below. Opens a small modal to collect the event's title, when, and
  // details.
  if (matchesCommand(content, '!rsvp')) {
    if (!isAllowedGiveawayRsvpChannel(message.channel.id)) {
      message.reply({
        content: `📅 Events are hosted over in <#${GIVEAWAY_CHANNEL_ID}> — head there to create or RSVP to one!`,
        allowedMentions: { repliedUser: false },
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    if (!isEventHostRole(message.member)) {
      message.reply({
        content: 'Only Council or Knight can create an event, traveller.',
        allowedMentions: { repliedUser: false },
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    message.reply({
      content: '📅 Click below to create your event.',
      allowedMentions: { repliedUser: false },
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`rsvpcreate:${message.author.id}`).setLabel('Create Event').setEmoji('📅').setStyle(ButtonStyle.Primary)
        ),
      ],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  // ---- Dungeon hub channel catch-all: anything typed here that wasn't already handled above
  // (an @dungeon-role ping, !party, or another real command) gets a reactive "ready to call a
  // party?" Start-button nudge instead of the old persistent standing menu. Same Start button
  // !party posts, so handlePartyStartButton deletes this nudge the moment it's used; it also
  // self-deletes after PARTY_START_PROMPT_LIFETIME_MS so it doesn't linger in the channel if
  // nobody taps it (e.g. because they ended up creating the party some other way). The original
  // message that triggered it gets cleaned up separately (see the messageCreate listener's
  // finally block).
  if (message.channel.id === DUNGEON_HUB_CHANNEL_ID) {
    const startRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`partystart:${message.author.id}`)
        .setLabel('Start')
        .setEmoji('🗺️')
        .setStyle(ButtonStyle.Primary)
    );
    const nudge = await message.channel.send({
      content: `Ready to call a party, traveller? Tap below to get started.`,
      components: [startRow],
      allowedMentions: { parse: [] },
    }).catch((err) => {
      console.error('Failed to post the dungeon hub party nudge:', err);
      return null;
    });
    if (nudge) {
      setTimeout(() => {
        nudge.delete().catch(() => {});
      }, PARTY_START_PROMPT_LIFETIME_MS);
    }
  }
}

// The dungeon hub channel is meant to contain only Party Up! cards — !party and an @dungeon-role
// mention both still work if typed, and anything else typed there gets a reactive "ready to call
// a party?" Start-button nudge (see hubChannelPartyNudge in handleMessageCreate) before the
// original message is cleaned up. Wrapping handleMessageCreate in try/finally means the
// message-delete cleanup runs on every code path through it, including its many early `return`s,
// without needing a delete call threaded through each one individually. Bot messages (the cards
// themselves, thread notices, etc.) are excluded so the Tavernkeep never deletes its own posts.

// The public "Start" prompt (posted by `!party` and the hub-channel catch-all below) can't be a
// true Discord ephemeral message — that only exists on interaction responses, and these are
// triggered by a plain text message, not an interaction — so instead it self-deletes after this
// long if nobody taps it, instead of sitting in the channel forever. handlePartyStartButton also
// deletes it immediately on a real tap; both deletes tolerate the message already being gone.
const PARTY_START_PROMPT_LIFETIME_MS = 30 * 1000;

// Same shape as the dungeon-picker step in `!party`, but every prompt is an ephemeral reply — so
// only the person who clicked Yes ever sees the picker, the ping-or-not question, or a "you ran
// out of time" notice. The only thing that ends up public is the finished Party Up! card itself,
// via finishPartyCreation (shared with `!party`). `interaction` must already be deferred
// (deferUpdate) by the caller so followUp works for every step below.
const DUNGEON_WIZARD_STEP_TIMEOUT_MS = 60 * 1000;

async function runPartyCreationWizard(interaction) {
  const ctx = { author: interaction.user, guild: interaction.guild, channel: interaction.channel };
  const authorName = interaction.member?.displayName || interaction.user.username;

  // Already in a live party for some dungeon? Unlike `!party` (an explicit command, which bumps
  // as a convenience shortcut), the persistent hub menu is standing furniture anyone can tap at
  // any time — it's meant for starting a *new* party, so it should never silently bump an
  // existing one on the caller's behalf. Instead, block creation and point them at their
  // existing party (via jump link) with guidance on how to free themselves up. In practice the
  // `!party` command's own bump check (which runs before its Start button ever appears) already
  // filters this out for that path, so this only fires for the hub menu button.
  const activeEntries = getActivePartiesForUser(ctx.author.id);
  if (activeEntries.length > 0) {
    const lines = activeEntries.map(({ messageId, party }) => {
      const isLeader = party.leaderId === ctx.author.id;
      const guidance = isLeader
        ? 'You\'re leading it — hit **Complete** on it first before calling a new one.'
        : 'You\'re a member of it — **Leave** it first if you\'d rather start/join a different one.';
      const jumpUrl = `https://discord.com/channels/${ctx.guild.id}/${party.channelId}/${messageId}`;
      return `⚔️ You're already in a **${party.dungeonName}** party: ${jumpUrl}\n${guidance}`;
    });
    await interaction.followUp({
      content: lines.join('\n\n'),
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const cooldownRemaining = partyCreateCooldownRemaining(ctx.author.id);
  if (cooldownRemaining > 0) {
    const waitSecs = Math.ceil(cooldownRemaining / 1000);
    await interaction.followUp({
      content: `🕰️ Slow down, adventurer — you can call another party in ~${waitSecs}s.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const dungeonSelect = new StringSelectMenuBuilder()
    .setCustomId('partywizard:dungeon')
    .setPlaceholder('Choose a dungeon...')
    .addOptions(Object.entries(DUNGEON_ROLES).map(([roleId, info]) => ({ label: info.name, value: roleId })));

  const picker = await interaction.followUp({
    content: `🗺️ Which dungeon are you calling a party for, ${authorName}?`,
    components: [new ActionRowBuilder().addComponents(dungeonSelect)],
    flags: MessageFlags.Ephemeral,
  }).catch((err) => {
    console.error('Dungeon-hub wizard: failed to post the dungeon picker:', err);
    return null;
  });
  if (!picker) return;

  const pick = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === ctx.author.id && i.customId === 'partywizard:dungeon',
      time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!pick) {
    await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
    await interaction.followUp({
      content: '🕰️ Looks like you forgot to pick a dungeon, traveller — run `!party` again whenever you\'re ready.',
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const roleId = pick.values[0];
  const info = DUNGEON_ROLES[roleId];
  const callerMember = interaction.member;

  // Expert/Seasoned Adventurers get waved straight through with no gating below, plus the option
  // right here to flag their run as an exclusive "fast run" — pinged only to fellow Expert/
  // Seasoned Adventurers instead of the dungeon's full role. Rookie/Novice callers get no such
  // prompt; they're nudged toward bringing along experienced help once their card is up instead
  // (see the notice after finishPartyCreation below).
  let fastRunOnly = false;
  let stepInteraction = pick; // whichever interaction's .update() should drive the next step

  if (isExperiencedAdventurer(callerMember)) {
    const fastRunRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('partywizard:fastrun:yes').setLabel('Yes, Expert/Seasoned only').setEmoji('⚡').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('partywizard:fastrun:no').setLabel('No, open to everyone').setStyle(ButtonStyle.Secondary)
    );

    await stepInteraction.update({
      content: `🗺️ Calling a party for **${info.name}**. Make this an **exclusive fast run**? It'll only notify fellow Expert and Seasoned Adventurers — no wider ping goes out.`,
      components: [fastRunRow],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));

    const fastRunChoice = await picker
      .awaitMessageComponent({
        filter: (i) => i.user.id === ctx.author.id && i.customId.startsWith('partywizard:fastrun:'),
        time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
      })
      .catch(() => null);

    if (!fastRunChoice) {
      await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
      await interaction.followUp({
        content: `🕰️ Looks like you forgot to answer, traveller — run \`!party\` again whenever you're ready.`,
        flags: MessageFlags.Ephemeral,
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    fastRunOnly = fastRunChoice.customId === 'partywizard:fastrun:yes';
    stepInteraction = fastRunChoice;
  }

  // Recruitment gate: who can self-serve Join. Skipped for exclusive fast runs, which are
  // already Expert/Seasoned-only by definition — see finishPartyCreation, which forces
  // requiredTier to 'expert' whenever fastRunOnly is set, so asking again here would be
  // redundant. Every other caller — Rookie through Seasoned — gets asked, so leaders of any
  // tier can restrict who's allowed to Join their own call.
  let requiredTier = 'open';
  if (!fastRunOnly) {
    const tierRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('partywizard:tier:open').setLabel('Open to All').setEmoji('🌍').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('partywizard:tier:novice').setLabel('Novice+').setEmoji('🌱').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('partywizard:tier:expert').setLabel('Expert+').setEmoji('⚔️').setStyle(ButtonStyle.Secondary)
    );

    await stepInteraction.update({
      content:
        `🗺️ Calling a party for **${info.name}**. Who's allowed to hit **Join**? Novice+ means Novice, Expert, or ` +
        `Seasoned; Expert+ means Expert or Seasoned only. (You can still seat anyone yourself later with **Add**, ` +
        `no matter what you pick here.)`,
      components: [tierRow],
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));

    const tierChoice = await picker
      .awaitMessageComponent({
        filter: (i) => i.user.id === ctx.author.id && i.customId.startsWith('partywizard:tier:'),
        time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
      })
      .catch(() => null);

    if (!tierChoice) {
      await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
      await interaction.followUp({
        content: `🕰️ Looks like you forgot to answer, traveller — run \`!party\` again whenever you're ready.`,
        flags: MessageFlags.Ephemeral,
      }).catch((err) => console.error('Discord API call failed (non-critical):', err));
      return;
    }

    requiredTier = tierChoice.customId.split(':')[2];
    stepInteraction = tierChoice;
  }

  // Select menus support up to 25 options, well above any realistic party size — unlike a button
  // row, which Discord caps at 5 per row (this used to build 6 buttons and crash the bot).
  const maxSize = getPartyMaxSize(roleId);
  const sizeOptionCount = Math.min(25, maxSize);
  const sizeSelect = new StringSelectMenuBuilder()
    .setCustomId('partywizard:size')
    .setPlaceholder('Choose a number...')
    .addOptions(
      Array.from({ length: sizeOptionCount }, (_, i) => ({
        label: String(i + 1),
        value: String(i + 1),
      }))
    );
  const sizeRow = new ActionRowBuilder().addComponents(sizeSelect);

  await stepInteraction.update({
    content: `🗺️ Calling a party for **${info.name}**. How many adventurers (counting yourself) are currently on your team? Picking a number seats you in slot 1 and fills that many slots total — e.g. picking 3 fills slots 1-3.`,
    components: [sizeRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const sizeChoice = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === ctx.author.id && i.customId === 'partywizard:size',
      time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!sizeChoice) {
    await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
    await interaction.followUp({
      content: `🕰️ Looks like you forgot to answer, traveller — run \`!party\` again whenever you're ready.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const filledCount = parseInt(sizeChoice.values[0], 10);

  // Ask which server the party's mustering at, right after party size and before the ping
  // question. A modal is the only component type that takes typed input, so — unlike the rest
  // of this wizard, which edits the same ephemeral message in place with .update() — this step
  // pops a small form instead. Submitting (or leaving it blank/"N/A" for "not sure yet") hands
  // control right back to that same ephemeral message via the modal submission's own .update().
  const serverModal = new ModalBuilder()
    .setCustomId('partywizard:servermodal')
    .setTitle(`Set Server — ${info.name}`);
  const serverInput = new TextInputBuilder()
    .setCustomId('server')
    .setLabel('What server are you in?')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("e.g. Nil 123 — leave blank or type N/A if not sure")
    .setRequired(false)
    .setMaxLength(50);
  serverModal.addComponents(new ActionRowBuilder().addComponents(serverInput));
  await sizeChoice.showModal(serverModal).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const serverSubmit = await sizeChoice
    .awaitModalSubmit({
      filter: (i) => i.user.id === ctx.author.id && i.customId === 'partywizard:servermodal',
      time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!serverSubmit) {
    await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
    await interaction.followUp({
      content: `🕰️ Looks like you forgot to answer, traveller — run \`!party\` again whenever you're ready.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const rawServer = serverSubmit.fields.getTextInputValue('server').trim();
  const server = (!rawServer || rawServer.toUpperCase() === 'N/A') ? null : rawServer;

  const pingRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('partywizard:ping:yes').setLabel('Yes, ping the role').setEmoji('📣').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('partywizard:ping:no').setLabel('No, open quietly').setStyle(ButtonStyle.Secondary)
  );

  const pingPromptContent = fastRunOnly
    ? `🗺️ Calling a party for **${info.name}**. Ping fellow Expert/Seasoned Adventurers for this exclusive fast run, or open the card quietly?`
    : `🗺️ Calling a party for **${info.name}**. Ping <@&${roleId}> for it, or open the card quietly?`;

  await serverSubmit.update({
    content: pingPromptContent,
    components: [pingRow],
  }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  const pingChoice = await picker
    .awaitMessageComponent({
      filter: (i) => i.user.id === ctx.author.id && i.customId.startsWith('partywizard:ping:'),
      time: DUNGEON_WIZARD_STEP_TIMEOUT_MS,
    })
    .catch(() => null);

  if (!pingChoice) {
    await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
    await interaction.followUp({
      content: `🕰️ Looks like you forgot to answer, traveller — run \`!party\` again whenever you're ready.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
    return;
  }

  const shouldPing = pingChoice.customId === 'partywizard:ping:yes';
  await pingChoice.update({ content: `🗺️ Opening a party for **${info.name}**...`, components: [] }).catch((err) => console.error('Discord API call failed (non-critical):', err));

  await finishPartyCreation(ctx, { roleId, info, authorName, shouldPing, filledCount, server, fastRunOnly, requiredTier });

  // Rookie/Novice-only parties keep struggling to clear the harder dungeons and the other dungeons —
  // nudge the caller (privately, after their card is already up) to bring along some experienced
  // backup rather than blocking creation outright. Skip it if they already gated the party to
  // Novice+/Expert+ themselves — that's the same guidance, already acted on.
  if (isNewAdventurer(callerMember) && !isExperiencedAdventurer(callerMember) && requiredTier === 'open') {
    await interaction.followUp({
      content:
        `🌱 Heads up, ${authorName} — **${info.name}** (and the other dungeons) can be a rough fight for a party of ` +
        `just Rookie/Novice Adventurers. Try to line up **at least 1 Seasoned Adventurer**, or **1-2 Expert Adventurers**, ` +
        `to come along — ask around in <#${DUNGEON_GENERAL_CHAT_THREAD_ID}> or the run's own thread.`,
      flags: MessageFlags.Ephemeral,
    }).catch((err) => console.error('Discord API call failed (non-critical):', err));
  }

  // The ephemeral wizard scaffolding has done its job now that the real card exists (or the bump/
  // race-guard notice went out instead) — clear it so it doesn't just sit there disabled.
  await interaction.deleteReply(picker.id).catch((err) => console.error('Discord API call failed (non-critical):', err));
}

// Handles Truth/Dare button presses from a !tod card. Only the traveller who was actually
// mentioned (their ID lives in the customId) can press either button — anyone else, including
// the person who ran !tod, gets a quiet ephemeral "not addressed to you" instead and the buttons
// stay live for the real target. A valid press picks a random line from tod.json and edits the
// same message publicly for everyone (interaction.update), then disables both buttons so it can't
// be pressed twice.
async function handleTodButton(interaction) {
  const [, choice, targetId] = interaction.customId.split(':');

  if (interaction.user.id !== targetId) {
    await interaction.reply({ content: 'This dare isn\'t yours to take, traveller.', flags: MessageFlags.Ephemeral });
    return;
  }

  const tod = loadTod();
  const pool = choice === 'dare' ? tod.dares : tod.truths;
  const pick = pool.length
    ? pool[Math.floor(Math.random() * pool.length)]
    : (choice === 'dare' ? 'No dares on file — ask a mod to stock the book!' : 'No truths on file — ask a mod to stock the book!');

  const isDare = choice === 'dare';
  const targetName = interaction.member?.displayName || interaction.user.username;

  const disabledRow = new ActionRowBuilder().addComponents(
    ButtonBuilder.from(interaction.message.components[0].components[0]).setDisabled(true),
    ButtonBuilder.from(interaction.message.components[0].components[1]).setDisabled(true)
  );

  // Falls back to a fresh embed instead of erroring if this button somehow lives on an older,
  // pre-embed !tod card (e.g. left over across a bot update).
  const originalEmbed = interaction.message.embeds[0];
  const revealEmbed = (originalEmbed ? EmbedBuilder.from(originalEmbed) : new EmbedBuilder().setColor(0x8b4513).setTitle('🎭 Truth or Dare!'))
    .setDescription(`**${targetName}** chose **${isDare ? 'Dare' : 'Truth'}**!\n\n"${pick}"`)
    .setFooter({ text: isDare ? 'No backing out now.' : 'The truth is out.' });

  await interaction.update({
    embeds: [revealEmbed],
    components: [disabledRow],
  });
}

// Handles the "Start" button posted by `!party`. Only the person who ran `!party` can press it —
// anyone else gets a quick ephemeral nudge instead. A valid press deletes the public Start prompt
// and hands off straight into the same ephemeral wizard the dungeon-hub nudge uses, so from here
// every step (dungeon picker, party size, server popup, ping question) is ephemeral until the finished card
// posts publicly via finishPartyCreation.
async function handlePartyStartButton(interaction) {
  const [, authorId] = interaction.customId.split(':');

  if (interaction.user.id !== authorId) {
    await interaction.reply({ content: 'This one wasn\'t addressed to you, traveller.', flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.deferUpdate();
  await interaction.message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
  await runPartyCreationWizard(interaction);
}

client.on('error', (err) => console.error('Discord client error:', err));

client.on('messageCreate', async (message) => {
  try {
    await handleMessageCreate(message);
  } catch (err) {
    console.error('handleMessageCreate failed (bot kept alive):', err);
  } finally {
    if (message.channel?.id === DUNGEON_HUB_CHANNEL_ID && !message.author?.bot) {
      message.delete().catch((err) => console.error('Discord API call failed (non-critical):', err));
    }
    relockDungeonThreadIfIdle(message).catch((err) => {
      console.error('Failed to re-lock an idle dungeon thread after a message:', err);
    });
  }
});

// ---------- Periodic disk flush ----------
//
// drinks.json and warnings.json are now cached in memory (see loadDrinks/saveDrinks and
// loadWarnings/saveWarnings above) so hot paths — especially the per-message drunk-decay check,
// which used to run on every single chat message in the tavern/bartop channels — don't hit disk
// every time. Pending changes get flushed on a timer instead, plus once more on shutdown so nothing
// written between the last timer tick and a restart gets lost. parties.json rides the same timer
// (see flushPartiesToDisk above for why it's a full re-snapshot instead of dirty-flagged).
const DISK_FLUSH_INTERVAL_MS = 10 * 1000;
setInterval(() => {
  flushDrinksToDisk();
  flushWarningsToDisk();
  flushSettingsToDisk();
  flushIgnsToDisk();
  flushLoreToDisk();
  flushTodToDisk();
  flushPartiesToDisk();
  flushGiveawaysToDisk();
  flushRsvpsToDisk();
  flushActivityToDisk();
  flushRecruitsToDisk();
}, DISK_FLUSH_INTERVAL_MS);

function flushAllToDiskAndExit(signal) {
  console.log(`Received ${signal}, flushing drinks.json/warnings.json/settings.json/igns.json/lore.json/tod.json/parties.json/giveaways.json/rsvp.json/activity.json/recruits.json to disk before exit...`);
  flushDrinksToDisk();
  flushWarningsToDisk();
  flushSettingsToDisk();
  flushIgnsToDisk();
  flushLoreToDisk();
  flushTodToDisk();
  flushPartiesToDisk();
  flushGiveawaysToDisk();
  flushRsvpsToDisk();
  flushActivityToDisk();
  flushRecruitsToDisk();
  process.exit(0);
}
process.on('SIGINT', () => flushAllToDiskAndExit('SIGINT'));
process.on('SIGTERM', () => flushAllToDiskAndExit('SIGTERM'));

// Safety net: on Node 15+, an unhandled promise rejection anywhere crashes the whole process
// by default. That's how a single missed .catch() on a Discord API call (rate limit, permission
// hiccup, brief outage) can take the entire bot down silently — every scheduled thing (including
// the door/welcome/farewell lines) just stops firing until someone notices and restarts it. Log
// instead of dying so one bad request degrades gracefully rather than killing everything else.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection (bot is staying up):', reason);
});

// The token is read from the DISCORD_TOKEN environment variable (see .env.example).
// NEVER hardcode it or commit it.
const BOT_TOKEN = process.env.DISCORD_TOKEN;
if (!BOT_TOKEN) {
  console.error('Missing bot token. Set DISCORD_TOKEN in your environment or .env file.');
  process.exit(1);
}

client.login(BOT_TOKEN);
