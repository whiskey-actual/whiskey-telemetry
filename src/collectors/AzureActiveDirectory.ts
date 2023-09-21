import axios from "axios";
import * as msal from '@azure/msal-node'
import { Utilities } from "whiskey-utilities";
import { AzureActiveDirectoryDevice } from '../Device'

export class AzureActiveDirectory {

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._showDetails=showDetails;
    this._showDebug=showDebug;
    this._utilities = new Utilities(logStack, showDetails, showDebug);
  }
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  private _utilities = new Utilities([])

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureActiveDirectoryDevice[]> {
   this._utilities.logStack.push('fetch')

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  'initializing ..')
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  '.. getting access token.. ')
    const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const accessToken = authResponse.accessToken;
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  '.. got access token ..')
    let output:Array<AzureActiveDirectoryDevice> = []

    output = await this.devices(GRAPH_ENDPOINT, accessToken);

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  '.. done.')
   this._utilities.logStack.pop()
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
  }

  private async devices(GRAPH_ENDPOINT:string, accessToken:string):Promise<AzureActiveDirectoryDevice[]> {

    let output:Array<AzureActiveDirectoryDevice> = []
   this._utilities.logStack.push('devices')
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok,  `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {

      // let q = new sql.Request()
      // .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
      // .input('azureId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].displayName))
      // .input('azureDeviceCategory', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceCategory))
      // .input('azureDeviceId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceId))
      // .input('azureDeviceMetadata', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceMetadata))
      // .input('azureDeviceOwnership', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceOwnership))
      // .input('azureDeviceVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceVersion))
      // .input('azureDomainName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].domainName))
      // .input('azureEnrollmentProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentProfileType))
      // .input('azureEnrollmentType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].enrollmentType))
      // .input('azureExternalSourceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].externalSourceName))
      // .input('azureManagementType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managementType))
      // .input('azureManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].manufacturer))
      // .input('azureMDMAppId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].mdmAppId))
      // .input('azureModel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].model))
      // .input('azureOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operaingSystem))
      // .input('azureOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operatingSystemVersion))
      // .input('azureProfileType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].profileType))
      // .input('azureSourceType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].sourceType))
      // .input('azureTrustType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].trustType))
      // // dates
      // .input('azureDeletedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].deletedDateTime))
      // .input('azureApproximateLastSignInDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].approximateLastSignInDateTime))
      // .input('azureComplianceExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].complianceExpirationDateTime))
      // .input('azureCreatedDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].createdDateTime))
      // .input('azureOnPremisesLastSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime))
      // .input('azureRegistrationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].registrationDateTime))
      // // booleans
      // .input('azureOnPremisesSyncEnabled', sql.Bit, deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false)
      // .input('azureAccountEnabled', sql.Bit, deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false)
      // .input('azureIsCompliant', sql.Bit, deviceList[i].isCompliant ? deviceList[i].isCompliant : false)
      // .input('azureIsManaged', sql.Bit, deviceList[i].isManaged ? deviceList[i].isManaged : false)
      // .input('azureIsRooted', sql.Bit, deviceList[i].isRooted ? deviceList[i].isRooted : false)
      // output.sqlRequests.push(q)

      const d:AzureActiveDirectoryDevice = {
        // mandatory
        observedByAzureActiveDirectory: true,
        deviceName: deviceList[i].displayName.toString().trim(),
        azureDeviceId: deviceList[i].deviceId.toString().trim(),
        // strings
        azureDisplayName: this._utilities.CleanedString(deviceList[i].displayName),
        azureId: this._utilities.CleanedString(deviceList[i].id),
        azureDeviceCategory: this._utilities.CleanedString(deviceList[i].deviceCategory),
        azureDeviceMetadata: this._utilities.CleanedString(deviceList[i].deviceMetadata),
        azureDeviceOwnership: this._utilities.CleanedString(deviceList[i].deviceOwnership),
        azureDeviceVersion: this._utilities.CleanedString(deviceList[i].deviceVersion),
        azureDomainName: this._utilities.CleanedString(deviceList[i].domainName),
        azureEnrollmentProfileType: this._utilities.CleanedString(deviceList[i].enrollmentProfileType),
        azureEnrollmentType: this._utilities.CleanedString(deviceList[i].enrollmentType),
        azureExternalSourceName: this._utilities.CleanedString(deviceList[i].externalSourceName),
        azureManagementType: this._utilities.CleanedString(deviceList[i].managementType),
        azureManufacturer: this._utilities.CleanedString(deviceList[i].manufacturer),
        azureMDMAppId: this._utilities.CleanedString(deviceList[i].mdmAppId),
        azureModel: this._utilities.CleanedString(deviceList[i].model),
        azureOperatingSystem: this._utilities.CleanedString(deviceList[i].operaingSystem),
        azureOperatingSystemVersion: this._utilities.CleanedString(deviceList[i].operatingSystemVersion),
        azureProfileType: this._utilities.CleanedString(deviceList[i].profileType),
        azureSourceType: this._utilities.CleanedString(deviceList[i].sourceType),
        azureTrustType: this._utilities.CleanedString(deviceList[i].trustType),
        // dates
        azureDeletedDateTime: this._utilities.CleanedDate(deviceList[i].deletedDateTime),
        azureApproximateLastSignInDateTime: this._utilities.CleanedDate(deviceList[i].approximateLastSignInDateTime),
        azureComplianceExpirationDateTime: this._utilities.CleanedDate(deviceList[i].complianceExpirationDateTime),
        azureCreatedDateTime: this._utilities.CleanedDate(deviceList[i].createdDateTime),
        azureOnPremisesLastSyncDateTime: this._utilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime),
        azureRegistrationDateTime: this._utilities.CleanedDate(deviceList[i].registrationDateTime),
        // booleans
        azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false,
        azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false,
        azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : false,
        azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : false,
        azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : false,
      }

      output.push(d)
    }

   this._utilities.logStack.pop()
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})
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
   this._utilities.logStack.push('callAPI')

    const options = { headers: { Authorization: `Bearer ${accessToken}`}}

    try {
      const response = await axios.get(endpoint, options)
      output = response.data
    } catch (error:any) {
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error,  `error: ${error.toString()}`)
      return error;
    }

   this._utilities.logStack.pop();
    return new Promise<any>((resolve) => {resolve(output)})


  }

  private async getData(accesstoken:string, uri:string):Promise<any> {

    var output:any = []
   this._utilities.logStack.push('getData')

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
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error,  `error: ${error.toString()}`)
    }

   this._utilities.logStack.pop()
    return new Promise<any>((resolve) => {resolve(output)})

  }
}