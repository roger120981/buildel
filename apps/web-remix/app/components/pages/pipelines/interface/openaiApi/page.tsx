import React from "react";
import { routes } from "~/utils/routes.utils";
import { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { ChatbotSectionWrapper } from "~/components/pages/pipelines/interface/websiteChatbot/ChatbotSectionWrapper";
import { CodePreviewWrapper } from "~/components/pages/pipelines/CodePreview/CodePreviewWrapper";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";
import {
  ChatbotSectionHeader,
  ChatbotSectionHeaderParagraph,
  ChatbotSectionHeading,
} from "../websiteChatbot/ChatbotSectionHeading";
import { loader } from "./loader.server";

export function OpenAIApiPage() {
  const { organizationId, pipelineId, apiUrl } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <h2 className="text-lg text-white font-medium">OpenAI Api</h2>
        <p className="text-white text-xs mb-6">
          Unlock advanced communication features by integrating with our API.
        </p>
      </div>

      <ChatbotSectionWrapper>
        <ChatbotSectionHeader>
          <ChatbotSectionHeading>
            Connect to Our Custom API
          </ChatbotSectionHeading>
          <ChatbotSectionHeaderParagraph>
            Easily integrate your chatbot with our API by following these
            straightforward instructions.
          </ChatbotSectionHeaderParagraph>
        </ChatbotSectionHeader>

        <div className="p-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div className="text-white text-sm">
            <p className="lg:mt-4 mb-2">
              Ensure you replace the baseURL with our API's URL and include your{" "}
              <Link
                to={routes.organizationSettings(organizationId)}
                className="text-primary-500 hover:underline"
                target="_blank"
              >
                API key
              </Link>{" "}
              as the bearer token in the Authorization header.
            </p>
            <p>
              This setup will authenticate your requests and allow your chatbot
              to communicate with our API.
            </p>
          </div>
          <div className="w-full">
            <CodePreviewWrapper
              value={`import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${apiUrl}/api",
  defaultHeaders: { Authorization: 'Bearer ' + process.env.BUILDEL_API_KEY},
};

const completion = await openai.chat.completions.create({
  messages: [{ role: "system", content: "You are a helpful assistant." }],
  model: "gpt-3.5-turbo",
});

console.log(completion.choices[0]);`}
              language="typescript"
              height={250}
            >
              {(value) => <CopyCodeButton value={value} />}
            </CodePreviewWrapper>
          </div>
        </div>
      </ChatbotSectionWrapper>
    </div>
  );
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "OpenAI Api",
    },
  ];
};
