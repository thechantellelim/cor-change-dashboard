import Endpoints from './Endpoints';
import { useLocalData } from './AppConfig';
let appData = [];

const ApiDataService = {
    async fetchData() {
        if (useLocalData) {
            return Promise.all([
                fetch('http://localhost:1235/inputData', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined),
                fetch('http://localhost:1235/logs', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined),
                fetch('http://localhost:1235/dbConfig', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined)
            ]).then(([inputData,logs,dbConfig]) => ({inputData,logs,dbConfig}))
        }
        else {
            const prom1 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('inputData');
            })
            const prom2 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('inputFields');
            })
            const prom3 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('logs');
            })
            const prom4 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('surveyData');
            })
            const prom5 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('formData');
            })
            return Promise.all([prom1,prom2,prom3,prom4,prom5]).then(([prom1,prom2,prom3,prom4,prom5])=>({"inputData":prom1,"inputFields":prom2,"logs":prom3,"surveyData":prom4,"formData":prom5}))
        }
    },
    async getUrlParams() {
        if (useLocalData) {
            return new URLSearchParams(window.location.search);
        }
        else {
            return new URLSearchParams(window.googleParams);
        }
    },
    async getUserEmail() {
        if (useLocalData) {
            return Promise.resolve('chantelle.lim@gsa.gov');
        }
        else {
            return new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getUserEmail();
            });
        }
    },
    async getAdminList(){
        if (useLocalData) {
            return (
                fetch('http://localhost:1235/adminList', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined)
            )
        }
        else {
            return new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getAdminList();
            });
        }
    },
    async getLMTData(leaseNumber,corEmail,acorEmail){
        if (useLocalData) {
            return Promise.all([
                fetch('http://localhost:1235/lmtData', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined),
                fetch('http://localhost:1235/lmtTenantData', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined),
                fetch('http://localhost:1235/lmtOfficeData', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined),
                fetch('http://localhost:1235/lmtOfficeData', {
                    method: "GET"
                }).then(response => response.status !== 204 ? response.json() : undefined)

            ]).then(([lmtData,lmtTenantData,corData,acorData]) => ({lmtData,lmtTenantData,corData,acorData}))
        }
        else {
            const prom1 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('lmtData');
            })
            const prom2 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('lmtTenantData');
            })
            const prom3 = new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).getData('lmtOfficeData');
            })
            return Promise.all([prom1,prom2,prom3]).then(([prom1,prom2,prom3,prom4])=>({"inputData":prom1,"inputFields":prom2,"logs":prom3}))
        }
    },
    async submitUpdates(data,type){
        if (useLocalData){
            return Promise.all([
                fetch('http://localhost:1235/submitForm', {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                    "Content-Type": "application/json",
                    }
                }).then(response => response.status !== 204 ? response.json() : undefined)
            ])
        }
        else {
            return new Promise((resolve, reject) => {
                google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).submitUpdates(data,type);
            });
        }
    }
}

export default ApiDataService;