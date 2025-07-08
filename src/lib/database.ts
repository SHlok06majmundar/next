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
        description: 'Modern Honda Civic with all the latest technology features. Great for city driving and road trips.',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        pricePerDay: 38.00,
        location: 'Mission District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1606664519473-1c397c02eafa?w=500',
        status: 'approved',
        submittedBy: 'user456'
      },
      {
        id: uuidv4(),
        title: 'Tesla Model 3 - Electric Luxury',
        description: 'Experience the future of driving with this sleek Tesla Model 3. Zero emissions and full of cutting-edge features.',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        pricePerDay: 95.00,
        location: 'Marina District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1591440549227-4ac2dcc9574b?w=500',
        status: 'approved',
        submittedBy: 'user789'
      },
      {
        id: uuidv4(),
        title: 'BMW 3 Series - Premium Driving Experience',
        description: 'Elegant BMW 3 Series offering a perfect blend of performance and luxury. Ideal for special occasions.',
        brand: 'BMW',
        model: '3 Series',
        year: 2021,
        pricePerDay: 85.00,
        location: 'Pacific Heights, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1612471758789-a965563a32d6?w=500',
        status: 'rejected',
        submittedBy: 'user123',
        rejectionReason: 'Documentation incomplete, please resubmit with insurance papers.'
      },
      {
        id: uuidv4(),
        title: 'Audi A4 2022 - Executive Elegance',
        description: 'Premium Audi A4 with leather interior and advanced driving features. Perfect for business trips and making an impression.',
        brand: 'Audi',
        model: 'A4',
        year: 2022,
        pricePerDay: 89.00,
        location: 'Financial District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=500',
        status: 'pending',
        submittedBy: 'user567'
      },
      {
        id: uuidv4(),
        title: 'Jeep Wrangler - Adventure Ready',
        description: 'Rugged Jeep Wrangler ready for your next outdoor adventure. Great for weekend getaways to mountains or beaches.',
        brand: 'Jeep',
        model: 'Wrangler',
        year: 2021,
        pricePerDay: 75.00,
        location: 'Sunset District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500',
        status: 'approved',
        submittedBy: 'user890'
      },
      {
        id: uuidv4(),
        title: 'Mercedes C-Class - Luxury and Style',
        description: 'Elegant Mercedes C-Class with premium finishes and smooth handling. The perfect luxury rental for any occasion.',
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2023,
        pricePerDay: 95.00,
        location: 'Nob Hill, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500',
        status: 'pending',
        submittedBy: 'user345'
      },
      {
        id: uuidv4(),
        title: 'Ford Mustang GT - American Muscle',
        description: 'Classic American muscle car with powerful engine and iconic design. Experience the thrill of driving this legendary vehicle.',
        brand: 'Ford',
        model: 'Mustang GT',
        year: 2022,
        pricePerDay: 82.00,
        location: 'Richmond District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f452d1f2?w=500',
        status: 'approved',
        submittedBy: 'user678'
      },
      {
        id: uuidv4(),
        title: 'Porsche 911 - Performance Perfection',
        description: 'Iconic Porsche 911 offering unmatched driving dynamics and head-turning style. For the discerning driver who accepts no compromises.',
        brand: 'Porsche',
        model: '911',
        year: 2023,
        pricePerDay: 150.00,
        location: 'Marina District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500',
        status: 'pending',
        submittedBy: 'user901'
      },
      {
        id: uuidv4(),
        title: 'Range Rover Sport - Luxury SUV',
        description: 'Premium Range Rover Sport combining off-road capability with urban sophistication. Spacious interior and commanding presence.',
        brand: 'Land Rover',
        model: 'Range Rover Sport',
        year: 2022,
        pricePerDay: 120.00,
        location: 'Presidio Heights, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1536637002700-58382d05da76?w=500',
        status: 'approved',
        submittedBy: 'user234'
      },
      {
        id: uuidv4(),
        title: 'Range Rover Sport - Luxury SUV Experience',
        description: 'Premium Range Rover Sport with all the bells and whistles. Perfect for family trips and outdoor adventures with style.',
        brand: 'Land Rover',
        model: 'Range Rover Sport',
        year: 2023,
        pricePerDay: 135.00,
        location: 'Pacific Heights, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500',
        status: 'approved',
        submittedBy: 'user789'
      },
      {
        id: uuidv4(),
        title: 'Lexus ES - Japanese Luxury',
        description: 'Elegant Lexus ES offering exceptional comfort and reliability. Enjoy smooth driving and premium features.',
        brand: 'Lexus',
        model: 'ES',
        year: 2023,
        pricePerDay: 85.00,
        location: 'Embarcadero, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500',
        status: 'pending',
        submittedBy: 'user234'
      },
      {
        id: uuidv4(),
        title: 'Volkswagen Golf GTI - Hot Hatch Fun',
        description: 'Sporty VW Golf GTI combining practicality with driving excitement. The perfect balance of performance and everyday usability.',
        brand: 'Volkswagen',
        model: 'Golf GTI',
        year: 2022,
        pricePerDay: 65.00,
        location: 'Mission Bay, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=500',
        status: 'pending',
        submittedBy: 'user456'
      },
      {
        id: uuidv4(),
        title: 'Chevrolet Corvette - American Icon',
        description: 'Thrilling Corvette with head-turning design and exhilarating performance. Experience the pinnacle of American sports car engineering.',
        brand: 'Chevrolet',
        model: 'Corvette',
        year: 2022,
        pricePerDay: 125.00,
        location: 'North Beach, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1552519507-88aa2dfa9fdb?w=500',
        status: 'approved',
        submittedBy: 'user789'
      },
      {
        id: uuidv4(),
        title: 'Subaru Outback - All-Weather Adventure',
        description: 'Reliable Subaru Outback with all-wheel drive and ample cargo space. Perfect for outdoor adventures and road trips in any weather.',
        brand: 'Subaru',
        model: 'Outback',
        year: 2021,
        pricePerDay: 58.00,
        location: 'Outer Sunset, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11994e909e74?w=500',
        status: 'pending',
        submittedBy: 'user567'
      },
      {
        id: uuidv4(),
        title: 'Hyundai Tucson - Modern Family SUV',
        description: 'Stylish Hyundai Tucson with modern amenities and comfortable interior. Great for family trips and daily commutes.',
        brand: 'Hyundai',
        model: 'Tucson',
        year: 2023,
        pricePerDay: 52.00,
        location: 'Hayes Valley, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1632183053282-319fabaf6e55?w=500',
        status: 'approved',
        submittedBy: 'user123'
      },
      {
        id: uuidv4(),
        title: 'Mazda MX-5 Miata - Convertible Fun',
        description: 'Iconic Mazda MX-5 Miata convertible for the ultimate open-air driving experience. Perfect for scenic coastal drives.',
        brand: 'Mazda',
        model: 'MX-5 Miata',
        year: 2022,
        pricePerDay: 68.00,
        location: 'Russian Hill, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=500',
        status: 'pending',
        submittedBy: 'user890'
      },
      {
        id: uuidv4(),
        title: 'Ferrari 488 - Italian Supercar',
        description: 'Experience the ultimate driving thrill in this iconic Ferrari 488. Incredible handling and breathtaking acceleration.',
        brand: 'Ferrari',
        model: '488',
        year: 2021,
        pricePerDay: 350.00,
        location: 'Marina District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=500',
        status: 'approved',
        submittedBy: 'user456'
      },
      {
        id: uuidv4(),
        title: 'Lamborghini Huracan - Exotic Beauty',
        description: 'Turn heads everywhere you go with this stunning Lamborghini Huracan. Aggressive styling and exceptional performance.',
        brand: 'Lamborghini',
        model: 'Huracan',
        year: 2022,
        pricePerDay: 400.00,
        location: 'Financial District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500',
        status: 'pending',
        submittedBy: 'user234'
      },
      {
        id: uuidv4(),
        title: 'Nissan GT-R - Japanese Supercar',
        description: 'Legendary Nissan GT-R with twin-turbo V6 and advanced AWD. Known as Godzilla, this technological marvel delivers supercar performance.',
        brand: 'Nissan',
        model: 'GT-R',
        year: 2021,
        pricePerDay: 220.00,
        location: 'SoMa, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1595044426077-d36d9236d44e?w=500',
        status: 'approved',
        submittedBy: 'user567'
      },
      {
        id: uuidv4(),
        title: 'Rolls-Royce Ghost - Ultimate Luxury',
        description: 'Experience the epitome of luxury with this Rolls-Royce Ghost. Hand-crafted excellence and whisper-quiet comfort.',
        brand: 'Rolls-Royce',
        model: 'Ghost',
        year: 2023,
        pricePerDay: 490.00,
        location: 'Nob Hill, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1631294767601-83edce40f3a5?w=500',
        status: 'pending',
        submittedBy: 'user678'
      },
      {
        id: uuidv4(),
        title: 'Kia Telluride - Family SUV Excellence',
        description: 'Award-winning Kia Telluride with three rows of seating. Perfect for family vacations and group trips.',
        brand: 'Kia',
        model: 'Telluride',
        year: 2023,
        pricePerDay: 75.00,
        location: 'Outer Richmond, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500',
        status: 'approved',
        submittedBy: 'user345'
      },
      {
        id: uuidv4(),
        title: 'Bentley Continental GT - British Luxury',
        description: 'Handcrafted Bentley Continental GT combining luxury with impressive performance. The perfect grand touring experience.',
        brand: 'Bentley',
        model: 'Continental GT',
        year: 2022,
        pricePerDay: 380.00,
        location: 'Pacific Heights, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1619551734325-81aaf323686c?w=500',
        status: 'pending',
        submittedBy: 'user901'
      },
      {
        id: uuidv4(),
        title: 'Toyota RAV4 - Reliable SUV',
        description: 'Dependable Toyota RAV4 SUV with excellent fuel economy and cargo space. Perfect for weekend getaways.',
        brand: 'Toyota',
        model: 'RAV4',
        year: 2022,
        pricePerDay: 58.00,
        location: 'Mission District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1568844293986-ca9c5c1d4cba?w=500',
        status: 'approved',
        submittedBy: 'user123'
      },
      {
        id: uuidv4(),
        title: 'Honda CR-V - Practical Crossover',
        description: 'Spacious and efficient Honda CR-V with advanced safety features. Great for city driving and outdoor adventures.',
        brand: 'Honda',
        model: 'CR-V',
        year: 2023,
        pricePerDay: 55.00,
        location: 'Bernal Heights, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1623013438264-7ee5b373ef29?w=500',
        status: 'pending',
        submittedBy: 'user456'
      },
      {
        id: uuidv4(),
        title: 'McLaren 720S - Hypercar Experience',
        description: 'Breathtaking McLaren 720S with stunning design and incredible performance. The ultimate driving experience for enthusiasts.',
        brand: 'McLaren',
        model: '720S',
        year: 2022,
        pricePerDay: 450.00,
        location: 'Marina District, San Francisco',
        imageUrl: 'https://images.unsplash.com/photo-1621363441864-a11465b57886?w=500',
        status: 'approved',
        submittedBy: 'user789'
      }
    ];

    testListings.forEach((listing) => {
      dbConnection!.run(
        `INSERT INTO car_listings (
          id, title, description, brand, model, year, price_per_day,
          location, image_url, status, submitted_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          listing.id, listing.title, listing.description, listing.brand,
          listing.model, listing.year, listing.pricePerDay, listing.location,
          listing.imageUrl, listing.status, listing.submittedBy
        ]
      );
    });
  });

  dbConnection!.get('SELECT COUNT(*) as count FROM audit_logs', (err, row: any) => {
    if (err || row.count > 0) return;

    dbConnection!.get('SELECT id, username FROM users WHERE role = "admin" LIMIT 1', (err, adminUser: any) => {
      if (err || !adminUser) return;

      dbConnection!.all('SELECT id FROM car_listings LIMIT 5', (err, listings: any[]) => {
        if (err || !listings.length) return;

        const sampleAuditLogs = [
          {
            id: uuidv4(),
            action: 'approve',
            listing_id: listings[0]?.id,
            admin_id: adminUser.id,
            admin_username: adminUser.username,
            reason: 'Listing meets all requirements and photos are clear',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          },
          {
            id: uuidv4(),
            action: 'reject',
            listing_id: listings[1]?.id,
            admin_id: adminUser.id,
            admin_username: adminUser.username,
            reason: 'Vehicle photos do not match description',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
          },
          {
            id: uuidv4(),
            action: 'edit',
            listing_id: listings[2]?.id,
            admin_id: adminUser.id,
            admin_username: adminUser.username,
            reason: 'Updated pricing to match market rates',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          },
          {
            id: uuidv4(),
            action: 'approve',
            listing_id: listings[3]?.id,
            admin_id: adminUser.id,
            admin_username: adminUser.username,
            reason: 'Premium vehicle with excellent condition photos',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: uuidv4(),
            action: 'reject',
            listing_id: listings[4]?.id,
            admin_id: adminUser.id,
            admin_username: adminUser.username,
            reason: 'Missing required documentation',
            timestamp: new Date().toISOString()
          }
        ];

        sampleAuditLogs.forEach(log => {
          dbConnection!.run(
            `INSERT INTO audit_logs (id, action, listing_id, admin_id, admin_username, reason, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              log.id,
              log.action,
              log.listing_id,
              log.admin_id,
              log.admin_username,
              log.reason,
              log.timestamp
            ]
          );
        });
      });
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

export async function getAuditLogs({ page = 1, limit = 20 }: PaginationParams) {
  return new Promise<{ logs: AuditLog[], total: number }>((resolve, reject) => {
    const db = getDatabase();
    const offset = (page - 1) * limit;
    
    db.get('SELECT COUNT(*) as count FROM audit_logs', (err, countResult: any) => {
      if (err) {
        reject(err);
        return;
      }

      const total = countResult?.count || 0;
      
      db.all(
        `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          
          const logs = rows.map((row) => ({
            id: row.id,
            action: row.action,
            listingId: row.listing_id,
            adminId: row.admin_id,
            adminUsername: row.admin_username,
            previousData: row.previous_data ? JSON.parse(row.previous_data) : undefined,
            newData: row.new_data ? JSON.parse(row.new_data) : undefined,
            reason: row.reason,
            details: row.reason,
            timestamp: new Date(row.timestamp),
          }));
          
          resolve({ logs, total });
        }
      );
    });
  });
}
