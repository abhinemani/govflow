import axios from 'axios';
import logger from '../logging';

export interface RecaptchaV2VerificationResponse {
    success: boolean;
    challenge_ts: string,
    hostname: string,
    "error-codes"?: string[]
}

export async function verifyRecaptchaResponse(secretKey: string, responseToken: string): Promise<RecaptchaV2VerificationResponse> {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    let response: RecaptchaV2VerificationResponse;
    try {
        response = await axios.post(verifyUrl, {
            secret: secretKey,
            response: responseToken
          })
    } catch(error) {
        logger.error({message: 'Failed request to reCaptcha', error: `${error}`})
        response = {success: false} as unknown as RecaptchaV2VerificationResponse;
    }
    return response;
}
