import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'

export class AzureActiveDirectory {

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<SqlRequestCollection> {
    this._logStack.push('fetch')
    let output:SqlRequestCollection

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token.. ')
    const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const accessToken = authResponse.accessToken;
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token ..')

    output = await this.devices(GRAPH_ENDPOINT, accessToken);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  }

  private async devices(GRAPH_ENDPOINT:string, accessToken:string):Promise<SqlRequestCollection> {
    let output = new SqlRequestCollection('sp_add_azureActiveDirectory_device')
    this._logStack.push('devices')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {

      try {
        let q = new sql.Request()
        .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
        .input('azureId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
        .input('azureDeviceCategory', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceCategory))
        .input('azureDeviceId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceId))
        .input('azureDeviceMetadata', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceMetadata))
        .input('azureDeviceOwnership', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceOwnership))
        .input('azureDeviceVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceVersion))
        .input('azureDomainName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].domainName))
        .input('azureEnrollmentProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentProfileType))
        .input('azureEnrollmentType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentType))
        .input('azureExternalSourceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].externalSourceName))
        .input('azureManagementType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managementType))
        .input('azureManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].manufacturer))
        .input('azureMDMAppId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].mdmAppId))
        .input('azureModel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].model))
        .input('azureOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operaingSystem))
        .input('azureOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operatingSystemVersion))
        .input('azureProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].profileType))
        .input('azureSourceType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].sourceType))
        .input('azureTrustType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].trustType))
        // dates
        .input('azureDeletedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].deletedDateTime))
        .input('azureApproximateLastSignInDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].approximateLastSignInDateTime))
        .input('azureComplianceExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].complianceExpirationDateTime))
        .input('azureCreatedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].createdDateTime))
        .input('azureOnPremisesLastSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime))
        .input('azureRegistrationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].registrationDateTime))
        // booleans
        .input('azureOnPremisesSyncEnabled', sql.Bit, deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false)
        .input('azureAccountEnabled', sql.Bit, deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false)
        .input('azureIsCompliant', sql.Bit, deviceList[i].isCompliant ? deviceList[i].isCompliant : false)
        .input('azureIsManaged', sql.Bit, deviceList[i].isManaged ? deviceList[i].isManaged : false)
        .input('azureIsRooted', sql.Bit, deviceList[i].isRooted ? deviceList[i].isRooted : false)
        output.sqlRequests.push(q)
        
      }
      catch(err) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `ERR: ${err}`)
        this._logStack.pop()
        throw(err)
      }
    }

    this._logStack.pop()
    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  }

  private async getToken(AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {

    const msalConfig:msal.Configuration = {
      auth: {
        clientId: CLIENT_ID,
        authority: `${AAD_ENDPOINT}/${TENANT_ID}`,
        clientSecret: CLIENT_SECRET
      }
    }

    const tokenRequest:msal.ClientCredentialRequest = { scopes: [`${GRAPH_ENDPOINT}/.default`]}

    const cca:msal.ConfidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);


    const result:msal.AuthenticationResult|null =  await cca.acquireTokenByClientCredential(tokenRequest)

    if(result!=null) {
      return new Promise<msal.AuthenticationResult>((resolve) => {resolve(result)})
    }
    else {
      throw('error getting token')
    }

  }

  private async callAPI(accessToken:string, endpoint:string):Promise<any> {

    let output:any = undefined
    this._logStack.push('callAPI')

    const options = { headers: { Authorization: `Bearer ${accessToken}`}}

    try {
      const response = await axios.get(endpoint, options)
      output = response.data
    } catch (error:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${error.toString()}`)
      return error;
    }

    this._logStack.pop();
    return new Promise<any>((resolve) => {resolve(output)})


  }

  private async getData(accesstoken:string, uri:string):Promise<any> {

    var output:any = []
    this._logStack.push('getData')

    try {

       const response = await this.callAPI(accesstoken, uri);
       for(const value of response.value) {
        output.push(value)
       }

       var nextLink = response['@odata.nextLink']
       while(nextLink) {
        const nextPage = await this.callAPI(accesstoken, nextLink)
        nextLink = nextPage['@odata.nextLink']

        for(const value of nextPage.value) {
          output.push(value)
        }
       }
    } catch (error:any) {
      WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `error: ${error.toString()}`)
    }

    this._logStack.pop()
    return new Promise<any>((resolve) => {resolve(output)})

  }

}
