import type * as v from "valibot";

export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type AnySchema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;


export const $schema = Symbol("schema");
export const $internal = Symbol("internal");
export const $computed = Symbol("computed");



export type AnyField = { [$schema]: AnySchema;[$internal]: boolean };
export type AnyComputed = { [$computed]: unknown;[$internal]: boolean };



export type InternalKeys<S extends Record<string, AnyField>> = {
    [K in keyof S]: S[K][typeof $internal] extends true ? K : never;
}[keyof S];

export type PublicKeys<S extends Record<string, AnyField>> = Exclude<keyof S, InternalKeys<S>>;

export type AllEntries<S extends Record<string, AnyField>> = {
    [K in keyof S]: S[K][typeof $schema];
};

export type PubEntries<S extends Record<string, AnyField>> = {
    [K in PublicKeys<S>]: S[K][typeof $schema];
};

export type ComputedInternalKeys<E extends Record<string, AnyComputed>> = {
    [K in keyof E]: E[K][typeof $internal] extends true ? K : never;
}[keyof E];

export type ComputedPublicKeys<E extends Record<string, AnyComputed>> = Exclude<keyof E, ComputedInternalKeys<E>>;

export type ComputedValues<E extends Record<string, AnyComputed>> = {
    [K in keyof E]: E[K][typeof $computed];
};

export interface ClientSchema {
    input: AnySchema;
    output: AnySchema;
}





















// export interface KvDescriptor<SIn, SOut, CIn, COut> {
//     _serverInput: SIn;
//     _serverOutput: SOut;
//     _clientInput: CIn;
//     _clientOutput: COut;

//     serverInputSchema: AnySchema;  // parse + validate on set()
//     serverOutputSchema: AnySchema;  // parse + strip on server get()
//     clientInputSchema: AnySchema;  // parse + validate on client write
//     clientOutputSchema: AnySchema;  // parse + strip on client get()
// }