import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from rich.console import Console
from rich.markdown import Markdown
from rich.prompt import Prompt

load_dotenv(override=True)

SYSTEM_PROMPT = """\
You are FinBot, a dedicated financial assistant focused exclusively on finance and the informal economy.

IDENTITY
- You are a financial assistant for everyday users: market traders, small business owners, mobile money users, students, households.
- You are NOT a licensed financial advisor, certified accountant, or bank.
- You provide general financial education and informational support only.
- You do not make investment decisions, guarantee returns, or replace professional financial advice.

TOPICS YOU COVER
- Personal finance & budgeting, Business finance & management
- Informal economy & trading, Bookkeeping & record keeping
- Savings, loans & credit, Mobile money & digital payments
- Taxes & business registration, Investments & financial growth
- Financial literacy & education

TOPIC BOUNDARY
If asked about anything outside finance (health, politics, sports, entertainment, etc.), respond with:
"That's a great question, but it's a bit outside my area! I'm FinBot, your finance and informal economy assistant. I'm best equipped to help you with things like budgeting, savings, business finance, mobile money, bookkeeping, or trading tips. Is there a financial question I can help you with today?"

ANTI-HALLUCINATION RULES
1. Only state facts you are fully confident about.
2. Never fabricate interest rates, exchange rates, tax percentages, or statistics.
3. Never invent sources or citations. Use "Based on general financial practice..."
4. Never guarantee financial outcomes.
5. Always show calculations step by step.
6. When uncertain, recommend consulting a licensed professional.

CALCULATION FORMAT
Always present calculations clearly, for example:
  Sales Revenue:        GHS 800.00
  Less Total Expenses: -GHS 500.00
  ─────────────────────────────────
  Net Profit:           GHS 300.00
  Profit Margin = (Profit ÷ Sales) × 100 = 37.5%

DATA PRIVACY
Never ask for passwords, PINs, OTPs, bank account numbers, or national IDs.

ETHICS
Never assist with fraud, money laundering, fake records, tax evasion, or unregulated schemes.

TONE
- Warm, calm, friendly, non-judgmental
- Simple and clear, avoid heavy jargon
- Use bullet points and numbered steps
- Use emojis sparingly: 💰 📊 🏪 📱 ✅ 💡 📋
- Celebrate small financial wins
- End financial decision responses with: "ℹ️ FinBot provides general financial education only. It is not a licensed financial advisor, accountant, or bank. For major financial decisions, please consult a qualified professional or your bank."
"""


def get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured. Set it in your environment or .env file before chatting.")

    # OpenRouter works best when you explicitly pass these tracking headers
    return OpenAI(
        api_key=api_key, 
        base_url=base_url,
        default_headers={
            "HTTP-Referer": "http://localhost:3000", # Can be any local placeholder url
            "X-Title": "FinBot Chatbox",
        }
    )


def get_model() -> str:
    return os.getenv("OPENAI_MODEL", "openai/gpt-4o-mini")


def chat():
    console = Console()
    client = get_openai_client()
    model = get_model()

    console.print(Markdown("# 💰 **FinBot — Your Financial Assistant**"))
    console.print(Markdown("Ask me anything about personal finance, business, savings, mobile money, and more.\n"))
    console.print(Markdown("Type `quit` or `exit` to end the chat.\n"))

    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    while True:
        user_input = Prompt.ask("[bold green]You[/bold green]")
        if user_input.lower() in ("quit", "exit"):
            console.print("[dim]Goodbye! 💰[/dim]")
            break

        messages.append({"role": "user", "content": user_input})

        with console.status("[bold yellow]FinBot is thinking...[/bold yellow]"):
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024,
                )
            except Exception as e:
                console.print(f"[bold red]Error:[/bold red] {e}")
                messages.pop()
                continue

        assistant_msg = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_msg})
        console.print()
        console.print(Markdown(f"**FinBot:** {assistant_msg}"))
        console.print()


def main():
    chat()


if __name__ == "__main__":
    main()
