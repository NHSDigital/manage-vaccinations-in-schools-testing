import {
    clickDraftConsentAgree,
    clickDraftConsentConfirm,
    clickDraftConsentParentDetailsContinue,
    clickDraftConsentQuestions,
    clickDraftConsentRouteContinue,
    clickDraftConsentWhoContinue,
    clickRecordANewConsentResponse,
    clickSaveTriageIfPresent
} from "../utils/consents";
import {PatientSessionRecord} from "../utils/patientDataSetup";
import { sleep } from "k6";
import { parseHTML } from "k6/html";

export function recordConsentResponseIfNeeded(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): Response {
    if (!requiresConsentRecording(response)) {
        console.log("Consent already recorded for patient_id:", patient_id);
        return response;
    }

    console.log("Recording consent response for patient_id:", patient_id);
    return executeConsentWorkflow(response, patientSessionRecord, patient_id);
}

function requiresConsentRecording(response: Response): boolean {
    const doc = parseHTML((response.body || "") as string);
    if (!doc) return false;

    // Find all consent status tags
    const consentTags = doc.find('strong.nhsuk-tag--aqua-green');
    
    const hasConsentGiven = consentTags.toArray().some(el => 
        el.text().includes('Consent given')
    );

    return !hasConsentGiven;
}

function executeConsentWorkflow(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): Response {
    const workflow = [
        { fn: clickSaveTriageIfPresent, name: 'SaveTriage' },
        { fn: clickRecordANewConsentResponse, name: 'NewConsentResponse' },
        { fn: clickDraftConsentWhoContinue, name: 'WhoContinue' },
        { fn: clickDraftConsentParentDetailsContinue, name: 'ParentDetails' },
        { fn: clickDraftConsentRouteContinue, name: 'RouteContinue' },
        { fn: clickDraftConsentAgree, name: 'ConsentAgree' },
        { fn: clickDraftConsentQuestions, name: 'ConsentQuestions' },
        { fn: clickDraftConsentConfirm, name: 'ConsentConfirm' }
    ];

    for (const { fn, name } of workflow) {
        response = fn(response, patientSessionRecord, patient_id);
        if (response.status>=400) {
            console.log(response.status)
            console.error(`Consent workflow failed at step: ${name}`);
        }
        sleep(1);
    }
    return response
}
