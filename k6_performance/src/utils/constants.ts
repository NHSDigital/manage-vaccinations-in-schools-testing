export const MAVIS_BASE_URL = 'https://performance.mavistesting.com'

export const BASIC_AUTH_USERNAME = 'manage'
export const BASIC_AUTH_PASSWORD = 'vaccinations'

export const USERNAME = 'nurse.perf2test@example.com'
export const PASSWORD = 'nurse.perf2test@example.com'

export const CONSENT_RESPONSE_AGREE = {
    flu: "given_injection",
    hpv: "given",
    menacwy: "given",
    td_ipv: "given",
}

export const CONSENT_TRIAGE_RESPONSE : { [key: string]: string} = {
    flu: "safe_to_vaccinate_injection",
    hpv: "safe_to_vaccinate",
    menacwy: "safe_to_vaccinate",
    td_ipv: "safe_to_vaccinate",
}

export const VACCINATION_METHOD : { [key: string]: string} = {
    flu: "nasal",
    hpv: "injection",
    menacwy: "injection",
    td_ipv: "injection",
}

export const DELIVERY_SITE : { [key: string]: string} = {
    flu: "nose",
    hpv: "right_arm_upper_position",
    menacwy: "right_arm_upper_position",
    td_ipv: "right_arm_upper_position",
}