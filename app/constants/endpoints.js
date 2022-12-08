const ALL_SBI = ''
const SBI_BY_ID = ''

const LAND_SUMMARY_URL = 'land-summary'
const SCHEME_SELECTION_URL = 'standards-selection'
const DYNAMIC_FORM_URL = 'form'
const SBI_SUMMARY_URL = 'sbi-summary'
const APPLICATION_SUMMARY_URL = 'application-summary'
const HOME_URL = ''
const PROCESS_PENDING_URL = 'process-pending'

const JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS = (processId) =>
  `${process.env.JBPM_URL}/kie-server/services/rest/server/queries/processes/instances/${processId}?withVars=true`

const JBPM_START_ELIGIBILITY_PROCESS = `${process.env.JBPM_URL}/kie-server/services/rest/server/containers/${process.env.POC_CONTAINER_ID}/processes/${process.env.ELIGIBILITY_PROCESS_DEFINITION_ID}/instances`

const JBPM_SEARCH_PROCESS_BY_IDENTIFIER = (sbi, statuses) => {
  const statusString = statuses.map((status) => `status=${status}`).join('&')
  return `${process.env.JBPM_URL}/kie-server/services/rest/server/queries/processes/instances/variables/processIdentifier?varValue=SFI_${sbi}${process.env.PROCESS_SUFFIX}&${statusString}&pageSize=10000`
}

const JBPM_COMPLETE_SUMMARY_ANSWER = (taskId) =>
  `${process.env.JBPM_URL}/kie-server/services/rest/server/containers/${process.env.POC_CONTAINER_ID}/tasks/${taskId}/states/completed?auto-progress=true&user=katy`

const JBPM_DMN_SCHEME_TEMPLATES = `${process.env.JBPM_URL}/kie-server/services/rest/server/containers/${process.env.POC_CONTAINER_ID}/dmn`

const AUTH_HEADER = {
  auth: {
    username: process.env.REST_USERNAME,
    password: process.env.REST_PASSWORD
  }
}

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
  PROCESS_PENDING_URL,
  JBPM_START_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
  JBPM_COMPLETE_SUMMARY_ANSWER,
  JBPM_DMN_SCHEME_TEMPLATES
}
