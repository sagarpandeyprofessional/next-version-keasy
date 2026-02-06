import { defineFunction, secret } from "@aws-amplify/backend";

export const keasyApiFunction = defineFunction({
  name: "keasy-api",
  entry: "./handler.js",
  timeoutSeconds: 30,
  memoryMB: 1024,
  environment: {
    TOSS_SECRET_KEY: secret("TOSS_SECRET_KEY"),
    TOSS_API_BASE_URL: process.env.TOSS_API_BASE_URL ?? "",
  },
});
