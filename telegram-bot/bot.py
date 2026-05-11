import os
import logging
from collections import defaultdict
from anthropic import Anthropic
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

ANTHROPIC_KEY = os.environ["ANTHROPIC_API_KEY"]
BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
MAX_HISTORY = int(os.getenv("MAX_HISTORY", "20"))
MODEL = os.getenv("CLAUDE_MODEL", "claude-opus-4-7")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2048"))
SYSTEM_PROMPT = os.getenv(
    "SYSTEM_PROMPT",
    "You are a helpful assistant. Answer concisely and clearly.",
)

client = Anthropic(api_key=ANTHROPIC_KEY)
histories: dict[int, list[dict]] = defaultdict(list)


async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "👋 Hi! I'm powered by Claude.\n\n"
        "Just send me any message and I'll respond.\n"
        "/reset — clear conversation history\n"
        "/info — show current settings"
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
        f"📏 Max history: {MAX_HISTORY} messages\n"
        f"🔢 Max tokens: {MAX_TOKENS}",
        parse_mode="Markdown",
    )


async def handle_message(update: Update, ctx: ContextTypes.DEFAULT_TYPE) -> None:
    chat_id = update.effective_chat.id
    user_text = update.message.text

    await ctx.bot.send_chat_action(chat_id=chat_id, action="typing")

    history = histories[chat_id]
    history.append({"role": "user", "content": user_text})

    # Keep history within limit
    if len(history) > MAX_HISTORY:
        histories[chat_id] = history[-MAX_HISTORY:]

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=histories[chat_id],
        )
        reply = response.content[0].text
        history.append({"role": "assistant", "content": reply})

        # Telegram message limit is 4096 chars — split if needed
        for i in range(0, len(reply), 4096):
            await update.message.reply_text(reply[i : i + 4096])

    except Exception as e:
        logger.error("Claude API error: %s", e)
        await update.message.reply_text(
            "⚠️ Something went wrong. Please try again."
        )


def main() -> None:
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("reset", reset))
    app.add_handler(CommandHandler("info", info))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("Bot started. Polling...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
