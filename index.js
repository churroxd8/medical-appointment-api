const express = require('express');
const { PrismaClient } = require('./prisma/generated/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = decodedUser;
        next();
    });
}

// TODO: local testing only. Change later
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_portfolio_key_change_me_later';

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

app.get('/api/doctors/:id/appointments', authenticateToken, async (req, res) => {
    const { id } = req.params;

    if (req.user.doctorId !== id) {
        return res.status(403).json({ error: 'Forbidden: You can only view your own schedule' });
    }

    try {
        const doctorSchedule = await prisma.doctor.findUnique({
            where: {id: id},
            include: {
                appointments: {
                    include: { patient: true },
                    orderBy: { dateTime: 'asc' }
                }
            }
        });

        if (!doctorSchedule) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        delete doctorSchedule.password;
        res.status(200).json(doctorSchedule);
    } catch (error) {
        console.error('Error fetching schedule;', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { email: email }
        });

        if (!doctor) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, doctor.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { doctorId: doctor.id, email: doctor.email },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token: token,
            doctor: {
                id: doctor.id,
                firstName: doctor.firstsName,
                lastName: doctor.lastName,
                email: doctor.email
            }
        });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});