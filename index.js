const express = require("express")
const app = express();
var listener = app.listen(process.env.PORT || 2000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.listen(() => console.log("I'm Ready To Work..! 24H"));
app.get('/', (req, res) => {
  res.send(`
  <body>
  <center><h1>Bot 24H ON!</h1></center
  </body>`)
});
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection
} = require('@discordjs/voice');
const play = require('play-dl');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const commands = [
  {
    name: 'join',
    description: 'دخول الروم والبقاء فيه 24 ساعة'
  },
  {
    name: 'play',
    description: 'تشغيل أغنية',
    options: [
      {
        name: 'query',
        type: 3,
        description: 'رابط أو اسم الأغنية',
        required: true
      }
    ]
  },
  {
    name: 'stop',
    description: 'إيقاف الأغنية وخروج البوت'
  }
];

const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Play,
  },
});

// تشغيل الصوت الصامت بشكل متكرر
function playSilent() {
  if (fs.existsSync('silent.mp3')) {
    const silentResource = createAudioResource('silent.mp3');
    player.play(silentResource);
  } else {
    console.error('❌ ملف silent.mp3 غير موجود!');
  }
}

// عند انتهاء أي صوت، يشغل silent مرة ثانية
player.on(AudioPlayerStatus.Idle, () => {
  playSilent();
});

client.once('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.token);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered!');
  } catch (err) {
    console.error(err);
  }
  console.log(`🟢 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;

  // أمر join
  if (commandName === 'join') {
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply('❌ لازم تدخل روم صوتي.');

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);
    playSilent();

    return interaction.reply('✅ دخلت الروم الصوتي وراح أجلس فيه 24 ساعة.');
  }

  // أمر play
  if (commandName === 'play') {
    const query = interaction.options.getString('query');
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply('❌ لازم تدخل روم صوتي.');

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.subscribe(player);

    try {
      const stream = await play.stream(query);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);

      interaction.reply(`🎶 يتم تشغيل: **${query}**`);
    } catch (err) {
      console.error(err);
      interaction.reply('❌ صار خطأ أثناء محاولة تشغيل الأغنية.');
    }
  }

  // أمر stop
  if (commandName === 'stop') {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) return interaction.reply('❌ البوت مو موجود في أي روم.');

    connection.destroy();
    player.stop();

    interaction.reply('🛑 تم إيقاف الأغنية وخروج البوت.');
  }
});

client.login(process.env.token);
const keepAlive = require("./keep_alive");
keepAlive();
app.get("/", (req, res) => {
  res.send("✅ Bot is alive!");
});

const PORT = process.env.PORT || 3000; // هذا المهم

app.listen(PORT, () => {
  console.log(`✅ Web server is running on port ${PORT}`);
});
