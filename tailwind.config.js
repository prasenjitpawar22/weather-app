/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "bounce-ball": "bounce-ball 1s linear infinite alternate",
        "shadow-ball": "shadow-ball .5s ease-in-out infinite alternate",
      },
      keyframes: {
        "bounce-ball": {
          "0%, 100%": {
            top: "25%",
            "animation-timing-function": "cubic-bezier(0.8,0,1,1)",
          }, // Initial and final positions (center)
          "50%": {
            top: "55%",
            "animation-timing-function": "cubic-bezier(0,0,0.2,1)",
          }, // Peak of the bounce
        },
        "shadow-ball": {
          from: {
            opacity: "0",
            width: "0",
            "animation-timing-function": "cubic-bezier(0,0,0.9,1)",
          },
          to: {
            opacity: ".5",
            width: "55px",
            "animation-timing-function": "cubic-bezier(0.8,0,1,1)",
          },
        },
      },
    },
  },
  plugins: [],
};
