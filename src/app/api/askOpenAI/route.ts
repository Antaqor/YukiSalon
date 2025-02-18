import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // Check if API key is available
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
        }

        // OpenAI client setup
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // OpenAI API call
        const chatResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 100,
            temperature: 0.7,
        });

        // Extract the assistant’s reply
        const reply = chatResponse.choices[0]?.message?.content || "No response from AI";

        return NextResponse.json({ result: reply });
    } catch (err) {
        console.error("OpenAI error:", err);
        return NextResponse.json({ error: "AI request failed" }, { status: 500 });
    }
}
