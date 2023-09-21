import axios from "axios";
import * as msal from '@azure/msal-node'
import { Utilities } from "whiskey-utilities";
import { AzureManagedDevice } from '../Device'

export class AzureManaged {

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._showDetails=showDetails;
    this._showDebug=showDebug;
    this._utilities = new Utilities(logStack, showDetails, showDebug);
  }
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  private _utilities = new Utilities([])

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureManagedDevice[]> {
   this._utilities.logStack.push('fetch')

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, 'initializing ..')
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. getting access token.. ')
    const authResponse = await this.getToken(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
    const accessToken = authResponse.accessToken;
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. got access token ..')
    let output:Array<AzureManagedDevice> = []
    output = await this.managedDevices(accessToken, GRAPH_ENDPOINT);

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, '.. done.')
   this._utilities.logStack.pop()
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})
  }

  public async managedDevices(accessToken:string, GRAPH_ENDPOINT:string):Promise<AzureManagedDevice[]> {

    let output:Array<AzureManagedDevice> = []
   this._utilities.logStack.push('managedDevices')
    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. fetching managed devices ..`)

    const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/deviceManagement/managedDevices`)

    this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Ok, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {

      // let q = new sql.Request()
      // .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceName))
      // .input('azureManagedDeviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].azureManagedDeviceName))
      // .input('azureManagedId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].id))
      // .input('azureManagedUserId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userId))
      // .input('azureManagedManagedDeviceOwnerType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managedDeviceOwnerType))
      // .input('azureManagedOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operatingSystem))
      // .input('azureManagedComplianceState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].complianceState))
      // .input('azureManagedJailBroken', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].jailBroken))
      // .input('azureManagedManagementAgent', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managementAgent))
      // .input('azureManagedOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].osVersion))
      // .input('azureManagedEASDeviceID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].easDeviceId))
      // .input('azureManagedDeviceEnrollmentType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceEnrollmentType))
      // .input('azureManagedActivationLockBypassCode', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].activationLockBypassCode))
      // .input('azureManagedEmailAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].emailAddress))
      // .input('azureManagedAzureADDeviceID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].azureADDeviceID))
      // .input('azureManagedDeviceRegistrationState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceRegistrationState))
      // .input('azureManagedDeviceCategoryDisplayName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceCategoryDisplayName))
      // .input('azureManagedExchangeAccessState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].exchangeAccessState))
      // .input('azureManagedExchangeAccessStateReason', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].accessStateReason))
      // .input('azureManagedRemoteAssistanceSessionUrl', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].remoteAssistanceSessionUrl))
      // .input('azureManagedRemoteAssistanceErrorDetails', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].remoteAssistanceErrorDetails))
      // .input('azureManagedUserPrincipalName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userPrincipalName))
      // .input('azureManagedModel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].model))
      // .input('azureManagedManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].manufacturer))
      // .input('azureManagedIMEI', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].imei))
      // .input('azureManagedSerialNumber', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].serialNumber))
      // .input('azureManagedPhoneNumber', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].phoneNumber))
      // .input('azureManagedAndroidSecurityPatchLevel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].securityPatchLevel))
      // .input('azureManagedUserDisplayName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userDisplayName))
      // .input('azureManagedConfigurationManagerClientEnabedFeatures', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].configurationManagerClientEnabedFeatures))
      // .input('azureManagedWiFiMACAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].wifiMacAddress))
      // .input('azureManagedDeviceHealthAttestationState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceHealthAttestationState))
      // .input('azureManagedSubscriberCarrier', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].subscriberCarrier))
      // .input('azureManagedMEID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].meid))
      // .input('azureManagedPartnerReportedThreatState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].partnerReportedThreatState))
      // .input('azureManagedICCID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].iccid))
      // .input('azureManagedUDID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].udid))
      // .input('azureManagedNotes', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].notes))
      // .input('azureManagedEthernetMacAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].ethernetMacAddress))
      // // bigint
      // .input('azureManagedTotalStorageSpaceInBytes', sql.BigInt, deviceList[i].totalStorageSpaceInBytes ? Number(deviceList[i].totalStorageSpaceInBytes) : undefined)
      // .input('azureManagedFreeStorageSpaceInBytes', sql.BigInt, deviceList[i].freeStorageSpaceInBytes ? Number(deviceList[i].freeStorageSpaceInBytes) : undefined)
      // .input('azureManagedPhysicalMemoryInBytes', sql.BigInt, deviceList[i].physicalMemoryInBytes ? Number(deviceList[i].physicalMemoryInBytes) : undefined)
      // // datetime
      // .input('azureManagedEnrolledDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].enrolledDateTime))
      // .input('azureManagedLastSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].lastSyncDateTime))
      // .input('azureManagedEASActivationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].easActivationDateTime))
      // .input('azureManagedExchangeLastSuccessfulSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].exchangeLastSuccessfulSyncDateTime))
      // .input('azureManagedComplianceGracePeriodExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].complianceGracePeriodExpirationDateTime))
      // .input('azureManagedManagementCertificateExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].managementCertificateExpirationDateTime))
      // // bit
      // .input('azureManagedRequireUserEnrollmentApproval', sql.Bit, deviceList[i].requireUserEnrollmentApproval ? deviceList[i].requireUserEnrollmentApproval : false)
      // .input('azureManagedIsEASActivated', sql.Bit, deviceList[i].easActivated ? deviceList[i].easActivated : false)
      // .input('azureManagedIsAzureADRegistered', sql.Bit, deviceList[i].azureADRegistered ? deviceList[i].azureADRegistered : false)
      // .input('azureManagedIsSupervised', sql.Bit, deviceList[i].isSupervised ? deviceList[i].isSupervised : false)
      // .input('azureManagedIsEncrypted', sql.Bit, deviceList[i].isEncrypted ? deviceList[i].isEncrypted : false)
      // output.sqlRequests.push(q)
      
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

   this._utilities.logStack.pop()
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})

  }

  private async getToken(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {

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
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${error.toString()}`)
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
      this._utilities.AddLogEntry(Utilities.LogEntrySeverity.Error, `error: ${error.toString()}`)
    }

   this._utilities.logStack.pop()
    return new Promise<any>((resolve) => {resolve(output)})

  }

}