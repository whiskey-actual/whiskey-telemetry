import axios from "axios";
import * as msal from '@azure/msal-node'
import { WhiskeyUtilities } from "whiskey-utilities";
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'

export class AzureManaged {

  constructor(logStack:string[], showDetails:boolean=false, showDebug:boolean=false) {
    this._logStack=logStack;
    this._showDetails=showDetails;
    this._showDebug=showDebug;
  }
  private _logStack:string[]=[]
  private _showDetails:boolean=false;
  private _showDebug:boolean=false;
  

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<SqlRequestCollection> {
    this._logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_AzureManaged_device")
    WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, 'initializing ..')

      try {
        
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. getting access token.. ')
        const authResponse = await this.getToken(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET);
        const accessToken = authResponse.accessToken;
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, '.. got access token; fetching managed devices ..')
        const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/deviceManagement/managedDevices`)
        WhiskeyUtilities.AddLogEntry(WhiskeyUtilities.LogEntrySeverity.Ok, this._logStack, `.. received ${deviceList.length} devices; processing ..`)

        
        for(let i=0; i<deviceList.length; i++) {
            try {
              let q = new sql.Request()
              .input('deviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceName))
              .input('azureManagedDeviceName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].azureManagedDeviceName))
              .input('azureManagedId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].id))
              .input('azureManagedUserId', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userId))
              .input('azureManagedManagedDeviceOwnerType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managedDeviceOwnerType))
              .input('azureManagedOperatingSystem', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].operatingSystem))
              .input('azureManagedComplianceState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].complianceState))
              .input('azureManagedJailBroken', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].jailBroken))
              .input('azureManagedManagementAgent', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].managementAgent))
              .input('azureManagedOperatingSystemVersion', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].osVersion))
              .input('azureManagedEASDeviceID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].easDeviceId))
              .input('azureManagedDeviceEnrollmentType', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceEnrollmentType))
              .input('azureManagedActivationLockBypassCode', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].activationLockBypassCode))
              .input('azureManagedEmailAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].emailAddress))
              .input('azureManagedAzureADDeviceID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].azureADDeviceID))
              .input('azureManagedDeviceRegistrationState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceRegistrationState))
              .input('azureManagedDeviceCategoryDisplayName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceCategoryDisplayName))
              .input('azureManagedExchangeAccessState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].exchangeAccessState))
              .input('azureManagedExchangeAccessStateReason', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].accessStateReason))
              .input('azureManagedRemoteAssistanceSessionUrl', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].remoteAssistanceSessionUrl))
              .input('azureManagedRemoteAssistanceErrorDetails', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].remoteAssistanceErrorDetails))
              .input('azureManagedUserPrincipalName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userPrincipalName))
              .input('azureManagedModel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].model))
              .input('azureManagedManufacturer', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].manufacturer))
              .input('azureManagedIMEI', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].imei))
              .input('azureManagedSerialNumber', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].serialNumber))
              .input('azureManagedPhoneNumber', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].phoneNumber))
              .input('azureManagedAndroidSecurityPatchLevel', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].securityPatchLevel))
              .input('azureManagedUserDisplayName', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].userDisplayName))
              .input('azureManagedConfigurationManagerClientEnabedFeatures', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].configurationManagerClientEnabedFeatures))
              .input('azureManagedWiFiMACAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].wifiMacAddress))
              .input('azureManagedDeviceHealthAttestationState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].deviceHealthAttestationState))
              .input('azureManagedSubscriberCarrier', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].subscriberCarrier))
              .input('azureManagedMEID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].meid))
              .input('azureManagedPartnerReportedThreatState', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].partnerReportedThreatState))
              .input('azureManagedICCID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].iccid))
              .input('azureManagedUDID', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].udid))
              .input('azureManagedNotes', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].notes))
              .input('azureManagedEthernetMacAddress', sql.VarChar(255), WhiskeyUtilities.CleanedString(deviceList[i].ethernetMacAddress))
              // bigint
              .input('azureManagedTotalStorageSpaceInBytes', sql.BigInt, deviceList[i].totalStorageSpaceInBytes ? Number(deviceList[i].totalStorageSpaceInBytes) : undefined)
              .input('azureManagedFreeStorageSpaceInBytes', sql.BigInt, deviceList[i].freeStorageSpaceInBytes ? Number(deviceList[i].freeStorageSpaceInBytes) : undefined)
              .input('azureManagedPhysicalMemoryInBytes', sql.BigInt, deviceList[i].physicalMemoryInBytes ? Number(deviceList[i].physicalMemoryInBytes) : undefined)
              // datetime
              .input('azureManagedEnrolledDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].enrolledDateTime))
              .input('azureManagedLastSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].lastSyncDateTime))
              .input('azureManagedEASActivationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].easActivationDateTime))
              .input('azureManagedExchangeLastSuccessfulSyncDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].exchangeLastSuccessfulSyncDateTime))
              .input('azureManagedComplianceGracePeriodExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].complianceGracePeriodExpirationDateTime))
              .input('azureManagedManagementCertificateExpirationDateTime', sql.DateTime2, WhiskeyUtilities.CleanedDate(deviceList[i].managementCertificateExpirationDateTime))
              // bit
              .input('azureManagedRequireUserEnrollmentApproval', sql.Bit, deviceList[i].requireUserEnrollmentApproval ? deviceList[i].requireUserEnrollmentApproval : false)
              .input('azureManagedIsEASActivated', sql.Bit, deviceList[i].easActivated ? deviceList[i].easActivated : false)
              .input('azureManagedIsAzureADRegistered', sql.Bit, deviceList[i].azureADRegistered ? deviceList[i].azureADRegistered : false)
              .input('azureManagedIsSupervised', sql.Bit, deviceList[i].isSupervised ? deviceList[i].isSupervised : false)
              .input('azureManagedIsEncrypted', sql.Bit, deviceList[i].isEncrypted ? deviceList[i].isEncrypted : false)
              output.sqlRequests.push(q)
            }
            catch(err) {
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
