import { Database } from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { CarListing, User, AuditLog, PaginationParams } from '@/types';

let dbConnection: Database | null = null;

export function getDatabase(): Database {
  if (!dbConnection) {
    const databasePath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
    dbConnection = new Database(databasePath);
    initializeTables();
  }
  return dbConnection;
}

function initializeTables() {
  if (!dbConnection) return;

  dbConnection.serialize(() => {
    dbConnection!.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    dbConnection!.run(`CREATE TABLE IF NOT EXISTS car_listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price_per_day REAL NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_by TEXT NOT NULL,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      rejection_reason TEXT
    )`);

    dbConnection!.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      listing_id TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      admin_username TEXT NOT NULL,
      previous_data TEXT,
      new_data TEXT,
      reason TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    setupDefaultUser();
    populateTestData();
  });
}

async function setupDefaultUser() {
  if (!dbConnection) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  const userId = uuidv4();

  dbConnection!.run(
    `INSERT OR IGNORE INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)`,
    [userId, 'admin', 'admin@example.com', passwordHash, 'admin']
  );
}

function populateTestData() {
  if (!dbConnection) return;

  dbConnection!.get('SELECT COUNT(*) as count FROM car_listings', (err, row: any) => {
    if (err || row.count > 0) return;

    const testListings = [
      {
        id: uuidv4(),
        title: 'Toyota Camry 2020 - Reliable and Comfortable',
        description: 'Well-maintained Toyota Camry with excellent fuel efficiency. Perfect for business trips or family vacations.',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        pricePerDay: 45.00,
        location: 'Downtown, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500',
        status: 'pending',
        submittedBy: 'user123'
      },
      {
        id: uuidv4(),
        title: 'Honda Civic 2019 - Sporty and Efficient',
        description: 'Clean Honda Civic with low mileage. Great for city driving and weekend getaways.',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        pricePerDay: 40.00,
        location: 'Oakland, CA',
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500',
        status: 'approved',
        submittedBy: 'user456',
        reviewedBy: 'admin',
        reviewedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'BMW X3 2021 - Luxury SUV',
        description: 'Premium BMW X3 with all modern amenities. Perfect for special occasions and comfortable long drives.',
        brand: 'BMW',
        model: 'X3',
        year: 2021,
        pricePerDay: 85.00,
        location: 'Palo Alto, CA',
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500',
        status: 'pending',
        submittedBy: 'user789'
      },
      {
        id: uuidv4(),
        title: 'Ford Focus 2018 - Budget Friendly',
        description: 'Affordable Ford Focus in good condition. Ideal for budget-conscious travelers.',
        brand: 'Ford',
        model: 'Focus',
        year: 2018,
        pricePerDay: 35.00,
        location: 'San Jose, CA',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500',
        status: 'rejected',
        submittedBy: 'user101',
        reviewedBy: 'admin',
        reviewedAt: new Date().toISOString(),
        rejectionReason: 'Vehicle does not meet safety standards'
      },
      {
        id: uuidv4(),
        title: 'Tesla Model 3 2022 - Electric and Modern',
        description: 'Latest Tesla Model 3 with autopilot features. Eco-friendly option for tech enthusiasts.',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        pricePerDay: 95.00,
        location: 'Fremont, CA',
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500',
        status: 'pending',
        submittedBy: 'user202'
      }
    ];

    testListings.forEach(listing => {
      dbConnection!.run(
        `INSERT INTO car_listings (id, title, description, brand, model, year, price_per_day, location, image_url, status, submitted_by, reviewed_by, reviewed_at, rejection_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listing.id, listing.title, listing.description, listing.brand, listing.model,
          listing.year, listing.pricePerDay, listing.location, listing.imageUrl,
          listing.status, listing.submittedBy, listing.reviewedBy || null,
          listing.reviewedAt || null, listing.rejectionReason || null
        ]
      );
    });
  });
}

export class DatabaseService {
  static findUserByLogin(username: string, password: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      database.get('SELECT * FROM users WHERE username = ?', [username], async (err, userData: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!userData) {
          resolve(null);
          return;
        }

        const passwordValid = await bcrypt.compare(password, userData.password);
        if (!passwordValid) {
          resolve(null);
          return;
        }

        resolve({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          createdAt: new Date(userData.created_at)
        });
      });
    });
  }

  static findUserById(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      database.get('SELECT * FROM users WHERE id = ?', [userId], (err, userData: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!userData) {
          resolve(null);
          return;
        }

        resolve({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          createdAt: new Date(userData.created_at)
        });
      });
    });
  }

  static fetchListings(params: PaginationParams): Promise<{ listings: CarListing[], total: number }> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      const { page, limit, status, search } = params;
      const skip = (page - 1) * limit;

      let whereCondition = '';
      let parameters: any[] = [];

      if (status && status !== 'all') {
        whereCondition += ' WHERE status = ?';
        parameters.push(status);
      }

      if (search) {
        whereCondition += whereCondition ? ' AND' : ' WHERE';
        whereCondition += ' (title LIKE ? OR brand LIKE ? OR model LIKE ? OR location LIKE ?)';
        const searchPattern = `%${search}%`;
        parameters.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      database.get(`SELECT COUNT(*) as total FROM car_listings${whereCondition}`, parameters, (err, countResult: any) => {
        if (err) {
          reject(err);
          return;
        }

        database.all(`SELECT * FROM car_listings${whereCondition} ORDER BY submitted_at DESC LIMIT ? OFFSET ?`, 
          [...parameters, limit, skip], (err, listingRows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          const carListings = listingRows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            brand: row.brand,
            model: row.model,
            year: row.year,
            pricePerDay: row.price_per_day,
            location: row.location,
            imageUrl: row.image_url,
            status: row.status,
            submittedBy: row.submitted_by,
            submittedAt: new Date(row.submitted_at),
            reviewedBy: row.reviewed_by,
            reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
            rejectionReason: row.rejection_reason
          }));

          resolve({ listings: carListings, total: countResult.total });
        });
      });
    });
  }

  static findListingById(listingId: string): Promise<CarListing | null> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      database.get('SELECT * FROM car_listings WHERE id = ?', [listingId], (err, listingData: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!listingData) {
          resolve(null);
          return;
        }

        resolve({
          id: listingData.id,
          title: listingData.title,
          description: listingData.description,
          brand: listingData.brand,
          model: listingData.model,
          year: listingData.year,
          pricePerDay: listingData.price_per_day,
          location: listingData.location,
          imageUrl: listingData.image_url,
          status: listingData.status,
          submittedBy: listingData.submitted_by,
          submittedAt: new Date(listingData.submitted_at),
          reviewedBy: listingData.reviewed_by,
          reviewedAt: listingData.reviewed_at ? new Date(listingData.reviewed_at) : undefined,
          rejectionReason: listingData.rejection_reason
        });
      });
    });
  }

  static changeListingStatus(listingId: string, newStatus: 'approved' | 'rejected', adminId: string, adminUsername: string, rejectReason?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      
      this.findListingById(listingId).then(existingListing => {
        if (!existingListing) {
          resolve(false);
          return;
        }

        database.run(
          `UPDATE car_listings SET status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ? WHERE id = ?`,
          [newStatus, adminId, new Date().toISOString(), rejectReason || null, listingId],
          function(err) {
            if (err) {
              reject(err);
              return;
            }

            DatabaseService.recordAction(
              newStatus === 'approved' ? 'approve' : 'reject',
              listingId, adminId, adminUsername, existingListing,
              { status: newStatus, reviewedBy: adminId, reviewedAt: new Date(), rejectionReason: rejectReason },
              rejectReason
            ).then(() => {
              resolve(this.changes > 0);
            }).catch(reject);
          }
        );
      }).catch(reject);
    });
  }

  static modifyListing(listingId: string, changes: Partial<CarListing>, adminId: string, adminUsername: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();

      this.findListingById(listingId).then(existingListing => {
        if (!existingListing) {
          resolve(false);
          return;
        }

        const fieldUpdates = [];
        const valueUpdates = [];

        if (changes.title) {
          fieldUpdates.push('title = ?');
          valueUpdates.push(changes.title);
        }
        if (changes.description) {
          fieldUpdates.push('description = ?');
          valueUpdates.push(changes.description);
        }
        if (changes.brand) {
          fieldUpdates.push('brand = ?');
          valueUpdates.push(changes.brand);
        }
        if (changes.model) {
          fieldUpdates.push('model = ?');
          valueUpdates.push(changes.model);
        }
        if (changes.year) {
          fieldUpdates.push('year = ?');
          valueUpdates.push(changes.year);
        }
        if (changes.pricePerDay) {
          fieldUpdates.push('price_per_day = ?');
          valueUpdates.push(changes.pricePerDay);
        }
        if (changes.location) {
          fieldUpdates.push('location = ?');
          valueUpdates.push(changes.location);
        }
        if (changes.imageUrl) {
          fieldUpdates.push('image_url = ?');
          valueUpdates.push(changes.imageUrl);
        }

        if (fieldUpdates.length === 0) {
          resolve(false);
          return;
        }

        valueUpdates.push(listingId);

        database.run(`UPDATE car_listings SET ${fieldUpdates.join(', ')} WHERE id = ?`, valueUpdates, function(err) {
          if (err) {
            reject(err);
            return;
          }

          DatabaseService.recordAction('edit', listingId, adminId, adminUsername, existingListing, changes)
            .then(() => resolve(this.changes > 0))
            .catch(reject);
        });
      }).catch(reject);
    });
  }

  static recordAction(actionType: 'approve' | 'reject' | 'edit' | 'delete', listingId: string, adminId: string, adminUsername: string, oldData?: Partial<CarListing>, newData?: Partial<CarListing>, actionReason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      const logEntryId = uuidv4();

      database.run(
        `INSERT INTO audit_logs (id, action, listing_id, admin_id, admin_username, previous_data, new_data, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logEntryId, actionType, listingId, adminId, adminUsername,
          oldData ? JSON.stringify(oldData) : null,
          newData ? JSON.stringify(newData) : null,
          actionReason || null
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }

  static fetchAuditHistory(pageNum: number = 1, pageSize: number = 20): Promise<{ logs: AuditLog[], total: number }> {
    return new Promise((resolve, reject) => {
      const database = getDatabase();
      const skipRecords = (pageNum - 1) * pageSize;

      database.get('SELECT COUNT(*) as total FROM audit_logs', (err, countResult: any) => {
        if (err) {
          reject(err);
          return;
        }

        database.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?', [pageSize, skipRecords], (err, logRows: any[]) => {
          if (err) {
            reject(err);
            return;
          }

          const auditEntries = logRows.map(row => ({
            id: row.id,
            action: row.action,
            listingId: row.listing_id,
            adminId: row.admin_id,
            adminUsername: row.admin_username,
            previousData: row.previous_data ? JSON.parse(row.previous_data) : undefined,
            newData: row.new_data ? JSON.parse(row.new_data) : undefined,
            reason: row.reason,
            timestamp: new Date(row.timestamp)
          }));

          resolve({ logs: auditEntries, total: countResult.total });
        });
      });
    });
  }
}
