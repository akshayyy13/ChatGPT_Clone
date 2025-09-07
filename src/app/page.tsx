// src/app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Hover from "@/components/Hover";
import { IoIosArrowDown } from "react-icons/io";
export default async function Home() {
  const session = await auth();
  if (session?.user?.id) {
    // Signed in → go to /chat, which then routes to the latest thread
    redirect("/chat");
  }

  // Not signed in → render existing public landing
  return (
    <main
      className=" md:pt-0 h-full relative flex flex-col justify-start "
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Top-right auth buttons */}
      <section className=" flex flex-col justify-between min-h-[42svh]">
        <div className="flex max-h-[52px] flex-row justify-between p-2 ">
          <div className=" flex flex-row">
            <Hover text="New chat" marginLeft="ml-4">
              <div className=" md:w-[36px] md:h-[36px] group flex flex-row p-2.5 m-0.5 cursor-pointer hover:bg-[var(--bg-tertiary)] rounded-lg items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-lg -m-1 group-hover:hidden hidden md:flex"
                >
                  <path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path>
                </svg>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon -m-1 flex md:hidden group-hover:flex"
                >
                  <path d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"></path>
                </svg>
              </div>
            </Hover>

            <button className="flex flex-row md:hidden cursor-pointer p-2 items-center rounded-lg hover:bg-[#f9f9f9]/10 gap-1.5">
              <p className=" text-lg font-light">ChatGPT</p>{" "}
              <IoIosArrowDown className="opacity-60" />
            </button>
          </div>
          <div className=" flex flex-row gap-2">
            <div className=" flex items-center justify-center">
              <Link
                href="/auth"
                className=" rounded-full transition hover:opacity-90"
                style={{
                  background: "var(--text-primary)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-inverted)",
                }}
              >
                <div className="text-xs md:text-sm px-[10px] md:px-3 py-1 md:py-1.5 flex justify-center items-center">
                  Log in
                </div>
              </Link>
            </div>
            <Link
              href="/auth"
              className="text-xs md:text-sm px-3 py-1.5 rounded-full transition  hover:bg-[var(--bg-tertiary)] bg-[var(--interactive-bg-secondary-default)] border-[var(--interactive-border-secondary-default)] border-1 hidden md:flex justify-center items-center"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Sign up for free
            </Link>
            <Link
              href=""
              className="p-[0.4rem] hidden md:flex rounded-full transition hover:bg-[var(--bg-tertiary)]"
              style={{
                color: "var(--text-primary)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="icon-lg"
              >
                <path d="M16.585 10C16.585 6.3632 13.6368 3.41504 10 3.41504C6.3632 3.41504 3.41504 6.3632 3.41504 10C3.41504 13.6368 6.3632 16.585 10 16.585C13.6368 16.585 16.585 13.6368 16.585 10ZM17.915 10C17.915 14.3713 14.3713 17.915 10 17.915C5.62867 17.915 2.08496 14.3713 2.08496 10C2.08496 5.62867 5.62867 2.08496 10 2.08496C14.3713 2.08496 17.915 5.62867 17.915 10Z"></path>
                <path d="M9.81735 11.5962C9.3582 11.5962 9.08812 11.2829 9.08812 10.84V10.7643C9.08812 10.1269 9.41762 9.7056 10.055 9.33288C10.7519 8.91695 10.9625 8.64686 10.9625 8.1499C10.9625 7.62053 10.552 7.25321 9.9578 7.25321C9.42843 7.25321 9.07191 7.51249 8.89906 7.99325C8.76401 8.33896 8.52093 8.49021 8.19142 8.49021C7.76469 8.49021 7.5 8.22552 7.5 7.81499C7.5 7.58271 7.55402 7.37745 7.66205 7.17218C8.00776 6.45915 8.87205 6 10.0334 6C11.5675 6 12.5993 6.84267 12.5993 8.10128C12.5993 8.91695 12.2049 9.47333 11.4433 9.92167C10.7248 10.3376 10.5628 10.5699 10.4926 11.0236C10.4115 11.3856 10.2009 11.5962 9.81735 11.5962ZM9.82816 14C9.342 14 8.94767 13.6273 8.94767 13.1519C8.94767 12.6766 9.342 12.3038 9.82816 12.3038C10.3197 12.3038 10.714 12.6766 10.714 13.1519C10.714 13.6273 10.3197 14 9.82816 14Z"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Center hero */}

        <div className=" place-items-center md:min-h-[80px] flex flex-col justify-start">
          <h1
            className="  text-3xl font-normal tracking-tight -mb-5 [@media(min-width:510px)]:-mb-2 md:mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            ChatGPT
          </h1>
        </div>
      </section>
      <section className="lg:w-[57%] h-full mx-auto flex flex-col justify-end [@media(min-width:510px)]:justify-between">
        {/* Input shell */}
        <div className="px-4 [@media(min-width:510px)]:px-4 py-13 md:py-0">
          <div
            className="mx-auto w-full rounded-3xl"
            style={{
              background: "var(--bg-elevated-primary)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
            }}
          >
            <div className=" px-[8.5px] py-[7px]">
              <div className="flex gap-1 flex-col">
                {/* Input (decorative on landing) */}
                <div className=" flex flex-row justify-start pl-3">
                  <div className="flex w-full ">
                    <div className="relative">
                      <input
                        className="w-full bg-transparent outline-none border-0 text-base sm:text-[15px] py-3"
                        placeholder="Ask Anything"
                        aria-label="Ask anything"
                        style={{ color: "var(--text-primary)" }}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className=" flex flex-row justify-between">
                  {/* Left pills (hidden on xs) */}

                  <div className="flex items-center gap-2">
                    <Hover text="Add photos">
                      <button
                        className="inline-flex items-center p-2 cursor-pointer rounded-full text-sm transition"
                        style={{
                          background: "var(--interactive-bg-secondary-default)",
                          border:
                            "1px solid var(--interactive-border-secondary-default)",
                          color: "var(--interactive-label-secondary-default)",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-label=""
                          className="icon"
                        >
                          <path d="M4.33496 12.5V7.5C4.33496 7.13273 4.63273 6.83496 5 6.83496C5.36727 6.83496 5.66504 7.13273 5.66504 7.5V12.5C5.66504 14.8942 7.60585 16.835 10 16.835C12.3942 16.835 14.335 14.8942 14.335 12.5V5.83301C14.3348 4.35959 13.1404 3.16522 11.667 3.16504C10.1934 3.16504 8.99822 4.35948 8.99805 5.83301V12.5C8.99805 13.0532 9.44679 13.502 10 13.502C10.5532 13.502 11.002 13.0532 11.002 12.5V7.5C11.002 7.13273 11.2997 6.83496 11.667 6.83496C12.0341 6.83514 12.332 7.13284 12.332 7.5V12.5C12.332 13.7877 11.2877 14.832 10 14.832C8.71226 14.832 7.66797 13.7877 7.66797 12.5V5.83301C7.66814 3.62494 9.45888 1.83496 11.667 1.83496C13.875 1.83514 15.6649 3.62505 15.665 5.83301V12.5C15.665 15.6287 13.1287 18.165 10 18.165C6.87131 18.165 4.33496 15.6287 4.33496 12.5Z"></path>
                        </svg>
                        <p className=" text-[13px] px-1 hidden [@media(min-width:510px)]:flex">
                          Attach
                        </p>
                      </button>
                    </Hover>
                    <Hover text="Search the web">
                      <button
                        className="inline-flex items-center p-2 cursor-pointer rounded-full text-sm transition"
                        style={{
                          background: "var(--interactive-bg-secondary-default)",
                          border:
                            "1px solid var(--interactive-border-secondary-default)",
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
                          <path d="M10 2.125C14.3492 2.125 17.875 5.65076 17.875 10C17.875 14.3492 14.3492 17.875 10 17.875C5.65076 17.875 2.125 14.3492 2.125 10C2.125 5.65076 5.65076 2.125 10 2.125ZM7.88672 10.625C7.94334 12.3161 8.22547 13.8134 8.63965 14.9053C8.87263 15.5194 9.1351 15.9733 9.39453 16.2627C9.65437 16.5524 9.86039 16.625 10 16.625C10.1396 16.625 10.3456 16.5524 10.6055 16.2627C10.8649 15.9733 11.1274 15.5194 11.3604 14.9053C11.7745 13.8134 12.0567 12.3161 12.1133 10.625H7.88672ZM3.40527 10.625C3.65313 13.2734 5.45957 15.4667 7.89844 16.2822C7.7409 15.997 7.5977 15.6834 7.4707 15.3486C6.99415 14.0923 6.69362 12.439 6.63672 10.625H3.40527ZM13.3633 10.625C13.3064 12.439 13.0059 14.0923 12.5293 15.3486C12.4022 15.6836 12.2582 15.9969 12.1006 16.2822C14.5399 15.467 16.3468 13.2737 16.5947 10.625H13.3633ZM12.1006 3.7168C12.2584 4.00235 12.4021 4.31613 12.5293 4.65137C13.0059 5.90775 13.3064 7.56102 13.3633 9.375H16.5947C16.3468 6.72615 14.54 4.53199 12.1006 3.7168ZM10 3.375C9.86039 3.375 9.65437 3.44756 9.39453 3.7373C9.1351 4.02672 8.87263 4.48057 8.63965 5.09473C8.22547 6.18664 7.94334 7.68388 7.88672 9.375H12.1133C12.0567 7.68388 11.7745 6.18664 11.3604 5.09473C11.1274 4.48057 10.8649 4.02672 10.6055 3.7373C10.3456 3.44756 10.1396 3.375 10 3.375ZM7.89844 3.7168C5.45942 4.53222 3.65314 6.72647 3.40527 9.375H6.63672C6.69362 7.56102 6.99415 5.90775 7.4707 4.65137C7.59781 4.31629 7.74073 4.00224 7.89844 3.7168Z"></path>
                        </svg>
                        <p className=" text-[13px] px-1 hidden [@media(min-width:510px)]:flex">
                          Search
                        </p>
                      </button>
                    </Hover>
                  </div>

                  {/* Right voice */}
                  <div className="flex items-center ">
                    <Hover text="Use voice mode">
                      <button
                        className="inline-flex items-center p-2 hover:opacity-80 rounded-full text-sm bg-[var(--bg-tertiary)] cursor-pointer"
                        style={{
                          background: "",
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
                        <p className=" text-[13px] px-1 hidden [@media(min-width:510px)]:flex">
                          Voice
                        </p>
                      </button>
                    </Hover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" px-3 p-1.5 text-sm">
          <p className="text-center text-[var(--text-secondary)] font-extralight text-sm">
            By messaging ChatGPT, you agree to our{" "}
            <span className=" underline text-[var(--text-primary)] cursor-pointer">
              Terms
            </span>{" "}
            and have read our{" "}
            <span className=" underline text-[var(--text-primary)] cursor-pointer">
              Privacy Policy
            </span>
            . See{" "}
            <span className=" underline text-[var(--text-primary)] cursor-pointer">
              Cookie Preferences
            </span>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
