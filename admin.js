const express = require('express');
const admin = express.Router();
const {Signin,bookings,Doctor}=require('./models/models.js')

admin.use(express.json());
admin.use(express.urlencoded({ extended: true }));

// -----------------------------------------------

admin.post('/Doctorreg', async (req, res) => {
    const { name, Phone, Email, Catagory, Qualification, Address, Dateofbirth, Username, password } = req.body;
    console.log(name, Phone, Email, Catagory, Qualification, Address, Dateofbirth);

    try {
       
        const existingUser = await Signin.findOne({ Username });
        if (existingUser) {
            return res.status(400).send('The username is already registered.');
        }

       
        const newSignin = new Signin({ Name: name, Phone, Email, Password: password, Username });
        await newSignin.save();

       
        const newDoctor = new Doctor({
            Name: name,
            Phone,
            Email,
            Catagory,
            Qualification,
            Address,
            Dateofbirth,
            Username,
            Password: password,
        });
        const result = await newDoctor.save();

        res.send(`Doctor registered successfully: ${result}`);
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Error during registration.');
    }
});


admin.get('/displaydoc', async (req, res) => {
    try {
        const doctors = await Doctor.find();
        if (doctors.length === 0) {
            return res.send('No doctors found.');
        }
        res.json(doctors);
    } catch (err) {
        console.error('Error fetching doctors:', err);
        res.status(500).send('Error displaying doctors.');
    }
});

// -----------------------------------------------

admin.get('/displaybooking', async (req, res) => {
    try {
        const bookings = await Bookings.find();
        if (bookings.length === 0) {
            return res.send('No bookings found.');
        }
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).send('Error fetching bookings.');
    }
});

// -----------------------------------------------

admin.put('/updatedata/:id', async (req, res) => {
    const { id } = req.params;
    const { name, Phone, Email, Catagory, Qualification, Address, Dateofbirth } = req.body;

    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id,
            { Name: name, Phone, Email, Catagory, Qualification, Address, Dateofbirth },
            { new: true } // Return the updated document
        );

        if (!updatedDoctor) {
            return res.status(404).send('Doctor not found.');
        }
        res.send('Doctor updated successfully.');
    } catch (err) {
        console.error('Error updating doctor:', err);
        res.status(500).send('Error updating doctor.');
    }
});

// -----------------------------------------------

admin.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(id);
        if (!deletedDoctor) { 
            return res.status(404).send('No doctor found.');
        }
        res.send('Doctor deleted successfully.');
    } catch (err) {
        console.error('Error deleting doctor:', err);
        res.status(500).send('Error deleting doctor.');
    }
});

// -------------------------------------------
module.exports = admin;
