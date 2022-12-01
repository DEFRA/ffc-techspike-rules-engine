const ALL_SBI = "";
const SBI_BY_ID = "";

const LAND_SUMMARY_URL = "land-summary";
const SCHEME_SELECTION_URL = "standards-selection";
const DYNAMIC_FORM_URL = "form";
const SBI_SUMMARY_URL = "sbi-summary";
const APPLICATION_SUMMARY_URL = "application-summary";
const HOME_URL = "";
const WAITING_SCREEN = "waiting-screen";

const JBPM_LOAD_IN_PROGRESS_PROCESS = (processId) =>
  `${process.env.JBPM_URL}/kie-server/services/rest/server/queries/processes/instances/${processId}?withVars=true`;
const JBPM_START_POC_ELIGIBILITY_PROCESS = `${process.env.JBPM_URL}/kie-server/services/rest/server/containers/${process.env.POC_CONTAINER_ID}/processes/${process.env.ELIGIBILITY_PROCESS_DEFINITION_ID}/instances`;
const JBPM_SEARCH_PROCESS_BY_IDENTIFIER = (sbi, statuses) => {
  const statusString = statuses.map((status) => `status=${status}`).join("&");
  return `${process.env.JBPM_URL}/kie-server/services/rest/server/queries/processes/instances/variables/processIdentifier?varValue=SFI_${sbi}${process.env.PROCESS_SUFFIX}&${statusString}`;
};

const AUTH_HEADER = {
  auth: {
    username: process.env.REST_USERNAME,
    password: process.env.REST_PASSWORD,
  },
};

module.exports = {
  AUTH_HEADER,
  ALL_SBI,
  SBI_BY_ID,
  LAND_SUMMARY_URL,
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  SBI_SUMMARY_URL,
  APPLICATION_SUMMARY_URL,
  HOME_URL,
  WAITING_SCREEN,
  JBPM_START_POC_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
};
