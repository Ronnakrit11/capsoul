import TelegramBot from 'node-telegram-bot-api';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN is not defined - notifications will be disabled');
}

if (!TELEGRAM_CHAT_ID) {
  console.warn('TELEGRAM_CHAT_ID is not defined - notifications will be disabled');
}

// Initialize bot without polling
const bot = TELEGRAM_BOT_TOKEN ? new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false }) : null;

export async function sendOrderNotification(orderData: {
  orderNumber: string;
  customerName: string;
  email: string;
  tel: string;
  address: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  // If bot is not initialized, skip notification
  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log('Telegram notifications are disabled');
    return;
  }

  try {
    const message = `
🛍 *New Order Received!*

*Order Number:* \`${orderData.orderNumber}\`
*Customer:* ${orderData.customerName}
*Email:* ${orderData.email}
*Phone:* ${orderData.tel}
*Address:* ${orderData.address}

*Items:*
${orderData.items.map(item => `• ${item.name} x${item.quantity} ($${item.price})`).join('\n')}

*Total Amount:* $${orderData.totalAmount.toFixed(2)}

*Payment Method:* Cash on Delivery (COD)
*Status:* Pending
    `;

    await bot.sendMessage(TELEGRAM_CHAT_ID, message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    console.log('Telegram notification sent successfully');
  } catch (error) {
    // More detailed error logging
    console.error('Error sending Telegram notification:', {
      error: error,
      chatId: TELEGRAM_CHAT_ID,
    });
    
    // Don't throw the error to prevent order creation failure
    // Just log it since Telegram notification is not critical
  }
}