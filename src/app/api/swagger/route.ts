import swaggerJSDoc from "swagger-jsdoc";

export async function GET() {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ITEH API",
        version: "1.0.0",
        description: "API documentation for the application",
      },
    },
    apis: ["src/app/api/**/route.ts"],
  };

  const spec = swaggerJSDoc(options);

  return Response.json(spec);
}