import {httpc} from "./customHttp";
import {parseHTML} from "k6/html";
import {PatientSessionRecord} from "./patientDataSetup";
import {CONSENT_RESPONSE_AGREE, CONSENT_TRIAGE_RESPONSE} from "./constants";

export function clickSaveTriageIfPresent(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): Response {
    let session_id = patientSessionRecord.session_id;
    let programme = patientSessionRecord.programme;
    let relative_url = `/sessions/${session_id}/patients/${patient_id}/${programme}`

    if (response.url.indexOf(relative_url) === -1) {
        throw new Error(`Expected URL to contain ${relative_url}, got ${response.url}`);
    }

    let formSelector = `form[action="${relative_url}/triages"]`
    const doc = parseHTML(response.body);
    
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: {
                    'triage_form[status_and_vaccine_method]': CONSENT_TRIAGE_RESPONSE[programme],
                    'triage_form[notes]': 'New notes for ${VaccinationPage}',
                }
            })
    }
    return response;
}

export function clickRecordANewConsentResponse(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): Response {
    let session_id = patientSessionRecord.session_id;
    let programme = patientSessionRecord.programme;
    let relative_url = `/sessions/${session_id}/patients/${patient_id}/${programme}`
    
    if (response.url.indexOf(relative_url) === -1) {
        throw new Error(`Expected URL to contain ${relative_url}, got ${response.url}`);
    }
    return httpc.submitForm(
        response,
        `form[action="${relative_url}/consents"][method="post"]`);
}

export function clickDraftConsentWhoContinue(response: Response): Response {
    if (response.url.indexOf(`/draft-consent/who`) === -1) {
        throw new Error(`Expected URL to contain /draft-consent/who, got ${response.url}`);
    }

    const formSelector = 'form[action="/draft-consent/who"]'
    const radioSelector = 'input[name="draft_consent\\[new_or_existing_contact\\]"]'

    const doc = parseHTML(response.body);
    const radios = doc.find(formSelector).find(radioSelector);

    const firstRadio = radios.eq(0);
    const firstValue = firstRadio.attr('value');

    return httpc.submitForm(response,
        formSelector,
        {
            fields: {
                'draft_consent[new_or_existing_contact]': firstValue,
            }
        }
    );
}


export function clickDraftConsentParentDetailsContinue(response: Response, patientSessionRecord: PatientSessionRecord): Response {
    return httpc.submitForm(response,
        'form[action="/draft-consent/parent-details"]',
        {
            fields: {
                'draft_consent[parent_full_name]': patientSessionRecord.parent_name,
                'draft_consent[parent_relationship_type]': patientSessionRecord.parent_relationship,
                'draft_consent[parent_relationship_other_name]': '',
                'draft_consent[parent_email]': patientSessionRecord.parent_email,
                'draft_consent[parent_phone]': patientSessionRecord.parent_phone,
                'draft_consent[parent_phone_receive_updates]': '0',
            }
        }
    );
}

export function clickDraftConsentRouteContinue(response: Response): Response {
    return httpc.submitForm(response,
        'form[action="/draft-consent/route"]',
        {
            fields: {
                'draft_consent[route]': 'phone',
            }
        })
}

export function clickDraftConsentAgree(response: Response, patientSessionRecord: PatientSessionRecord): Response {
    return httpc.submitForm(response,
        'form[action="/draft-consent/agree"]',
        {
            fields: {
                'draft_consent[response]': CONSENT_RESPONSE_AGREE[patientSessionRecord.programme],
            }
        })
}

//questions

export function clickDraftConsentQuestions(response: Response): Response {
    return httpc.submitForm(response,
        'form[action="/draft-consent/questions"]',
        {
            fields: {
                'draft_consent[question_0][notes]': '',
                'draft_consent[question_0][response]': 'no',
                'draft_consent[question_1][notes]': '',
                'draft_consent[question_1][response]': 'no',
                'draft_consent[question_2][notes]': '',
                'draft_consent[question_2][response]': 'no',
                'draft_consent[question_3][notes]': '',
                'draft_consent[question_3][response]': 'no',
                'draft_consent[question_4][notes]': '',
                'draft_consent[question_4][response]': 'no',
                'draft_consent[question_5][notes]': '',
                'draft_consent[question_5][response]': 'no',
                'draft_consent[question_6][notes]': '',
                'draft_consent[question_6][response]': 'no',
                'draft_consent[question_7][notes]': '',
                'draft_consent[question_7][response]': 'no',
                'draft_consent[question_8][notes]': '',
                'draft_consent[question_8][response]': 'no',
                'draft_consent[question_9][notes]': '',
                'draft_consent[question_9][response]': 'no',
                'draft_consent[question_10][notes]': '',
                'draft_consent[question_10][response]': 'no',
            }
        })
}

export function clickDraftConsentConfirm(response: Response): Response {
    return httpc.submitForm(response, 'form[action="/draft-consent/confirm"]');
}