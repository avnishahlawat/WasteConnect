import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { CitizenProfile } from '../models/CitizenProfile.js';
import { CollectorProfile } from '../models/CollectorProfile.js';
import { AuthorityProfile } from '../models/AuthorityProfile.js';
import { ServiceArea } from '../models/ServiceArea.js';
import { WasteCategory } from '../models/WasteCategory.js';
import { PickupRequest } from '../models/PickupRequest.js';
import { PickupEvent } from '../models/PickupEvent.js';
import { PickupAssignment } from '../models/PickupAssignment.js';
import { WasteRecord } from '../models/WasteRecord.js';
import { PublicIssue } from '../models/PublicIssue.js';
import { IssueEvent } from '../models/IssueEvent.js';
import { Notification } from '../models/Notification.js';
import { Feedback } from '../models/Feedback.js';
import { AuditLog } from '../models/AuditLog.js';
import { Announcement } from '../models/Announcement.js';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { UserRole, PickupStatus, IssueStatus, Severity, Priority, CollectorAvailability, TimeSlot, NotificationType, HotspotLevel, CitizenVerification } from '../types/enums.js';
const subDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
};
const seed = async () => {
    console.log('🌱 Starting WasteConnect seed...');
    await connectDatabase();
    console.log('Clearing collections...');
    await Promise.all([
        User.deleteMany({}),
        CitizenProfile.deleteMany({}),
        CollectorProfile.deleteMany({}),
        AuthorityProfile.deleteMany({}),
        ServiceArea.deleteMany({}),
        WasteCategory.deleteMany({}),
        PickupRequest.deleteMany({}),
        PickupEvent.deleteMany({}),
        PickupAssignment.deleteMany({}),
        WasteRecord.deleteMany({}),
        PublicIssue.deleteMany({}),
        IssueEvent.deleteMany({}),
        Notification.deleteMany({}),
        Feedback.deleteMany({}),
        AuditLog.deleteMany({}),
        Announcement.deleteMany({}),
        AIAnalysis.deleteMany({}),
    ]);
    const now = new Date();
    // --- Create service areas ---
    console.log('Creating service areas...');
    const sa1 = await ServiceArea.create({
        name: 'Indirapuram & Ahinsa Khand Ward', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6415, lng: 77.3714 }, hotspotScore: 38, hotspotLevel: HotspotLevel.MODERATE
    });
    const sa2 = await ServiceArea.create({
        name: 'Raj Nagar & Kavi Nagar', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6811, lng: 77.4422 }, hotspotScore: 25, hotspotLevel: HotspotLevel.LOW
    });
    const sa3 = await ServiceArea.create({
        name: 'Vasundhara & Vaishali Ward', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6600, lng: 77.3550 }, hotspotScore: 42, hotspotLevel: HotspotLevel.MODERATE
    });
    const sa4 = await ServiceArea.create({
        name: 'Sahibabad Industrial Area & Site IV', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6720, lng: 77.3450 }, hotspotScore: 84, hotspotLevel: HotspotLevel.CRITICAL
    });
    const sa5 = await ServiceArea.create({
        name: 'Crossings Republik & Dundahera', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6280, lng: 77.4340 }, hotspotScore: 48, hotspotLevel: HotspotLevel.MODERATE
    });
    const sa6 = await ServiceArea.create({
        name: 'Kaushambi & Anand Vihar Border', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6502, lng: 77.3210 }, hotspotScore: 55, hotspotLevel: HotspotLevel.ELEVATED
    });
    const sa7 = await ServiceArea.create({
        name: 'Mohan Nagar & Arthala Ward', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6780, lng: 77.3910 }, hotspotScore: 68, hotspotLevel: HotspotLevel.HIGH
    });
    const sa8 = await ServiceArea.create({
        name: 'Govindpuram & Shastri Nagar', city: 'Ghaziabad', district: 'Ghaziabad',
        coordinates: { lat: 28.6850, lng: 77.4780 }, hotspotScore: 30, hotspotLevel: HotspotLevel.LOW
    });
    const sa9 = await ServiceArea.create({
        name: 'Connaught Place & Central Ward', city: 'New Delhi', district: 'Central Delhi',
        coordinates: { lat: 28.6315, lng: 77.2167 }, hotspotScore: 62, hotspotLevel: HotspotLevel.HIGH
    });
    const sa10 = await ServiceArea.create({
        name: 'Saket & Malviya Nagar', city: 'New Delhi', district: 'South Delhi',
        coordinates: { lat: 28.5244, lng: 77.2100 }, hotspotScore: 18, hotspotLevel: HotspotLevel.LOW
    });
    const sa11 = await ServiceArea.create({
        name: 'Laxmi Nagar & Mayur Vihar', city: 'New Delhi', district: 'East Delhi',
        coordinates: { lat: 28.6180, lng: 77.2980 }, hotspotScore: 74, hotspotLevel: HotspotLevel.HIGH
    });
    const sa12 = await ServiceArea.create({
        name: 'Rohini Sector 7 & Pitampura', city: 'New Delhi', district: 'North West Delhi',
        coordinates: { lat: 28.7166, lng: 77.1147 }, hotspotScore: 35, hotspotLevel: HotspotLevel.MODERATE
    });
    const sa13 = await ServiceArea.create({
        name: 'Dwarka Sector 10 & 21', city: 'New Delhi', district: 'South West Delhi',
        coordinates: { lat: 28.5823, lng: 77.0500 }, hotspotScore: 22, hotspotLevel: HotspotLevel.LOW
    });
    const sa14 = await ServiceArea.create({
        name: 'Karol Bagh & Rajendra Nagar', city: 'New Delhi', district: 'Central Delhi',
        coordinates: { lat: 28.6514, lng: 77.1907 }, hotspotScore: 58, hotspotLevel: HotspotLevel.ELEVATED
    });
    const sa15 = await ServiceArea.create({
        name: 'Chandni Chowk & Old Delhi', city: 'New Delhi', district: 'North Delhi',
        coordinates: { lat: 28.6562, lng: 77.2300 }, hotspotScore: 88, hotspotLevel: HotspotLevel.CRITICAL
    });
    const sa16 = await ServiceArea.create({
        name: 'Hauz Khas & Green Park', city: 'New Delhi', district: 'South Delhi',
        coordinates: { lat: 28.5535, lng: 77.2060 }, hotspotScore: 28, hotspotLevel: HotspotLevel.LOW
    });
    const sa17 = await ServiceArea.create({
        name: 'Janakpuri & Uttam Nagar', city: 'New Delhi', district: 'West Delhi',
        coordinates: { lat: 28.6219, lng: 77.0878 }, hotspotScore: 65, hotspotLevel: HotspotLevel.HIGH
    });
    const sa18 = await ServiceArea.create({
        name: 'Noida Sector 62 & Electronic City', city: 'Noida', district: 'Gautam Buddha Nagar',
        coordinates: { lat: 28.6270, lng: 77.3650 }, hotspotScore: 32, hotspotLevel: HotspotLevel.LOW
    });
    const sa19 = await ServiceArea.create({
        name: 'Noida Sector 18 & Atta Market', city: 'Noida', district: 'Gautam Buddha Nagar',
        coordinates: { lat: 28.5708, lng: 77.3260 }, hotspotScore: 71, hotspotLevel: HotspotLevel.HIGH
    });
    const areas = [sa1, sa2, sa3, sa4, sa5, sa6, sa7, sa8, sa9, sa10, sa11, sa12, sa13, sa14, sa15, sa16, sa17, sa18, sa19];
    // --- Create waste categories ---
    console.log('Creating waste categories...');
    const catData = [
        { name: 'Organic', slug: 'organic', description: 'Food scraps, yard waste', compostable: true, disposalGuidance: 'Use green bin' },
        { name: 'Plastic', slug: 'plastic', description: 'Plastic bottles, containers', recyclable: true, disposalGuidance: 'Rinse before disposal' },
        { name: 'Paper', slug: 'paper', description: 'Paper, cardboard', recyclable: true, disposalGuidance: 'Keep dry' },
        { name: 'Glass', slug: 'glass', description: 'Glass bottles, jars', recyclable: true, disposalGuidance: 'Wrap broken glass' },
        { name: 'Metal', slug: 'metal', description: 'Cans, foil', recyclable: true, disposalGuidance: 'Rinse before disposal' },
        { name: 'E-waste', slug: 'e-waste', description: 'Electronics, batteries', hazardous: true, disposalGuidance: 'Do not mix with regular waste' },
        { name: 'Textile', slug: 'textile', description: 'Clothes, fabrics', recyclable: true, disposalGuidance: 'Keep dry and clean' },
        { name: 'Mixed', slug: 'mixed', description: 'General unsegregated waste', disposalGuidance: 'Use black bin' },
        { name: 'Household Hazardous', slug: 'hazardous', description: 'Chemicals, paints', hazardous: true, disposalGuidance: 'Special collection required' },
        { name: 'Other', slug: 'other', description: 'Miscellaneous items', disposalGuidance: 'Check local guidelines' }
    ];
    const categories = await WasteCategory.insertMany(catData);
    // --- Create users and profiles ---
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    const adminPassword = await bcrypt.hash('Admin@123!', 12);
    const citizenData = [
        { email: 'aarav.sharma@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Aarav', lastName: 'Sharma', isActive: true, isEmailVerified: true },
        { email: 'priya.patel@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Priya', lastName: 'Patel', isActive: true, isEmailVerified: true },
        { email: 'rohit.verma@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Rohit', lastName: 'Verma', isActive: true, isEmailVerified: true },
        { email: 'ananya.iyer@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Ananya', lastName: 'Iyer', isActive: true, isEmailVerified: true },
        { email: 'rahul.sharma@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Rahul', lastName: 'Sharma', isActive: true, isEmailVerified: true },
        { email: 'maya.chen@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Maya', lastName: 'Chen', isActive: true, isEmailVerified: true }
    ];
    const citizens = await User.insertMany(citizenData);
    for (let ci = 0; ci < citizens.length; ci++) {
        await CitizenProfile.create({ user: citizens[ci]._id, preferredServiceArea: areas[ci % areas.length]._id });
    }
    const collectorData = [
        { email: 'vikram.singh@wasteconnect.in', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Vikram', lastName: 'Singh', isActive: true, isEmailVerified: true },
        { email: 'rajesh.kumar@wasteconnect.in', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Rajesh', lastName: 'Kumar', isActive: true, isEmailVerified: true },
        { email: 'sunil.yadav@wasteconnect.in', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Sunil', lastName: 'Yadav', isActive: true, isEmailVerified: true },
        { email: 'alex.martinez@wasteconnect.io', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Alex', lastName: 'Martinez', isActive: true, isEmailVerified: true }
    ];
    const collectors = await User.insertMany(collectorData);
    await CollectorProfile.create({ user: collectors[0]._id, serviceAreas: [sa1._id, sa3._id, sa4._id, sa6._id], totalCollections: 87, rating: 4.8, availability: CollectorAvailability.AVAILABLE });
    await CollectorProfile.create({ user: collectors[1]._id, serviceAreas: [sa2._id, sa5._id, sa7._id, sa8._id], totalCollections: 42, rating: 4.6, availability: CollectorAvailability.AVAILABLE });
    await CollectorProfile.create({ user: collectors[2]._id, serviceAreas: [sa9._id, sa10._id, sa11._id, sa16._id], totalCollections: 28, rating: 4.9, availability: CollectorAvailability.AVAILABLE });
    await CollectorProfile.create({ user: collectors[3]._id, serviceAreas: [sa12._id, sa13._id, sa14._id, sa15._id, sa17._id, sa18._id, sa19._id], totalCollections: 35, rating: 4.7, availability: CollectorAvailability.AVAILABLE });

    const authorityData = [
        { email: 'neha.gupta@greenfield.gov.in', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'Neha', lastName: 'Gupta', isActive: true, isEmailVerified: true },
        { email: 'arjun.deshmukh@greenfield.gov.in', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'Arjun', lastName: 'Deshmukh', isActive: true, isEmailVerified: true },
        { email: 'kavita.reddy@greenfield.gov.in', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'Kavita', lastName: 'Reddy', isActive: true, isEmailVerified: true },
        { email: 'david.park@greenfield.gov', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'David', lastName: 'Park', isActive: true, isEmailVerified: true }
    ];
    const authorities = await User.insertMany(authorityData);
    await AuthorityProfile.create({ user: authorities[0]._id, serviceAreas: [sa1._id, sa2._id, sa3._id, sa4._id, sa5._id, sa6._id, sa7._id, sa8._id], designation: 'Sanitation Superintendent', department: 'Municipal Sanitation Ghaziabad' });
    await AuthorityProfile.create({ user: authorities[1]._id, serviceAreas: [sa9._id, sa10._id, sa11._id, sa14._id, sa16._id], designation: 'Zonal Health Officer', department: 'Municipal Sanitation Delhi South/Central' });
    await AuthorityProfile.create({ user: authorities[2]._id, serviceAreas: [sa12._id, sa13._id, sa15._id, sa17._id], designation: 'Operations Director', department: 'Municipal Sanitation Delhi North/West' });
    await AuthorityProfile.create({ user: authorities[3]._id, serviceAreas: [sa18._id, sa19._id, sa1._id, sa6._id], designation: 'Municipal Officer', department: 'Noida Authority & NCR Operations' });

    const adminData = [
        { email: 'admin@wasteconnect.in', password: adminPassword, role: UserRole.ADMIN, firstName: 'Rajiv', lastName: 'Mehta', isActive: true, isEmailVerified: true },
        { email: 'admin@wasteconnect.io', password: adminPassword, role: UserRole.ADMIN, firstName: 'System', lastName: 'Admin', isActive: true, isEmailVerified: true },
        { email: 'ops.admin@wasteconnect.in', password: adminPassword, role: UserRole.ADMIN, firstName: 'Pooja', lastName: 'Malhotra', isActive: true, isEmailVerified: true },
        { email: 'data.admin@wasteconnect.in', password: adminPassword, role: UserRole.ADMIN, firstName: 'Amitabh', lastName: 'Sen', isActive: true, isEmailVerified: true }
    ];
    await User.insertMany(adminData);
    // --- Create pickup requests with event history ---
    console.log('Creating pickup requests...');
    const indianStreetNames = [
        'MG Road', 'Station Road', 'Nehru Nagar', 'Civil Lines', 'Sector 14',
        'Gandhi Marg', 'Bypass Road', 'Ring Road', 'Subhash Nagar', 'Indira Colony'
    ];
    for (let i = 0; i < 50; i++) {
        const isCompleted = i < 40;
        const isProgress = i >= 40 && i < 45;
        const requestDate = subDays(now, Math.floor(Math.random() * 120));
        const citizen = citizens[i % citizens.length];
        const area = areas[i % areas.length];
        const category = categories[i % categories.length];
        const street = indianStreetNames[i % indianStreetNames.length];
        const pr = await PickupRequest.create({
            citizen: citizen._id,
            wasteCategory: category._id,
            estimatedQuantity: Math.round((Math.random() * 8 + 2) * 10) / 10,
            unit: 'kg',
            address: `Plot ${i + 12}, ${street}, ${area.name}`,
            location: { type: 'Point', coordinates: [area.coordinates.lng, area.coordinates.lat] },
            serviceArea: area._id,
            preferredDate: requestDate,
            timeSlot: TimeSlot.MORNING,
            status: isCompleted ? PickupStatus.COMPLETED : (isProgress ? PickupStatus.IN_PROGRESS : PickupStatus.PENDING),
            createdAt: subDays(requestDate, 2)
        });
        await PickupEvent.create({
            pickupRequest: pr._id,
            newStatus: PickupStatus.PENDING,
            actor: citizen._id,
            actorRole: UserRole.CITIZEN,
            timestamp: pr.createdAt
        });
        if (isCompleted || isProgress) {
            const collector = collectors[i % collectors.length];
            pr.assignedCollector = collector._id;
            if (isCompleted) {
                pr.actualQuantity = Math.round((pr.estimatedQuantity + (Math.random() * 1.6 - 0.6)) * 10) / 10;
                pr.completedAt = requestDate;
            }
            await pr.save();
            await PickupAssignment.create({
                pickupRequest: pr._id,
                collector: collector._id,
                assignedBy: authorities[0]._id,
                assignedAt: subDays(requestDate, 1)
            });
            await PickupEvent.create({
                pickupRequest: pr._id,
                previousStatus: PickupStatus.PENDING,
                newStatus: PickupStatus.ASSIGNED,
                actor: authorities[0]._id,
                actorRole: UserRole.AUTHORITY,
                timestamp: subDays(requestDate, 1)
            });
            if (isCompleted) {
                await WasteRecord.create({
                    pickupRequest: pr._id,
                    citizen: citizen._id,
                    collector: collector._id,
                    wasteCategory: category._id,
                    serviceArea: area._id,
                    estimatedQuantity: pr.estimatedQuantity,
                    actualQuantity: pr.actualQuantity,
                    unit: pr.unit,
                    collectedAt: requestDate,
                    location: pr.location
                });
                await Feedback.create({
                    pickupRequest: pr._id,
                    citizen: citizen._id,
                    collector: collector._id,
                    rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
                });
            }
        }
    }
    // --- Create public issues with event history ---
    console.log('Creating public issues...');
    const issueCategories = [
        'Illegal Dumping', 'Overflowing Public Bin', 'Garbage Accumulation',
        'Uncollected Waste', 'Plastic Accumulation', 'Construction Debris',
        'E-waste Dumping', 'Waste Burning', 'Damaged Infrastructure'
    ];
    const issueDescriptions = {
        'Illegal Dumping': 'Large pile of construction debris and household waste illegally dumped near the roadside. The dump site has been growing for several days.',
        'Overflowing Public Bin': 'Three public bins are overflowing with garbage. Waste is spilling onto the pavement creating a health hazard.',
        'Garbage Accumulation': 'Significant garbage accumulation in the area. Uncollected waste has been piling up for over a week.',
        'Uncollected Waste': 'Scheduled waste collection missed for this zone. Residents have reported multiple times but no action taken.',
        'Plastic Accumulation': 'Large quantity of plastic waste accumulated near the drainage channel. Risk of blocking the drain.',
        'Construction Debris': 'Construction debris from a nearby project has been dumped on the public road, causing obstruction.',
        'E-waste Dumping': 'Electronic waste including old monitors, circuit boards and batteries found dumped in an open area.',
        'Waste Burning': 'Waste is being burned openly in the area. Heavy smoke and smell affecting nearby residents.',
        'Damaged Infrastructure': 'Public waste bin is severely damaged and unusable. Waste is scattered around the broken bin.',
    };
    const eastWardAddresses = [
        '14 Industrial Road, East Ward', '7 Factory Lane, East Ward', '23 Gate 4 Complex, East Ward',
        '56 Chemical Works Rd, East Ward', '3 Warehouse District, East Ward', '89 Eastern Bypass, East Ward',
        '11 Industrial Estate, East Ward', '44 Production Zone, East Ward', '67 Logistics Park, East Ward',
        '2 Old Factory Road, East Ward',
    ];
    const marketAddresses = [
        '12 Main Market Street, Market District', '34 Bazaar Road, Market District',
        '8 Commerce Lane, Market District', '55 Trade Center, Market District',
        '19 Vendor Alley, Market District',
    ];
    const centralAddresses = [
        '5 Civil Lines, Central Ward', '22 Town Hall Road, Central Ward',
        '9 Park Street, Central Ward', '33 Admin Block, Central Ward',
    ];
    const issueDistribution = [
        { area: sa4, count: 12, severity: Severity.HIGH, priority: Priority.HIGH, addresses: eastWardAddresses },
        { area: sa15, count: 10, severity: Severity.HIGH, priority: Priority.HIGH, addresses: ['Chawri Bazar Lane, Old Delhi', 'Nai Sarak Corner, Chandni Chowk', 'Fatehpuri Market Rd, Old Delhi', 'Ballimaran Gali, Old Delhi'] },
        { area: sa11, count: 8, severity: Severity.HIGH, priority: Priority.HIGH, addresses: ['Vikas Marg, Laxmi Nagar', 'Pocket 1 Main Rd, Mayur Vihar Phase 1', 'Pandav Nagar Crossing, East Delhi'] },
        { area: sa9, count: 8, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: marketAddresses },
        { area: sa19, count: 7, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: ['Atta Market Road, Sector 18', 'Sector 18 Metro Plaza, Noida', 'Brahmaputra Market Lane, Noida'] },
        { area: sa1, count: 6, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: centralAddresses },
        { area: sa6, count: 5, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: ['Kaushambi Wave Cinema Rd', 'Anand Vihar ISBT Border Rd', 'Radhu Palace Crossing, Kaushambi'] },
        { area: sa2, count: 4, severity: Severity.LOW, priority: Priority.LOW, addresses: ['10 RDC Raj Nagar, Ghaziabad', '25 Kavi Nagar C-Block, Ghaziabad', '7 Hapur Road, Raj Nagar'] },
        { area: sa10, count: 4, severity: Severity.LOW, priority: Priority.LOW, addresses: ['Press Enclave Road, Saket', 'PVR Anupam Complex, Saket', 'Shivalik Main Road, Malviya Nagar'] },
        { area: sa12, count: 4, severity: Severity.LOW, priority: Priority.LOW, addresses: ['Madhuban Chowk, Rohini', 'Sector 7 Market, Rohini', 'Outer Ring Road, Pitampura'] },
        { area: sa13, count: 3, severity: Severity.LOW, priority: Priority.LOW, addresses: ['Sector 10 Main Market, Dwarka', 'Sector 21 Metro Station Rd, Dwarka'] },
    ];
    let issueIndex = 0;
    for (const dist of issueDistribution) {
        for (let i = 0; i < dist.count; i++) {
            const isResolved = i < Math.floor(dist.count / 2);
            const isCritical = dist.area.name === 'East Ward (Industrial)' && i < 5;
            const isOverdue = !isResolved && Math.random() > 0.6;
            const isDuplicate = !isResolved && i > 0 && Math.random() > 0.85;
            const reporter = citizens[i % citizens.length];
            const created = subDays(now, Math.floor(Math.random() * 110) + 5);
            const cat = issueCategories[issueIndex % issueCategories.length];
            const addr = dist.addresses[i % dist.addresses.length];
            const status = isResolved ? IssueStatus.CLOSED :
                (isCritical ? IssueStatus.IN_PROGRESS :
                    (isOverdue ? IssueStatus.ASSIGNED : IssueStatus.REPORTED));
            const issue = await PublicIssue.create({
                reporter: reporter._id,
                category: cat,
                title: `${cat} — ${dist.area.name}`,
                description: issueDescriptions[cat] || `Waste issue reported in ${dist.area.name}.`,
                address: addr,
                location: { type: 'Point', coordinates: [dist.area.coordinates.lng + (Math.random() * 0.01 - 0.005), dist.area.coordinates.lat + (Math.random() * 0.01 - 0.005)] },
                serviceArea: dist.area._id,
                severity: isCritical ? Severity.CRITICAL : dist.severity,
                priority: isCritical ? Priority.CRITICAL : dist.priority,
                status,
                isOverdue,
                assignedAuthority: isResolved || isCritical ? authorities[issueIndex % authorities.length]._id : undefined,
                resolutionNotes: isResolved ? 'Issue has been addressed and the area has been cleaned by the field team.' : undefined,
                resolvedAt: isResolved ? subDays(created, -Math.floor(Math.random() * 7 + 1)) : undefined,
                citizenVerification: isResolved ? (Math.random() > 0.2 ? CitizenVerification.CONFIRMED : CitizenVerification.DISPUTED) : CitizenVerification.PENDING,
                createdAt: created,
            });
            await IssueEvent.create({
                issue: issue._id,
                newStatus: IssueStatus.REPORTED,
                actor: reporter._id,
                actorRole: UserRole.CITIZEN,
                note: 'Issue reported by citizen.',
                timestamp: created,
                isPublic: true,
            });
            if (status !== IssueStatus.REPORTED) {
                await IssueEvent.create({
                    issue: issue._id,
                    previousStatus: IssueStatus.REPORTED,
                    newStatus: IssueStatus.UNDER_REVIEW,
                    actor: authorities[issueIndex % authorities.length]._id,
                    actorRole: UserRole.AUTHORITY,
                    note: 'Issue taken under review by authority.',
                    timestamp: new Date(created.getTime() + 3600000),
                    isPublic: true,
                });
            }
            if (isResolved) {
                await IssueEvent.create({
                    issue: issue._id,
                    previousStatus: IssueStatus.UNDER_REVIEW,
                    newStatus: IssueStatus.CLOSED,
                    actor: authorities[issueIndex % authorities.length]._id,
                    actorRole: UserRole.AUTHORITY,
                    note: 'Issue resolved and closed.',
                    timestamp: issue.resolvedAt || new Date(),
                    isPublic: true,
                });
                await Notification.create({
                    recipient: reporter._id,
                    type: NotificationType.ISSUE_RESOLVED,
                    title: 'Issue Resolved',
                    message: `Your reported issue "${issue.title}" has been resolved.`,
                    relatedEntityType: 'PublicIssue',
                    relatedEntityId: issue._id,
                });
            }
            issueIndex++;
        }
    }
    // --- Create notifications for all users ---
    console.log('Creating notifications...');
    for (const citizen of citizens) {
        for (let n = 0; n < 5; n++) {
            await Notification.create({
                recipient: citizen._id,
                type: n % 2 === 0 ? NotificationType.PICKUP_COMPLETED : NotificationType.ISSUE_STATUS_CHANGED,
                title: n % 2 === 0 ? 'Pickup Completed' : 'Issue Status Updated',
                message: n % 2 === 0
                    ? 'Your waste pickup has been completed successfully.'
                    : 'The status of your reported issue has been updated.',
                isRead: n > 2,
                createdAt: subDays(now, n * 3),
            });
        }
    }
    for (const collector of collectors) {
        await Notification.create({
            recipient: collector._id,
            type: NotificationType.PICKUP_ASSIGNED,
            title: 'New Pickup Assigned',
            message: 'A new pickup request has been assigned to you.',
            isRead: false,
        });
    }
    // --- Create audit logs ---
    console.log('Creating audit logs...');
    const auditActions = [
        { action: 'USER_LOGIN', description: 'User logged in successfully' },
        { action: 'PICKUP_ASSIGNED', description: 'Pickup request assigned to collector' },
        { action: 'ISSUE_VERIFIED', description: 'Public issue verified by authority' },
        { action: 'ISSUE_RESOLVED', description: 'Public issue marked as resolved' },
        { action: 'USER_REGISTERED', description: 'New user account created' },
    ];
    for (let a = 0; a < 20; a++) {
        const auditAction = auditActions[a % auditActions.length];
        const actor = [...citizens, ...authorities, ...collectors][a % 9];
        await AuditLog.create({
            actor: actor._id,
            actorRole: actor.role,
            actorEmail: actor.email,
            action: auditAction.action,
            description: auditAction.description,
            createdAt: subDays(now, a * 2),
        });
    }
    // Announcements
    console.log('Creating announcements...');
    await Announcement.create({
        author: authorities[0]._id,
        title: 'Welcome to WasteConnect',
        content: 'WasteConnect is now live in the Greenfield Municipal Region. Citizens can now report waste issues and request pickups directly from this platform.',
        type: 'INFO',
        targetRole: 'ALL',
        isActive: true,
    });
    await Announcement.create({
        author: authorities[1]._id,
        title: 'Heavy Rain — Collection Delays Possible',
        content: 'Due to heavy rain forecast for the next 3 days, waste collection in East Ward may be delayed. We apologize for any inconvenience.',
        type: 'WARNING',
        targetRole: 'ALL',
        targetServiceArea: sa3._id,
        isActive: true,
    });
    await Announcement.create({
        author: authorities[2]._id,
        title: 'Market District Cleanup Drive — This Weekend',
        content: 'A special cleanup drive has been scheduled for Market District this Saturday and Sunday. All available collectors please report to the coordination center by 8 AM.',
        type: 'SCHEDULE',
        targetRole: UserRole.COLLECTOR,
        targetServiceArea: sa5._id,
        isActive: true,
    });
    console.log('✅ Seed complete!');
    await disconnectDatabase();
    process.exit(0);
};
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
