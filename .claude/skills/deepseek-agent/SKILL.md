---
name: deepseek-agent
description: Adds DeepSeek as a fallback reasoning tool.
---

# DeepSeek Fallback Agent

This skill integrates DeepSeek so Claude can delegate complex reasoning or handle "Rate Limit" errors automatically.

## Models

- `deepseek-chat` — Fast, cost-effective model for general tasks and conversation.
- `deepseek-reasoner` — Slow, high-quality model for complex reasoning (returns a `reasoning_content` field before the final answer).

## Tasks

1. **Create Utility:** Create `src/utils/deepseek.ts` to handle the API call to `https://api.deepseek.com/v1/chat/completions`. Accept a `model` parameter defaulting to `deepseek-chat`; use `deepseek-reasoner` for reasoning-heavy tasks.
2. **Handle Reasoning:** For `deepseek-reasoner` responses, extract `reasoning_content` (chain-of-thought) separately from the final `content`. For `deepseek-chat` responses, use `content` directly. Ensure the utility also extracts any `<tool_call>` tags from responses.
3. **Register Tools:** Add both `call_deepseek_chat` and `call_deepseek_reasoning` to the tools in `src/index.ts`.
4. **Logic:** Add a wrapper in the message loop: if a Claude request returns a 429 (Rate Limit) or 503 error, automatically retry once — use `call_deepseek_chat` for general messages and `call_deepseek_reasoning` for tasks that require multi-step reasoning.