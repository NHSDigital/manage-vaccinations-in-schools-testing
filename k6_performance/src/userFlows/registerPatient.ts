import { httpc } from "../utils/customHttp";
import { PatientSessionRecord } from "../utils/patientDataSetup";
import { clickOnAttendingForChild, goToChildrenPageOfSession, searchForChild } from "../utils/register";

export function registerPatientAttendance(patientSessionRecord: PatientSessionRecord): number | null {
    var patient_id: number | null
    var response = goToChildrenPageOfSession(patientSessionRecord);
    [response,  patient_id] = searchForChild(response, patientSessionRecord);
    if (patient_id) {
        clickOnAttendingForChild(response, patientSessionRecord, patient_id);
        return patient_id
    }
    return null
}
