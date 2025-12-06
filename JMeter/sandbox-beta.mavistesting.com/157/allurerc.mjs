import { defineConfig } from "allure";

export default defineConfig({
  name: "Manage vaccinations in schools",
  output: "allure-report",
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: "en",
        groupBy: ["suite"],
      },
    },
  },
});
