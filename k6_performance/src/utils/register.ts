import { parseHTML } from "k6/html";
import { httpc } from "./customHttp";
import { PatientSessionRecord } from "./patientDataSetup";

export function goToChildrenPageOfSession(
    patientSessionRecord: PatientSessionRecord,
): Response {
    let session_id = patientSessionRecord.session_id;

    let url = `/sessions/${session_id}/patients`;
    var response = httpc.get(url);

    console.log(`Visiting ${url}, status:${response.status}`);
    return response;
}

export function searchForChild(response: Response, patientSessionRecord: PatientSessionRecord): [Response, number | null] {
    const session_id = patientSessionRecord.session_id;
    const formSelector = `form[action="/sessions/${session_id}/patients"]`;

    response = httpc.submitForm(response,
        formSelector,
        {
            fields: {
                'q': `${patientSessionRecord.forename} ${patientSessionRecord.surname}`
            }
        }
    )
    console.log(`Searching for child record on session page, status:${response.status}`);

    const doc = parseHTML(response.body);
    // Select the first patient link within the results container
    const firstPatient = doc.find('div[class="nhsuk-card__content"]').first();

    if (!firstPatient) {
        console.log(`No patients found in search results for ${patientSessionRecord.forename} ${patientSessionRecord.surname}`);
        return [response, null];
    }
    const patientSelection = firstPatient.find('a[href]').first()
    if (patientSelection.size() === 0) {
        console.log(`No patient link found in the first search result for ${patientSessionRecord.forename} ${patientSessionRecord.surname}`);
        return [response, null];
    }

    const href = patientSelection.attr('href');

    // Remove query string and split path into non-empty segments
    const path = href.split('?')[0]
    const parts = path.split('/').filter(segment => segment.length > 0)
    // Path structure: sessions/{sessionId}/patients/{patientId}/...
    const patientId = parts[3]

    const registerAttendanceForm = firstPatient.find(`form[action="/sessions/${session_id}/patients/${patientId}/register/present"]`);
    if (registerAttendanceForm.size() === 0) {
        console.log(`Registration already complete for patient ID: ${patientId}`);
        return [response, null];
    }

    return [response, parseInt(patientId)];
}

export function clickOnAttendingForChild(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): void {
    const session_id = patientSessionRecord.session_id;

    const formSelector = `form[action="/sessions/${session_id}/patients/${patient_id}/register/present"]`;

    httpc.submitForm(response, formSelector, { fields: {} });
    console.log(`Trying to register attendance for child ${patient_id} in session ${session_id}, status:${response.status}`);
}