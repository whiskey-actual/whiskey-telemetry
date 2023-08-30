import { model, Schema } from "mongoose";

export const minDate:Date = new Date(-8640000000000000);

export const DeviceSchema = new Schema<Device>({
  deviceName: {type:String, required:true, index:true, id: true, unique: true},
  deviceFirstObserved: {type:Date, default:new Date()},
  deviceLastObserved: {type:Date, default:minDate, required:true },
  deviceIsActive: {type:Boolean, default:false, required:true, index:true, },
  deviceOperatingSystem: {type:String, default:'UNKNOWN', required:true, index:true},

  // active directory
  activeDirectoryDN: {type:String, default:'UNKNOWN'},
  activeDirectoryLogonCount: {type:Number, default:0},
  activeDirectoryOperatingSystem: {type:String, default:'UNKNOWN'},
  activeDirectoryOperatingSystemVersion: {type:String, default:'UNKNOWN'},
  activeDirectoryDNSHostName: {type:String, default:'UNKNOWN'},
  // active directory - dates
  activeDirectoryWhenCreated: {type:Date, default:minDate},
  activeDirectoryWhenChanged: {type:Date, default:minDate},
  activeDirectoryLastLogon: {type:Date, default:minDate},
  activeDirectoryPwdLastSet: {type:Date, default:minDate},
  activeDirectoryLastLogonTimestamp: {type:Date, default:minDate},
  // active directory - booleans
  observedByActiveDirectory: {type:Boolean, default:false, required:true, index:true},


  // azure
  azureDisplayName: { type:String, default:'UNKNOWN' },
  azureId: {type:String, default:'UNKNOWN'},
  azureDeviceCategory: {type:String, default:'UNKNOWN'},
  azureDeviceId: {type:String, default:'UNKNOWN'},
  azureDeviceMetadata: {type:String, default:'UNKNOWN'},
  azureDeviceOwnership: {type:String, default:'UNKNOWN'},
  azureDeviceVersion: {type:String, default:'UNKNOWN'},
  azureDomainName: {type:String, default:'UNKNOWN'},
  azureEnrollmentProfileType: {type:String, default:'UNKNOWN'},
  azureEnrollmentType: {type:String, default:'UNKNOWN'},
  azureExternalSourceName: {type:String, default:'UNKNOWN'},
  azureManagementType: {type:String, default:'UNKNOWN'},
  azureManufacturer: {type:String, default:'UNKNOWN'},
  azureMDMAppId: {type:String, default:'UNKNOWN'},
  azureModel: {type:String, default:'UNKNOWN'},
  azureOnPremisesSyncEnabled: {type:String, default:'UNKNOWN'},
  azureOperatingSystem: {type:String, default:'UNKNOWN'},
  azureOperatingSystemVersion: {type:String, default:'UNKNOWN'},
  azureProfileType: {type:String, default:'UNKNOWN'},
  azureSourceType: {type:String, default:'UNKNOWN'},
  azureTrustType: {type:String, default:'UNKNOWN'},
  // azure - dates
  azureDeletedDateTime: {type:Date, default:minDate},
  azureApproximateLastSignInDateTime: {type:Date, default:minDate},
  azureComplianceExpirationDateTime: {type:Date, default:minDate},
  azureCreatedDateTime: {type:Date, default:minDate},
  azureOnPremisesLastSyncDateTime: {type:Date, default:minDate},
  azureRegistrationDateTime: {type:Date, default:minDate},
  // azure - booleans
  observedByAzure: {type:Boolean, default:false, required:true, index:true},
  azureAccountEnabled: {type:Boolean, default:false},
  azureIsCompliant: {type:Boolean, default:false},
  azureIsManaged: {type:Boolean, default:false},
  azureIsRooted: {type:Boolean, default:false},

  // azure managed
  azureManagedDeviceName: {type:String, default:'UNKNOWN'},
  azureManagedManagedDeviceName: {type:String, default:'UNKNOWN'},
  azureManagedId: {type:String, default:'UNKNOWN'},
  azureManagedUserId: {type:String, default:'UNKNOWN'},
  azureManagedManagedDeviceOwnerType: {type:String, default:'UNKNOWN'},
  azureManagedOperatingSystem: {type:String, default:'UNKNOWN'},
  azureManagedComplianceState: {type:String, default:'UNKNOWN'},
  azureManagedJailBroken: {type:String, default:'UNKNOWN'},
  azureManagedManagementAgent: {type:String, default:'UNKNOWN'},
  azureManagedOperatingSystemVersion: {type:String, default:'UNKNOWN'},
  azureManagedEASDeviceID: {type:String, default:'UNKNOWN'},
  azureManagedDeviceEnrollmentType: {type:String, default:'UNKNOWN'},
  azureManagedActivationLockBypassCode: {type:String, default:'UNKNOWN'},
  azureManagedEmailAddress: {type:String, default:'UNKNOWN'},
  azureManagedAzureADDeviceID: {type:String, default:'UNKNOWN'},
  azureManagedDeviceRegistrationState: {type:String, default:'UNKNOWN'},
  azureManagedDeviceCategoryDisplayName: {type:String, default:'UNKNOWN'},
  azureManagedExchangeAccessState: {type:String, default:'UNKNOWN'},
  azureManagedExchangeAccessStateReason: {type:String, default:'UNKNOWN'},
  azureManagedRemoteAssistanceSessionUrl: {type:String, default:'UNKNOWN'},
  azureManagedRemoteAssistanceErrorDetails: {type:String, default:'UNKNOWN'},
  azureManagedUserPrincipalName: {type:String, default:'UNKNOWN'},
  azureManagedModel: {type:String, default:'UNKNOWN'},
  azureManagedManufacturer: {type:String, default:'UNKNOWN'},
  azureManagedIMEI: {type:String, default:'UNKNOWN'},
  azureManagedSerialNumber: {type:String, default:'UNKNOWN'},
  azureManagedPhoneNumber: {type:String, default:'UNKNOWN'},
  azureManagedAndroidSecurityPatchLevel: {type:String, default:'UNKNOWN'},
  azureManagedUserDisplayName: {type:String, default:'UNKNOWN'},
  azureManagedConfigurationManagerClientEnabedFeatures: {type:String, default:'UNKNOWN'},
  azureManagedWiFiMACAddress: {type:String, default:'UNKNOWN'},
  azureManagedDeviceHealthAttestationState: {type:String, default:'UNKNOWN'},
  azureManagedSubscriberCarrier: {type:String, default:'UNKNOWN'},
  azureManagedMEID: {type:String, default:'UNKNOWN'},
  azureManagedTotalStorageSpaceInBytes: {type:String, default:'UNKNOWN'},
  azureManagedFreeStorageSpaceInBytes: {type:String, default:'UNKNOWN'},
  azureManagedPartnerReportedThreatState: {type:String, default:'UNKNOWN'},
  azureManagedRequireUserEnrollmentApproval: {type:String, default:'UNKNOWN'},
  azureManagedICCID: {type:String, default:'UNKNOWN'},
  azureManagedUDID: {type:String, default:'UNKNOWN'},
  azureManagedNotes: {type:String, default:'UNKNOWN'},
  azureManagedEthernetMacAddress: {type:String, default:'UNKNOWN'},
  azureManagedPhysicalMemoryInBytes: {type:String, default:'UNKNOWN'},
  // azure managed - dates
  azureManagedEnrolledDateTime: {type:Date, default:minDate},
  azureManagedLastSyncDateTime: {type:Date, default:minDate},
  azureManagedEASActivationDateTime: {type:Date, default:minDate},
  azureManagedExchangeLastSuccessfulSyncDateTime: {type:Date, default:minDate},
  azureManagedComplianceGracePeriodExpirationDateTime: {type:Date, default:minDate},
  azureManagedManagementCertificateExpirationDateTime: {type:Date, default:minDate},
  // azure managed - boolean
  observedByAzureMDM: {type:Boolean, default:false, required:true, index:true},
  azureManagedIsEASActivated: {type:Boolean, default:false},
  azureManagedIsAzureADRegistered: {type:Boolean, default:false},
  azureManagedIsSupervised: {type:Boolean, default:false},
  azureManagedIsEncrypted: {type:Boolean, default:false},


  // crowdstrike
  crowdstrikeDeviceId: {type:String, default:'UNKNOWN'},
  crowdstrikeCID: {type:String, default:'UNKNOWN'},
  crowdstrikeAgentVersion: {type:String, default:'UNKNOWN'},
  crowdstrikeBIOSManufacturer: {type:String, default:'UNKNOWN'},
  crowdstrikeBIOSVersion: {type:String, default:'UNKNOWN'},
  crowdstrikeExternalIP: {type:String, default:'UNKNOWN'},
  crowdstrikeMACAddress: {type:String, default:'UNKNOWN'},
  crowdstrikeLocalIP: {type:String, default:'UNKNOWN'},
  crowdstrikeMachineDomain: {type:String, default:'UNKNOWN'},
  crowdstrikeMajorVersion: {type:String, default:'UNKNOWN'},
  crowdstrikeMinorVersion: {type:String, default:'UNKNOWN'},
  crowdstrikeOSVersion: {type:String, default:'UNKNOWN'},
  crowdstrikeOSBuild: {type:String, default:'UNKNOWN'},
  crowdstrikePlatformName: {type:String, default:'UNKNOWN'},
  crowdstrikeReducedFunctionalityMode: {type:String, default:'UNKNOWN'},
  crowdstrikeProductTypeDesc: {type:String, default:'UNKNOWN'},
  crowdstrikeProvisionStatus: {type:String, default:'UNKNOWN'},
  crowdstrikeSerialNumber: {type:String, default:'UNKNOWN'},
  crowdstrikeServicePackMajor: {type:String, default:'UNKNOWN'},
  crowdstrikeServicePackMinor: {type:String, default:'UNKNOWN'},
  crowdstrikeStatus: {type:String, default:'UNKNOWN'},
  crowdstrikeSystemManufacturer: {type:String, default:'UNKNOWN'},
  crowdstrikeSystemProductName: {type:String, default:'UNKNOWN'},
  crowdstrikeKernelVersion: {type:String, default:'UNKNOWN'},
  // crowdstrike - datetime
  crowdstrikeFirstSeenDateTime: {type:Date, default:minDate},
  crowdstrikeLastSeenDateTime: {type:Date, default:minDate},
  crowdstrikeModifiedDateTime: {type:Date, default:minDate},
  // crowdstrike - boolean
  observedByCrowdstrike: {type:Boolean, default: false, required:true, index:true},

}, {
  collection: 'devices',
  timestamps: true,
  autoCreate: true,
})

export interface Device {
  [key: string]: string | number | boolean | Number | Date | undefined;
  deviceName:string;
  deviceFirstObserved?:Date;
  deviceLastObserved?:Date,
  deviceIsActive?:boolean;
  deviceOperatingSystem?:string;

  // active directory
  observedByActiveDirectory?:boolean;
  activeDirectoryDN?:string|undefined;
  activeDirectoryWhenCreated?:Date|undefined;
  activeDirectoryWhenChanged?:Date|undefined;
  activeDirectoryLastLogon?:Date|undefined;
  activeDirectoryPwdLastSet?:Date|undefined;
  activeDirectoryLogonCount?:Number;
  activeDirectoryOperatingSystem?:string|undefined;
  activeDirectoryOperatingSystemVersion?:string|undefined;
  activeDirectoryDNSHostName?:string|undefined;
  activeDirectoryLastLogonTimestamp?:Date|undefined;

  // azure
  observedByAzure?:boolean;
  azureDisplayName?:string|undefined;
  azureId?:string|undefined;
  azureDeviceCategory?:string|undefined;
  azureDeviceId?:string|undefined;
  azureDeviceMetadata?:string|undefined;
  azureDeviceOwnership?:string|undefined;
  azureDeviceVersion?:string|undefined;
  azureDomainName?:string|undefined;
  azureEnrollmentProfileType?:string|undefined;
  azureEnrollmentType?:string|undefined;
  azureExternalSourceName?:string|undefined;
  azureManagementType?:string|undefined;
  azureManufacturer?:string|undefined;
  azureMDMAppId?:string|undefined;
  azureModel?:string|undefined;
  azureOnPremisesSyncEnabled?:string|undefined;
  azureOperatingSystem?:string|undefined;
  azureOperatingSystemVersion?:string|undefined;
  azureProfileType?:string|undefined;
  azureSourceType?:string|undefined;
  azureTrustType?:string|undefined;
  azureDeletedDateTime?:Date|undefined;
  azureApproximateLastSignInDateTime?:Date|undefined;
  azureComplianceExpirationDateTime?:Date|undefined;
  azureCreatedDateTime?:Date|undefined;
  azureOnPremisesLastSyncDateTime?:Date|undefined;
  azureRegistrationDateTime?:Date|undefined;
  azureAccountEnabled?:boolean;
  azureIsCompliant?:boolean;
  azureIsManaged?:boolean;
  azureIsRooted?:boolean;


  // azure managed
  azureManagedDeviceName?:string|undefined;
  azureManagedManagedDeviceName?:string|undefined;
  azureManagedId?:string|undefined;
  azureManagedUserId?:string|undefined;
  azureManagedManagedDeviceOwnerType?:string|undefined;
  azureManagedOperatingSystem?:string|undefined;
  azureManagedComplianceState?:string|undefined;
  azureManagedJailBroken?:string|undefined;
  azureManagedManagementAgent?:string|undefined;
  azureManagedOperatingSystemVersion?:string|undefined;
  azureManagedEASDeviceID?:string|undefined;
  azureManagedDeviceEnrollmentType?:string|undefined;
  azureManagedActivationLockBypassCode?:string|undefined;
  azureManagedEmailAddress?:string|undefined;
  azureManagedAzureADDeviceID?:string|undefined;
  azureManagedDeviceRegistrationState?:string|undefined;
  azureManagedDeviceCategoryDisplayName?:string|undefined;
  azureManagedExchangeAccessState?:string|undefined;
  azureManagedExchangeAccessStateReason?:string|undefined;
  azureManagedRemoteAssistanceSessionUrl?:string|undefined;
  azureManagedRemoteAssistanceErrorDetails?:string|undefined;
  azureManagedUserPrincipalName?:string|undefined;
  azureManagedModel?:string|undefined;
  azureManagedManufacturer?:string|undefined;
  azureManagedIMEI?:string|undefined;
  azureManagedSerialNumber?:string|undefined;
  azureManagedPhoneNumber?:string|undefined;
  azureManagedAndroidSecurityPatchLevel?:string|undefined;
  azureManagedUserDisplayName?:string|undefined;
  azureManagedConfigurationManagerClientEnabedFeatures?:string|undefined;
  azureManagedWiFiMACAddress?:string|undefined;
  azureManagedDeviceHealthAttestationState?:string|undefined;
  azureManagedSubscriberCarrier?:string|undefined;
  azureManagedMEID?:string|undefined;
  azureManagedTotalStorageSpaceInBytes?:string|undefined;
  azureManagedFreeStorageSpaceInBytes?:string|undefined;
  azureManagedPartnerReportedThreatState?:string|undefined;
  azureManagedRequireUserEnrollmentApproval?:string|undefined;
  azureManagedICCID?:string|undefined;
  azureManagedUDID?:string|undefined;
  azureManagedNotes?:string|undefined;
  azureManagedEthernetMacAddress?:string|undefined;
  azureManagedPhysicalMemoryInBytes?:string|undefined;
  // azure managed - dates
  azureManagedEnrolledDateTime?:Date|undefined;
  azureManagedLastSyncDateTime?:Date|undefined;
  azureManagedEASActivationDateTime?:Date|undefined;
  azureManagedExchangeLastSuccessfulSyncDateTime?:Date|undefined;
  azureManagedComplianceGracePeriodExpirationDateTime?:Date|undefined;
  azureManagedManagementCertificateExpirationDateTime?:Date|undefined;
  // azure managed - boolean
  azureManagedIsEASActivated?:boolean;
  azureManagedIsAzureADRegistered?:boolean;
  azureManagedIsSupervised?:boolean;
  azureManagedIsEncrypted?:boolean;
  observedByAzureMDM?:boolean;

  // crowdstrike
  crowdstrikeDeviceId?:string|undefined;
  crowdstrikeCID?:string|undefined;
  crowdstrikeAgentVersion?:string|undefined;
  crowdstrikeBIOSManufacturer?:string|undefined;
  crowdstrikeBIOSVersion?:string|undefined;
  crowdstrikeExternalIP?:string|undefined;
  crowdstrikeMACAddress?:string|undefined;
  crowdstrikeLocalIP?:string|undefined;
  crowdstrikeMachineDomain?:string|undefined;
  crowdstrikeMajorVersion?:string|undefined;
  crowdstrikeMinorVersion?:string|undefined;
  crowdstrikeOSVersion?:string|undefined;
  crowdstrikeOSBuild?:string|undefined;
  crowdstrikePlatformName?:string|undefined;
  crowdstrikeReducedFunctionalityMode?:string|undefined;
  crowdstrikeProductTypeDesc?:string|undefined;
  crowdstrikeProvisionStatus?:string|undefined;
  crowdstrikeSerialNumber?:string|undefined;
  crowdstrikeServicePackMajor?:string|undefined;
  crowdstrikeServicePackMinor?:string|undefined;
  crowdstrikeStatus?:string|undefined;
  crowdstrikeSystemManufacturer?:string|undefined;
  crowdstrikeSystemProductName?:string|undefined;
  crowdstrikeKernelVersion?:string|undefined;
  // crowdstrike - datetime
  crowdstrikeFirstSeenDateTime?:Date|undefined;
  crowdstrikeLastSeenDateTime?:Date|undefined;
  crowdstrikeModifiedDateTime?:Date|undefined;
  // crowdstrike - boolean
  observedByCrowdstrike?:boolean;

}


// Virtuals
DeviceSchema.virtual("type").get(function(this: Device) {
  //return this.deviceType
})

// Methods
DeviceSchema.methods.getOperatingSystem = function(this: Device) {
  //return this.operatingSystem
}

// Document middlewares
DeviceSchema.pre<Device>("save", function(next) {

  // prune objects
  // if(!this.observedByActiveDirectory) {delete this.observedByActiveDirectory}
  // if(!this.observedByAzure) {delete this.observedByAzure}
  // if(!this.observedByAzureMDM) {delete this.observedByAzureMDM}
  // if(!this.observedByCrowdstrike) {delete this.observedByCrowdstrike}

});

export default model<Device>('Device', DeviceSchema)
