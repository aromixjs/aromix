import type { Operator } from '@aromix/validator'
import type { Collation, ColumnType, ColumnTypeMap, ColumnState, ReferenceAction, UniqueConflict } from './column.d'

export type Chain<Type extends ColumnType, Used extends string = never, NotNull extends boolean = false, AutoInc extends boolean = false, Output = ColumnTypeMap[Type]> = Omit<
    {
        readonly state: ColumnState<Type, NotNull, AutoInc, Output>
        primaryKey(): Chain<Type, Used | 'primaryKey', NotNull, AutoInc, Output>
        autoIncrement(): Chain<Type, Used | 'autoIncrement', NotNull, true, Output>
        notNull(): Chain<Type, Used | 'notNull', true, AutoInc, Output>
        unique(conflict?: UniqueConflict): Chain<Type, Used | 'unique', NotNull, AutoInc, Output>
        index(): Chain<Type, Used | 'index', NotNull, AutoInc, Output>
        collate(value: Collation): Chain<Type, Used | 'collate', NotNull, AutoInc, Output>
        gt(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        gte(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        lt(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        lte(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        minLength(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        maxLength(value: number): Chain<Type, Used, NotNull, AutoInc, Output>
        in(values: string[]): Chain<Type, Used | 'in', NotNull, AutoInc, Output>
        references(col: unknown, actions?: ReferenceAction[]): Chain<Type, Used | 'references', NotNull, AutoInc, Output>
        default(value: Output): Chain<Type, Used | 'default', NotNull, AutoInc, Output>
        defaultFn(fn: () => Output): Chain<Type, Used | 'defaultFn', NotNull, AutoInc, Output>
        onUpdate(fn: () => Output): Chain<Type, Used | 'onUpdate', NotNull, AutoInc, Output>
        pipe<Next>(operator: Operator<Output, Next>): Chain<Type, Used, NotNull, AutoInc, Next>
    },
    Used
>
