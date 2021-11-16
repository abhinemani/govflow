import { IterableQueryResult, QueryParamsAll, QueryResult } from ".";

/* eslint-disable */
export interface Pluggable {

}
/* eslint-enable */

export interface IJurisdictionRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (id: string) => Promise<QueryResult>;
}

export interface IStaffUserRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
    lookupTable: (jurisdictionId: string) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IServiceRequestRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    update: (jurisdictionId: string, id: string, data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
    findStatusList: (id: string) => Promise<Record<string, string>>;
    createComment: (jurisdictionId: string, serviceRequestId: string, data: Record<string, unknown>) => Promise<QueryResult>;
    updateComment: (jurisdictionId: string, serviceRequestId: string, serviceRequestCommentId: string, data: Record<string, unknown>) => Promise<QueryResult>;
}

export interface IOpen311ServiceRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, code: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IOpen311ServiceRequestRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}

export interface IEventRepository extends Pluggable {
    create: (data: Record<string, unknown>) => Promise<QueryResult>;
    findOne: (jurisdictionId: string, id: string) => Promise<QueryResult>;
    findAll: (jurisdictionId: string, queryParams?: QueryParamsAll) => Promise<[IterableQueryResult, number]>;
}
