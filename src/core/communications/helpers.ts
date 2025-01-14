import type { ClientResponse } from '@sendgrid/mail';
import { constants as fsConstants, promises as fs } from 'fs';
import _ from 'lodash';
import path from 'path';
import striptags from 'striptags';
import { sendEmail } from '../../email';
import logger from '../../logging';
import { sendSms } from '../../sms';
import { CommunicationAttributes, DispatchConfigAttributes, DispatchPayloadAttributes, ICommunicationRepository, ServiceRequestAttributes, TemplateConfigAttributes, TemplateConfigContextAttributes } from '../../types';

export function makeRequestURL(appClientUrl: string, appClientRequestsPath: string, serviceRequestId: string): string {
    return `${appClientUrl}${appClientRequestsPath}/${serviceRequestId}`
}

export async function loadTemplate(templateName: string, templateContext: TemplateConfigContextAttributes, withUnsubscribe = false): Promise<string> {
    const filepath = path.resolve(`${__dirname}/templates/${templateName}.txt`);
    try {
        await fs.access(filepath, fsConstants.R_OK | fsConstants.W_OK);
    } catch (error) {
        logger.error(error);
        throw error;
    }
    const templateBuffer = await fs.readFile(filepath);
    const templateString = templateBuffer.toString();
    let appendString: string;

    if (withUnsubscribe) {
        const [templateType, ..._rest] = templateName.split('.');
        const appendUnsubscribe = path.resolve(`${__dirname}/templates/${templateType}.unsubscribe.txt`);
        const unsubscribeBuffer = await fs.readFile(appendUnsubscribe);
        appendString = `<br />${unsubscribeBuffer.toString()}`;
    } else {
        appendString = '';
    }

    const fullTemplateString = `${templateString}${appendString}`;
    const templateCompile = _.template(fullTemplateString);
    return templateCompile({ context: templateContext });
}

function makePlainTextFromHtml(html: string) {
    const _tmp = striptags(html, ['br', 'p']);
    return striptags(_tmp, [], '\n');
}


export async function dispatchMessageForPublicUser(
    serviceRequest: ServiceRequestAttributes,
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    if (serviceRequest.communicationChannel === null) {
        logger.warn(`Cannot send message for ${serviceRequest.id} as no communication address was supplied.`);
        return {} as CommunicationAttributes;
    } else if (serviceRequest.communicationValid === false) {
        logger.warn(`Cannot send message for ${serviceRequest.id} as no communication address is valid.`);
        return {} as CommunicationAttributes;
    } else {
        const record = await dispatchMessage(dispatchConfig, templateConfig, CommunicationRepository);
        if (record.accepted === true) {
            serviceRequest.communicationValid = true
        } else {
            logger.warn(`Cannot send message for ${serviceRequest.id} as backend rejected the payload.`);
            serviceRequest.communicationValid = false
        }
        return record;
    }
}

export async function dispatchMessageForStaffUser(
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    return await dispatchMessage(dispatchConfig, templateConfig, CommunicationRepository);
}

export async function dispatchMessage(
    dispatchConfig: DispatchConfigAttributes,
    templateConfig: TemplateConfigAttributes,
    CommunicationRepository: ICommunicationRepository):
    Promise<CommunicationAttributes> {
    let dispatchResponse: ClientResponse | Record<string, string> | Record<string, unknown>;
    let dispatchPayload: DispatchPayloadAttributes;
    let subject: string;
    let textBody: string;
    let htmlBody: string;
    if (dispatchConfig.channel === 'email') {
        subject = await loadTemplate(
            `email.${templateConfig.name}.subject`,
            templateConfig.context
        );
        htmlBody = await loadTemplate(
            `email.${templateConfig.name}.body`,
            templateConfig.context
        );
        textBody = makePlainTextFromHtml(htmlBody);
        dispatchPayload = Object.assign({}, dispatchConfig, { subject, textBody, htmlBody })
        dispatchResponse = await sendEmail(
            dispatchPayload.sendGridApiKey,
            dispatchPayload.toEmail,
            dispatchPayload.fromEmail,
            dispatchPayload.subject as string,
            dispatchPayload.htmlBody as string,
            dispatchPayload.textBody as string,
        );
    } else if (dispatchConfig.channel === 'sms') {
        textBody = await loadTemplate(
            `sms.${templateConfig.name}.body`,
            templateConfig.context,
            true
        );
        dispatchPayload = Object.assign({}, dispatchConfig, { textBody })
        dispatchResponse = await sendSms(
            dispatchPayload.twilioAccountSid as string,
            dispatchPayload.twilioAuthToken as string,
            dispatchPayload.toPhone as string,
            dispatchPayload.fromPhone as string,
            dispatchPayload.textBody as string,
        );
    } else {
        const errorMsg = `Unknown communication dispatch channel`;
        logger.error(errorMsg);
        throw new Error(errorMsg)
    }

    const record = await CommunicationRepository.create({
        channel: dispatchConfig.channel,
        dispatched: true,
        dispatchPayload: dispatchConfig,
        dispatchResponse: dispatchResponse as Record<string, string>,
        // TODO: conditionally check
        accepted: true,
        delivered: true,
    })
    return record;
}
