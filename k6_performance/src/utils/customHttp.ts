import http from "k6/http";
import { BASIC_AUTH_PASSWORD, BASIC_AUTH_USERNAME, MAVIS_BASE_URL, USERNAME, PASSWORD } from "./constants";
import encoding from "k6/encoding";


export const httpc = createCustomHttp(
    MAVIS_BASE_URL,
    getBasicAuthHeader(
        BASIC_AUTH_USERNAME,
        BASIC_AUTH_PASSWORD
    ),
    USERNAME,
    PASSWORD
);

function getBasicAuthHeader(username: string, password: string) {
    return {
        "Authorization": "Basic " + encoding.b64encode(`${username}:${password}`)
    }
}

function mergeParams(params: any = {}, additionalHeaders: any) {
    return {
        ...params,
        headers: {
            ...(params.headers || {}),
            ...(additionalHeaders)
        }
    };
}

function mergeBody(body: any, additionalBody: any) {
    return {
        ...body,
        ...additionalBody
    };
}

function buildAuthTokenBody(token: string, username: string, password: string) {
    return {
        authenticity_token: token
    }
}

export function createCustomHttp(
    rootUrl: string,
    authHeader: Record<string, string> = {},
    username: string,
    password: string
) {
    let backupAuthToken: string = "";

    const api = {
        request: (method: string, path: string, body?: any, params: any = {}, authToken: string = "") => {
            const fullUrl = rootUrl + path;

            const mergedParams = mergeParams(params, authHeader);

            const authTokenToUse = authToken == "" ? backupAuthToken : authToken;

            const authTokenBody = buildAuthTokenBody(authTokenToUse, username, password);
            const mergedBody = mergeBody(body, authTokenBody);

            const response = http.request(method, fullUrl, mergedBody, mergedParams);

            return response;
        },

        get: (path: string, params?: object, authToken?: string) => {
            return api.request("GET", path, null, params, authToken);
        },

        post: (path: string, body?: any, params?: object, authToken?: string) => {
            return api.request("POST", path, body, params, authToken);
        },

        put: (path: string, body?: any, params?: object, authToken?: string) => {
            return api.request("PUT", path, body, params, authToken);
        },

        del: (path: string, params?: object, authToken?: string) => {
            return api.request("DELETE", path, null, params, authToken);
        },

        patch: (path: string, body?: any, params?: object, authToken?: string) => {
            return api.request("PATCH", path, body, params, authToken);
        },

        submitForm: (pageResult: Response, formSelector: string, options: {fields?: any, submitSelector?: string, params?: object, authToken?: string} = {}) => {
            options.params = mergeParams(options.params || {}, authHeader)

            return pageResult.submitForm({
                formSelector: formSelector,
                ...options
            });
        }
    };

    return api;
}
