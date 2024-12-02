const express = require('express');
const doctor = express.Router();
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const {Signin,bookings}=require('./models/models.js')

// -------------------------------


doctor.get('/booking', async (req, res) => {
    if (!req.session.login) {
        return res.status(401).send('Session not available');
    }

    const { user } = req.session.login; 
    try {
        
        const results = await bookings.find({ Doctor: user });
        if (results.length === 0) {
            return res.status(404).send('No bookings found for this doctor.');
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).send('Error fetching bookings.');
    }
});        
       

// -------------------------------------------------


doctor.delete('/deletebooking/:id', async (req, res) => {
    const { id } = req.params;

    try {
        
        const deletedBooking = await bookings.findByIdAndDelete(id);

        if (!deletedBooking) {
            return res.status(404).send('Booking not found or already deleted.');
        }

        res.send('Booking deleted successfully.');
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.status(500).send('Error deleting booking.');
    }
});

// -------------------------------------------------
doctor.get('/peric2/:id', async (req, res) => {
    const { id } = req.params;

    try {
      
        const booking = await bookings.findById(id);

        if (!booking) {
            return res.status(404).send('No booking found.');
        }

        const { _id: ids, Name: name, Age, Place: place, Doctor: doctorName, Gender: gender } = booking;

        const pdfPath = path.join(__dirname, 'report', `prescription${ids}.pdf`);

      
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
                .replace('{{doctors}}', doctorName)
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
            downloadUrl: `/doctor/prescriptions/prescription${ids}.pdf`, 
            printUrl: `/doctor/prescriptions/prescription${ids}.pdf`,
        });
    } catch (error) {
        console.error('Error generating prescription:', error);
        res.status(500).send('Error generating the prescription.');
    }
});

// ------------------------------------------------------

doctor.use('/prescriptions', express.static(path.join(__dirname, 'report')));

module.exports = doctor;
