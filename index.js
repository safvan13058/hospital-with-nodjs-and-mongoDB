const express=require('express')
const app=express()
const  database=require('./mongoodb');
const nodemailer = require('nodemailer');
const session = require('express-session');
app.use(express.json());

const {Signin,bookings}=require('./models/models.js')

// ------------------admin page-----------------------
const admin=require('./admin.js');
app.use('/admin',admin);

// ------------doc page----------------------
const doctor=require('./doctor.js');
app.use('/doctor',doctor);
// ------------------

const reception=require('./reception.js');
app.use('/reception',reception);


app.get('/',(req,res)=>{
    res.send(`<h1>Hello</h1>`);
});
app.use(session({
    secret:"e3b62cf12a2f7bbe1b674619f00bc96faaed93c4aa9e58f30f11b6b12e1dff6b" ,          // Secret key used to sign the session ID cookie
    resave: false,                     // Do not save session if unmodified
    saveUninitialized: false,          // Do not create a session until something is stored
    // cookie: { maxAge: 120000 }          // Session expiration time (in milliseconds, e.g., 60000 = 1 min)
}));


app.post('/signin',async (req, res) => {
    const {  Name,Phone,Username,Password,Email} = req.body; 

    if (!Name || !Phone || !Username || !Password| !Email) {
       res.send( "All fields are required");
    }
    
    const  Singin= await Signin.find({ Username:Username });
    if (Singin.length === 0) {
        console.log(Email)
        const OTP = Math.floor(100000 + Math.random() * 900000);
        console.log(OTP);
    
    
    
        var transport = nodemailer.createTransport({
            service: 'gmail',
            auth:{
               user: 'make13058@gmail.com',
               pass: 'keaj awno ztep vcmu'
            }
         });
         message = {
            from: "make13058@gmail.com",
            to: Email,
            subject: "OTP of your Registration",
            text: `Dear ${Name},Your OTP is ${OTP}`
         }
         transport.sendMail(message, function(err, info) {
            if (err) {
               res.json({message:"Not able to send OTP"});
             }
             else {
                req.session.user = { name: Name, phone:Phone,Username:Username,password:Password,email:Email,otp:OTP};
                console.log("sending otp else")
             }});
            req.session.user = { name: Name, phone:Phone,Username:Username,password:Password,email:Email,otp:OTP};

            console.log("send otp")
            res.json({message:"Check your Email for OTP"});
         }
    else{
        return res.status(404).json({ message: 'Username is already exist' });
    }

    // res.send({ message: "Student registered successfully"});

});
// for validation
app.post('/otp',async(req,res)=>
    {
        const {otp} = req.body; 
    
        // const otps=req.session.user.OTP
        const Name=req.session.user.name
        const Phone=req.session.user.phone
        const Username=req.session.user.Username
        const Password=req.session.user.password
        const Email=req.session.user.email
        const Otp=req.session.user.otp
        
        

        console.log(Otp)
        if (otp==Otp){
            const newStudent = new Signin({
                Name,Email,Phone,Username,Password
            });
            await newStudent.save();
            res.send({ message: "Student registered successfully", student: newStudent });
        }
  
});


app.post('/login',async (req,res)=>{
    if(req.session.login){
        res.send("you are already login")
    }

    else{
    const {user,pass}=req.body
    const  login= await Signin.find({ Username:user ,Password:pass});
    
       if(login.length===0){
        res.send("Username or Password is wrong,Try again");
       }
       else{
       if(login.length!== 0){
           console.log('login ');
           
       
           console.log(login)
           req.session.login={user:user,pass:pass}
           res.send("Login successfully")
      }
}
}});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Failed to log out');
      }
      res.send('Logged out successfully');
    });
  });





  app.post('/booking', async (req, res) => {
    const { name, phone, Doctor,Age,gender,email } = req.body;
     

    const  booking= await bookings.find({Phone:phone});
        
      if (booking.length!==0){
        res.send('Your already Appointed')
        console.log(booking.length!==0)
        console.log('Your already Appointed')
      
      }
      else{
    // console.log(results)
       const lastBooking = await bookings.findOne().sort({ Token: -1 }); // Get the latest booking by Token number
       let Token = 100; // Default token if no bookings exist

       if (lastBooking && lastBooking.Token) {
         Token = lastBooking.Token + 1; // Increment token based on the last booking
         }
        
                // if () {
                //     console.error("Booking failed:", err);
                //     return res.status(500).send('Booking failed');
                // }
                const newbooking = new bookings({
                    Name:name,Email:email,Phone:phone,Age:Age,Doctor:Doctor,Gender:gender,Token
                });
                await newbooking.save();
                res.send(`Your booking is confirmed. Your token number is: ${Token}`);
            }
        });



        app.delete ('/deletebooking/:id', async (req,res)=>{
            console.log(req.params)
            const {id}=req.params;
             console.log(id)
          const dltbook=await bookings.findByIdAndDelete(id)
             
              
                if(!dltbook){
                  res.send("booking not able to delete")
                  
                }
                else{
                  res.send(`delete successfully${dltbook}`)
                }
              
          
            });
          

app.listen(3001)