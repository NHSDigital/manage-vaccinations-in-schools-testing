import {httpc} from "./customHttp";

export function logIn(username: string, password: string) {
    console.log(`logging in as ${username}`);

    const signInPath = '/users/sign-in';

    // 1) Fetch sign-in page to get session cookies and CSRF token
    const getRes = httpc.get(signInPath);
    if (getRes.status != 200) {
        console.error("Failed to fetch sign-in page, status: " + getRes.status);
        if (getRes.status == 401) {
            console.error("Unauthorized, basic auth headers are probably not set correctly.");
        }
        return;
    }
    if (getRes.body == null) {
        console.error(`Response body is null; landed on url: ${getRes.url}`);
        return;
    }

    // 2) Post sign-in form
    const postRes = httpc.submitForm(
        getRes,
        'form[action="/users/sign-in"][method="post"]', {
        fields: {
            'user[email]': username,
            'user[password]': password,
        }
    });

    console.log("Trying to log in, status:" + postRes.status);
    console.log("Landed on URL after login (should be /dashboard): " + postRes.url);
}
