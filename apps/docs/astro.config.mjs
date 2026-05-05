import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    starlight({
      title: "Hibi",
      description: "Self-hosted SRS for Japanese sentence mining.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/YannickHerrero/hibi",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [{ label: "Getting started", slug: "getting-started" }],
        },
        {
          label: "Client SDK",
          items: [{ label: "Overview", slug: "client-sdk/overview" }],
        },
        {
          label: "Concepts",
          items: [{ label: "FSRS scheduling", slug: "concepts/fsrs" }],
        },
      ],
    }),
  ],
});
