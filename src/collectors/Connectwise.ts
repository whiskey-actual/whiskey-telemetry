import https from 'https'
import axios from 'axios'
import { Utilities } from 'whiskey-utilities'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'

export class Connectwise
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._showDetails=showDetails;
    this._showDebug=showDebug;
    this._utilities = new Utilities(logStack, showDetails, showDebug);
  }
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  private _utilities:Utilities=new Utilities([])

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<SqlRequestCollection> {
   this._utilities.logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Connectwise_device")
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, 'initializing ..')

    try {

      // get the access token ..
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. received accessToken ..`)

      // get computers ..
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), this._utilities.CleanedString(computers[i].ComputerName))
          .input('connectwiseId', sql.VarChar(255), this._utilities.CleanedString(computers[i].Id))
          .input('connectwiseDeviceType', sql.VarChar(255), 'computer')
          .input('connectwiseLocation', sql.VarChar(255), this._utilities.CleanedString(computers[i].Location.Name))
          .input('connectwiseClient', sql.VarChar(255), this._utilities.CleanedString(computers[i].Client.Name))
          .input('connectwiseOperatingSystem', sql.VarChar(255), this._utilities.CleanedString(computers[i].OperatingSystemName))
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), this._utilities.CleanedString(computers[i].OperatingSystemVersion))
          .input('connectwiseDomainName', sql.VarChar(255), this._utilities.CleanedString(computers[i].DomainName))
          .input('connectwiseAgentVersion', sql.VarChar(255), this._utilities.CleanedString(computers[i].RemoteAgentVersion))
          .input('connectwiseComment', sql.VarChar(255), this._utilities.CleanedString(computers[i].Comment))
          .input('connectwiseIpAddress', sql.VarChar(255), this._utilities.CleanedString(computers[i].LocalIPAddress))
          .input('connectwiseMacAddress', sql.VarChar(255), this._utilities.CleanedString(computers[i].MACAddress))
          .input('connectwiseLastUserName', sql.VarChar(255), this._utilities.CleanedString(computers[i].LastUserName))
          .input('connectwiseType', sql.VarChar(255), this._utilities.CleanedString(computers[i].Type))
          .input('connectwiseStatus', sql.VarChar(255), this._utilities.CleanedString(computers[i].Status))
          .input('connectwiseSerialNumber', sql.VarChar(255), this._utilities.CleanedString(computers[i].SerialNumber))
          .input('connectwiseBiosManufacturer', sql.VarChar(255), this._utilities.CleanedString(computers[i].BiosManufacturer))
          .input('connectwiseModel', sql.VarChar(255), this._utilities.CleanedString(computers[i].Model))
          .input('connectwiseDescription', sql.VarChar(255), this._utilities.CleanedString(computers[i].Description))
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseLastObserved', sql.DateTime2, this._utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, this._utilities.CleanedDate(computers[i].WindowsUpdateDate))
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, this._utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          .input('connectwiseFirstSeen', sql.DateTime2, this._utilities.CleanedDate(computers[i].DateAdded))
          output.sqlRequests.push(q)
        }  catch(err) {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${err}`)
        }
      }

      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. done; querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<computers.length; i++) {
        try {
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), this._utilities.CleanedString(computers[i].ComputerName))
          .input('connectwiseId', sql.VarChar(255), this._utilities.CleanedString(computers[i].Id))
          .input('connectwiseDeviceType', sql.VarChar(255), 'network')
          .input('connectwiseLocation', sql.VarChar(255), this._utilities.CleanedString(computers[i].Location.Name))
          .input('connectwiseClient', sql.VarChar(255), this._utilities.CleanedString(computers[i].Client.Name))
          .input('connectwiseOperatingSystem', sql.VarChar(255), this._utilities.CleanedString(computers[i].OperatingSystemName))
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), this._utilities.CleanedString(computers[i].OperatingSystemVersion))
          .input('connectwiseDomainName', sql.VarChar(255), this._utilities.CleanedString(computers[i].DomainName))
          .input('connectwiseAgentVersion', sql.VarChar(255), this._utilities.CleanedString(computers[i].RemoteAgentVersion))
          .input('connectwiseComment', sql.VarChar(255), this._utilities.CleanedString(computers[i].Comment))
          .input('connectwiseIpAddress', sql.VarChar(255), this._utilities.CleanedString(computers[i].LocalIPAddress))
          .input('connectwiseMacAddress', sql.VarChar(255), this._utilities.CleanedString(computers[i].MACAddress))
          .input('connectwiseLastUserName', sql.VarChar(255), this._utilities.CleanedString(computers[i].LastUserName))
          .input('connectwiseType', sql.VarChar(255), this._utilities.CleanedString(computers[i].Type))
          .input('connectwiseStatus', sql.VarChar(255), this._utilities.CleanedString(computers[i].Status))
          .input('connectwiseSerialNumber', sql.VarChar(255), this._utilities.CleanedString(computers[i].SerialNumber))
          .input('connectwiseBiosManufacturer', sql.VarChar(255), this._utilities.CleanedString(computers[i].BiosManufacturer))
          .input('connectwiseModel', sql.VarChar(255), this._utilities.CleanedString(computers[i].Model))
          .input('connectwiseDescription', sql.VarChar(255), this._utilities.CleanedString(computers[i].Description))
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseFirstSeen', sql.DateTime2, this._utilities.CleanedDate(computers[i].DateAdded))
          .input('connectwiseLastObserved', sql.DateTime2, this._utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, this._utilities.CleanedDate(computers[i].WindowsUpdateDate))
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, this._utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          output.sqlRequests.push(q)
        }  catch(err) {
          this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${err}`)
        }
      }

    } catch(err) {
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${err}`)
      throw(err)
    } finally {
     this._utilities.logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  
  }
}
