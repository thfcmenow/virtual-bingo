import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '15': 'repeat(15, minmax(0, 1fr))',
      },
      colors: {
        slate: {
          850: '#151f32',
        },
        bingo: {
          b: "#3b82f6",
          i: "#ef4444",
          n: "#f59e0b",
          g: "#10b981",
          o: "#8b5cf6",
        },
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pop-in": "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "daub-stamp": "daubStamp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "ball-roll": "ballRoll 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "glow": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        daubStamp: {
          "0%": { transform: "scale(2.2)", opacity: "0" },
          "60%": { transform: "scale(0.9)", opacity: "0.95" },
          "100%": { transform: "scale(1)", opacity: "0.9" },
        },
        ballRoll: {
          "0%": { transform: "scale(0.2) rotate(-180deg) translateY(40px)", opacity: "0" },
          "70%": { transform: "scale(1.1) rotate(10deg) translateY(-5px)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg) translateY(0)", opacity: "1" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)" },
          "50%": { boxShadow: "0 0 35px rgba(245, 158, 11, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
