# pip install python-telegram-bot==20.*
from telegram import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo, Update
from telegram.ext import Application, CommandHandler, ContextTypes

WEBAPP_URL = "https://74ac16104c81.ngrok-free.app"  # must be HTTPS and allowed in BotFather /setdomain

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    kb = InlineKeyboardMarkup(
        [[ InlineKeyboardButton(text="Open App", web_app=WebAppInfo(url=WEBAPP_URL)) ]]
    )
    await update.message.reply_text(
        "Tap to open the app:",
        reply_markup=kb
    )

def main():
    app = Application.builder().token("7383155264:AAEvP3AyMJ3JQdpfficepnuwOI6u-JZe1gg").build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling()

if __name__ == "__main__":
    main()
