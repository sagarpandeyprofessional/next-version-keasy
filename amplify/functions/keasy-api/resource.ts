import { defineFunction } from "@aws-amplify/backend";

export const keasyApiFunction = defineFunction({
  name: "keasy-api",
  entry: "./handler.js",
  timeoutSeconds: 30,
  memoryMB: 1024,
});
