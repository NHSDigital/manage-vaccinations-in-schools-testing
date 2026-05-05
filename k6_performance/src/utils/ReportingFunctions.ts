import {httpc} from "./customHttp";
import { parseHTML} from "k6/html";
import { getAllSessionIDs } from './sessionFunctions';

export function schoolReportGet(team: string,programme: string): Response {
    let reportResponse = httpc.get(`/reports/team/${team}/schools?programme=${programme}`);
    return reportResponse;
}

export function getTargetSchools(programme: string, patientCount: number): string[] {
    let schools: string[]
    let sessions: string[]

    //get all session IDs along with school name and programme

    sessions = getAllSessionIDs();

    //Hardcoded team for now, until I figure out what to do
    const reportResponse = schoolReportGet("perf2test",programme);

    let runningTotal=patientCount;

    //Get the response into table form
    const doc = parseHTML(reportResponse.body);
    const table = doc.find('tbody');
    const rows = table.find('tr');

    //Loop through reportResponse getting sufficient valid schools to sustain the test
    rows.each((i,row) => {
        const cells = row.children();
        const urn = cells[0].textContent().trim();
        const school = cells[1].textContent().toLowerCase().trim();
        const cohort = Number(cells[2].textContent());
        const noresponse = Number(cells[3].textContent());
        const consentgiven = Number(cells[4].textContent());
        const vaccinated = Number(cells[5].textContent());

        let isValid=true;
        //If I already have enough records then don't do anything
        if(runningTotal<=0){
            isValid=false;
        }
        //If cohort is too big or too small then reject
        if((cohort<50)||(cohort>500)){
            isValid=false;
        }
        //If there aren't enough left to be vaccinated, then reject
        if(vaccinated>(cohort-50)){
            isValid=false;
        }
        if(isNaN(cohort)){
            //mainly to exclude 'unknown school'
            isValid=false;
        }
        if(isValid){
            console.log(school + " , " + cohort);
            const sessionSearch = school + "," + programme;
            console.log(sessions.find(item => item.includes(sessionSearch)));
        }
    });
        return ["be","quiet"]

}

export function getSchoolList(programme: string): RegExpExecArray[] {
    let reportResponse = httpc.get(`/reports/`);
    let teamName = (reportResponse.body as string).match(/\/reports\/team\/(.*?)\/schools\"/);

    let reportSchoolsResponse = httpc.get(`/reports/team/${teamName[1]}/schools?programme=${programme}`);

    let schoolRegExp = /<tr class="nhsuk-table__row">\s*<td class="nhsuk-table__cell">\s*(?<URN>.*)\s*<\/td>\s*<td class="nhsuk-table__cell">\s*(?<School>.*)\s*<\/td>\s*<td class="nhsuk-table__cell nhsuk-table__cell--numeric">\s*(?<Cohort>.*)\s*<\/td>\s*<td class="nhsuk-table__cell nhsuk-table__cell--numeric">\s*(?<NoResponse>.*)\s*<\/td>\s*<td class="nhsuk-table__cell nhsuk-table__cell--numeric">\s*(?<ConsentGiven>.*)\s*<\/td>\s*<td class="nhsuk-table__cell nhsuk-table__cell--numeric">\s*(?<Vaccinated>.*)\s/g;
    let schoolList = [...(reportSchoolsResponse.body as string).matchAll(schoolRegExp)];

    return schoolList;
}