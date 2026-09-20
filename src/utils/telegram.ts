// src/utils/telegram.ts

export async function sendTelegramNotification(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8666747883:AAGpU-nVDZDEy2uLUEznhpBDRyGugq1K2lU';
  const rawChatIds = process.env.TELEGRAM_CHAT_ID || '1303146173,6396985082';

  if (!botToken) {
    console.warn("Telegram bot token missing, notification skipped.");
    return;
  }

  // Support multiple chat IDs separated by comma or semicolon
  // Also guarantee 6396985082 is included even if Next.js dev server was not restarted
  const chatIds = Array.from(new Set(
    rawChatIds
      .split(/[,;]/)
      .concat(['6396985082', '1303146173'])
      .map(id => id.trim())
      .filter(Boolean)
  ));

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await Promise.all(
    chatIds.map(async (chatId) => {
      try {
        const res = await fetch(url, {
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

        const data = await res.json();
        if (!res.ok || !data.ok) {
          console.error(`Telegram API error for chat_id ${chatId}:`, data);
        } else {
          console.log(`Telegram notification successfully sent to ${chatId}`);
        }
      } catch (error) {
        console.error(`Failed to send Telegram notification to ${chatId}:`, error);
      }
    })
  );
}
