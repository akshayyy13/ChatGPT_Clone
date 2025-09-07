"use client";
import { useState } from "react";

interface BirthdayInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function BirthdayInput({
  value,
  onChange,
  required = false,
}: BirthdayInputProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, "");

    if (inputValue.length >= 2) {
      inputValue = inputValue.substring(0, 2) + "/" + inputValue.substring(2);
    }
    if (inputValue.length >= 5) {
      inputValue =
        inputValue.substring(0, 5) + "/" + inputValue.substring(5, 9);
    }

    onChange(inputValue);
  };

  return (
    <div className="relative">
      <input
        type="text"
        id="birthday"
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder=" "
        maxLength={10}
        className={`peer w-full px-4 py-3 border rounded-md text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
          focused || value ? "border-green-500" : "border-gray-300"
        }`}
        required={required}
      />
      <label
        htmlFor="birthday"
        className={`absolute left-4 transition-all duration-200 transform origin-left bg-[#f9f9f9] px-1 ${
          focused || value
            ? "top-1 text-xs text-green-600 -translate-y-1"
            : "top-3 text-base text-gray-500"
        }`}
      >
        Birthday
      </label>
      {focused && !value && (
        <div className="absolute left-4 top-3 text-gray-400 pointer-events-none">
          <span className="bg-green-100 text-green-600 px-1 rounded text-sm font-medium">
            MM
          </span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-gray-400">DD</span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-gray-400">YYYY</span>
        </div>
      )}
    </div>
  );
}
