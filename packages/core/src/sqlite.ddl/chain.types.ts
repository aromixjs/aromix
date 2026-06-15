import { Collation, ColumnReference, ColumnState, ColumnType, ColumnTypeMap, ReferenceAction, UniqueConflict } from './column.types'

export interface AnyColumn<Output = unknown> {
    readonly state: ColumnState
    readonly $infer: Output
}

// RefinedChain :: returned by .refine(). Carries the narrowed output type.
// No further chain methods refine is terminal for type narrowing.
export interface RefinedChain<Output> extends AnyColumn<Output> {}

export type Chain<Type extends ColumnType, Used extends string = never> = Omit<
    {
        readonly state: ColumnState
        readonly $infer: ColumnTypeMap[Type]

        primaryKey(): Chain<Type, Used | 'primaryKey' | 'notNull'>
        autoIncrement(): Chain<Type, Used | 'autoIncrement'>
        notNull(): Chain<Type, Used | 'notNull'>

        unique(conflict?: UniqueConflict): Chain<Type, Used | 'unique'>
        index(): Chain<Type, Used | 'index'>
        collate(value: Collation): Chain<Type, Used | 'collate'>

        gt(value: number): Chain<Type, Used>
        gte(value: number): Chain<Type, Used>
        lt(value: number): Chain<Type, Used>
        lte(value: number): Chain<Type, Used>
        minLength(value: number): Chain<Type, Used>
        maxLength(value: number): Chain<Type, Used>

        in(values: string[]): Chain<Type, Used | 'in'>

        references(col: ColumnReference, actions?: ReferenceAction[]): Chain<Type, Used | 'references'>

        default(value: ColumnTypeMap[Type]): Chain<Type, Used | 'default' | 'defaultFn'>
        defaultFn(fn: () => ColumnTypeMap[Type]): Chain<Type, Used | 'default' | 'defaultFn'>
        onUpdate(fn: () => ColumnTypeMap[Type]): Chain<Type, Used | 'onUpdate'>

        refine<Output extends ColumnTypeMap[Type]>(fn: (value: ColumnTypeMap[Type]) => Output): RefinedChain<Output>
    },
    Used
>
