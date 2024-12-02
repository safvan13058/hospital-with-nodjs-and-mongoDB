const express = require('express');
const reception = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const {Signin,bookings,Doctor}=require('./models/models.js')


reception.use(express.json());
reception.use(express.urlencoded({ extended: true }));

// ---------------------------------------------
// Route: Create Booking
reception.post('/booking', async (req, res) => {
    const { name, phone, Doctor: doctor, Age, Place, gender } = req.body;

    try {
        // Check if a booking already exists for the phone number
        const existingBooking = await Booking.findOne({ Phone: phone });
        if (existingBooking) {
            return res.status(400).send('You are already appointed.');
        }

        // Get the maximum token value from the bookings collection
        const lastBooking = await Booking.findOne().sort({ Token: -1 });
        const Token = lastBooking ? lastBooking.Token + 1 : 100; // Default token starts at 100

        // Create a new booking
        const newBooking = new Booking({ Name: name, Phone: phone, DoctorName: doctor, Age, Place, gender, Token });
        await newBooking.save();

        res.send(`Your booking is confirmed. Your token number is: ${Token}`);
    } catch (error) {
        console.error('Booking failed:', error);
        res.status(500).send('Booking failed.');
    }
});

// ---------------------------------------------
// Route: Delete Booking by ID
reception.delete('/deletebooking/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBooking = await Booking.findByIdAndDelete(id);
        if (!deletedBooking) {
            return res.status(404).send('Booking not found.');
        }
        res.send('Booking deleted successfully.');
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).send('Error deleting booking.');
    }
});

// ---------------------------------------------

reception.get('/displaydoc', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.json(doctors);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).send('Error displaying doctors.');
    }
});

// ------------------------------z---------------

reception.get('/peric/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).send('No booking found.');
        }

        const { _id, Name: name, Age, Place: place, DoctorName: doctorName, gender } = booking;

        
        const pdfPath = path.join(__dirname, 'report', `prescription${_id}.pdf`);

        async function generatePrescription() {
           
            let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

            const date = new Date().toLocaleDateString();

            html = html
                .replace('{{patientName}}', name)
                .replace('{{Age}}', Age)
                .replace('{{date}}', date)
                .replace('{{place}}', place)
                .replace('{{gender}}', gender)
                .replace('{{doctor}}', doctorName);

          
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setContent(html);
            await page.pdf({ path: pdfPath, format: 'A4' });

            await browser.close();
            console.log('Prescription PDF generated:', pdfPath);
        }

       
        await generatePrescription();

    
        const pdfUrl = `/reception/prescriptions/prescription${_id}.pdf`;
        res.json({
            message: 'Prescription generated successfully',
            downloadUrl: pdfUrl,
            printUrl: pdfUrl,
        });
    } catch (error) {
        console.error('Error generating prescription:', error);
        res.status(500).send('Error generating the prescription.');
    }
});

// ---------------------------------------------

reception.get('/peric2/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).send('No booking found.');
        }

        const { _id, Name: name, Age, Place: place, DoctorName: doctorName, gender } = booking;

        const pdfPath = path.join(__dirname, 'report', `prescription${_id}.pdf`);

        async function generatePrescription() {
            let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
            const absoluteLogoPath = path.join(__dirname, 'logo', 'logo.jpg');
            const encodedLogoPath = `file://${absoluteLogoPath.replace(/\\/g, '/')}`;

            const date = new Date().toLocaleDateString();

            html = html
                .replace('{{patientName}}', name)
                .replace('{{Age}}', Age)
                .replace('{{date}}', date)
                .replace('{{place}}', place)
                .replace('{{gender}}', gender)
                .replace('{{doctor}}', doctorName)
                .replace('{{logo}}', encodedLogoPath);

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.setContent(html);
            await page.pdf({ path: pdfPath, format: 'A4' });

            await browser.close();
            console.log('Prescription PDF generated:', pdfPath);
        }

        await generatePrescription();

        res.json({
            message: 'Prescription generated successfully',
            downloadUrl: `/reception/prescriptions/prescription${_id}.pdf`,
            printUrl: `/reception/prescriptions/prescription${_id}.pdf`,
        });
    } catch (error) {
        console.error('Error generating prescription:', error);
        res.status(500).send('Error generating the prescription.');
    }
});


reception.use('/prescriptions', express.static(path.join(__dirname, 'report')));

// ---------------------------------------------
module.exports = reception;
