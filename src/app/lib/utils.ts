async function generateSummary(messages: any[]) {
  const core = toCoreMessages([
    {
      role: "system",
      content: [{ type: "text", text: "Summarize concisely." }],
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]);

  const { text } = await (
    await import("ai")
  ).generateText({
    model: getModel("gemini-1.5"), // or your default
    messages: core,
  });

  return text;
}
