"use client";

export default function LoadingBubble() {
  return (
    <div className="w-full flex justify-start mt-2">
      <div className="text-white max-w-[100%]">
        <div className="w-full rounded-3xl break-words text-[var(--text-secondary)]">
          <div className="flex items-center space-x-2 p-4">
            <div className="flex space-x-1">
              <div className="loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
