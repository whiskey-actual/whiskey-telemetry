import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { AzureDevice } from '../Device'

export class Azure {

  constructor(logStack:string[], TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this._logStack=logStack;
    this._TENANT_ID=TENANT_ID
    this._AAD_ENDPOINT=AAD_ENDPOINT
    this._GRAPH_ENDPOINT=GRAPH_ENDPOINT
    this._CLIENT_ID=CLIENT_ID
    this._CLIENT_SECRET=CLIENT_SECRET
  }

  _logStack:string[]=[]
  _TENANT_ID:string=''
  _AAD_ENDPOINT:string=''
  _GRAPH_ENDPOINT:string=''
  _CLIENT_ID:string=''
  _CLIENT_SECRET:string=''

  public async query():Promise<AzureDevice[]> {

    this._logStack.push('Azure')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token.. ')
    const authResponse = await this.getToken();
    const accessToken = authResponse.accessToken;
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token ..')
    let output:Array<AzureDevice> = []

    output = await this.devices(accessToken);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<AzureDevice[]>((resolve) => {resolve(output)})
  }

  public async devices(accessToken:string):Promise<AzureDevice[]> {

    let output:Array<AzureDevice> = []
    this._logStack.push('devices')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. fetching devices ..`)

    const deviceList = await this.getData(accessToken, `${this._GRAPH_ENDPOINT}/v1.0/devices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const d:AzureDevice = {
        deviceName: deviceList[i].displayName.toString(),
        observedByAzure: true,
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
        azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled.toString() : undefined,
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
        azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : undefined,
        azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : undefined,
        azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : undefined,
        azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : undefined,
      }

      output.push(d)
    }

    this._logStack.pop()
    return new Promise<AzureDevice[]>((resolve) => {resolve(output)})
  }

  private async getToken():Promise<msal.AuthenticationResult> {

    const msalConfig:msal.Configuration = {
      auth: {
        clientId: this._CLIENT_ID,
        authority: `${this._AAD_ENDPOINT}/${this._TENANT_ID}`,
        clientSecret: this._CLIENT_SECRET
      }
    }

    const tokenRequest:msal.ClientCredentialRequest = { scopes: [`${this._GRAPH_ENDPOINT}/.default`]}

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
