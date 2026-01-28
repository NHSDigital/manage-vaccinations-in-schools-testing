import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import {SharedArray} from "k6/data";


export class PatientSessionRecord {
    public programme: string;
    public forename: string;
    public surname: string;
    public dob: string;
    public address_line_1: string;
    public postcode: string;
    public parent_name: string;
    public parent_relationship: string;
    public parent_email: string;
    public parent_phone: string;
    public session_id: string;

    constructor(data: any) {
        this.programme = data.programme;
        this.forename = data.forename;
        this.surname = data.surname;
        this.dob = data.dob;
        this.address_line_1 = data.address_line_1;
        this.postcode = data.postcode;
        this.parent_name = data.parent_name;
        data.parent_relationship == 'other' ?
            this.parent_relationship = 'guardian' :
            this.parent_relationship = data.parent_relationship;
        this.parent_email = data.parent_email;
        this.parent_phone = data.parent_phone;
        this.session_id = data.session_id;
    }
}

// Updated function to return an array of VaccinationRecord instances
export function createVaccinationDataArray(vaccinationType: string): PatientSessionRecord[] {
    return new SharedArray(`${vaccinationType}-vaccination-data`, function () {
        const parsedData = papaparse.parse(open(`../data/${vaccinationType}-vaccination-data.csv`), {
            header: true,
            delimiter: ','
        }).data;
        return parsedData.map((row: any) => new PatientSessionRecord(row));
    })
}

