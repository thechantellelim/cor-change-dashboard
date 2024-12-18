import React, {useEffect,useState, createContext} from 'react';
import { useSearchParams } from "react-router-dom";
import './styles/App.css';
import './styles/bootstrap.js';
import ApiDataService from './ApiDataService';
import LoadingScreen from './LoadingScreen';
import MainTable from './mainTable';
import Instructions from './Instructions';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import image from './logoImage.js';

export const AutomationsContext = createContext({ inputData: [], setInputData(arg) {}, logs: [], setLogs(arg) {}, userEmail: [],dbConfig:{}});

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTitle,setLoadingTitle] = useState("Loading Data")
  const [inputData,setInputData] = useState([])
  const [logs,setLogs] = useState([])
  const [userEmail,setUserEmail]=useState("")
  const [dbConfig,setDBConfig] = useState({"submissionCols":[],"lmtCols":[]})
  let time = [new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York'}),new Date().toLocaleTimeString('en-US', {timeZone: 'America/New_York'})].join(" ")
  let lmtTime = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-US', {timeZone: 'America/New_York'})

  // const [searchParams, setSearchParams] = useSearchParams();

  function useAsyncEffect(setup, dependencies = undefined) {
    useEffect(() => {
        setup().catch(console.error);
    }, dependencies);
  }

 async function refreshData() {
  setIsLoading(true)
  const result = await ApiDataService.fetchData();
  result.inputData.forEach((row,idx) =>{
    result.inputData[idx]["search"]=Object.values(row).join(" ").replaceAll("/\{\}\"/g","")
  })
  setInputData(result.inputData)
  setLogs(result.logs)
  time = [new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York'}),new Date().toLocaleTimeString('en-US', {timeZone: 'America/New_York'})].join(" ")
  setIsLoading(false)
}

  useAsyncEffect( async () => {
    try {
      const userEmail = await ApiDataService.getUserEmail()
      setUserEmail(userEmail)
      console.log("Useremail: " + userEmail)
      if (userEmail!=""){
        const adminList = await ApiDataService.getAdminList();
        if (!adminList.includes(userEmail)){
          setLoadingTitle("You do not have permission to enter this site")
          return;
        }
      }

      // setSearchParams(ApiDataService.getUrlParams());
      console.log(ApiDataService.getUrlParams().toString())

      const result = await ApiDataService.fetchData();
      const {inputData,logs,dbConfig} = result;
      inputData.forEach((row,idx) =>{
        inputData[idx]["search"]=Object.values(row).join(" ").replaceAll("/\{\}\"/g","")
      })

      console.log('Setting Initial Data:', result);
      setInputData(inputData);
      console.log(inputData)
      setLogs(logs)
      setDBConfig(dbConfig)
      console.log(dbConfig)
      console.log('Completed Initial Data');
      time = [new Date().toLocaleDateString('en-US', {timeZone: 'America/New_York'}),new Date().toLocaleTimeString('en-US', {timeZone: 'America/New_York'})].join(" ")
      setIsLoading(false)
    }
    catch(err) {
        console.error(err)
    }
  },[])

    return (
        <div className="App">
            <LoadingScreen title={loadingTitle} isLoading={isLoading} />
            <AutomationsContext.Provider value={{inputData,setInputData,logs,setLogs,userEmail,isLoading,setIsLoading,refreshData,dbConfig}}>

                  <div className="wrapper">
                    <img src={image} width="80" height="80" alt="frpcLogo"/>
                    <h1>COR/ACOR Change Dashboard</h1>
                    <div className="flexColEven">
                      <span>
                        <OverlayTrigger overlay={<Tooltip >Refresh data</Tooltip>} placement="bottom">
                          <Button type="button" variant="outline-secondary" style={{'border':'white'}} onClick={() =>{refreshData()}}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
                        </OverlayTrigger>
                      Data as of: {time}
                      </span>
                      <div style={{ textAlign: 'right',color: 'red' }}>LMT Data as of: {lmtTime}</div>
                    </div>
                </div>
                <Instructions />
                <MainTable />
            </AutomationsContext.Provider>
        </div>
    );
}

export default App;
