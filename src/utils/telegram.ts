// src/utils/telegram.ts

export async function sendTelegramNotification(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatIds = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !rawChatIds) {
    console.warn("Telegram credentials missing in .env.local, notification skipped.");
    return;
  }

  // Support multiple chat IDs separated by comma or semicolon
  const chatIds = rawChatIds
    .split(/[,;]/)
    .map(id => id.trim())
    .filter(Boolean);

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        });
      } catch (error) {
        console.error(`Failed to send Telegram notification to ${chatId}:`, error);
      }
    })
  );
}
