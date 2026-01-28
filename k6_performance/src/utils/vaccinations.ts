import {httpc} from "./customHttp";
import {parseHTML} from "k6/html";
import {PatientSessionRecord} from "./patientDataSetup";
import {DELIVERY_SITE, VACCINATION_METHOD} from "./constants";

export function clickContinueToVaccinationWizard(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): Response {
    let session_id = patientSessionRecord.session_id;
    let programme = patientSessionRecord.programme;
    let relative_url = `/sessions/${session_id}/patients/${patient_id}/${programme}`

    if (response.url.indexOf(relative_url) === -1) {
        throw new Error(`Expected URL to contain ${relative_url}, got ${response.url}`);
    }

    let formSelector = `form[action="${relative_url}/vaccinations"]`
    const doc = parseHTML(response.body);
    if (doc.find(formSelector).is(formSelector)) {
        console.log(`Found vaccination form for patient ${patient_id} in session ${session_id}`);
        response = httpc.submitForm(response,
            formSelector,
            {
                fields: {
                    'vaccinate_form[identity_check_confirmed_by_patient]': 'true',
                    'vaccinate_form[identity_check_confirmed_by_other_name]': '',
                    'vaccinate_form[identity_check_confirmed_by_other_relationship]': '',
                    'vaccinate_form[pre_screening_confirmed]': '1',
                    'vaccinate_form[pre_screening_notes]': 'Some pre-screening notes',
                    'vaccinate_form[vaccine_method]': VACCINATION_METHOD[programme],
                    'vaccinate_form[delivery_site]': DELIVERY_SITE[programme],
                    'vaccinate_form[dose_sequence]': '1',
                    'vaccinate_form[programme_type]': programme,
                }
            })
        console.log(`Submitted vaccination form for patient ${patient_id} in session ${session_id}: ${response.url}`)
        return response
    }
    return response;
}

export function extractBatchId(response: Response): string {
    const doc = parseHTML(response.body);
    console.log(response.url)
    const input = doc.find('input[class="nhsuk-checkboxes__input"]');
    if (input && input.size() > 0) {
        const batch_value = input.attr('value');
        if (batch_value) {
            return batch_value;
        }
    }
    throw new Error("No batch ID found in response.");
}

export function chooseBatchAndClickContinue(response: Response): Response {
    let url = '/draft-vaccination-record/batch';
    let batchId = extractBatchId(response);

    if (response.url.indexOf(url) === -1) {
        throw new Error(`Expected URL to contain ${url}, got ${response.url}`);
    }

    let formSelector = `form[action="${url}"]`
    const doc = parseHTML(response.body);
    
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: {
                    '_method': 'put',
                    'draft_vaccination_record[batch_id]': batchId,
                }
            })
    }
    return response;
}

export function confirmVaccination(response: Response): Response {
    let url = '/draft-vaccination-record/confirm';

    if (response.url.indexOf(url) === -1) {
        throw new Error(`Expected URL to contain ${url}, got ${response.url}`);
    }

    let formSelector = `form[action="${url}"]`
    const doc = parseHTML(response.body);
    
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: {
                    '_method': 'put',
                    'draft_vaccination_record[notes]': 'Some confirmation notes',
                }
            })
    }
    return response;
}