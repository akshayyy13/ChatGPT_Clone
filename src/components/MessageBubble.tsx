"use client";
import Markdown from "@/components/Markdown";
import { Msg, TextContent } from "@/app/types";
import { BiCopy, BiLike, BiDislike } from "react-icons/bi";
import { GrFormEdit } from "react-icons/gr";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { RiShare2Fill } from "react-icons/ri";
import { BsArrowRepeat } from "react-icons/bs";

export default function MessageBubble({
  msg,
  onEdit,
  onCopy,
}: {
  msg: Msg;
  onEdit?: () => void;
  onCopy?: () => void;
}) {
  const isUser = msg.role === "user";
  const text =
    (msg.content.find((c) => c.type === "text") as TextContent | undefined)
      ?.text ?? "";

  const iconBtn =
    "inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition cursor-pointer text-[var(--text-secondary)] opacity-95";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "relative group rounded-3xl break-words max-w-full sm:max-w-[80%] md:max-w-[70%] p-3",
          isUser
            ? "bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
            : "bg-[var(--bg-primary)] text-white",
        ].join(" ")}
      >
        <div className="w-full break-words">
          <Markdown
            components={{
              pre: ({ children }) => (
                <pre
                  className="bg-black text-white p-3 rounded-lg overflow-x-auto whitespace-pre overflow-y-hidden max-w-full"
                  style={{ whiteSpace: "pre" }} // prevents wrapping inside pre
                >
                  {children}
                </pre>
              ),
              code: ({ children }) => (
                <code className="bg-black text-white px-1 py-[0.1rem] rounded-sm break-words">
                  {children}
                </code>
              ),
            }}
          >
            {text}
          </Markdown>
        </div>

        {isUser && (
          <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] shadow-md backdrop-blur-sm">
              <button
                onClick={onCopy}
                type="button"
                aria-label="Copy message"
                className={iconBtn}
                title="Copy"
              >
                <BiCopy size={20} />
              </button>

              {onEdit && (
                <button
                  onClick={onEdit}
                  type="button"
                  aria-label="Edit message"
                  className={iconBtn}
                  title="Edit"
                >
                  <GrFormEdit size={20} />
                </button>
              )}
            </div>
          </div>
        )}

        {!isUser && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <button
              onClick={onCopy}
              type="button"
              className={iconBtn}
              title="Copy"
            >
              <BiCopy size={20} />
            </button>
            <button type="button" className={iconBtn} title="Like">
              <BiLike size={20} />
            </button>
            <button type="button" className={iconBtn} title="DisLike">
              <BiDislike size={20} />
            </button>
            <button type="button" className={iconBtn} title="Speak Aloud">
              <HiOutlineSpeakerWave size={20} />
            </button>
            <button type="button" className={iconBtn} title="Share">
              <RiShare2Fill size={20} />
            </button>
            <button type="button" className={iconBtn} title="Try Again">
              <BsArrowRepeat size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
