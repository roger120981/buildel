export const routes = {
  dashboard: "/",
  login: "/login",
  register: "/register",
  organizations: "/organizations",
  organization: (organizationId: OrganizationId) => `/${organizationId}`,
  newOrganization: () => `${routes.organizations}/new`,
  pipelines: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines`,
  pipeline: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipelines(organizationId)}/${pipelineId}`,
  pipelineRuns: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/overview`,
  pipelineInterface: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/interface`,
  pipelineSettings: (organizationId: OrganizationId, pipelineId: PipelineId) =>
    `${routes.pipeline(organizationId, pipelineId)}/settings`,
  pipelinesNew: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/pipelines/new`,
  knowledgeBase: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/knowledge-base`,
  collectionKnowledgeBase: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.knowledgeBase(organizationId)}/${collectionName}`,
  collectionKnowledgeBaseNew: (
    organizationId: OrganizationId,
    collectionName: string
  ) => `${routes.collectionKnowledgeBase(organizationId, collectionName)}/new`,
  apiKeys: (organizationId: OrganizationId) =>
    `${routes.organization(organizationId)}/api-keys`,
};

type OrganizationId = string | number;
type PipelineId = string | number;
