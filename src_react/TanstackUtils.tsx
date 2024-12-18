import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
} from '@tanstack/react-table';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Form } from "react-bootstrap";

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        // Required if GetDefaultEditableColumn is used.
        updateData?: (rowIndex: number, columnId: string, value: unknown) => void
    }
    interface ColumnMeta<TData extends RowData, TValue> {
        filterVariant?: 'text' | 'range' | 'select'
      }
}

export type InputDataType = {
    Updates: any,
    ID: any,
    Agency: any,
    "First Name": any,
    "Last Name": any,
    Group: any,
    "Email Address": any,
    Role: any,
    Title: any,
    ListServ: any,
    "Google Calendar": any,
    "Phone Number": any,
    Status: any,
    search: any
    //[prop: string]: any
}

export function GetDefaultEditableColumn<T>(): Partial<ColumnDef<T>> {
    return {
        cell: ({ getValue, row: { index }, column: { id }, table }) => {
            const initialValue = getValue();

            // We need to keep and update the state of the cell normally
            const [value, setValue] = useState(initialValue);

            // When the input is blurred, we'll call our table meta's updateData function
            const onBlur = () => {
                table.options.meta?.updateData(index, id, value);
            }

            // If the initialValue is changed external, sync it up with our state
            useEffect(() => {
                setValue(initialValue)
            }, [initialValue])

            return (
                <input
                    value={value as string}
                    onChange={e => setValue(e.target.value)}
                    onBlur={onBlur}
                />
            )
        },
    }
}

export function useSkipper() {
    const shouldSkipRef = useRef(true);
    const shouldSkip = shouldSkipRef.current;

    // Wrap a function with this to skip a pagination reset temporarily
    const skip = useCallback(() => {
        shouldSkipRef.current = false
    }, []);

    useEffect(() => {
        shouldSkipRef.current = true
    });

    return [shouldSkip, skip] as const;
}

// A typical debounced input react component
export function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value])

    return (
        <Form.Control {...props} value={value} onChange={e => setValue(e.target.value)} />
    );
}

// export function Filter({ column }: { column: Column<any, unknown> }) {
//     const columnFilterValue = column.getFilterValue();

//     return (
//         <DebouncedInput
//             type="text"
//             value={(columnFilterValue ?? '') as string}
//             onChange={value => column.setFilterValue(value)}
//             placeholder={`Search...`}
//             className="w-36 border shadow rounded"
//         />
//     )
// }


export function Filter({ column }: { column: Column<any, unknown> }) {
    const { filterVariant } = column.columnDef.meta ?? {}
  
    const columnFilterValue = column.getFilterValue()
  
    const sortedUniqueValues = React.useMemo(
      () =>
        filterVariant === 'range'
          ? []
          : Array.from(column.getFacetedUniqueValues().keys())
              .sort()
              .slice(0, 5000),
      [column.getFacetedUniqueValues(), filterVariant]
    )
  
    return filterVariant === 'range' ? (
      <div>
        <div className="flex space-x-2">
          <DebouncedInput
            type="number"
            min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
            max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
            value={(columnFilterValue as [number, number])?.[0] ?? ''}
            onChange={value =>
              column.setFilterValue((old: [number, number]) => [value, old?.[1]])
            }
            placeholder={`Min ${
              column.getFacetedMinMaxValues()?.[0] !== undefined
                ? `(${column.getFacetedMinMaxValues()?.[0]})`
                : ''
            }`}
            className="w-24 border shadow rounded"
          />
          <DebouncedInput
            type="number"
            min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
            max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
            value={(columnFilterValue as [number, number])?.[1] ?? ''}
            onChange={value =>
              column.setFilterValue((old: [number, number]) => [old?.[0], value])
            }
            placeholder={`Max ${
              column.getFacetedMinMaxValues()?.[1]
                ? `(${column.getFacetedMinMaxValues()?.[1]})`
                : ''
            }`}
            className="w-24 border shadow rounded"
          />
        </div>
        <div className="h-1" />
      </div>
    ) : filterVariant === 'select' ? (
      <select
        onChange={e => column.setFilterValue(e.target.value)}
        // CLIM modified 7/18/24 old:
        value={columnFilterValue ? columnFilterValue.toString() : ""}
        // value={columnFilterValue?.toString()}
      >
        <option value="">All</option>
        {sortedUniqueValues.map(value => (
          //dynamically generated select options from faceted values feature
          <option value={value} key={value}>
            {value}
          </option>
        ))}
      </select>
    ) 
    : (
      <>
        {/* Autocomplete suggestions from faceted values feature
        <datalist id={column.id + 'list'}>
          {sortedUniqueValues.map((value: any) => (
            <option value={value} key={value} />
          ))}
        </datalist>
        <DebouncedInput
          type="text"
          value={(columnFilterValue ?? '') as string}
          onChange={value => column.setFilterValue(value)}
          placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
          className="w-36 border shadow rounded"
          list={column.id + 'list'}
        />
        <div className="h-1" /> */}
      </>
    )
  }

export function useDebounceEffect(arg, duration, dependencies = undefined) {
    useEffect(() => {
        const handle = setTimeout(arg, duration);
        return () => clearTimeout(handle);
    }, dependencies)
}