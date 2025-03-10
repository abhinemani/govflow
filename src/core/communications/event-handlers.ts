import type { ICommunicationService, JurisdictionAttributes, ServiceRequestAttributes } from '../../types';

export async function serviceRequestCreateHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: ICommunicationService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestCreate(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeStatusHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: ICommunicationService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestChangeStatus(jurisdiction, serviceRequest);
}

export async function serviceRequestChangeAssignedToHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: ICommunicationService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestChangeAssignee(jurisdiction, serviceRequest);
}

export async function serviceRequestClosedHandler(
    jurisdiction: JurisdictionAttributes,
    serviceRequest: ServiceRequestAttributes,
    dispatchHandler: ICommunicationService
): Promise<void> {
    await dispatchHandler.dispatchServiceRequestClosed(jurisdiction, serviceRequest);
}
