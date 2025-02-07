import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'neon-pink': "var(--neon-pink)",
        'neon-blue': "var(--neon-blue)",
        'neon-purple': "var(--neon-purple)",
        'chat-bubble': "var(--chat-bubble)",
      },
      boxShadow: {
        'neon': '0 0 5px var(--neon-pink), 0 0 20px var(--neon-pink)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
      }
    },
  },
  plugins: [],
} satisfies Config;
