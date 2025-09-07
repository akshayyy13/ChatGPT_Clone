"use client";

import { useRef, useEffect, useCallback } from "react";
import { IoMdArrowUp } from "react-icons/io";
import Hover from "@/components/Hover";

interface ComposerProps {
  input: string;
  setInput: (value: string) => void;
  selectedFile: {
    name: string;
    url: string;
    mime: string;
    size?: number;
    publicId?: string;
  } | null;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<{
      name: string;
      url: string;
      mime: string;
      size?: number;
      publicId?: string;
    } | null>
  >;
  uploading: boolean;
  onSend: () => void;
  sending: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Composer({
  input,
  setInput,
  selectedFile,
  setSelectedFile,
  uploading,
  onSend,
  sending,
  onFileSelect,
}: ComposerProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Move autosizeTextarea to useCallback at top level
  const autosizeTextarea = useCallback(() => {
    const el = taRef.current;
    if (!el) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      // Reset height first to allow shrinking
      el.style.height = "auto";

      // Calculate new height
      const scrollHeight = el.scrollHeight;
      const maxHeight = 180;

      // Set height with max constraint
      const nextHeight = Math.min(scrollHeight, maxHeight);
      el.style.height = `${nextHeight}px`;
    });
  }, []);

  // ✅ Initial resize and cleanup
  useEffect(() => {
    autosizeTextarea();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autosizeTextarea]);

  // ✅ Handle input changes and call autosize
  useEffect(() => {
    autosizeTextarea();
  }, [input, autosizeTextarea]);

  // ✅ Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      autosizeTextarea();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autosizeTextarea]);

  const hasText = input.trim().length > 0;

  return (
    <div className="w-full max-w-[40rem] lg:max-w-[48rem] sm:p-0 px-5 mx-auto bg-[var(--bg-primary)]">
      <div
        className="w-full rounded-4xl mx-auto p-2 relative"
        style={{
          background: "var(--bg-elevated-primary)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
        }}
      >
        <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-1.5">
          {selectedFile && (
            <div className=" px-1">
              <div className="relative isolate  cursor-pointer inline-flex max-w-full items-center gap-2 rounded-[18px] border border-[var(--border-heavy)] bg-[var(--bg-background-primary)] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] w-[20rem]">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-[#FA423E]">
                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.2598 2.25191C11.8396 2.25191 12.2381 2.24808 12.6201 2.33981L12.8594 2.40719C13.0957 2.48399 13.3228 2.5886 13.5352 2.71871L13.6582 2.79879C13.9416 2.99641 14.1998 3.25938 14.5586 3.61813L15.5488 4.60836L15.833 4.89449C16.0955 5.16136 16.2943 5.38072 16.4482 5.6318L16.5703 5.84957C16.6829 6.07074 16.7691 6.30495 16.8271 6.54684L16.8574 6.69137C16.918 7.0314 16.915 7.39998 16.915 7.90719V13.0839C16.915 13.7728 16.9157 14.3301 16.8789 14.7802C16.8461 15.1808 16.781 15.5417 16.6367 15.8779L16.5703 16.0205C16.3049 16.5413 15.9008 16.9772 15.4053 17.2812L15.1865 17.4033C14.8099 17.5951 14.4041 17.6745 13.9463 17.7119C13.4961 17.7487 12.9391 17.749 12.25 17.749H7.75C7.06092 17.749 6.50395 17.7487 6.05371 17.7119C5.65317 17.6791 5.29227 17.6148 4.95606 17.4707L4.81348 17.4033C4.29235 17.1378 3.85586 16.7341 3.55176 16.2382L3.42969 16.0205C3.23787 15.6439 3.15854 15.2379 3.12109 14.7802C3.08432 14.3301 3.08496 13.7728 3.08496 13.0839V6.91695C3.08496 6.228 3.08433 5.67086 3.12109 5.22066C3.1585 4.76296 3.23797 4.35698 3.42969 3.98043C3.73311 3.38494 4.218 2.90008 4.81348 2.59664C5.19009 2.40484 5.59593 2.32546 6.05371 2.28805C6.50395 2.25126 7.06091 2.25191 7.75 2.25191H11.2598ZM7.75 3.58199C7.03896 3.58199 6.54563 3.58288 6.16211 3.61422C5.78642 3.64492 5.575 3.70168 5.41699 3.78219C5.0718 3.95811 4.79114 4.23874 4.61524 4.58395C4.53479 4.74193 4.47795 4.95354 4.44727 5.32906C4.41595 5.71254 4.41504 6.20609 4.41504 6.91695V13.0839C4.41504 13.7947 4.41594 14.2884 4.44727 14.6718C4.47798 15.0472 4.53477 15.259 4.61524 15.417L4.68555 15.5429C4.86186 15.8304 5.11487 16.0648 5.41699 16.2187L5.54688 16.2744C5.69065 16.3258 5.88016 16.3636 6.16211 16.3867C6.54563 16.418 7.03898 16.4189 7.75 16.4189H12.25C12.961 16.4189 13.4544 16.418 13.8379 16.3867C14.2135 16.356 14.425 16.2992 14.583 16.2187L14.709 16.1474C14.9963 15.9712 15.2308 15.7189 15.3848 15.417L15.4414 15.2861C15.4927 15.1425 15.5297 14.953 15.5527 14.6718C15.5841 14.2884 15.585 13.7947 15.585 13.0839V8.55758L13.3506 8.30953C12.2572 8.18804 11.3976 7.31827 11.2881 6.22359L11.0234 3.58199H7.75ZM12.6113 6.09176C12.6584 6.56193 13.0275 6.93498 13.4971 6.98727L15.5762 7.21871C15.5727 7.13752 15.5686 7.07109 15.5615 7.01266L15.5342 6.85738C15.5005 6.7171 15.4501 6.58135 15.3848 6.45309L15.3145 6.32711C15.2625 6.24233 15.1995 6.16135 15.0928 6.04488L14.6084 5.54879L13.6182 4.55856C13.2769 4.21733 13.1049 4.04904 12.9688 3.94234L12.8398 3.8525C12.7167 3.77705 12.5853 3.71637 12.4482 3.67184L12.3672 3.6484L12.6113 6.09176Z"
                      ></path>
                    </svg>
                  )}
                </div>

                <div className="min-w-0 leading-5">
                  <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                    {selectedFile.name}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)]">
                    {selectedFile.mime?.split("/")[1] || "FILE"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="absolute top-[5px] right-[5px] grid h-[18px] w-[18px] place-items-center rounded-full border border-[var(--border-default)] bg-[#f9f9f9] text-[10px] leading-none text-[var(--text-inverted)] shadow-sm cursor-pointer"
                  aria-label="Remove file"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label=""
                    className="icon-sm"
                  >
                    <path d="M11.1152 3.91503C11.3868 3.73594 11.756 3.7658 11.9951 4.00488C12.2341 4.24395 12.264 4.61309 12.0849 4.88476L11.9951 4.99511L8.99018 7.99999L11.9951 11.0049L12.0849 11.1152C12.264 11.3869 12.2341 11.756 11.9951 11.9951C11.756 12.2342 11.3868 12.2641 11.1152 12.085L11.0048 11.9951L7.99995 8.99023L4.99506 11.9951C4.7217 12.2685 4.2782 12.2685 4.00483 11.9951C3.73146 11.7217 3.73146 11.2782 4.00483 11.0049L7.00971 7.99999L4.00483 4.99511L3.91499 4.88476C3.73589 4.61309 3.76575 4.24395 4.00483 4.00488C4.24391 3.7658 4.61305 3.73594 4.88471 3.91503L4.99506 4.00488L7.99995 7.00976L11.0048 4.00488L11.1152 3.91503Z"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end justify-between">
            <div className=" flex items-center gap-2">
              <Hover text="Add files and more ">
                <button
                  className="cursor-pointer rounded-full hover:bg-[#454545] p-2"
                  style={{
                    color: "var(--interactive-label-secondary-default)",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon"
                  >
                    <path d="M9.33496 16.5V10.665H3.5C3.13273 10.665 2.83496 10.3673 2.83496 10C2.83496 9.63273 3.13273 9.33496 3.5 9.33496H9.33496V3.5C9.33496 3.13273 9.63273 2.83496 10 2.83496C10.3673 2.83496 10.665 3.13273 10.665 3.5V9.33496H16.5L16.6338 9.34863C16.9369 9.41057 17.165 9.67857 17.165 10C17.165 10.3214 16.9369 10.5894 16.6338 10.6514L16.5 10.665H10.665V16.5C10.665 16.8673 10.3673 17.165 10 17.165C9.63273 17.165 9.33496 16.8673 9.33496 16.5Z"></path>
                  </svg>
                </button>
              </Hover>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.json,.csv"
                onChange={onFileSelect}
              />
            </div>

            <div className="flex-1 justify-end ">
              <textarea
                ref={taRef}
                className="w-full bg-transparent outline-none border-0 text-base text-[15px] resize-none leading-6 placeholder:text-gray-400 placeholder:text-left max-h-[180px] min-h-[24px] overflow-y-auto textarea-scroll"
                placeholder="Ask anything"
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // ✅ Remove the direct call - it's handled by useEffect
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                style={{
                  overflowAnchor: "none",
                  height: "auto", // ✅ Add initial height
                }}
              />
            </div>

            <div className="flex items-end gap-1.5">
              <Hover text="Dictate">
                <div className="cursor-pointer rounded-full hover:bg-[#454545] p-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label=""
                    className="icon"
                    fontSize="inherit"
                  >
                    <path d="M15.7806 10.1963C16.1326 10.3011 16.3336 10.6714 16.2288 11.0234L16.1487 11.2725C15.3429 13.6262 13.2236 15.3697 10.6644 15.6299L10.6653 16.835H12.0833L12.2171 16.8486C12.5202 16.9106 12.7484 17.1786 12.7484 17.5C12.7484 17.8214 12.5202 18.0894 12.2171 18.1514L12.0833 18.165H7.91632C7.5492 18.1649 7.25128 17.8672 7.25128 17.5C7.25128 17.1328 7.5492 16.8351 7.91632 16.835H9.33527L9.33429 15.6299C6.775 15.3697 4.6558 13.6262 3.84992 11.2725L3.76984 11.0234L3.74445 10.8906C3.71751 10.5825 3.91011 10.2879 4.21808 10.1963C4.52615 10.1047 4.84769 10.2466 4.99347 10.5195L5.04523 10.6436L5.10871 10.8418C5.8047 12.8745 7.73211 14.335 9.99933 14.335C12.3396 14.3349 14.3179 12.7789 14.9534 10.6436L15.0052 10.5195C15.151 10.2466 15.4725 10.1046 15.7806 10.1963ZM12.2513 5.41699C12.2513 4.17354 11.2437 3.16521 10.0003 3.16504C8.75675 3.16504 7.74835 4.17343 7.74835 5.41699V9.16699C7.74853 10.4104 8.75685 11.418 10.0003 11.418C11.2436 11.4178 12.2511 10.4103 12.2513 9.16699V5.41699ZM13.5814 9.16699C13.5812 11.1448 11.9781 12.7479 10.0003 12.748C8.02232 12.748 6.41845 11.1449 6.41828 9.16699V5.41699C6.41828 3.43889 8.02221 1.83496 10.0003 1.83496C11.9783 1.83514 13.5814 3.439 13.5814 5.41699V9.16699Z"></path>
                  </svg>
                </div>
              </Hover>
              {hasText ? (
                <button
                  onClick={onSend}
                  disabled={sending}
                  className="inline-flex items-center gap-2 p-2 rounded-full text-sm transition disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "var(--interactive-bg-primary-default)",
                    color: "var(--interactive-label-primary-default)",
                  }}
                >
                  <IoMdArrowUp size={22} />
                </button>
              ) : (
                <div className="flex items-end gap-2">
                  <Hover text="Use voice mode">
                    <button
                      className="cursor-pointer rounded-full opacity-80 bg-[#454545] hover:opacity-70 p-2"
                      style={{
                        color: "var(--interactive-label-secondary-default)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon"
                      >
                        <path d="M7.167 15.416V4.583a.75.75 0 0 1 1.5 0v10.833a.75.75 0 0 1-1.5 0Zm4.166-2.5V7.083a.75.75 0 0 1 1.5 0v5.833a.75.75 0 0 1-1.5 0ZM3 11.25V8.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0Zm12.5 0V8.75a.75.75 0 0 1 1.5 0v2.5a.75.75 0 0 1-1.5 0Z"></path>
                      </svg>
                    </button>
                  </Hover>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center my-1.5 w-full text-center text-[var(--text-tertiary)]">
        <div className="text-center text-[var(--text-primary)] font-extralight text-[12px] md:text-[13px]">
          ChatGPT can make mistakes. Check important info. See{" "}
          <span className="underline text-[var(--text-primary)] cursor-pointer">
            Cookie Preferences
          </span>
          .
        </div>
      </div>
    </div>
  );
}
