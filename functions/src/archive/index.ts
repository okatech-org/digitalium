/**
 * Archive Module — Re-export all archive Cloud Functions
 *
 * 26 Cloud Functions total:
 *   Folders:    5 (get, getOne, create, update, delete)
 *   Documents:  7 (get, getOne, create, update, delete, restore, search)
 *   Versions:   2 (get, create)
 *   Sharing:    4 (share, getShares, revoke, accessShared)
 *   Integrity:  1 (verify)
 *   Audit:      2 (log, getLogs)
 *   Stats:      3 (stats, retentionPolicies, expiringDocs)
 *   Integrations: 2 (syncDrive, sendEmail) — TODO Phase 3+
 */

export { archiveGetFolders, archiveGetFolder, archiveCreateFolder, archiveUpdateFolder, archiveDeleteFolder } from './folders';
export { archiveGetDocuments, archiveGetDocument, archiveCreateDocument, archiveUpdateDocument, archiveDeleteDocument, archiveRestoreDocument, archiveSearchDocuments } from './documents';
export { archiveGetVersions, archiveCreateVersion } from './versions';
export { archiveShareDocument, archiveGetShares, archiveRevokeShare, archiveAccessShared } from './sharing';
export { archiveVerifyIntegrity } from './integrity';
export { archiveLogAudit, archiveGetAuditLogs, archiveGetStats, archiveGetRetentionPolicies, archiveGetExpiringDocuments } from './audit';
