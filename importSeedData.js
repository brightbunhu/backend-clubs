import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Club from './models/clubModel.js';
import Event from './models/eventModel.js';
import User from './models/userModel.js';
import crypto from 'crypto';

dotenv.config();

const clubsPath = path.join(process.cwd(), 'clubs (1).json');
const eventsPath = path.join(process.cwd(), 'events (1).json');
const credentialsPath = path.join(process.cwd(), 'imported_leaders_credentials.txt');

function generateRandomPassword(length = 10) {
  return crypto.randomBytes(length).toString('base64').slice(0, length);
}

function splitName(fullName) {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { name: parts[0], surname: 'Unknown' };
  }
  return {
    name: parts.slice(0, -1).join(' '),
    surname: parts[parts.length - 1]
  };
}

function makeRegNumber(name, role) {
  // Generate a fake regNumber for a user
  return `${role.toUpperCase()}_${name.replace(/\s+/g, '').toLowerCase()}`;
}

function makeEmail(name, role) {
  return `${name.replace(/\s+/g, '').toLowerCase()}_${role}@example.com`;
}

async function importData() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Import Clubs
  const clubsRaw = fs.readFileSync(clubsPath, 'utf-8');
  const clubsJson = JSON.parse(clubsRaw);

  // Prepare to collect credentials
  let credentials = [];

  // Map for created users by email
  const leaderEmailToId = {};

  for (const club of clubsJson.clubs) {
    // Check if club already exists
    const existingClub = await Club.findOne({ name: club.name });
    if (existingClub) continue;

    // Handle leadership
    let clubLeaders = [];
    if (Array.isArray(club.leadership)) {
      for (const leader of club.leadership) {
        const leaderEmail = leader.contact?.email || `${leader.name.replace(/\s+/g, '').toLowerCase()}_${leader.role}@example.com`;
        let user = await User.findOne({ email: leaderEmail });
        if (!user) {
          const password = generateRandomPassword(12);
          const { name, surname } = splitName(leader.name);
          user = await User.create({
            regNumber: `LEADER_${leader.name.replace(/\s+/g, '').toLowerCase()}`,
            email: leaderEmail,
            name,
            surname,
            dob: new Date('1990-01-01'),
            password,
            roles: ['club_leader'],
          });
          credentials.push(`${leaderEmail},${password}`);
        }
        leaderEmailToId[leaderEmail] = user._id;
        clubLeaders.push(user._id);
      }
    }
    // Patron (if any)
    let patronId = null;
    if (club.patron && club.patron.contact?.email) {
      const patronEmail = club.patron.contact.email;
      let patronUser = await User.findOne({ email: patronEmail });
      if (!patronUser) {
        const password = generateRandomPassword(12);
        const { name, surname } = splitName(club.patron.name);
        patronUser = await User.create({
          regNumber: `PATRON_${club.patron.name.replace(/\s+/g, '').toLowerCase()}`,
          email: patronEmail,
          name,
          surname,
          dob: new Date('1980-01-01'),
          password,
          roles: ['patron'],
        });
        credentials.push(`${patronEmail},${password}`);
      }
      patronId = patronUser._id;
    }
    // Create club
    await Club.create({
      name: club.name,
      description: club.description,
      introducedAt: club.founded ? new Date(`${club.founded}-01-01`) : new Date(),
      profilePic: club.image,
      patron: patronId,
      clubLeaders,
      members: [],
      category: club.category || 'General',
    });
  }

  // Write credentials to file
  if (credentials.length > 0) {
    fs.writeFileSync(credentialsPath, credentials.join('\n'), 'utf-8');
    console.log(`Wrote credentials for ${credentials.length} users to ${credentialsPath}`);
  }

  // Map club name to _id for event linking
  const allClubs = await Club.find({});
  const clubNameToId = {};
  allClubs.forEach((club) => {
    clubNameToId[club.name] = club._id;
  });

  // Import Events
  const eventsRaw = fs.readFileSync(eventsPath, 'utf-8');
  const eventsJson = JSON.parse(eventsRaw);
  for (const event of eventsJson.events) {
    // Check if event already exists (by title and date)
    const existingEvent = await Event.findOne({ title: event.title, date: event.date });
    if (existingEvent) continue;
    const clubId = clubNameToId[event.club] || null;
    // Try to set createdBy to a club leader if possible
    let createdBy = null;
    if (clubId) {
      const club = allClubs.find(c => c._id.equals(clubId));
      if (club && club.clubLeaders && club.clubLeaders.length > 0) {
        createdBy = club.clubLeaders[0];
      }
    }
    if (!clubId) {
      console.warn(`Skipping event '${event.title}' - club '${event.club}' not found.`);
      continue;
    }
    if (!createdBy) {
      console.warn(`Skipping event '${event.title}' - no club leader found for club '${event.club}'.`);
      continue;
    }
    await Event.create({
      title: event.title,
      description: event.description,
      date: event.date,
      club: clubId,
      createdBy,
      status: 'approved',
      location: event.location,
    });
  }

  mongoose.connection.close();
  console.log('Import complete.');
}

importData().catch((err) => {
  console.error(err);
  mongoose.connection.close();
}); 