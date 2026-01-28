import { httpc } from './utils/customHttp';
import { sleep } from 'k6';
import { USERNAME, PASSWORD } from "./utils/constants";
import { logIn } from "./utils/authorisation";
import { createVaccinationDataArray, PatientSessionRecord } from './utils/patientDataSetup';
import { registerPatientAttendance } from './userFlows/registerPatient';
import { recordConsentResponseIfNeeded } from './userFlows/recordConsentResponse';
import { recordVaccinationIfNeeded } from './userFlows/recordVaccination';

const PARALLEL_RUNS_PER_PROGRAMME = 2;
const MAX_ITERATIONS_PER_PROGRAMME = 2;

const vaccinationDataArrays = {
    hpv: splitArrayIntoEqualSubarrays(createVaccinationDataArray('hpv'), 100),
    flu: splitArrayIntoEqualSubarrays(createVaccinationDataArray('flu'), 100),
    menacwy: splitArrayIntoEqualSubarrays(createVaccinationDataArray('menacwy'), 100),
    td_ipv: splitArrayIntoEqualSubarrays(createVaccinationDataArray('td_ipv'), 100)
};



export const options = {
    scenarios: {
        hpv: {
            executor: 'shared-iterations',
            env: {
                programme: "HPV",
                vaccination: "hpv",
            },
            vus: Math.min(vaccinationDataArrays.hpv.length, MAX_ITERATIONS_PER_PROGRAMME),
            iterations: Math.min(vaccinationDataArrays.hpv.length, MAX_ITERATIONS_PER_PROGRAMME)
        },
        flu: {
            executor: 'shared-iterations',
            env: {
                programme: "Flu",
                vaccination: "flu",
            },
            vus: Math.min(vaccinationDataArrays.flu.length, PARALLEL_RUNS_PER_PROGRAMME),
            iterations: Math.min(vaccinationDataArrays.flu.length, MAX_ITERATIONS_PER_PROGRAMME)
        },
        menacwy: {
            executor: 'shared-iterations',
            env: {
                programme: "ACWYX4",
                vaccination: "menacwy",
            },
            vus: Math.min(vaccinationDataArrays.menacwy.length, PARALLEL_RUNS_PER_PROGRAMME),
            iterations: Math.min(vaccinationDataArrays.menacwy.length, MAX_ITERATIONS_PER_PROGRAMME)
        },
        tdipv: {
            executor: 'shared-iterations',
            env: {
                programme: "3-in-1",
                vaccination: "td_ipv",
            },
            vus: Math.min(vaccinationDataArrays.td_ipv.length, PARALLEL_RUNS_PER_PROGRAMME),
            iterations: Math.min(vaccinationDataArrays.td_ipv.length, MAX_ITERATIONS_PER_PROGRAMME)
        },
    }
};

export default async function () {
    let patientSessionRecordList: PatientSessionRecord[] = getDataForProgramme(__ENV.vaccination)[ __VU - 1];
    
    logIn(USERNAME, PASSWORD);
    for (let patientSessionRecord of patientSessionRecordList) {
        let patientId: number | null = registerPatientAttendance(patientSessionRecord);

        if (patientId) {
            console.log("Vaccination type:", __ENV.vaccination);
            console.log(`Programme: ${__ENV.programme}, VU: ${__VU}, Recording for patient ID: ${patientId}`);
            console.log(`Patient Session Record: ${JSON.stringify(patientSessionRecord)}`);
            let responseForConsentSubFlow = httpc.get(`/sessions/${patientSessionRecord.session_id}/patients/${patientId}/${patientSessionRecord.programme}`)
            let responseForVaccinationSubflow = recordConsentResponseIfNeeded(responseForConsentSubFlow, patientSessionRecord, patientId)
            recordVaccinationIfNeeded(responseForVaccinationSubflow, patientSessionRecord, patientId);
        }

        sleep(5)
    }
    // log-out function
}

function getDataForProgramme(programme: string) {
    switch (programme) {
        case "hpv":
            return vaccinationDataArrays.hpv
        case "flu":
            return vaccinationDataArrays.flu
        case "menacwy":
            return vaccinationDataArrays.menacwy
        case "td_ipv":
            return vaccinationDataArrays.td_ipv
        default:
            throw new Error("Unknown programme: " + programme);
    }
}

function splitArrayIntoEqualSubarrays(arr: PatientSessionRecord[], size: number): PatientSessionRecord[][] {
    return Array.from({ length: Math.ceil(arr.length / size) },
        (_, index) =>
            arr.slice(index * size, (index + 1) * size)
    )
}
