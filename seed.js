const { PrismaClient } = require('./prisma/generated/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');


const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  const plainTextPassword = 'SecurePassword123!';
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10); // 10 salt rounds

  
  const doctor = await prisma.doctor.create({
    data: {
      firstName: 'Jane',
      lastName: 'Doe',
      specialty: 'Cardiology',
      email: 'jane.doe@example.com',
      password: hashedPassword,
    },
  });
  console.log(`Created Doctor: Dr. ${doctor.lastName} with hashed password`);

  
  const patient = await prisma.patient.create({
    data: {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '555-0198',
    },
  });
  console.log(`Created Patient: ${patient.firstName} ${patient.lastName}`);

  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment = await prisma.appointment.create({
    data: {
      dateTime: tomorrow,
      status: 'SCHEDULED', 
      notes: 'Routine heart checkup',
      doctorId: doctor.id,
      patientId: patient.id,
    },
  });
  console.log('Created Appointment successfully.');

  console.log('✅ Database seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Safely close the Prisma connection and the PostgreSQL pool
    await prisma.$disconnect();
    await pool.end();
  });