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

const apiRoutes = [
  "/api/keasy/chat",
  "/api/confirm/payment",
  "/api/confirm/widget",
  "/api/confirm/brandpay",
  "/api/issue-billing-key",
  "/api/confirm-billing",
];

apiRoutes.forEach((path) => {
  httpApi.addRoutes({
    path,
    methods: [HttpMethod.POST],
    integration,
  });
});

backend.addOutput({
  custom: {
    keasyApiEndpoint: httpApi.apiEndpoint,
  },
});
