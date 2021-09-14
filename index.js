const Discord = require("discord.js");
const Revolt = require("revolt.js");
const config = require("./config.json");

const disc = new Discord.Client({ intents: Object.values(Discord.Intents.FLAGS) });
disc.login(config.token.discord);

const rev = new Revolt.Client();
rev.loginBot(config.token.revolt);

let ready = 0;
async function done() {
  console.log("Ready to work.");
  let discServer = await disc.guilds.fetch(config.server.discord);
  let revServer = await rev.servers.fetch(config.server.revolt);
  if (!discServer || !revServer) return console.log("Error fetching servers.");
  console.log("Fetching data...");
  await discServer.channels.fetch();
  await discServer.emojis.fetch();
  console.log("Fetched data.");

  function discFindChannel(id) {
    return discServer.channels.cache.filter((c) => c.isText()).find((c) => c.topic === id);
  }
  function discordTimestamp() {
    return `<t:${Math.floor(+new Date() / 1000)}:R>`;
  }
  function revoltTimestamp() {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
  async function discordAvatar(user) {
    let emoji = discServer.emojis.cache.find((e) => e.name == user._id);
    if (!emoji) {
      emoji = await discServer.emojis.create(user.generateAvatarURL(), user._id);
    }
    return emoji.toString();
  }

  function sync() {
    let revChan = revServer.channels.filter((c) => c.channel_type == "TextChannel");
    console.log("Syncing channels...");
    return new Promise((_res) => {
      new Promise((res) => {
        let done = 0;
        revChan.forEach(async (c) => {
          let channel = discFindChannel(c._id);
          if (!channel) {
            console.log(`Did not find channel ${c.name} in discord, creating it..."`);
            await discServer.channels.create(c.name, { type: "GUILD_TEXT", topic: c._id });
          }
          done++;
          if (revChan.length == done) {
            console.log("Synced channels.");
            res();
          }
        });
      }).then(() => {
        console.log("Cleaning up channels...");
        new Promise((res) => {
          let chan = discServer.channels.cache;
          let through = 0;
          chan.forEach(async (c) => {
            if (!c.topic || !revChan.map((c) => c._id).includes(c.topic)) {
              await c.delete();
            }
            through++;
            if (through == chan.size) {
              console.log("Cleaned up channels.");
              res();
            }
          });
        }).then(() => {
          console.log("Sycing server data...");
          new Promise(async (res) => {
            if (discServer.name !== revServer.name) await discServer.setName(revServer.name);
            if (!discServer.icon) await discServer.setIcon(revServer.generateIconURL()); // needs better detection
            console.log("Synced server data.");
            _res();
          });
        });
      });
    });
  }

  sync().then(() => {
    console.log("Syncing done.");
    rev.on("message", async (message) => {
      if (
        message.channel.server_id !== revServer._id ||
        message.author.bot ||
        (!message.content && !message.attachments)
      )
        return;
      let chan = discFindChannel(message.channel_id);
      if (!chan) {
        console.log("Failed to find message channel in discord!");
        sync();
        return;
      }
      let files = [];
      message.attachments
        ?.filter((a) => a.content_type.startsWith("image"))
        .forEach((a) => {
          files.push(`https://autumn.revolt.chat/attachments/${a._id}/${a.filename}`);
        });
      chan.send({
        content: `${await discordAvatar(message.author)} **${
          message.author.username
        }** ${discordTimestamp()}

${message.content ? `>>> ${message.content}` : ""}`,
        files: files,
      });
    });
    disc.on("messageCreate", async (message) => {
      if (
        message.guild.id !== discServer.id ||
        message.author.id == disc.user.id ||
        (!message.content && !message.attachments.size)
      )
        return;
      let chan = rev.channels.get(message.channel.topic);
      if (!chan) {
        console.log("Failed to find message channel in revolt!");
        sync();
        return;
      }
      let files = message.attachments.map((a) => a.proxyURL);
      chan.sendMessage({
        ...{
          content: `**${message.author.tag}** [${revoltTimestamp()}]

> ${message.content}
${files.join(", ")}`,
        },
      });
    });
  });
}

disc.on("ready", () => {
  ready++;
  console.log(`${disc.user.tag} is online!`);
  if (ready == 2) done();
});
rev.on("connected", () => {
  ready++;
  console.log(`Revolt is online!`);
  if (ready == 2) done();
});
