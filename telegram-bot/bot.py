import os
import logging
from collections import defaultdict
import google.generativeai as genai
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

GEMINI_KEY = os.environ["GEMINI_API_KEY"]
BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "20"))
MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "You are a helpful assistant. Answer concisely and clearly.",
)

genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel(model_name=MODEL, system_instruction=SYSTEM_PROMPT)

# history per chat_id: list of {"role": "user"|"model", "parts": [str]}
histories: dict[int, list[dict]] = defaultdict(list)


def build_chat(chat_id: int) -> genai.ChatSession:
    return model.start_chat(history=histories[chat_id])


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "👋 Hi! I'm powered by Google Gemini.\n\n"
        "Just send me any message and I'll respond.\n"
        "/reset — clear conversation history\n"
        "/info  — show current settings"
    )


async def reset(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    histories[chat_id].clear()
    await update.message.reply_text("✅ Conversation history cleared.")


async def info(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    turns = len(histories[chat_id])
    await update.message.reply_text(
        f"🤖 Model: `{MODEL}`\n"
        f"💬 History: {turns} messages\n"
        f"📏 Max history: {MAX_HISTORY} messages",
        parse_mode="Markdown",
    )


async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    user_text = update.message.text

    await ctx.bot.send_chat_action(chat_id=chat_id, action="typing")

    try:
        chat = build_chat(chat_id)
        response = chat.send_message(user_text)
        reply = response.text

        # Update stored history from the chat session
        histories[chat_id] = list(chat.history)
        # Trim to limit
        if len(histories[chat_id]) > MAX_HISTORY:
            histories[chat_id] = histories[chat_id][-MAX_HISTORY:]

        # Telegram message limit is 4096 chars
        for i in range(0, len(reply), 4096):
            await update.message.reply_text(reply[i : i + 4096])

    except Exception as e:
        logger.error("Gemini API error: %s", e)
        await update.message.reply_text(
            "⚠️ Something went wrong. Please try again."
        )


def main() -> None:
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reset", reset))
    app.add_handler(CommandHandler("info", info))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot started with model: %s", MODEL)
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
