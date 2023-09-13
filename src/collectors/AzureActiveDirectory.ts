import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { AzureActiveDirectoryDevice } from '../Device'
import sql from 'mssql'

export class AzureActiveDirectory {

  public static sqlProcedure:string = 'sp_add_device_azureActiveDirectory'

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  _logStack:string[]=[]
  _showDetails:boolean=false;
  _showDebug:boolean=false;
  

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<sql.Request[]> {
    this._logStack.push('fetch')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token.. ')
    const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const accessToken = authResponse.accessToken;
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token ..')
    let output:Array<sql.Request> = []

    output = await this.devices(GRAPH_ENDPOINT, accessToken);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    return new Promise<sql.Request[]>((resolve) => {resolve(output)})
  }

  private async devices(GRAPH_ENDPOINT:string, accessToken:string):Promise<sql.Request[]> {

    let output:Array<sql.Request> = []
    this._logStack.push('devices')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const device:AzureActiveDirectoryDevice = {
        deviceName: deviceList[i].displayName.toString(),
        observedByAzureActiveDirectory: true,
        azureDisplayName: deviceList[i].displayName.toString(),
        azureId: deviceList[i].id,
        azureDeviceCategory: deviceList[i].deviceCategory ? deviceList[i].deviceCategory.toString() : undefined,
        azureDeviceId: deviceList[i].deviceId ? deviceList[i].deviceId.toString() : undefined,
        azureDeviceMetadata: deviceList[i].deviceMetadata ? deviceList[i].deviceMetadata.toString() : undefined,
        azureDeviceOwnership: deviceList[i].deviceOwnership ? deviceList[i].deviceOwnership.toString() : undefined,
        azureDeviceVersion: deviceList[i].deviceVersion ? deviceList[i].deviceVersion.toString() : undefined,
        azureDomainName: deviceList[i].domainName ? deviceList[i].domainName.toString() : undefined,
        azureEnrollmentProfileType: deviceList[i].enrollmentProfileType ? deviceList[i].enrollmentProfileType.toString() : undefined,
        azureEnrollmentType: deviceList[i].enrollmentType ? deviceList[i].enrollmentType.toString() : undefined,
        azureExternalSourceName: deviceList[i].externalSourceName ? deviceList[i].externalSourceName.toString() : undefined,
        azureManagementType: deviceList[i].managementType ? deviceList[i].managementType.toString() : undefined,
        azureManufacturer: deviceList[i].manufacturer ? deviceList[i].manufacturer.toString() : undefined,
        azureMDMAppId: deviceList[i].mdmAppId ? deviceList[i].mdmAppId.toString() : undefined,
        azureModel: deviceList[i].model ? deviceList[i].model.toString() : undefined,
        azureOperatingSystem: deviceList[i].operaingSystem ? deviceList[i].operaingSystem.toString() : undefined,
        azureOperatingSystemVersion: deviceList[i].operatingSystemVersion ? deviceList[i].operatingSystemVersion.toString() : undefined,
        azureProfileType: deviceList[i].profileType ? deviceList[i].profileType.toString() : undefined,
        azureSourceType: deviceList[i].sourceType ? deviceList[i].sourceType.toString() : undefined,
        azureTrustType: deviceList[i].trustType ? deviceList[i].trustType.toString() : undefined,
        azureDeletedDateTime: new Date(deviceList[i].deletedDateTime),
        azureApproximateLastSignInDateTime: new Date(deviceList[i].approximateLastSignInDateTime),
        azureComplianceExpirationDateTime: new Date(deviceList[i].complianceExpirationDateTime),
        azureCreatedDateTime: new Date(deviceList[i].createdDateTime),
        azureOnPremisesLastSyncDateTime: new Date(deviceList[i].onPremisesLastSyncDateTime),
        azureRegistrationDateTime: new Date(deviceList[i].registrationDateTime),
        azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false,
        azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false,
        azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : false,
        azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : false,
        azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : false,
      }

      const sqlStatement:sql.Request = await this.generateSqlStatement(device)

      output.push(sqlStatement)
    }

    this._logStack.pop()
    return new Promise<sql.Request[]>((resolve) => {resolve(output)})
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

  private async generateSqlStatement(device:AzureActiveDirectoryDevice):Promise<sql.Request> {
    let output:sql.Request = new sql.Request()
    this._logStack.push("generateSqlStatements");

      try {
        let q = new sql.Request()
        .input('deviceName', sql.VarChar(255), device.azureDisplayName)
        .input('azureId', sql.VarChar(255), device.azureId)
        .input('azureDeviceCategory', sql.VarChar(255), device.azureDeviceCategory)
        .input('azureDeviceId', sql.VarChar(255), device.azureDeviceId)
        .input('azureDeviceMetadata', sql.VarChar(255), device.azureDeviceMetadata)
        .input('azureDeviceOwnership', sql.VarChar(255), device.azureDeviceOwnership)
        .input('azureDeviceVersion', sql.VarChar(255), device.azureDeviceVersion)
        .input('azureDomainName', sql.VarChar(255), device.azureDomainName)
        .input('azureEnrollmentProfileType', sql.VarChar(255), device.azureEnrollmentProfileType)
        .input('azureEnrollmentType', sql.VarChar(255), device.azureEnrollmentType)
        .input('azureExternalSourceName', sql.VarChar(255), device.azureExternalSourceName)
        .input('azureManagementType', sql.VarChar(255), device.azureManagementType)
        .input('azureManufacturer', sql.VarChar(255), device.azureManufacturer)
        .input('azureMDMAppId', sql.VarChar(255), device.azureMDMAppId)
        .input('azureModel', sql.VarChar(255), device.azureModel)
        .input('azureOperatingSystem', sql.VarChar(255), device.azureOperatingSystem)
        .input('azureOperatingSystemVersion', sql.VarChar(255), device.azureOperatingSystemVersion)
        .input('azureProfileType', sql.VarChar(255), device.azureProfileType)
        .input('azureSourceType', sql.VarChar(255), device.azureSourceType)
        .input('azureTrustType', sql.VarChar(255), device.azureTrustType)
        // dates
        .input('azureDeletedDateTime', sql.DateTime2, device.azureDeletedDateTime)
        .input('azureApproximateLastSignInDateTime', sql.DateTime2, device.azureApproximateLastSignInDateTime)
        .input('azureComplianceExpirationDateTime', sql.DateTime2, device.azureComplianceExpirationDateTime)
        .input('azureCreatedDateTime', sql.DateTime2, device.azureCreatedDateTime)
        .input('azureOnPremisesLastSyncDateTime', sql.DateTime2, device.azureOnPremisesLastSyncDateTime)
        .input('azureRegistrationDateTime', sql.DateTime2, device.azureRegistrationDateTime)
        // booleans
        .input('azureOnPremisesSyncEnabled', sql.Bit, device.azureOnPremisesSyncEnabled)
        .input('azureAccountEnabled', sql.Bit, device.azureAccountEnabled)
        .input('azureIsCompliant', sql.Bit, device.azureIsCompliant)
        .input('azureIsManaged', sql.Bit, device.azureIsManaged)
        .input('azureIsRooted', sql.Bit, device.azureIsRooted)
        .execute('sp_add_device_azureActiveDirectory')
        //console.debug(result)
        
      }
      catch(err) {
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Error, this._logStack, `ERR: ${err}`)
        this._logStack.pop()
        throw(err)
      }

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Info, this._logStack, `done.`)
    
    this._logStack.pop()
    return new Promise<sql.Request>((resolve) => {resolve(output)})
  }

}
