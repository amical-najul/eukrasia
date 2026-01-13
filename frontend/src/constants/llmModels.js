export const LLM_PROVIDERS = [
    {
        id: 'openai',
        name: 'OpenAI',
        models: {
            general: [
                { id: 'gpt-5', name: 'GPT-5 (Flagship)' },
                { id: 'gpt-4.1', name: 'GPT-4.1 (High Reasoning)' },
                { id: 'gpt-4o', name: 'GPT-4o (Multimodal)' },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast/Cheap)' },
                { id: 'gpt-o3', name: 'GPT-o3 (Reasoning Optimized)' },
                { id: 'gpt-o3-mini', name: 'GPT-o3-mini (Lightweight)' }
            ],
            code: [
                { id: 'gpt-5-codex', name: 'GPT-5 Codex (End-to-end)' },
                { id: 'gpt-4.1-code', name: 'GPT-4.1 Code (Debug)' }
            ]
        }
    },
    {
        id: 'google',
        name: 'Google Gemini',
        models: {
            general: [
                { id: 'gemini-3-pro-high', name: 'Gemini 3 Pro (High)' },
                { id: 'gemini-3-pro-low', name: 'Gemini 3 Pro (Low)' },
                { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
                { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
                { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
                { id: 'gemini-ultra', name: 'Gemini Ultra' },
                { id: 'gemini-nano-banana', name: 'Gemini Nano (Banana)' }
            ],
            code: [
                { id: 'gemini-code-pro', name: 'Gemini Code Pro' },
                { id: 'alphacode-2', name: 'AlphaCode 2' }
            ]
        }
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        models: {
            general: [
                { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
                { id: 'claude-sonnet-4.5-thinking', name: 'Claude Sonnet 4.5 (Thinking)' },
                { id: 'claude-opus-4.5-thinking', name: 'Claude Opus 4.5 (Thinking)' },
                { id: 'claude-3.7-sonnet', name: 'Claude 3.7 Sonnet' },
                { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
                { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku' },
                { id: 'claude-computer-use', name: 'Claude Computer Use (Beta)' }
            ],
            code: [
                { id: 'claude-4.1-opus-code', name: 'Claude 4.1 Opus (Code)' },
                { id: 'claude-3.5-sonnet-code', name: 'Claude 3.5 Sonnet (Code)' }
            ]
        }
    },
    {
        id: 'xai',
        name: 'xAI (Grok)',
        models: {
            general: [
                { id: 'grok-4', name: 'Grok-4 (Flagship)' },
                { id: 'grok-4-heavy', name: 'Grok-4 Heavy' },
                { id: 'grok-4-fast', name: 'Grok-4 Fast (2M Context)' },
                { id: 'grok-3', name: 'Grok-3 (Reasoning)' },
                { id: 'grok-3-mini', name: 'Grok-3 Mini' }
            ],
            code: [
                { id: 'grok-code-fast-1', name: 'Grok Code Fast 1' }
            ]
        }
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        models: {
            general: [
                { id: 'deepseek-r1', name: 'DeepSeek-R1 (Reasoning 671B)' },
                { id: 'deepseek-r1-zero', name: 'DeepSeek-R1-Zero' },
                { id: 'deepseek-v3', name: 'DeepSeek-V3' },
                { id: 'deepseek-v2', name: 'DeepSeek-V2' }
            ],
            code: [
                { id: 'deepseek-coder', name: 'DeepSeek-Coder (Distilled)' },
                { id: 'deepseek-coder-v2', name: 'DeepSeek-Coder V2' }
            ]
        }
    },
    {
        id: 'alibaba',
        name: 'Alibaba',
        models: {
            general: [
                { id: 'qwen-3-max', name: 'Qwen 3 Max' },
                { id: 'qwen-2.5-max', name: 'Qwen 2.5 Max' },
                { id: 'qwen-plus', name: 'Qwen Plus' },
                { id: 'qwen-turbo', name: 'Qwen Turbo' },
                { id: 'qwen-2.5-vl', name: 'Qwen 2.5 VL' },
                { id: 'qwen-omni', name: 'Qwen Omni' }
            ],
            code: [
                { id: 'qwen-2.5-coder-32b', name: 'Qwen 2.5 Coder 32B' },
                { id: 'qwen-coder-turbo', name: 'Qwen Coder Turbo' }
            ]
        }
    }
];
