import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { Device } from '../Device'

export class Azure {

  constructor(logStack:string[]) {
    this._logStack=logStack;
    this._logStack.push('Azure')
  }

  _logStack:string[]=[]

  public async queryDevices(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('queryAzureDevices')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'getting access token.. ')

    const authResponse = await this.getToken(CLIENT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_SECRET);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token, querying devices .. ')

    const deviceList = await this.getData(authResponse.accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const d:Device = {deviceName: deviceList[i].displayName.toString()}
      d.observedByAzure=true;
      d.azureDisplayName=deviceList[i].displayName.toString();
      d.azureId=deviceList[i].id;
      d.azureDeviceCategory=deviceList[i].deviceCategory ? deviceList[i].deviceCategory.toString() : undefined;
      d.azureDeviceId=deviceList[i].deviceId ? deviceList[i].deviceId.toString() : undefined;
      d.azureDeviceMetadata=deviceList[i].deviceMetadata ? deviceList[i].deviceMetadata.toString() : undefined;
      d.azureDeviceOwnership=deviceList[i].deviceOwnership ? deviceList[i].deviceOwnership.toString() : undefined;
      d.azureDeviceVersion=deviceList[i].deviceVersion ? deviceList[i].deviceVersion.toString() : undefined;
      d.azureDomainName=deviceList[i].domainName ? deviceList[i].domainName.toString() : undefined;
      d.azureEnrollmentProfileType=deviceList[i].enrollmentProfileType ? deviceList[i].enrollmentProfileType.toString() : undefined;
      d.azureEnrollmentType=deviceList[i].enrollmentType ? deviceList[i].enrollmentType.toString() : undefined;
      d.azureExternalSourceName=deviceList[i].externalSourceName ? deviceList[i].externalSourceName.toString() : undefined;
      d.azureManagementType=deviceList[i].managementType ? deviceList[i].managementType.toString() : undefined;
      d.azureManufacturer=deviceList[i].manufacturer ? deviceList[i].manufacturer.toString() : undefined;
      d.azureMDMAppId=deviceList[i].mdmAppId ? deviceList[i].mdmAppId.toString() : undefined;
      d.azureModel=deviceList[i].model ? deviceList[i].model.toString() : undefined;
      d.azureOnPremisesSyncEnabled=deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled.toString() : undefined;
      d.azureOperatingSystem=deviceList[i].operaingSystem ? deviceList[i].operaingSystem.toString() : undefined;
      d.azureOperatingSystemVersion=deviceList[i].operatingSystemVersion ? deviceList[i].operatingSystemVersion.toString() : undefined;
      d.azureProfileType=deviceList[i].profileType ? deviceList[i].profileType.toString() : undefined;
      d.azureSourceType=deviceList[i].sourceType ? deviceList[i].sourceType.toString() : undefined;
      d.azureTrustType=deviceList[i].trustType ? deviceList[i].trustType.toString() : undefined;
      d.azureDeletedDateTime=deviceList[i].deletedDateTime ? new Date(deviceList[i].deletedDateTime) : undefined;
      d.azureApproximateLastSignInDateTime=deviceList[i].approximateLastSignInDateTime ? new Date(deviceList[i].approximateLastSignInDateTime) : undefined;
      d.azureComplianceExpirationDateTime=deviceList[i].complianceExpirationDateTime ? new Date(deviceList[i].complianceExpirationDateTime) : undefined;
      d.azureCreatedDateTime=deviceList[i].createdDateTime ? new Date(deviceList[i].createdDateTime) : undefined;
      d.azureOnPremisesLastSyncDateTime=deviceList[i].onPremisesLastSyncDateTime ? new Date(deviceList[i].onPremisesLastSyncDateTime) : undefined;
      d.azureRegistrationDateTime=deviceList[i].registrationDateTime ? new Date(deviceList[i].registrationDateTime) : undefined;
      d.azureAccountEnabled=deviceList[i].accountEnabled ? deviceList[i].accountEnabled : undefined;
      d.azureIsCompliant=deviceList[i].isCompliant ? deviceList[i].isCompliant : undefined;
      d.azureIsManaged=deviceList[i].isManaged ? deviceList[i].isManaged : undefined;
      d.azureIsRooted=deviceList[i].isRooted ? deviceList[i].isRooted : undefined;
      output.push(d)
    }

    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})
  }

  public async queryManagedDevices(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<Device[]> {

    let output:Array<Device> = []
    this._logStack.push('queryAzureManagedDevices')

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'getting access token.. ')

    const authResponse = await this.getToken(CLIENT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_SECRET);

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token, querying devices .. ')

    const deviceList = await this.getData(authResponse.accessToken, `${GRAPH_ENDPOINT}/v1.0/deviceManagement/managedDevices`)

    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

    for(let i=0; i<deviceList.length; i++) {
      const d:Device = {deviceName: deviceList[i].deviceName.toString()}
      d.observedByAzureMDM=true;
      d.azureManagedDeviceName=deviceList[i].azureManagedDeviceName;
      d.azureManagedId=deviceList[i].id;
      d.azureManagedUserId=deviceList[i].userId
      d.azureManagedManagedDeviceOwnerType=deviceList[i].managedDeviceOwnerType;
      d.azureManagedOperatingSystem=deviceList[i].operatingSystem;
      d.azureManagedComplianceState=deviceList[i].complianceState;
      d.azureManagedJailBroken=deviceList[i].jailBroken;
      d.azureManagedManagementAgent=deviceList[i].managementAgent;
      d.azureManagedOperatingSystemVersion=deviceList[i].osVersion;
      d.azureManagedEASDeviceID=deviceList[i].easDeviceId;
      d.azureManagedDeviceEnrollmentType=deviceList[i].deviceEnrollmentType;
      d.azureManagedActivationLockBypassCode=deviceList[i].activationLockBypassCode;
      d.azureManagedEmailAddress=deviceList[i].emailAddress;
      d.azureManagedAzureADDeviceID=deviceList[i].azureADDeviceID;
      d.azureManagedDeviceRegistrationState=deviceList[i].deviceRegistrationState;
      d.azureManagedDeviceCategoryDisplayName=deviceList[i].deviceCategoryDisplayName;
      d.azureManagedExchangeAccessState=deviceList[i].exchangeAccessState;
      d.azureManagedExchangeAccessStateReason=deviceList[i].accessStateReason;
      d.azureManagedRemoteAssistanceSessionUrl=deviceList[i].rRemoteAssistanceSessionUrl;
      d.azureManagedRemoteAssistanceErrorDetails=deviceList[i].remoteAssistanceErrorDetails;
      d.azureManagedUserPrincipalName=deviceList[i].userPrincipalName;
      d.azureManagedModel=deviceList[i].model;
      d.azureManagedManufacturer=deviceList[i].manufacturer;
      d.azureManagedIMEI=deviceList[i].imei;
      d.azureManagedSerialNumber=deviceList[i].serialNumber;
      d.azureManagedPhoneNumber=deviceList[i].phoneNumber;
      d.azureManagedAndroidSecurityPatchLevel=deviceList[i].securityPatchLevel;
      d.azureManagedUserDisplayName=deviceList[i].userDisplayName;
      d.azureManagedConfigurationManagerClientEnabedFeatures=deviceList[i].configurationManagerClientEnabedFeatures;
      d.azureManagedWiFiMACAddress=deviceList[i].wifiMacAddress;
      d.azureManagedDeviceHealthAttestationState=deviceList[i].deviceHealthAttestationState;
      d.azureManagedSubscriberCarrier=deviceList[i].subscriberCarrier;
      d.azureManagedMEID=deviceList[i].meid;
      d.azureManagedTotalStorageSpaceInBytes=deviceList[i].totalStorageSpaceInBytes;
      d.azureManagedFreeStorageSpaceInBytes=deviceList[i].freeStorageSpaceInBytes;
      d.azureManagedPartnerReportedThreatState=deviceList[i].partnerReportedThreatState;
      d.azureManagedRequireUserEnrollmentApproval=deviceList[i].requireUserEnrollmentApproval;
      d.azureManagedICCID=deviceList[i].iccid;
      d.azureManagedUDID=deviceList[i].udid;
      d.azureManagedNotes=deviceList[i].notes;
      d.azureManagedEthernetMacAddress=deviceList[i].ethernetMacAddress;
      d.azureManagedPhysicalMemoryInBytes=deviceList[i].physicalMemoryInBytes;
      // azure managed - dates
      d.azureManagedEnrolledDateTime = deviceList[i].enrolledDateTime ? new Date(deviceList[i].enrolledDateTime) : undefined
      d.azureManagedLastSyncDateTime = deviceList[i].lastSyncDateTime ? new Date(deviceList[i].lastSyncDateTime) : undefined
      d.azureManagedEASActivationDateTime = deviceList[i].easActivationDateTime ? new Date(deviceList[i].easActivationDateTime) : undefined
      d.azureManagedExchangeLastSuccessfulSyncDateTime = deviceList[i].exchangeLastSuccessfulSyncDateTime ? new Date(deviceList[i].exchangeLastSuccessfulSyncDateTime) : undefined
      d.azureManagedComplianceGracePeriodExpirationDateTime = deviceList[i].complianceGracePeriodExpirationDateTime ? new Date(deviceList[i].complianceGracePeriodExpirationDateTime) : undefined
      d.azureManagedManagementCertificateExpirationDateTime = deviceList[i].managementCertificateExpirationDateTime ? new Date(deviceList[i].managementCertificateExpirationDateTime) : undefined
      // azure managed - boolean
      d.azureManagedIsEASActivated = deviceList[i].easActivated ? deviceList[i].easActivated : undefined
      d.azureManagedIsAzureADRegistered = deviceList[i].azureADRegistered ? deviceList[i].azureADRegistered : undefined
      d.azureManagedIsSupervised = deviceList[i].isSupervised ? deviceList[i].isSupervised : undefined
      d.azureManagedIsEncrypted = deviceList[i].isEncrypted ? deviceList[i].isEncrypted : undefined


      output.push(d)
    }

    this._logStack.pop()
    return new Promise<Device[]>((resolve) => {resolve(output)})

  }

  private async getToken(CLIENT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, TENANT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {

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
