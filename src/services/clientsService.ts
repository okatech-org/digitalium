/**
 * Clients Service - Digitalium Ecosystem
 * 
 * Manages the lifecycle of tenants (Administrations & Entreprises)
 * in the Digitalium multi-tenant SaaS platform.
 * 
 * Architecture:
 *   - Each client = 1 Tenant (Organization)
 *   - Each tenant gets an iDID (iDETUDE Digital ID)
 *   - Modules are provisioned per tenant
 *   - Admin account is created on tenant provisioning
 * 
 * Current: Mock mode with localStorage persistence
 * Target:  POST /api/clients → Cloud SQL (db_digitalium)
 */

// ========================================
// TYPES
// ========================================

export type ClientCategory = 'administration' | 'entreprise';

export type InstitutionType = 'ministry' | 'presidency' | 'parliament' | 'judiciary' | 'agency' | 'collectivity';

export type BusinessSector = 'insurance' | 'construction' | 'banking' | 'technology' | 'agriculture' | 'energy' | 'mining' | 'telecom' | 'health' | 'education' | 'other';

export type ClientStatus = 'pending' | 'active' | 'trial' | 'suspended' | 'archived';

export type DigitaliumPlan = 'sovereign_gov' | 'sovereign_pro' | 'sovereign_enterprise' | 'citizen_premium';

export type DigitaliumModule = 'iDocument' | 'iArchive' | 'iSignature' | 'DGSS' | 'iWorkflow' | 'iAnalytics';

export interface ClientContact {
    fullName: string;
    email: string;
    phone?: string;
    role: string;  // e.g., "Directeur de Cabinet", "DSI", "Responsable Admin"
}

export interface DigitaliumClient {
    id: string;
    iDID: string;         // Permanent iDETUDE Digital ID (e.g., "DIG-ADM-2026-0001")
    category: ClientCategory;
    name: string;
    email: string;
    phone?: string;

    // Type-specific fields
    institutionType?: InstitutionType;  // For administrations
    sector?: BusinessSector;           // For entreprises

    // Provisioning
    status: ClientStatus;
    plan: DigitaliumPlan;
    modules: DigitaliumModule[];

    // Contact
    contact: ClientContact;

    // Metrics
    users: number;
    storageUsedMB: number;
    documentsCount: number;

    // Billing (entreprises only)
    subscription?: string;  // Monthly amount in XAF

    // Metadata
    createdAt: string;
    activatedAt?: string;
    lastSync: string;
    notes?: string;
}

export interface CreateClientPayload {
    category: ClientCategory;
    name: string;
    email: string;
    phone?: string;
    institutionType?: InstitutionType;
    sector?: BusinessSector;
    plan: DigitaliumPlan;
    modules: DigitaliumModule[];
    contact: ClientContact;
    notes?: string;
}

// ========================================
// iDID GENERATION
// ========================================

/**
 * Generates a unique iDETUDE Digital ID for a new client.
 * Format: DIG-{CAT}-{YEAR}-{SEQ}
 * Example: DIG-ADM-2026-0042, DIG-ENT-2026-0007
 * 
 * In production, this will be generated server-side with a DB sequence.
 */
function generateIDID(category: ClientCategory): string {
    const prefix = category === 'administration' ? 'ADM' : 'ENT';
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `DIG-${prefix}-${year}-${seq}`;
}

// ========================================
// AVAILABLE MODULES CONFIG
// ========================================

export const AVAILABLE_MODULES: { id: DigitaliumModule; name: string; description: string; icon: string; recommended: boolean }[] = [
    { id: 'iDocument', name: 'iDocument', description: 'Gestion documentaire professionnelle', icon: '📄', recommended: true },
    { id: 'iArchive', name: 'iArchive', description: 'Archivage numérique et conformité légale', icon: '🗄️', recommended: true },
    { id: 'iSignature', name: 'iSignature', description: 'Signature électronique certifiée', icon: '✍️', recommended: false },
    { id: 'iWorkflow', name: 'iWorkflow', description: 'Automatisation des processus métier', icon: '⚙️', recommended: false },
    { id: 'iAnalytics', name: 'iAnalytics', description: 'Tableaux de bord et rapports', icon: '📊', recommended: false },
    { id: 'DGSS', name: 'DGSS', description: 'Direction Générale Sûreté & Sécurité', icon: '🛡️', recommended: false },
];

export const INSTITUTION_TYPES: { value: InstitutionType; label: string; icon: string }[] = [
    { value: 'ministry', label: 'Ministère', icon: '🏛️' },
    { value: 'presidency', label: 'Présidence', icon: '👑' },
    { value: 'parliament', label: 'Parlement', icon: '🏢' },
    { value: 'judiciary', label: 'Justice', icon: '⚖️' },
    { value: 'agency', label: 'Agence publique', icon: '🏗️' },
    { value: 'collectivity', label: 'Collectivité', icon: '🗺️' },
];

export const BUSINESS_SECTORS: { value: BusinessSector; label: string }[] = [
    { value: 'insurance', label: 'Assurance' },
    { value: 'construction', label: 'BTP' },
    { value: 'banking', label: 'Banque & Finance' },
    { value: 'technology', label: 'Technologie' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'energy', label: 'Énergie' },
    { value: 'mining', label: 'Mines' },
    { value: 'telecom', label: 'Télécommunications' },
    { value: 'health', label: 'Santé' },
    { value: 'education', label: 'Éducation' },
    { value: 'other', label: 'Autre' },
];

export const PLAN_OPTIONS: { value: DigitaliumPlan; label: string; description: string; forCategory: ClientCategory[] }[] = [
    { value: 'sovereign_gov', label: 'Sovereign Gov', description: 'Pour les institutions gouvernementales', forCategory: ['administration'] },
    { value: 'sovereign_pro', label: 'Sovereign Pro', description: 'Pour les PME et startups', forCategory: ['entreprise'] },
    { value: 'sovereign_enterprise', label: 'Sovereign Enterprise', description: 'Pour les grandes entreprises', forCategory: ['entreprise'] },
];

// ========================================
// LOCAL STORAGE PERSISTENCE (Mock Mode)
// ========================================

const STORAGE_KEY = 'digitalium-clients';

function loadClients(): DigitaliumClient[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveClients(clients: DigitaliumClient[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
}

// ========================================
// SERVICE API
// ========================================

export const clientsService = {
    /**
     * Get all clients, optionally filtered by category
     */
    async getAll(category?: ClientCategory): Promise<DigitaliumClient[]> {
        // TODO: Replace with API call: GET /api/clients?category={category}
        const clients = loadClients();
        if (category) return clients.filter(c => c.category === category);
        return clients;
    },

    /**
     * Get a single client by ID
     */
    async getById(id: string): Promise<DigitaliumClient | null> {
        // TODO: Replace with API call: GET /api/clients/:id
        const clients = loadClients();
        return clients.find(c => c.id === id) || null;
    },

    /**
     * Create a new client (provision a tenant)
     * 
     * In production, this will:
     * 1. Create the organization record in Cloud SQL
     * 2. Generate an iDID via the identity service
     * 3. Provision selected modules
     * 4. Create the initial admin account
     * 5. Send an activation email
     */
    async create(payload: CreateClientPayload): Promise<DigitaliumClient> {
        // TODO: Replace with API call: POST /api/clients

        const now = new Date().toISOString();
        const newClient: DigitaliumClient = {
            id: `${payload.category === 'administration' ? 'adm' : 'ent'}-${Date.now()}`,
            iDID: generateIDID(payload.category),
            category: payload.category,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            institutionType: payload.institutionType,
            sector: payload.sector,
            status: payload.category === 'administration' ? 'pending' : 'trial',
            plan: payload.plan,
            modules: payload.modules,
            contact: payload.contact,
            users: 0,
            storageUsedMB: 0,
            documentsCount: 0,
            subscription: payload.category === 'entreprise' ? '0' : undefined,
            createdAt: now.split('T')[0],
            lastSync: '-',
            notes: payload.notes,
        };

        const clients = loadClients();
        clients.push(newClient);
        saveClients(clients);

        return newClient;
    },

    /**
     * Update a client's status (activate, suspend, archive)
     */
    async updateStatus(id: string, status: ClientStatus): Promise<DigitaliumClient | null> {
        // TODO: Replace with API call: PATCH /api/clients/:id/status
        const clients = loadClients();
        const index = clients.findIndex(c => c.id === id);
        if (index === -1) return null;

        clients[index].status = status;
        if (status === 'active' && !clients[index].activatedAt) {
            clients[index].activatedAt = new Date().toISOString();
        }
        saveClients(clients);
        return clients[index];
    },

    /**
     * Update a client's modules
     */
    async updateModules(id: string, modules: DigitaliumModule[]): Promise<DigitaliumClient | null> {
        // TODO: Replace with API call: PATCH /api/clients/:id/modules
        const clients = loadClients();
        const index = clients.findIndex(c => c.id === id);
        if (index === -1) return null;

        clients[index].modules = modules;
        saveClients(clients);
        return clients[index];
    },

    /**
     * Delete a client (soft delete → archive)
     */
    async archive(id: string): Promise<boolean> {
        // TODO: Replace with API call: DELETE /api/clients/:id
        return !!(await clientsService.updateStatus(id, 'archived'));
    },
};
