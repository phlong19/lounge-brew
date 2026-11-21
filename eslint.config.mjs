import nextVitals from "eslint-config-next/core-web-vitals";
// Preserve the existing lint baseline while surfacing newly enabled React compiler diagnostics.
// These legacy adapters need a dedicated lifecycle refactor before enabling compiler rules as errors.
const config=[{ignores:[".next/**","node_modules/**"]},...nextVitals,
 {files:["src/components/lounge/hero-carousel.tsx","src/components/lounge/menu-book.tsx","src/components/lounge/reservation-provider.tsx","src/components/ui/carousel.tsx","src/components/ui/dialog-presence.tsx","src/components/ui/hover-popover.tsx","src/components/ui/image-dropzone.tsx","src/components/ui/rich-text-editor.tsx"],rules:{"react-hooks/set-state-in-effect":"warn","react-hooks/refs":"warn","react-hooks/immutability":"warn"}}];
export default config;
