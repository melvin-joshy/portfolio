/* Shared story styling for every project page: the CrewsLink (ClientStoryBody) system.
   Values are lifted from there so the template bodies read the same. */

export const FONTS = {
  text: "var(--font-geist), var(--font-inter)",
  mono: "var(--font-geist-mono), var(--font-mono)",
};

/* One 1040px column for text, media and meta alike */
export const COLUMN = "mx-auto w-full max-w-[1040px]";

export const BODY_P = "text-[16px] leading-[1.62] text-white/65";

export const H1_CLASS = "text-[clamp(36px,4.6vw,56px)] leading-[1.06] text-white";
export const H1_STYLE = { fontFamily: FONTS.text, fontWeight: 500, letterSpacing: "-0.025em" } as const;

export const H2_CLASS = "text-[clamp(24px,2.5vw,33px)] leading-[1.12] text-white";
export const H2_STYLE = { fontFamily: FONTS.text, fontWeight: 500, letterSpacing: "-0.02em" } as const;

export const CAPTION_CLASS = "mt-3.5 text-[12px] text-white/50";
