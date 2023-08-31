import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { AzureManagedDevice } from '../Device'

export class AzureManaged {

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

  public async query():Promise<AzureManagedDevice[]> {

    this._logStack.push('AzureManaged')
    this._logStack.push('query')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token.. ')
    const authResponse = await this.getToken();
    const accessToken = authResponse.accessToken;
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token ..')
    let output:Array<AzureManagedDevice> = []
    output = await this.managedDevices(accessToken);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. done.')
    this._logStack.pop()
    this._logStack.pop()
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})
  }

  public async managedDevices(accessToken:string):Promise<AzureManagedDevice[]> {

    let output:Array<AzureManagedDevice> = []
    this._logStack.push('managedDevices')
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. fetching managed devices ..`)

    const deviceList = await this.getData(accessToken, `${this._GRAPH_ENDPOINT}/v1.0/deviceManagement/managedDevices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const d:AzureManagedDevice = {
        deviceName: deviceList[i].deviceName.toString(),
        observedByAzureMDM: true,
        azureManagedDeviceName: deviceList[i].azureManagedDeviceName,
        azureManagedId: deviceList[i].id,
        azureManagedUserId: deviceList[i].userId,
        azureManagedManagedDeviceOwnerType: deviceList[i].managedDeviceOwnerType,
        azureManagedOperatingSystem: deviceList[i].operatingSystem,
        azureManagedComplianceState: deviceList[i].complianceState,
        azureManagedJailBroken: deviceList[i].jailBroken,
        azureManagedManagementAgent: deviceList[i].managementAgent,
        azureManagedOperatingSystemVersion: deviceList[i].osVersion,
        azureManagedEASDeviceID: deviceList[i].easDeviceId,
        azureManagedDeviceEnrollmentType: deviceList[i].deviceEnrollmentType,
        azureManagedActivationLockBypassCode: deviceList[i].activationLockBypassCode,
        azureManagedEmailAddress: deviceList[i].emailAddress,
        azureManagedAzureADDeviceID: deviceList[i].azureADDeviceID,
        azureManagedDeviceRegistrationState: deviceList[i].deviceRegistrationState,
        azureManagedDeviceCategoryDisplayName: deviceList[i].deviceCategoryDisplayName,
        azureManagedExchangeAccessState: deviceList[i].exchangeAccessState,
        azureManagedExchangeAccessStateReason: deviceList[i].accessStateReason,
        azureManagedRemoteAssistanceSessionUrl: deviceList[i].remoteAssistanceSessionUrl,
        azureManagedRemoteAssistanceErrorDetails: deviceList[i].remoteAssistanceErrorDetails,
        azureManagedUserPrincipalName: deviceList[i].userPrincipalName,
        azureManagedModel: deviceList[i].model,
        azureManagedManufacturer: deviceList[i].manufacturer,
        azureManagedIMEI: deviceList[i].imei,
        azureManagedSerialNumber: deviceList[i].serialNumber,
        azureManagedPhoneNumber: deviceList[i].phoneNumber,
        azureManagedAndroidSecurityPatchLevel: deviceList[i].securityPatchLevel,
        azureManagedUserDisplayName: deviceList[i].userDisplayName,
        azureManagedConfigurationManagerClientEnabedFeatures: deviceList[i].configurationManagerClientEnabedFeatures,
        azureManagedWiFiMACAddress: deviceList[i].wifiMacAddress,
        azureManagedDeviceHealthAttestationState: deviceList[i].deviceHealthAttestationState,
        azureManagedSubscriberCarrier: deviceList[i].subscriberCarrier,
        azureManagedMEID: deviceList[i].meid,
        azureManagedTotalStorageSpaceInBytes: deviceList[i].totalStorageSpaceInBytes,
        azureManagedFreeStorageSpaceInBytes: deviceList[i].freeStorageSpaceInBytes,
        azureManagedPartnerReportedThreatState: deviceList[i].partnerReportedThreatState,
        azureManagedRequireUserEnrollmentApproval: deviceList[i].requireUserEnrollmentApproval,
        azureManagedICCID: deviceList[i].iccid,
        azureManagedUDID: deviceList[i].udid,
        azureManagedNotes: deviceList[i].notes,
        azureManagedEthernetMacAddress: deviceList[i].ethernetMacAddress,
        azureManagedPhysicalMemoryInBytes: deviceList[i].physicalMemoryInBytes,

        azureManagedEnrolledDateTime: new Date(deviceList[i].enrolledDateTime),
        azureManagedLastSyncDateTime: new Date(deviceList[i].lastSyncDateTime),
        azureManagedEASActivationDateTime: new Date(deviceList[i].easActivationDateTime),
        azureManagedExchangeLastSuccessfulSyncDateTime: new Date(deviceList[i].exchangeLastSuccessfulSyncDateTime),
        azureManagedComplianceGracePeriodExpirationDateTime: new Date(deviceList[i].complianceGracePeriodExpirationDateTime),
        azureManagedManagementCertificateExpirationDateTime: new Date(deviceList[i].managementCertificateExpirationDateTime),
        azureManagedIsEASActivated: deviceList[i].easActivated,
        azureManagedIsAzureADRegistered: deviceList[i].azureADRegistered,
        azureManagedIsSupervised: deviceList[i].isSupervised,
        azureManagedIsEncrypted: deviceList[i].isEncrypted,
        azureManagedManagedDeviceName: ""
      }



      output.push(d)
    }

    this._logStack.pop()
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})

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
