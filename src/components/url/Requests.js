import { url } from "./Url"

export const requests = {
    LOGIN: url+"/users/login",
    REGISTER: url + "/users/registration",
    USER_ACTIVATION: url+"/users/login/activate",
    FORGOT_PASSWORD_REQUEST: url+"/users/resetpwdreq",
    RESET_PASSWORD_REQUEST: url+"/users/resetpwdreq",
    RESET_PASSWORD: url+"/users/resetpwd",
    UPDATE_DOCUMENT: url+"/documents/1",
    CREATE_DOCUMENT: url+"/documents",
    UPDATE_DOCUMENT_2_SIGNER: url+ "/documents/1/signers",
    UPDATE_DOCUMENT1: url+"/documents/10",
    UPDATE_DOCUMENT3_SHARE: url+"/documents/1",
    GET_ALL_DOCUMENT_FOR_EMAILID: url+"/documents/?emailId=testuser@gmail.com",
    GET_SPECIFIC_DOCUMENT_FOR_EMAILID: url+"/documents/?emailId=testuser@gmail.com&documentId=1",
    UPDATE_DOCUMENT_STATUS: url+"/documents/1/documentStatus",
    CREATE_USER_PROFILE: url+"/userProfile/",
    UPDATE_USER_PROFILE: url+"/userProfile/testuser@gmail.com",
    GET_USER_PROFILE: url+"/userProfile/testuser@gmail.com",
    DELETE_DOCUMENT: url+"/documents/6",
    GET_ALL_USER_PROFILE: url+"/userProfile/userProfile/all",
    DELETE_SIGNER: url+"/documents/ankur.rajput25@gmail.com/signerDelete"
}
