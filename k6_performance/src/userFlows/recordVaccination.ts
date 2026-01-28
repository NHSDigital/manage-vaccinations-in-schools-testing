import {PatientSessionRecord} from "../utils/patientDataSetup";
import { chooseBatchAndClickContinue, clickContinueToVaccinationWizard, confirmVaccination, extractBatchId } from "../utils/vaccinations";


export function recordVaccinationIfNeeded(response: Response, patientSessionRecord: PatientSessionRecord, patient_id: number): void {
    response = clickContinueToVaccinationWizard(response, patientSessionRecord, patient_id)
    response = chooseBatchAndClickContinue(response);
    confirmVaccination(response);
}