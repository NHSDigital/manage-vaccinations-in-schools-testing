import {httpc} from "./customHttp";
import {parseHTML} from "k6/html";
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

//Probably no longer used
export function getAllSessionIDs(): string[]  {  //: string[]
    //Assume logged in
    let res = httpc.get("/sessions");
    let pageCount = res.body.match(/>([0-9]*?)<\/a><\/li><\/ul>/)[1];
    console.log(pageCount);
    //pageCount=1;
    const sessionIDS: string[] = [];

    for(let currentpage=1;currentpage<=pageCount;currentpage++){
        console.log(pageCount-currentpage);
        const res = httpc.get(`/sessions/?page=${currentpage}`);
//        console.log(res.body);
        //<a class="nhsuk-card__link" href="/sessions/pdj5wcarIm">

        const doc = parseHTML(res.body);
        //console.log(doc.find('title').text());
/*        const links = doc.find('.nhsuk-card__link');
        links.each((index,element) => {
                console.log(element.getAttribute('href')?.substring(10));
                console.log(element.textContent());
//                console.log(element.parentNode.attr('class')?.toString());
        })
*/
        const links2 = doc.find('.nhsuk-card__content');

        links2.each((index,element) => {
                if(element.childElementCount()<3){
                        const sessionID = element.children()[0].children()[0].getAttribute('href')?.substring(10);
                        const schoolName = element.children()[0].children()[0].textContent();
                        const programme = element.children()[1].children()[1].children()[1].textContent();
                        //console.log(sessionID + "," + schoolName + "," + programme);
                        sessionIDS.push(sessionID + "," + schoolName.toLowerCase() + "," + programme.toLowerCase());
                };
        })
}

return sessionIDS;
}

export function createSession(schoolName,programmes, yearGroups,dates){

        //Go to sessions page
        let response = httpc.get("/sessions");
        //Add a new session (need to check what happens if a session already exists)
        response = httpc.get("/sessions/new");

        response=chooseSchoolAndClickContinue(response,schoolName);
        response=chooseProgrammeAndClickContinue(response,programmes);
        response=chooseYearGroupAndClickContinue(response,yearGroups);
        response=chooseDatesAndClickContinue(response,dates);
}

export function chooseSchoolAndClickContinue(response: Response,schoolName): Response {
        let url = '/draft-session/school';
        //extract correct location ID
        let locationRegExp = new RegExp(`<option value="(.*?)" .*>${schoolName}<`);
        let locationID = (response.body as string).match(locationRegExp);

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
                    'draft_session[location_id]': locationID[1],
                }
            })
    }
}

export function chooseProgrammeAndClickContinue(response: Response,programmes): Response {
        let url = '/draft-session/programmes';

    if (response.url.indexOf(url) === -1) {
        throw new Error(`Expected URL to contain ${url}, got ${response.url}`);
    }

    let formSelector = `form[action="${url}"]`
    const doc = parseHTML(response.body);
    let programmeList = programmes.split(",");

    let formData = new FormData();
    formData.append('_method', 'put');
    programmeList.forEach((programme: string) => {
        formData.append('draft_session[programme_types][]',programme);
    });
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: formData
            })
    }
    return response;
}

export function chooseYearGroupAndClickContinue(response: Response,yearGroups): Response {
        let url = '/draft-session/year-groups';

    if (response.url.indexOf(url) === -1) {
        throw new Error(`Expected URL to contain ${url}, got ${response.url}`);
    }

    let formSelector = `form[action="${url}"]`
    const doc = parseHTML(response.body);
    let yearGroupsList = yearGroups.split(",");
    
    let formData = new FormData();
    formData.append('_method', 'put');
    yearGroupsList.forEach((yearGroup: string) => {
        formData.append('draft_session[year_groups][]',yearGroup);
    });
    
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: formData
            })
    }
    return response;
}

export function chooseDatesAndClickContinue(response: Response,dates): Response {
        let url = '/draft-session/dates';

    if (response.url.indexOf(url) === -1) {
        throw new Error(`Expected URL to contain ${url}, got ${response.url}`);
    }

    let formSelector = `form[action="${url}"]`
    const doc = parseHTML(response.body);
    let datesList = dates.split(",");
    
    let formData = new FormData();
    formData.append('_method', 'put');
    datesList.forEach((date: string,index) => {

        formData.append(`draft_session[session_date_${index}][value3i)]`,date.substring(0,1));//day
        formData.append(`draft_session[session_date_${index}][value2i)]`,date.substring(3,4));//month
        formData.append(`draft_session[session_date_${index}][value1i)]`,date.substring(6,9));//year
    });
    
    if (doc.find(formSelector).is(formSelector)) {
        return httpc.submitForm(response,
            formSelector,
            {
                fields: formData
            })
    }
    return response;
}