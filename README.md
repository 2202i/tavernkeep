# 🍺 Tavernkeep

> *A cat-eared innkeeper for your gaming guild's Discord. Pours drinks, spills gossip, keeps the books, and bounces troublemakers.*

**Tavernkeep** is a feature-packed, single-file Discord bot built on **discord.js v14**. It turns your server into a fantasy tavern: members drink, toast, throw potions at each other and slur their speech through magical "flairs", while behind the bar the Tavernkeep quietly runs your guild: dungeon party-finding, warnings and mutes, a recruit board, giveaways, RSVP events and a lore grimoire.

> ⚠️ Fictional, in-character drinking game. No real alcohol involved.

---

## ✨ Features

### 🍻 The Tavern (fun)
| Command | What it does |
|---|---|
| `!serve` | Serves you a random fantasy food or drink and pours a round, raising your **drunk meter** |
| `!toast` | Raise a toast to the room |
| `!throw @user` | Throw a random potion at someone (3 min cooldown) |
| `!cast @user` | Cast a random speech-flair on someone (3 min cooldown) |
| `!parry` | Reflect the latest spell or potion back onto its caster (chainable) |
| `!drink water` | Always in your inventory, so you can sober up |
| `!fortune` / `!gossip [@user]` | Tea-leaf fortunes and tavern rumors |
| `!tod @user` | Truth or Dare with buttons only the target can press |
| `!roll` / `!flip` / `!stats` | Dice, coins and your cast/throw/parry tally |

**Drunk meter and flairs.** The more you drink, the more your messages get rewritten (and re-posted through a webhook under your name and avatar) in a flair such as slurred, pirate, or dramatic. Warnings and curses stack their own flairs. A protected role (the "Golem") shrugs spells off, and the Tavernkeep can bounce them back.

### ⚔️ Party Up!
- `!party` or an `@dungeon-role` ping opens a guided wizard that posts a **Party Up! card** with Join / Leave buttons.
- Per-dungeon **threads** unarchive when a party opens and archive when it ends.
- Bump, idle-sweep and on-disk persistence, so parties survive restarts.
- Per-dungeon max party sizes via config.
- `!game` / `!gn` runs a lighter, uncapped version for other games (Minecraft, Game Night, and so on) with paged rosters and votes.
- Optional skill-tier gating (Rookie / Novice / Seasoned / Expert roles).

### 🛡️ Moderation toolkit
- `!warn`: tiered penalties with **30-day expiry**, a button menu (Warn / History / Remove / Edit), and a secret audit log.
- `!mute` / `!unmute`: duration units `30s`, `10m`, `2h`, `3d`, capped at Discord's 28-day maximum.
- `!ban`, `!curse`, `!shout`, `!vote`.
- `!enable` / `!disable`: toggle whether officers can use channel-wide casts.
- `!activity`: inactivity tracker book.
- `!guild`: role browser.

### 📚 Guild management
- **`!lore`**: a grimoire of tales about members, browsable by name, with a modal editor.
- **`!user` / `!name`**: a Discord-name → in-game-username directory, paged and searchable.
- **`!recruit` / `!rec`**: a shared recruit ticket board.
- **`!giveaway`**: timed giveaways with entry buttons and cleanup commands.
- **`!rsvp`**: RSVP event cards.
- **`!menu` / `!help`**: a paged public command menu.

### 🔐 Permission tiers
Roles are mapped in `config.json`:

| Tier | Typical powers |
|---|---|
| **High Council / Guild Leader** | Everything, including `!ban`, channel-wide casts, `!enable`/`!disable` |
| **Council** | Warns, mutes, `!cast`, `!shout`, `!tod` prompt book, lore editing |
| **Knight (officer)** | Warns, directory, recruit, giveaway and RSVP tools |
| **Emissary** | Recruit board, giveaways, mute/unmute, `!activity` |
| **Everyone** | The tavern fun, party-finding, browsing the directory and lore |

---

## 🚀 Setup

### 1. Create the bot
1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application with a Bot user.
2. Enable these **privileged intents**: **Message Content** and **Server Members**.
3. Invite it with these permissions: *View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Manage Messages, Manage Webhooks, Manage Threads, Moderate Members, Ban Members, View Audit Log, Add Reactions, Use Slash/External Emojis*. Adjust to the features you use.

### 2. Install
```bash
git clone https://github.com/<you>/tavernkeep.git
cd tavernkeep
npm install
```

### 3. Configure
```bash
cp .env.example .env            # put your bot token in DISCORD_TOKEN
cp config.example.json config.json   # fill in your own channel / role / user IDs
```
Turn on **Developer Mode** in Discord (Settings → Advanced), then right-click anything → **Copy ID**.

`config.json` sections:

| Key | Purpose |
|---|---|
| `channels` | tavern, bartop, admin log, warn-show, mod-private, giveaways, dungeon hub, dungeon general chat, optional farming thread |
| `roles` | council, high council, knight, emissary, guild leader, giveaway ping, guest, skill tiers, protected ("golem") role, game night |
| `users` | guild master, vice guild master, the bot's own user ID |
| `dungeons[]` | `{ roleId, name, threadId, maxSize? }`, one per dungeon or activity |
| `games[]` | `{ roleId, name, emoji }`, one per "other game" party role |

Any ID you leave as `0` simply won't match anything. The matching feature stays quiet, and the bot still boots.

### 4. Run
```bash
npm start
```
Use something like `pm2 start tavernkeep-bot.js --name tavernkeep` to keep it alive.

---

## 🗂️ Data files

State lives in plain JSON next to the script, using an in-memory cache, a dirty flag, a 10-second flush and atomic writes (so a crash never leaves a half-written file). All are gitignored.

`drinks.json`, `warnings.json`, `settings.json`, `igns.json`, `lore.json`, `tod.json`, `parties.json`, `giveaways.json`, `rsvp.json`, `gameparties.json`, `activity.json`, `recruits.json`

Back them up with a plain copy.

---

## 🧱 Project layout

```
tavernkeep-bot.js     # the whole bot (single file by design)
config.example.json   # template for your server IDs
.env.example          # template for your token
package.json
```

## 🎨 Make it yours
The flavor text (drinks, fortunes, gossip, potions, flairs, spells) lives in plain arrays near the top of each feature section. Rename the tavern, rewrite the rumors and add your guild's in-jokes.

## 🔒 Security
- **Never commit** `.env` or `config.json`, and never paste your token anywhere public.
- If a token has ever been exposed, **reset it** in the Developer Portal.

## 📜 License
MIT. See `LICENSE`.

*Pull up a stool. The first round's on the house.* 🍻
