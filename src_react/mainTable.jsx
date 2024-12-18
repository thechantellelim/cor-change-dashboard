import React, { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { AutomationsContext } from './App';
import ExportExcel from './ExcelExport';
import { Table as BTable } from 'react-bootstrap'
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Dropdown from 'react-bootstrap/Dropdown';
import DetailsPage from './DetailsPage';
import {
    Column,
    ColumnDef,
    ColumnFiltersState,
    RowData,
    SortingFn,
    SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
    createColumnHelper,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel
} from '@tanstack/react-table';
import { DebouncedInput, useSkipper } from './TanstackUtils';
import { Filter } from './TanstackUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faCheck, faExclamation,faArrowUpRightFromSquare,faFilterCircleXmark,faListCheck,faRobot, faSignature} from '@fortawesome/free-solid-svg-icons'

const columnHelper = createColumnHelper();

function MainTable() {
    const intakeFormURL = "https://script.google.com/a/macros/gsa.gov/s/AKfycbzt0W316CEYLSn27wRMyc8zxdA6_l2nBxtK2ipo8Qd4tA9b9OeEjdTWr31z6fptQLVhaQ/exec"
    const { inputData, setInputData, logs, userEmail,isLoading,setIsLoading } = useContext(AutomationsContext)
    const [currentRow, setCurrentRow] = useState(-1);
    const [currentMember, setCurrentMember] = useState({});
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [memberLogs, setMemberLogs] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState("Displaying all rows");
    const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
    const [columnFilters, setColumnFilters] = useState([
        {
            id: 'Status',
            value: 'LMT Info Needed',
        },
        {
            id: 'Status',
            value: 'Approval Needed',
        }
    ]);
    const [columnVisibility, setColumnVisibility] = useState({search:false,})
    const [sorting, setSorting] = useState([{
        id: 'Submission Date',
        desc: false, 
      },])
    const filteredInputData = useMemo(() => {
        console.log("Inside filteredinputdata")
        if (!searchText?.trim() && columnFilters==[]) {
            setSearchResults("Displaying all rows");
            return inputData;
        }
        else {
        let vals = columnFilters.map(a => a.value);
        let filterLength = vals.length;
        console.log(`columnFilters: ${vals}`)
        // build regex for column filters + search bar
        let regExbuilder = ""
        
        // vals?.forEach((val,idx) => {
        //     // 1st
        //     if (idx == 0){
        //         regExbuilder += "((?=.*" + val + ")"
        //     }
        //     // last
        //     else if (idx==filterLength-1){
        //         regExbuilder += "|(?=.*" + val + "))"
        //     }
        //     else {
        //         regExbuilder += "|(?=.*" + val + ")"
        //     }
        // })
            
        regExbuilder += "((?=.*LMT Info Needed)|(?=.*Approval Needed))"
        let regex = new RegExp(regExbuilder+"(?=.*"+searchText+").*","i"); 
        console.log(regex)
        const filtered = inputData.filter(x => x.search?.match(regex)?.length >0);
        console.log(filtered)
        setSearchResults("Displaying " + filtered.length.toLocaleString(undefined, { minimumFractionDigits: 0 }) + " of " + inputData.length.toLocaleString(undefined, { minimumFractionDigits: 0 }) + " rows");
        return filtered;
        }
    }, [inputData, searchText,columnFilters])

    const clearAllFilters = () =>{
        setColumnFilters([])
        setSearchText("")
    }

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'info',
            header: ({ table }) => (
                <span>Info</span>
            ),
            cell: (cell) => (
                <div className="px-1">
                    <Button type="button" onClick={() => handleSelect('details', cell.row.index)}><FontAwesomeIcon icon={faMagnifyingGlass} /></Button>
                </div>
            ),
            size:60,
             enableColumnFilter: false,
        }),
        columnHelper.accessor('status', {
            id: 'Status',
            header:"Status",
            cell: (cell) => {
                const value = cell.getValue();
                let result = <></>;
                switch (value) {
                    case "LMT Info Needed":
                        result = <OverlayTrigger placement="bottom" overlay={<Tooltip>{value}</Tooltip>}>
                                    <Button type="button" aria-label={value} variant="light" >
                                        <FontAwesomeIcon icon={faExclamation} />
                                    </Button>
                                </OverlayTrigger>
                        break;
                    case "Approval Needed":
                        result = <OverlayTrigger placement="bottom" overlay={<Tooltip>{value}</Tooltip>}>
                                    <Button type="button" aria-label={value} variant="light" >
                                        <FontAwesomeIcon icon={faListCheck} />
                                    </Button>
                                </OverlayTrigger>
                        break;
                    case "Awaiting Bot":
                        result = <OverlayTrigger placement="bottom" overlay={<Tooltip>{value}</Tooltip>}>
                                    <Button type="button" aria-label={value} variant="light" >
                                        <FontAwesomeIcon icon={faRobot} />
                                    </Button>
                                </OverlayTrigger>
                    break;
                    case "Docusign Sent":
                        result = <OverlayTrigger placement="bottom" overlay={<Tooltip>{value}</Tooltip>}>
                                    <Button type="button" aria-label={value} variant="light" >
                                        <FontAwesomeIcon icon={faSignature} />
                                    </Button>
                                </OverlayTrigger>
                    break;
                    case "Completed":
                        result = <OverlayTrigger placement="bottom" overlay={<Tooltip>{value}</Tooltip>}>
                                    <Button type="button" aria-label={value} variant="light" >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                </OverlayTrigger>
                        break;
                }

                return (
                    <div className="px-1">
                        {result}
                    </div>);
            },
            size:100,
            // filterFn: 'arrIncludesSome',
            meta: {
                filterVariant: 'select',
            }
        }),
        columnHelper.accessor('transactionID', {
            id:"ID",
            header:"ID",
            size:110
        }),
        columnHelper.accessor('date', {
            id:"Submission Date",
            header:"Submission Date",
            size:110
        }),
        columnHelper.accessor('submitter', {
            id:"Submitter",
            header:'Submitter',
            size:190,
            meta: {
                filterVariant: 'select',
            }
        }),
        columnHelper.accessor('leaseNumber', {
            id:"Lease Number",
            header:"Lease Number",
            size:100
        }),
        columnHelper.accessor('cor', {
            header:"COR",
            id:"COR",
            size:180,
            meta: {
                filterVariant: 'select',
            }
        }),
        columnHelper.accessor('acor', {
            header:'ACOR',
            id:"ACOR",
            size:180,
            meta: {
                filterVariant: 'select',
            }
        }),
        columnHelper.accessor('ccList', {
            id:'Additional CC',
            header:'Additional CC',
            size:180,
        }),
        columnHelper.accessor('search', {
            id: 'search',
            cell: info => <span>{info.getValue()}</span>,
        }),
    ],
        []
    );

    useEffect(() => {
        if (filteredInputData.length <= 0 || currentRow < 0) {
            setCarouselIndex(0);
            return;
        }
        const idx = currentRow;
        const row = filteredInputData[idx];
        console.log('Selected ID: ' + row.ID);
        console.log(row)
        setCurrentMember(row);
        setCarouselIndex(1);
        console.log(logs)
        setMemberLogs(logs.filter(item => item["transactionID"] == row["transactionID"]));
    }, [currentRow, filteredInputData]);

    const table = useReactTable({
        data: filteredInputData,
        columns,
        //defaultColumn,
        state: {
            columnVisibility:columnVisibility,
            columnFilters: columnFilters,
            sorting:sorting
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), //client-side filtering
        getSortedRowModel: getSortedRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(), // client-side faceting
        getFacetedUniqueValues: getFacetedUniqueValues(), // generate unique values for select filter/autocomplete
        autoResetPageIndex,
        meta: {
            updateData: (rowIndex, columnId, value) => {
                // Skip page index reset until after next rerender
                skipAutoResetPageIndex()
                setInputData(old =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            }
                        }
                        return row
                    })
                )
            },
        },
        filterFns: {
            multiSelect: (row, id, filterValues) => {
                if (filterValues.length === 0) return row;
                return row.filter((r) => filterValues.includes(r.values[id]));
            }
        }
    })

    function handleSelect(action, row) {
        switch (action) {
            case "details":
                setCurrentRow(row);
                break;
            case "mainTable":
                setCurrentRow(-1);
                break;
        }
    }

    console.log(table.getState().sorting)

    // React.useMemo( ()=> {
    //     table.setColumnFilters([{id:'status',value:["LMT Info Needed","Approval Needed"]}])
    // },[table])

    return (
        <>
            <Carousel activeIndex={carouselIndex} onSelect={handleSelect} controls={false} indicators={false}>
                <Carousel.Item>
                    {/* <Form>
                        <Row className="mb-3">
                            <Col md="4"> */}
                                <div className="wrapper">
                                    <div>
                                        <div className='flexVar'>
                                            <FloatingLabel label="Search Database">
                                                <DebouncedInput
                                                    value={searchText ?? ''}
                                                    onChange={value => setSearchText(String(value))}
                                                    placeholder="Search"
                                                />
                                            </FloatingLabel>
                                            <OverlayTrigger overlay={<Tooltip >Clear all filters</Tooltip>} placement="right">
                                                <Button type="button" id="removeFilterBtn" variant="outline-secondary" onClick={() =>{clearAllFilters()}}><FontAwesomeIcon icon={faFilterCircleXmark} /></Button>
                                            </OverlayTrigger>
                                        </div>
                                        <span>{searchResults}</span>
                                    </div>
                                    <div className="flexVar">
                                        <ExportExcel excelData={filteredInputData} fileName={"COR-ACOR Change Database " + [new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York'}),new Date().toLocaleTimeString('en-US', {timeZone: 'America/New_York'})].join(" ")}></ExportExcel>
                                        <Button type="button" variant="outline-secondary" style={{"height":"40px"}} href={intakeFormURL} target="_blank">Intake Form <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></Button>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="outline-primary" style={{"height":"40px"}}>
                                                Display
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {table.getAllLeafColumns().map(column => {
                                                    if (column.id!="search"){
                                                        return (
                                                            <div key={column.id} className="px-1">
                                                            <label>
                                                                <input
                                                                {...{
                                                                    type: 'checkbox',
                                                                    checked: column.getIsVisible(),
                                                                    onChange: column.getToggleVisibilityHandler(),
                                                                }}
                                                                />{' '}
                                                                {column.id}
                                                            </label>
                                                            </div>
                                                        )
                                                    }
                                                })}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            {/* </Col>
                        </Row>
                    </Form> */}
                    
                    <div style={{'overflowX':'scroll','overflowY':'scroll','height':'400px'}}>
                        <BTable style={{'tableLayout': 'fixed'}}>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} >
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className='text-center' style={{width: `${header.getSize()}px`,position:'sticky',top:'1',backgroundColor:'#efebeb'}}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : 
                                                    <>
                                                        <div
                                                            {...{
                                                                className: header.column.getCanSort()
                                                                ? 'cursor-pointer select-none'
                                                                : '',
                                                                onClick: header.column.getToggleSortingHandler(),
                                                            }}
                                                            >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                            {{
                                                                asc: ' 🔼',
                                                                desc: ' 🔽',
                                                            }[header.column.getIsSorted().toString()] ?? "↕️"}
                                                            </div>
                                                        {header.column.getCanFilter() ? (
                                                        <div>
                                                            <Filter column={header.column} />
                                                        </div>
                                                        ) : null}
                                                    </>
                                                }
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className='text-center' style={{width: `${cell.column.getSize()}px`}}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                            {/* <tfoot>
                                {table.getFooterGroups().map(footerGroup => (
                                    <tr key={footerGroup.id}>
                                        {footerGroup.headers.map(header => (
                                            <th key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.footer,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </tfoot> */}
                        </BTable>
                    </div>
                </Carousel.Item>
                <Carousel.Item>
                    <DetailsPage currentMember={currentMember} memberLogs={memberLogs} handleSelect={handleSelect} filteredInputData={filteredInputData}/>
                </Carousel.Item>
            </Carousel>
        </>
    )
}

export default MainTable;