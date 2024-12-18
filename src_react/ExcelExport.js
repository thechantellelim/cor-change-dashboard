// // source: https://medium.com/@aalam-info-solutions-llp/how-to-excel-export-in-react-js-481b15b961e3


import { read, utils, writeFileXLSX } from 'xlsx';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileExcel} from '@fortawesome/free-solid-svg-icons'
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const ExportExcel=({excelData,fileName}) =>{

    const exportToExcel = async () =>{
        const newArray = excelData.map(({ search,Info,Updates, ...item }) => item);
        console.log(newArray)
        const ws = utils.json_to_sheet(newArray);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Data");
            writeFileXLSX(wb, fileName+".xlsx");
    }

    return (
        <OverlayTrigger overlay={<Tooltip >Export visible data to excel</Tooltip>}>
            <Button type="button" variant='outline-secondary' onClick={(e)=>exportToExcel(fileName)} style={{"border":"white","height":"40px"}}><FontAwesomeIcon icon={faFileExcel} size='xl'/></Button>
        </OverlayTrigger>
    )
}

export default ExportExcel;
