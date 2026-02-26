const express = require('express');
const { PrismaClient } = require('./prisma/generated/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Medical API is running' });
});

app.post('/api/appointments', async (req, res) => {
    const { dateTime, status, notes, patientId, doctorId } = req.body;

    try {
        const newAppointment = await prisma.appointment.create({
            data: {
                dateTime: new Date(dateTime),
                status: status || 'SCHEDULED',
                notes: notes,
                patient: {
                    connect: { id: patientId }
                },
                doctor: {
                    connect: { id: doctorId }
                }
            },
            include: {
                doctor: true,
                patient: true
            }
        });

        res.status(201).json({
            message: 'Appointment created successfully',
            appointment: newAppointment
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Conflict: The doctor already has an appointment at this time.'
            });
        }

        console.error('Error creating the appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});