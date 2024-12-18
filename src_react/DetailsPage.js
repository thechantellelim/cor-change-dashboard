
import Button from 'react-bootstrap/Button';

import { current } from '@reduxjs/toolkit';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table'
import { useEffect, useMemo, useState, useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBackward,faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { parseSafe } from './DataUtils';
import { is } from './TypeUtils.js';
import ApiDataService from './ApiDataService.js';
import { AutomationsContext } from './App';
import { Stepper } from 'react-form-stepper';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import InputGroup from 'react-bootstrap/InputGroup';


const  logTableHeaders = ["Date","User","Action"];

const DetailsPage = ({currentMember,memberLogs,handleSelect,filteredInputData}) => {
    const {logs,setLogs,userEmail,isLoading,setIsLoading,refreshData,dbConfig} = useContext(AutomationsContext)
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [modalType,setModalType] = useState("");
    const [modalAction,setModalAction]=useState("")
    const [editMode,setEditMode]=useState(false)
    const [lmtData,setLMTData]=useState([])
    const [lmtTenantData,setLMTTenantData]=useState([])
    const [corData,setCORData]=useState([])
    const [acorData,setACORData]=useState([])

    function useAsyncEffect(setup, dependencies = undefined) {
        useEffect(() => {
            setup().catch(console.error);
        }, dependencies);
    }

    useAsyncEffect( async () => {
        try {
            setIsLoading(true)
            const result = await ApiDataService.getLMTData(currentMember.leaseNumber,currentMember.cor,currentMember.acor)
            const {lmtData,lmtTenantData,corData,acorData} = result;

            setLMTData(lmtData)
            setLMTTenantData(lmtTenantData)
            setCORData(corData)
            setACORData(acorData)
            console.log("Loading data from LMT")
            console.log(lmtData)
            console.log(lmtTenantData)
            console.log(corData)
            console.log(acorData)

            setIsLoading(false)
        }
        catch(err) {
            console.error(err)
        }
      },[currentMember]
    )

    const onActionChange = ({ target: { value } }) => {
        console.log(`value: ${value}`);
        setModalAction(value);
    };

    const actionPanel = useMemo(() =>{

        switch(modalAction){
            case "notes":
                return (
                    <>
                        <br />
                        <p><Form.Control as="textarea" aria-label="With textarea" placeholder='Enter notes here. Notes will be saved in the History Log.'/></p>
                    </>
                )
            break;
            case "verification":
                return (
                    <>
                        <br />
                        <p>I verify that all information listed here is accurate to my knowledge, and that upon submission, this information will be used to generate a new COR Letter in LMT, and subsequently the Agency and Lessor Letters.</p>
                    </>
                )
            break;
            case "reminders":
                return (
                    <>
                        <br />
                        <p>Hello,</p>
                        <p>Your COR/ACOR change submission for lease XXXXXX is still missing LMT information as of xxx. Please provide the missing info in LMT at your earliest convenience.</p>
                        <p><Form.Control as="textarea" aria-label="With textarea" placeholder='Enter any notes you would like to send to the reviewer, otherwise leave this field blank'/></p>
                        <p>Thanks,<br />GSA COR Letter Bot<br /><br /><i>This is an automated email. Please do not reply to this email</i>.</p>
                    </>
                )
            break;
            case "cancel":
                return (
                    <>
                        <br />
                        <p><Form.Control as="textarea" aria-label="With textarea" placeholder='Enter your cancellation reason here (Required)'/></p>
                        <p>*You will receive an email confirming the cancellation of this change request*</p>
                    </>
                )
            break;

        }
    },[modalAction])

    let displayLogs = memberLogs.slice(0, 3);

    useEffect(() => {
        console.log("current member:")
        console.log(currentMember)
        console.log("member logs:")
        console.log(memberLogs)
        console.log(dbConfig)
    }, [currentMember]);

    async function submitUpdates(){
        setIsLoading(true)
        const response = await ApiDataService.submitUpdates({"email":currentMember["EmailAddress"],"ID":currentMember["ID"],"submitterEmail":userEmail},modalAction);
        console.log("response:")
            console.log(response)
            if(response){
                console.log("successful update")
                refreshData();
            }
            else {
                alert("There was an error submitting updates. Please try again later, or contact the administrators if this error persists.")
            }
        
            setIsLoading(false)
        
    }
    
    return (
        <>  
            <div className="flex reviewPageTitle">
                <span className="sectionTitle">{currentMember["transactionID"] + " | " + currentMember["leaseNumber"]}</span>
                {
                    editMode==false &&
                    <Button type="button" variant="primary" onClick={() =>{handleSelect("mainTable")}}><FontAwesomeIcon icon={faBackward} />&emsp;Main Table</Button>
                }
            </div>
            <div id="review_div" className="flexVar">
            <div role="region" aria-label="Submission Details" id="summary_div">
                    <Tabs
                    defaultActiveKey="submissionInfo"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                    >
                        <Tab eventKey="submissionInfo" title="Submission Info">
                            <Table striped bordered hover>
                                <tbody>
                                    {
                                        Object.keys(currentMember).map(key =>(
                                            dbConfig.submissionCols.includes(key) &&
                                                <tr>
                                                    <td >{key}</td>
                                                    <td >{currentMember[key]}</td>
                                                </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="lmtInfo" title="LMT Info">
                            {
                                corData.length>0 &&
                                <>
                                <span className="sectionTitle">COR Info</span>
                                <hr className="underline" aria-hidden="true" />
                                    <Table striped bordered hover>
                                        <tbody>
                                            {
                                                Object.keys(corData[0]).map(key =>(
                                                    <tr>
                                                        <td >{key}</td>
                                                        <td >{corData[0][key]}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </>
                            }
                            {
                                acorData.length>0 &&
                                <>
                                <span className="sectionTitle">Alternate COR Info</span>
                                <hr className="underline" aria-hidden="true" />
                                    <Table striped bordered hover>
                                        <tbody>
                                            {
                                                Object.keys(acorData[0]).map(key =>(
                                                        <tr>
                                                            <td >{key}</td>
                                                            <td >{acorData[0][key]}</td>
                                                        </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </>
                            }
                            {
                                lmtTenantData.length>0 &&
                                <>
                                <span className="sectionTitle">Local Agency Info</span>
                                <hr className="underline" aria-hidden="true" />
                                {
                                    lmtTenantData.map(row =>{
                                        return (
                                            <>
                                            <Table striped bordered hover>
                                            <tbody>
                                            <tr>
                                                <td >Agency Name</td>
                                                <td >{row["Tenant Name"]}</td>
                                            </tr>
                                            <tr>
                                                <td >Primary POC Email Address</td>
                                                <td >{row["Tenant Representative Email"]}</td>
                                            </tr>
                                            <tr>
                                                <td >Primary POC First Name</td>
                                                <td >{row["Tenant Rep First Name"]}</td>
                                            </tr>
                                            <tr>
                                                <td >Primary POC Last Name</td>
                                                <td >{row["Tenant Rep Last Name"]}</td>
                                            </tr>
                                            </tbody>
                                            </Table>
                                            </>
                                        )
                                    })
                                }
                                </>
                            }
                            {
                                lmtData.length>0 &&
                                <>
                                <span className="sectionTitle">Additional Lease Info</span>
                                <hr className="underline" aria-hidden="true" />
                                <Table striped bordered hover>
                                    <tbody>
                                        {
                                            Object.keys(lmtData[0]).sort().map(key =>(
                                                dbConfig.lmtCols.includes(key) &&
                                                    <tr>
                                                        <td >{key}</td>
                                                        <td >{lmtData[0][key]}</td>
                                                    </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                                </>
                            }
                        </Tab>
                        
                        {currentMember.docusignInfo &&
                        <Tab eventKey="docusignInfo" title="Docusign Info">
                            <Table striped bordered hover>
                                <tbody>
                                    {
                                        Object.keys(currentMember.docusignInfo).map(key =>(
                                            <tr>
                                                <td >{key}</td>
                                                <td >{currentMember.docusignInfo[key]}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </Tab>
                        }
                        
                    </Tabs>               
                </div>
                <div id="action_div" className="flexcolStartVar">
                    <div id="takeAction" >
                        <Button type="button" variant="secondary" id="actionBtn" className="top-icon" onClick={() => {setModalType("Action");handleShow();}}>Action Menu <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></Button>
                        <div id="reviewBreakdown" className="flexColEven" >
                            <Stepper steps={[{ label: 'LMT Info Needed' },{ label: 'Approval Needed' },{ label: 'Awaiting Bot' }, { label: 'Docusign Sent' },{ label: 'Completed' }]} activeStep={currentMember["status"]=="LMT Info Needed" ? 0 : (currentMember["status"]=="Docusign Sent" ? 1 : 2)} />
                            <span>Submission Date</span>
                            <span>LMT Info Request Sent</span>
                            <span>Docusign Sent</span>
                            <span>Completed Date</span>
                        </div>
                    </div>
                    <div id="viewHistory">
                        <Button type="button" variant="secondary" id="historyBtn" className="top-icon" onClick={() => {setModalType("History");handleShow();}}>History Log <FontAwesomeIcon icon={faArrowUpRightFromSquare} /></Button>
                        <div id="historyText">
                            {displayLogs.map( (val) => (
                                <p>{val["Date"]} : {val["Action"]}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Modal 
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show} 
                onHide={handleClose}
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    {modalType=="Action" ? "Action Menu" : "History Log"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalType=="Action" ?
                        <Form>
                            <div className="flex actionGap">
                                <Form.Select aria-label="Select an action" onChange={onActionChange} defaultValue="selectaction">
                                    <option disabled value="selectaction">Select An Action</option>
                                    <option value="notes" disabled={currentMember["status"]=="Completed"? true : false}>Add Working Notes{currentMember["status"]=="Completed" && " [Disabled]"}</option>
                                    <option value="cancel" disabled={currentMember["status"]=="LMT Info Needed"? false : true}>Cancel Transaction{currentMember["status"]!="LMT Info Needed" && " [Disabled]"}</option>
                                    <option value="verification" disabled={currentMember["status"]!="Approval Needed" ? true : false}>Approve for Bot Processing{currentMember["status"]!="Approval Needed" && " [Disabled]"}</option>
                                </Form.Select>
                            </div>
                        </Form>
                        :
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    {logTableHeaders.map((header, idx) => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {memberLogs.map( (val,rowidx) => (
                                        <tr>
                                            <td >{val["Date"]}</td>
                                            <td >{val["User"]}</td>
                                            <td >{val["Action"]}</td>
                                        </tr>
                                ))}
                            </tbody>
                        </Table>
                    }
                    {actionPanel}
                </Modal.Body>
                <Modal.Footer>
                {modalType=="Action" &&
                    <>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => {submitUpdates();handleClose();}} disabled={modalAction=="" ? true : false}>
                            Submit Action
                        </Button>
                    </>
                }
                </Modal.Footer>
            </Modal>
        </>

    )
}

export default DetailsPage;