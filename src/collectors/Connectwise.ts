import https from 'https'
import axios from 'axios'
import { WhiskeyUtilities } from 'whiskey-utilities'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'

export class Connectwise
{

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  private _logStack:string[]=[]
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<SqlRequestCollection> {
    this._logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Connectwise_device")
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')

    try {

      // get the access token ..
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received accessToken ..`)

      // get computers ..
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), computers[i].ComputerName.toString())
          .input('connectwiseId', sql.VarChar(255), computers[i].Id)
          .input('connectwiseDeviceType', sql.VarChar(255), 'computer')
          .input('connectwiseLocation', sql.VarChar(255), computers[i].Location.Name)
          .input('connectwiseClient', sql.VarChar(255), computers[i].Client.Name)
          .input('connectwiseOperatingSystem', sql.VarChar(255), computers[i].OperatingSystemName)
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), computers[i].OperatingSystemVersion)
          .input('connectwiseDomainName', sql.VarChar(255), computers[i].DomainName)
          .input('connectwiseAgentVersion', sql.VarChar(255), computers[i].RemoteAgentVersion)
          .input('connectwiseComment', sql.VarChar(255), computers[i].Comment)
          .input('connectwiseIpAddress', sql.VarChar(255), computers[i].LocalIPAddress)
          .input('connectwiseMacAddress', sql.VarChar(255), computers[i].MACAddress)
          .input('connectwiseLastUserName', sql.VarChar(255), computers[i].LastUserName)
          .input('connectwiseType', sql.VarChar(255), computers[i].Type)
          .input('connectwiseStatus', sql.VarChar(255), computers[i].Status)
          .input('connectwiseSerialNumber', sql.VarChar(255), computers[i].SerialNumber)
          .input('connectwiseBiosManufacturer', sql.VarChar(255), computers[i].BiosManufacturer)
          .input('connectwiseModel', sql.VarChar(255), computers[i].Model)
          .input('connectwiseDescription', sql.VarChar(255), computers[i].Description)
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseLastObserved', sql.DateTime2, new Date(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, computers[i].WindowsUpdateDate ? new Date(computers[i].WindowsUpdateDate) : undefined)
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, computers[i].AntivirusDefinitionDate ? new Date(computers[i].AntivirusDefinitionDate) : undefined)
          .input('connectwiseFirstSeen', sql.DateTime2, new Date(computers[i].DateAdded))
          output.sqlRequests.push(q)
        }  catch(err) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${err}`)
        }
      }

      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. done; querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<computers.length; i++) {
        try {
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), computers[i].ComputerName.toString())
          .input('connectwiseId', sql.VarChar(255), computers[i].Id)
          .input('connectwiseDeviceType', sql.VarChar(255), 'network')
          .input('connectwiseLocation', sql.VarChar(255), computers[i].Location.Name)
          .input('connectwiseClient', sql.VarChar(255), computers[i].Client.Name)
          .input('connectwiseOperatingSystem', sql.VarChar(255), computers[i].OperatingSystemName)
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), computers[i].OperatingSystemVersion)
          .input('connectwiseDomainName', sql.VarChar(255), computers[i].DomainName)
          .input('connectwiseAgentVersion', sql.VarChar(255), computers[i].RemoteAgentVersion)
          .input('connectwiseComment', sql.VarChar(255), computers[i].Comment)
          .input('connectwiseIpAddress', sql.VarChar(255), computers[i].LocalIPAddress)
          .input('connectwiseMacAddress', sql.VarChar(255), computers[i].MACAddress)
          .input('connectwiseLastUserName', sql.VarChar(255), computers[i].LastUserName)
          .input('connectwiseType', sql.VarChar(255), computers[i].Type)
          .input('connectwiseStatus', sql.VarChar(255), computers[i].Status)
          .input('connectwiseSerialNumber', sql.VarChar(255), computers[i].SerialNumber)
          .input('connectwiseBiosManufacturer', sql.VarChar(255), computers[i].BiosManufacturer)
          .input('connectwiseModel', sql.VarChar(255), computers[i].Model)
          .input('connectwiseDescription', sql.VarChar(255), computers[i].Description)
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseFirstSeen', sql.DateTime2, new Date(computers[i].DateAdded))
          .input('connectwiseLastObserved', sql.DateTime2, new Date(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, new Date(computers[i].WindowsUpdateDate))
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, new Date(computers[i].AntivirusDefinitionDate))
          output.sqlRequests.push(q)
        }  catch(err) {
          WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${err}`)
        }
      }

    } catch(err) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${err}`)
      throw(err)
    } finally {
      this._logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  
  }
}
