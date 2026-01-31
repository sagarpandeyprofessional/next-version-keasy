import { defineBackend } from "@aws-amplify/backend";
import { HttpApi, CorsHttpMethod, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { keasyApiFunction } from "./functions/keasy-api/resource";

const backend = defineBackend({
  keasyApiFunction,
});

const apiStack = backend.createStack("keasy-api-stack");

const httpApi = new HttpApi(apiStack, "KeasyHttpApi", {
  corsPreflight: {
    allowOrigins: ["*"],
    allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

const integration = new HttpLambdaIntegration(
  "KeasyApiIntegration",
  backend.keasyApiFunction.resources.lambda
);

httpApi.addRoutes({
  path: "/api/keasy/chat",
  methods: [HttpMethod.POST],
  integration,
});

backend.addOutput({
  custom: {
    keasyApiEndpoint: httpApi.apiEndpoint,
  },
});
