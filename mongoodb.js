const mongoose=require('mongoose');
mongoose.connect('mongodb+srv://safvan:safvan13058@safvan.v5qoz.mongodb.net/safvan?retryWrites=true&w=majority&appName=safvan')
.then(()=>console.log('Connected to MongoDB'))
.catch((err) => console.error('could not connect to MongoDB',err));

//define the student schema and model
// const signin =new mongoose.Schema({
//     Name:{type:String,required:true},
//     Phone:{type:String,required:true},
//     Email:{type:String,required:true},
//     Username:{type:String,required:true},
//     Password:{type:String,required:true},

// });

// const Signin=mongoose.model('Singin',signin);


// module.exports=Signin; 