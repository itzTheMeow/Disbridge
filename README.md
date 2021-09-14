# Disbridge

A bridge between revolt and discord.

## Installation

### **WARNING: THE SERVER YOU PROVIDE ON DISCORD WILL BE OVERWRITTEN WITH WHAT IS IN REVOLT**

### **ALL CHANNELS WILL BE DELETED**

Copy the `config.template.json` to `config.json` and fill in the tokens and IDs. SEE WARNING ABOVE

I wouldn't use a bot for this (either platform) that you plan to use for other things. (although it's not set to mess with anything else)

Run `node .` to start the bridge. You should then see a bunch of info being logged.

The bridge is functional when you see "Syncing done."

## Features

This bridge syncs text chanels from revolt to discord only. It ignores other channels or roles.

Profile pictures are shown in messages as emojis (discord only) and are automatically generated when someone sends a message.

Images are sent from revolt to discord as attachments and are sent from discord to revolt as links (as uploading them as attachments there is more complicated, see to-do)

## Additional Info

This is primarily a Revolt => Discord bridge. This means that everything is copied from a server in revolt to a server in discord.

The only thing sent from discord to revolt is messages. This therefore assumes you are using revolt as your main chatting platform or that the owner of the server uses it mainly.

The discord server is NOT meant to be edited, as this could crash the bot as it doesn't check.

#### However:

- If you wish to refresh profile pictures, delete the emojis associated with them. (those are auto created)
- If you wish to refresh the server icon, remove it and restart the bot.
- If you messed something up discord-side, stop the bot, delete everything, and restart it. Everything will be made automatically.

## To-Do

- message deletion
  - not sure how yet
  - would have to figure out some way to keep track of messages
  - could possibly use embeds, but that ruins some aesthetic
- message edits
  - not sure how yet
  - same as above
- apparently replies are fucked up on revolt-side and dont come back as messages
- webhooks on discord side
  - utilize webhooks or embeds (see above)
- voice and category channel syncing
- POSSIBLY a vc bridge that lets u talk ad the bot sends it to revolt and back
  - would need to figure out how [vortex](https://github.com/revoltchat/vortex) works and attempt to connect
- auto sync channels
- MAYBE ill figure out the upload shit for autumn and make images an attachment instead of link
- some sort of mention parsing
  - i think revolt usernames are unique so something like @meow would work for discord => revolt
- mentions command
  - lists people you can mention
