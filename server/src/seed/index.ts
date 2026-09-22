import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';

import { User } from '../models/User';
import { CitizenProfile } from '../models/CitizenProfile';
import { CollectorProfile } from '../models/CollectorProfile';
import { AuthorityProfile } from '../models/AuthorityProfile';
import { ServiceArea } from '../models/ServiceArea';
import { WasteCategory } from '../models/WasteCategory';
import { PickupRequest } from '../models/PickupRequest';
import { PickupEvent } from '../models/PickupEvent';
import { PickupAssignment } from '../models/PickupAssignment';
import { WasteRecord } from '../models/WasteRecord';
import { PublicIssue } from '../models/PublicIssue';
import { IssueEvent } from '../models/IssueEvent';
import { Notification } from '../models/Notification';
import { Feedback } from '../models/Feedback';
import { AuditLog } from '../models/AuditLog';
import { Announcement } from '../models/Announcement';
import { AIAnalysis } from '../models/AIAnalysis';

import { 
  UserRole, PickupStatus, IssueStatus, Severity, Priority, 
  CollectorAvailability, TimeSlot, NotificationType, HotspotLevel,
  VerificationStatus, CitizenVerification
} from '../types/enums';

const subDays = (date: Date, days: number): Date => {
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
    name: 'Central Ward', city: 'Greenfield', district: 'Central',
    coordinates: { lat: 28.6139, lng: 77.2090 }, hotspotScore: 38, hotspotLevel: HotspotLevel.MODERATE
  });
  const sa2 = await ServiceArea.create({
    name: 'North Ward', city: 'Greenfield', district: 'North',
    coordinates: { lat: 28.6600, lng: 77.2090 }, hotspotScore: 25, hotspotLevel: HotspotLevel.LOW
  });
  const sa3 = await ServiceArea.create({
    name: 'East Ward (Industrial)', city: 'Greenfield', district: 'East',
    coordinates: { lat: 28.6139, lng: 77.2600 }, hotspotScore: 84, hotspotLevel: HotspotLevel.CRITICAL
  });
  const sa4 = await ServiceArea.create({
    name: 'South Ward (Residential)', city: 'Greenfield', district: 'South',
    coordinates: { lat: 28.5700, lng: 77.2090 }, hotspotScore: 18, hotspotLevel: HotspotLevel.LOW
  });
  const sa5 = await ServiceArea.create({
    name: 'Market District', city: 'Greenfield', district: 'Central',
    coordinates: { lat: 28.6139, lng: 77.1800 }, hotspotScore: 62, hotspotLevel: HotspotLevel.HIGH
  });

  const areas = [sa1, sa2, sa3, sa4, sa5];

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
    { email: 'maya.chen@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Maya', lastName: 'Chen', isActive: true, isEmailVerified: true },
    { email: 'rahul.sharma@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Rahul', lastName: 'Sharma', isActive: true, isEmailVerified: true },
    { email: 'priya.nair@example.com', password: hashedPassword, role: UserRole.CITIZEN, firstName: 'Priya', lastName: 'Nair', isActive: true, isEmailVerified: true }
  ];
  const citizens = await User.insertMany(citizenData);
  for (const c of citizens) {
    await CitizenProfile.create({ user: c._id, preferredServiceArea: sa1._id });
  }

  const collectorData = [
    { email: 'alex.martinez@wasteconnect.io', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Alex', lastName: 'Martinez', isActive: true, isEmailVerified: true },
    { email: 'james.okonkwo@wasteconnect.io', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'James', lastName: 'Okonkwo', isActive: true, isEmailVerified: true },
    { email: 'fatima.hassan@wasteconnect.io', password: hashedPassword, role: UserRole.COLLECTOR, firstName: 'Fatima', lastName: 'Al-Hassan', isActive: true, isEmailVerified: true }
  ];
  const collectors = await User.insertMany(collectorData);
  await CollectorProfile.create({ user: collectors[0]._id, serviceAreas: [sa1._id, sa5._id], totalCollections: 87, rating: 4.7, availability: CollectorAvailability.AVAILABLE });
  await CollectorProfile.create({ user: collectors[1]._id, serviceAreas: [sa2._id, sa4._id], totalCollections: 41, rating: 4.3, availability: CollectorAvailability.AVAILABLE });
  await CollectorProfile.create({ user: collectors[2]._id, serviceAreas: [sa3._id], totalCollections: 16, rating: 4.8, availability: CollectorAvailability.AVAILABLE });

  const authorityData = [
    { email: 'david.park@greenfield.gov', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'David', lastName: 'Park', isActive: true, isEmailVerified: true },
    { email: 'sarah.johnson@greenfield.gov', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'Sarah', lastName: 'Johnson', isActive: true, isEmailVerified: true },
    { email: 'amir.khan@greenfield.gov', password: hashedPassword, role: UserRole.AUTHORITY, firstName: 'Amir', lastName: 'Khan', isActive: true, isEmailVerified: true }
  ];
  const authorities = await User.insertMany(authorityData);
  await AuthorityProfile.create({ user: authorities[0]._id, serviceAreas: [sa1._id, sa2._id], designation: 'Municipal Officer', department: 'Sanitation' });
  await AuthorityProfile.create({ user: authorities[1]._id, serviceAreas: [sa3._id], designation: 'Municipal Officer', department: 'Sanitation' });
  await AuthorityProfile.create({ user: authorities[2]._id, serviceAreas: [sa5._id, sa4._id], designation: 'Municipal Officer', department: 'Sanitation' });

  const adminData = [
    { email: 'admin@wasteconnect.io', password: adminPassword, role: UserRole.ADMIN, firstName: 'System', lastName: 'Admin', isActive: true, isEmailVerified: true },
    { email: 'ops.admin@wasteconnect.io', password: adminPassword, role: UserRole.ADMIN, firstName: 'Ops', lastName: 'Admin', isActive: true, isEmailVerified: true },
    { email: 'data.admin@wasteconnect.io', password: adminPassword, role: UserRole.ADMIN, firstName: 'Data', lastName: 'Admin', isActive: true, isEmailVerified: true }
  ];
  await User.insertMany(adminData);

  // --- Create pickup requests with event history ---
  console.log('Creating pickup requests...');
  for (let i = 0; i < 50; i++) {
    const isCompleted = i < 40;
    const isProgress = i >= 40 && i < 45;
    
    const requestDate = subDays(now, Math.floor(Math.random() * 120));
    const citizen = citizens[i % citizens.length];
    const area = areas[i % areas.length];
    const category = categories[i % categories.length];
    
    const pr = await PickupRequest.create({
      citizen: citizen._id,
      wasteCategory: category._id,
      estimatedQuantity: Math.random() * 10 + 1,
      unit: 'kg',
      address: `Address ${i}, ${area.name}`,
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
      if(isCompleted) {
         pr.actualQuantity = pr.estimatedQuantity + (Math.random() * 2 - 1);
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
      
      if(isCompleted) {
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
    { area: sa3, count: 20, severity: Severity.HIGH, priority: Priority.HIGH, addresses: eastWardAddresses },
    { area: sa5, count: 15, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: marketAddresses },
    { area: sa1, count: 8, severity: Severity.MODERATE, priority: Priority.MEDIUM, addresses: centralAddresses },
    { area: sa2, count: 4, severity: Severity.LOW, priority: Priority.LOW, addresses: ['10 North Ave, North Ward', '25 Sector B, North Ward', '7 Green Lane, North Ward', '44 Maple St, North Ward'] },
    { area: sa4, count: 3, severity: Severity.LOW, priority: Priority.LOW, addresses: ['3 Residential Block A, South Ward', '18 Colony Road, South Ward', '44 Suburb Lane, South Ward'] },
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
        description: issueDescriptions[cat as keyof typeof issueDescriptions] || `Waste issue reported in ${dist.area.name}.`,
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
