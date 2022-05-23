const mongoose= require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const crypto = require('crypto');


 const userSchema = new mongoose.Schema({
     name:{
       type:String,
       required:[true,"Please Enter Your Name:"],
       maxlength:[30,"Name Cannot exceed 30 characters"],
       minlength:[4,"Name Should have more than 4 Characters"],
    },
    
    email:{
        type:String,
        required:[true,"Please Enter Your Email:"],
        unique:true,
        validate:[validator.isEmail,"Please Enter valid email"]
    },
    
    password:{
        
        type:String,
        required:[true,"Please Enter Your Password:"],
        minlength:[6,"Password Should have more than 6 Characters"],
        select:false
     },

     avatar:{
            public_id: {
              type: String,
              required: true,
            },
      
            url: {
              type: String,
              required: true,
            },
     },

     role:{
         type:String,
         default:"User",
     },

     resetPasswordToken:String,
     resetPasswordExpire:Date,
 });

 userSchema.pre("save",async function(next){
  
      if(!this.isModified("password")){
        next();
      }

      this.password =await bcrypt.hash(this.password,10)
 });

 //JWT Token
 userSchema.methods.getJWTToken= function(){
   return jwt.sign({id:this._id},process.env.JWT_SECRET,{
     expiresIn:process.env.JWT_EXPIRE,  
   });
 };


 //Compare password...
 userSchema.methods.comparePassword=async function(enteredPassword){

    return await bcrypt.compare(enteredPassword,this.password)

 }

 //Genearting  password  Reset Token

 userSchema.methods.getResetPasswordToken = function(){

  //generate a token

  const resetToken=crypto.randomBytes(20).toString('hex');

  //Hashing and adding to user Schema
   this.resetPasswordToken = crypto
   .createHash("sha256")
   .update(resetToken)
   .digest('hex');

   this.resetPasswordExpire = Date.now() + 15 * 60 *1000; 

    return resetToken;


 }

module.exports =  mongoose.model("User",userSchema); 