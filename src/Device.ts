import { model, Schema } from "mongoose";

export interface Device {
  deviceName: string;
}

export interface ActiveDirectoryDevice {
  // mandatory
  deviceName: string,
  observedByActiveDirectory: boolean,
  // strings
  activeDirectoryDN: string,
  activeDirectoryOperatingSystem?: string|undefined,
  activeDirectoryOperatingSystemVersion: string|undefined,
  activeDirectoryDNSHostName: string,
  // numbers
  activeDirectoryLogonCount: Number,
  // dates
  activeDirectoryWhenCreated: Date,
  activeDirectoryWhenChanged: Date,
  activeDirectoryLastLogon: Date,
  activeDirectoryPwdLastSet: Date,
  activeDirectoryLastLogonTimestamp: Date
}

export interface AzureDevice {
  // strings
  deviceName: string,
  azureDisplayName: string,
  azureId: string;
  azureDeviceCategory: string;
  azureDeviceId: string;
  azureDeviceMetadata: string;
  azureDeviceOwnership: string;
  azureDeviceVersion: string;
  azureDomainName: string;
  azureEnrollmentProfileType: string;
  azureEnrollmentType: string;
  azureExternalSourceName: string;
  azureManagementType: string;
  azureManufacturer: string;
  azureMDMAppId: string;
  azureModel: string;
  azureOnPremisesSyncEnabled: string;
  azureOperatingSystem: string;
  azureOperatingSystemVersion: string;
  azureProfileType: string;
  azureSourceType: string;
  azureTrustType: string;
  // dates
  azureDeletedDateTime: Date;
  azureApproximateLastSignInDateTime: Date;
  azureComplianceExpirationDateTime: Date;
  azureCreatedDateTime: Date;
  azureOnPremisesLastSyncDateTime: Date;
  azureRegistrationDateTime: Date;
  // booleans
  observedByAzure: boolean;
  azureAccountEnabled: boolean;
  azureIsCompliant: boolean;
  azureIsManaged: boolean;
  azureIsRooted: boolean;
}

export interface AzureManagedDevice {

  // strings
  deviceName: string,
  azureManagedDeviceName: string;
  azureManagedManagedDeviceName: string;
  azureManagedId: string;
  azureManagedUserId: string;
  azureManagedManagedDeviceOwnerType: string;
  azureManagedOperatingSystem: string;
  azureManagedComplianceState: string;
  azureManagedJailBroken: string;
  azureManagedManagementAgent: string;
  azureManagedOperatingSystemVersion: string;
  azureManagedEASDeviceID: string;
  azureManagedDeviceEnrollmentType: string;
  azureManagedActivationLockBypassCode: string;
  azureManagedEmailAddress: string;
  azureManagedAzureADDeviceID: string;
  azureManagedDeviceRegistrationState: string;
  azureManagedDeviceCategoryDisplayName: string;
  azureManagedExchangeAccessState: string;
  azureManagedExchangeAccessStateReason: string;
  azureManagedRemoteAssistanceSessionUrl: string;
  azureManagedRemoteAssistanceErrorDetails: string;
  azureManagedUserPrincipalName: string;
  azureManagedModel: string;
  azureManagedManufacturer: string;
  azureManagedIMEI: string;
  azureManagedSerialNumber: string;
  azureManagedPhoneNumber: string;
  azureManagedAndroidSecurityPatchLevel: string;
  azureManagedUserDisplayName: string;
  azureManagedConfigurationManagerClientEnabedFeatures: string;
  azureManagedWiFiMACAddress: string;
  azureManagedDeviceHealthAttestationState: string;
  azureManagedSubscriberCarrier: string;
  azureManagedMEID: string;
  azureManagedTotalStorageSpaceInBytes: string;
  azureManagedFreeStorageSpaceInBytes: string;
  azureManagedPartnerReportedThreatState: string;
  azureManagedRequireUserEnrollmentApproval: string;
  azureManagedICCID: string;
  azureManagedUDID: string;
  azureManagedNotes: string;
  azureManagedEthernetMacAddress: string;
  azureManagedPhysicalMemoryInBytes: string;
  // dates
  azureManagedEnrolledDateTime: Date;
  azureManagedLastSyncDateTime: Date;
  azureManagedEASActivationDateTime: Date;
  azureManagedExchangeLastSuccessfulSyncDateTime: Date;
  azureManagedComplianceGracePeriodExpirationDateTime: Date;
  azureManagedManagementCertificateExpirationDateTime: Date;
  // azure managed - boolean
  observedByAzureMDM: boolean;
  azureManagedIsEASActivated: boolean;
  azureManagedIsAzureADRegistered: boolean;
  azureManagedIsSupervised: boolean;
  azureManagedIsEncrypted: boolean;

}

export interface ConnectwiseDevice {

  // strings
  deviceName: string,
  connectwiseId: string;
  connectwiseLocation: string;
  connectwiseClient: string;
  connectwiseOperatingSystem: string;
  connectwiseOperatingSystemVersion: string;
  connectwiseDomainName: string;
  connectwiseAgentVersion: string;
  connectwiseComment: string;
  connectwiseIpAddress: string;
  connectwiseMacAddress: string;
  connectwiseLastUserName: string;
  connectwiseType: string;
  connectwiseStatus: string;
  connectwiseSerialNumber: string;
  connectwiseBiosManufacturer: string;
  connectwiseModel: string;
  connectwiseDescription: string;
  // numbers
  connectwiseTotalMemory: Number;
  connectwiseFreeMemory: Number;
  //dates
  connectwiseLastObserved: Date;
  connectwiseFirstSeen: Date;
  connectwiseWindowsUpdateDate: Date;
  connectwiseAntivirusDefinitionDate: Date;
  // booleans
  observedByConnectwise: Boolean;

}

export interface CrowdstrikeDevice {
    // strings
    deviceName: string;
    crowdstrikeDeviceId: string;
    crowdstrikeCID: string;
    crowdstrikeAgentVersion: string;
    crowdstrikeBIOSManufacturer: string;
    crowdstrikeBIOSVersion: string;
    crowdstrikeExternalIP: string;
    crowdstrikeMACAddress: string;
    crowdstrikeLocalIP: string;
    crowdstrikeMachineDomain: string;
    crowdstrikeMajorVersion: string;
    crowdstrikeMinorVersion: string;
    crowdstrikeOSVersion: string;
    crowdstrikeOSBuild: string;
    crowdstrikePlatformName: string;
    crowdstrikeReducedFunctionalityMode: string;
    crowdstrikeProductTypeDesc: string;
    crowdstrikeProvisionStatus: string;
    crowdstrikeSerialNumber: string;
    crowdstrikeServicePackMajor: string;
    crowdstrikeServicePackMinor: string;
    crowdstrikeStatus: string;
    crowdstrikeSystemManufacturer: string;
    crowdstrikeSystemProductName: string;
    crowdstrikeKernelVersion: string;
    // crowdstrike - datetime
    crowdstrikeFirstSeenDateTime: Date;
    crowdstrikeLastSeenDateTime: Date;
    crowdstrikeModifiedDateTime: Date;
    // crowdstrike - boolean
    observedByCrowdstrike: boolean;
}

export const DeviceSchema = new Schema({
  deviceName: {type:String, required:true, index:true, id: true, unique: true},
  deviceFirstObserved: {type:Date, default:new Date()},
  deviceLastObserved: {type:Date, default:new Date(), required:true },
  deviceIsActive: {type:Boolean, default:false, required:true, index:true, },
  deviceOperatingSystem: {type:String, required:true, index:true},

  // active directory
  activeDirectoryDN: {type:String},
  activeDirectoryLogonCount: {type:Number, default:0},
  activeDirectoryOperatingSystem: {type:String},
  activeDirectoryOperatingSystemVersion: {type:String},
  activeDirectoryDNSHostName: {type:String},
  // active directory - dates
  activeDirectoryWhenCreated: {type:Date},
  activeDirectoryWhenChanged: {type:Date},
  activeDirectoryLastLogon: {type:Date},
  activeDirectoryPwdLastSet: {type:Date},
  activeDirectoryLastLogonTimestamp: {type:Date},
  // active directory - booleans
  observedByActiveDirectory: {type:Boolean, default:false, required:true, index:true},


  // azure
  azureDisplayName: { type:String },
  azureId: {type:String},
  azureDeviceCategory: {type:String},
  azureDeviceId: {type:String},
  azureDeviceMetadata: {type:String},
  azureDeviceOwnership: {type:String},
  azureDeviceVersion: {type:String},
  azureDomainName: {type:String},
  azureEnrollmentProfileType: {type:String},
  azureEnrollmentType: {type:String},
  azureExternalSourceName: {type:String},
  azureManagementType: {type:String},
  azureManufacturer: {type:String},
  azureMDMAppId: {type:String},
  azureModel: {type:String},
  azureOnPremisesSyncEnabled: {type:String},
  azureOperatingSystem: {type:String},
  azureOperatingSystemVersion: {type:String},
  azureProfileType: {type:String},
  azureSourceType: {type:String},
  azureTrustType: {type:String},
  // azure - dates
  azureDeletedDateTime: {type:Date},
  azureApproximateLastSignInDateTime: {type:Date},
  azureComplianceExpirationDateTime: {type:Date},
  azureCreatedDateTime: {type:Date},
  azureOnPremisesLastSyncDateTime: {type:Date},
  azureRegistrationDateTime: {type:Date},
  // azure - booleans
  observedByAzure: {type:Boolean, default:false, required:true, index:true},
  azureAccountEnabled: {type:Boolean, default:false},
  azureIsCompliant: {type:Boolean, default:false},
  azureIsManaged: {type:Boolean, default:false},
  azureIsRooted: {type:Boolean, default:false},

  // azure managed
  azureManagedDeviceName: {type:String},
  azureManagedManagedDeviceName: {type:String},
  azureManagedId: {type:String},
  azureManagedUserId: {type:String},
  azureManagedManagedDeviceOwnerType: {type:String},
  azureManagedOperatingSystem: {type:String},
  azureManagedComplianceState: {type:String},
  azureManagedJailBroken: {type:String},
  azureManagedManagementAgent: {type:String},
  azureManagedOperatingSystemVersion: {type:String},
  azureManagedEASDeviceID: {type:String},
  azureManagedDeviceEnrollmentType: {type:String},
  azureManagedActivationLockBypassCode: {type:String},
  azureManagedEmailAddress: {type:String},
  azureManagedAzureADDeviceID: {type:String},
  azureManagedDeviceRegistrationState: {type:String},
  azureManagedDeviceCategoryDisplayName: {type:String},
  azureManagedExchangeAccessState: {type:String},
  azureManagedExchangeAccessStateReason: {type:String},
  azureManagedRemoteAssistanceSessionUrl: {type:String},
  azureManagedRemoteAssistanceErrorDetails: {type:String},
  azureManagedUserPrincipalName: {type:String},
  azureManagedModel: {type:String},
  azureManagedManufacturer: {type:String},
  azureManagedIMEI: {type:String},
  azureManagedSerialNumber: {type:String},
  azureManagedPhoneNumber: {type:String},
  azureManagedAndroidSecurityPatchLevel: {type:String},
  azureManagedUserDisplayName: {type:String},
  azureManagedConfigurationManagerClientEnabedFeatures: {type:String},
  azureManagedWiFiMACAddress: {type:String},
  azureManagedDeviceHealthAttestationState: {type:String},
  azureManagedSubscriberCarrier: {type:String},
  azureManagedMEID: {type:String},
  azureManagedTotalStorageSpaceInBytes: {type:String},
  azureManagedFreeStorageSpaceInBytes: {type:String},
  azureManagedPartnerReportedThreatState: {type:String},
  azureManagedRequireUserEnrollmentApproval: {type:String},
  azureManagedICCID: {type:String},
  azureManagedUDID: {type:String},
  azureManagedNotes: {type:String},
  azureManagedEthernetMacAddress: {type:String},
  azureManagedPhysicalMemoryInBytes: {type:String},
  // azure managed - dates
  azureManagedEnrolledDateTime: {type:Date},
  azureManagedLastSyncDateTime: {type:Date},
  azureManagedEASActivationDateTime: {type:Date},
  azureManagedExchangeLastSuccessfulSyncDateTime: {type:Date},
  azureManagedComplianceGracePeriodExpirationDateTime: {type:Date},
  azureManagedManagementCertificateExpirationDateTime: {type:Date},
  // azure managed - boolean
  observedByAzureMDM: {type:Boolean, default:false, required:true, index:true},
  azureManagedIsEASActivated: {type:Boolean, default:false},
  azureManagedIsAzureADRegistered: {type:Boolean, default:false},
  azureManagedIsSupervised: {type:Boolean, default:false},
  azureManagedIsEncrypted: {type:Boolean, default:false},


  // connectwise -- user device
  connectwiseId: {type:String},
  connectwiseLocation: {type:String},
  connectwiseClient: {type:String},
  connectwiseOperatingSystem: {type:String},
  connectwiseOperatingSystemVersion: {type:String},
  connectwiseDomainName: {type:String},
  connectwiseAgentVersion: {type:String},
  connectwiseComment: {type:String},
  connectwiseIpAddress: {type:String},
  connectwiseMacAddress: {type:String},
  connectwiseLastUserName: {type:String},
  connectwiseType: {type:String},
  connectwiseStatus: {type:String},
  connectwiseSerialNumber: {type:String},
  connectwiseBiosManufacturer: {type:String},
  connectwiseModel: {type:String},
  connectwiseDescription: {type:String},
  connectwiseTotalMemory: {type:Number, default:0},
  connectwiseFreeMemory: {type:Number, default:0},
  connectwiseLastObserved: {type:Date},
  connectwiseFirstSeen: {type:Date},
  connectwiseWindowsUpdateDate: {type:Date},
  connectwiseAntivirusDefinitionDate: {type:Date},
  observedByConnectwise: {type:Boolean, default:false, required:true, index:true},

  // crowdstrike
  crowdstrikeDeviceId: {type:String},
  crowdstrikeCID: {type:String},
  crowdstrikeAgentVersion: {type:String},
  crowdstrikeBIOSManufacturer: {type:String},
  crowdstrikeBIOSVersion: {type:String},
  crowdstrikeExternalIP: {type:String},
  crowdstrikeMACAddress: {type:String},
  crowdstrikeLocalIP: {type:String},
  crowdstrikeMachineDomain: {type:String},
  crowdstrikeMajorVersion: {type:String},
  crowdstrikeMinorVersion: {type:String},
  crowdstrikeOSVersion: {type:String},
  crowdstrikeOSBuild: {type:String},
  crowdstrikePlatformName: {type:String},
  crowdstrikeReducedFunctionalityMode: {type:String},
  crowdstrikeProductTypeDesc: {type:String},
  crowdstrikeProvisionStatus: {type:String},
  crowdstrikeSerialNumber: {type:String},
  crowdstrikeServicePackMajor: {type:String},
  crowdstrikeServicePackMinor: {type:String},
  crowdstrikeStatus: {type:String},
  crowdstrikeSystemManufacturer: {type:String},
  crowdstrikeSystemProductName: {type:String},
  crowdstrikeKernelVersion: {type:String},
  // crowdstrike - datetime
  crowdstrikeFirstSeenDateTime: {type:Date},
  crowdstrikeLastSeenDateTime: {type:Date},
  crowdstrikeModifiedDateTime: {type:Date},
  // crowdstrike - boolean
  observedByCrowdstrike: {type:Boolean, default: false, required:true, index:true},

}, {
  collection: 'devices',
  timestamps: true,
  autoCreate: true,
})


// Virtuals
// DeviceSchema.virtual("type").get(function(this: Device) {
//   //return this.deviceType
// })

// Methods
// DeviceSchema.methods.getOperatingSystem = function(this: Device) {
//   //return this.operatingSystem
// }

// Document middlewares
// DeviceSchema.pre<Device>("save", function(next) {

//   // prune objects
//   // if(!this.observedByActiveDirectory) {delete this.observedByActiveDirectory}
//   // if(!this.observedByAzure) {delete this.observedByAzure}
//   // if(!this.observedByAzureMDM) {delete this.observedByAzureMDM}
//   // if(!this.observedByCrowdstrike) {delete this.observedByCrowdstrike}

// });

export default model('Device', DeviceSchema)
