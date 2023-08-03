//import statements 

const express = require("express");
const bodyParser = require("body-parser");
var multer = require('multer');
const mongoose = require("mongoose");
var fs = require('fs');
var path = require('path');
require('dotenv/config');
const crypto=require("crypto");
const nodemailer = require('nodemailer');
var pn=1;


const algorithm='aes-256-cbc';
const key="adnan-tech-programming-computers";
const iv=crypto.randomBytes(16);

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

//mailsending emails........
 let mailTransporter= nodemailer.createTransport({

  service:"gmail",
  auth:{
    user:"unikon2023@gmail.com",
    pass:"LAPS@123"
  }
 });


 //for image uploading..............
var storage = multer.diskStorage({
    destination:"./public/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()+path.extname(file.originalname));
    }
});
 
var upload = multer({ storage: storage }).single("img");

//connect mongodb....
mongoose.connect("mongodb://localhost:27017/project_no_01_db", { useNewUrlParser: true });

// define schema.....
const usertable_schema ={
  name: String,
  email:String,
  password:String,
  phone_no:Number,
  user_name:String
};
const contact_schema ={
  name: String,
  email:String,
  subject:String,
  phone_no:Number,
  messages:String
};
const item_details_schema = {
  name_of_item: String,
  category_of_item: String,
  price_of_item: Number,
  address: String,
  img:String,
  description: String,
  contact_detail: String,
  city:String,
  pin:Number,
  state:String,
  seller_name: { type: String, required: true }
};
//create tables.
const item_details = mongoose.model("item_details", item_details_schema);
const user_details = mongoose.model("user_details",usertable_schema);
const contact_details = mongoose.model("contact_details", contact_schema);

app.get("/",function(req,res){
  res.render("homepage",{message:""});
})

app.get("/login",function(req,res){
  pn=1;
  res.render("box",{message:""});
})
app.get("/profile",function(req,res){
  res.render("editprofile",{message:""});
})

app.get("/profile/itemdetails",function(req,res){
  res.render("itemdetail",{message:""});
})
app.post("/profile/itemdetails",upload,function(req,res){

        const iname= req.body.itemname;
        const category=req.body.category;
        const contact=req.body.contact;
        const sellername=req.body.seller;
        const address=req.body.address;
        const city=req.body.city.toLowerCase();
        const pin=req.body.pin;
        const state=req.body.state;
        const price=req.body.price;
        const desc=req.body.desc;
        const img=req.file.filename;
        const item1 = new item_details({
     
          name_of_item: iname,
          category_of_item: category,
          price_of_item: price,
          address: address,
          img: img,
          description: desc,
          contact_detail: contact,
          city:city,
          pin:pin,
          state:state,
          seller_name:sellername,
        });
        async function saveItem() {
    
          try {
            await item1.save();
            console.log("Item saved successfully!");
            res.render("itemdetail",{message:"item save succesfully !!"});
           
          } catch (error) {
            console.log(error);
            res.render("itemdetail",{message:"error try again!!"});
          }
        }
        saveItem();
        
})
app.post("/profile",function(req,res){
     const upname=req.body.name;
     const upemail=req.body.email;
     let password=req.body.password;
     const phonenumber=req.body.phoneno;

     const cipher=crypto.createCipheriv(algorithm,key,iv);
     let encryptedData= cipher.update(password,"utf-8","hex");
     encryptedData+=cipher.final("hex");

     const base64data=Buffer.from(iv,'binary').toString('base64');
      password=encryptedData;
     async function updatedata(){ 
     const result =await user_details.findOneAndUpdate({email:upemail},{
      $set :{
        user_name:upname,
        password: password,
        phone_no:phonenumber,
      }
     },{
      new: true,
      useFindAndModify: false
     })

}
updatedata();
res.render("editprofile",{message:"data has been modified!"});
})

app.post("/login",function(req,res){
     const username=req.body.uname;
     let password=req.body.psw;
     const cipher=crypto.createCipheriv(algorithm,key,iv);
     let encryptedData= cipher.update(password,"utf-8","hex");
     encryptedData+=cipher.final("hex");
     
     const base64data=Buffer.from(iv,'binary').toString('base64');
     password=encryptedData;
      pn=1;
     user_details.findOne({ user_name: username,password: password }).then(async(data) => {
      if (data) {
        const results = await item_details.find({});
        const cnt = await item_details.countDocuments({});
        res.render("afterloginpage", { itemlist: results,pagenumber:pn,count:cnt}); 
      } else {
        res.render("box",{message:"please enter valid username or password !!"});
      }
    }).catch((err) => {
      console.error(err);
    });   
    
})
app.post("/productdescription",(req,res)=>{
    
  const img = req.body.img;
  const product_name= req.body.name_of_item;
  const product_price= req.body.price_of_item;
  const product_address = req.body.address;
   
    async function searchitem() {
      const results = await item_details.find({name_of_item:product_name,price_of_item:product_price,address:product_address});
     
      res.render("product_desc", {ProductName:results,img:img}); 
     }

     searchitem();
     
   
})
app.post("/searchbycity",function(req,res){
    const city=req.body.city.toLowerCase();
    cnt=0;
    async function searchitem() {
     const results = await item_details.find({city:city});
     const cnt = await item_details.countDocuments({});
     res.render("afterloginpage", { itemlist: results,pagenumber:pn,count:cnt}); 
    }
    searchitem();
})
app.post("/contact",function(req,res){
     const name=req.body.name;
     const email=req.body.email;
     const phone_no=req.body.phonenumber;
     const sub= req.body.subject;
     const mess=req.body.subject; 
     const item1 = new contact_details({
     
      name: name,
      email: email,
      subject:sub,
      phone_no: phone_no,
      messages: mess
    });
    async function saveItem() {

      try {
        await item1.save();
        console.log("Item saved successfully!");
        res.render("homepage",{message:"feedback send successfully!!"});
       
      } catch (error) {
        console.log(error);
        res.render("homepage",{message:"error try again!!"});
      }
    }
    saveItem();
})
app.get("/readmore",function(req,res){
    res.render("readmore");
});
app.post("/signup",function(req,res){
 
     
     const username=req.body.username;
     const email=req.body.email;
     let password=req.body.password; 
   
     const cipher=crypto.createCipheriv(algorithm,key,iv);
     let encryptedData= cipher.update(password,"utf-8","hex");
     encryptedData+=cipher.final("hex");
     
     const base64data=Buffer.from(iv,'binary').toString('base64');
     password=encryptedData;


     // sending mail
     let details={
        from:"unikon2023@gmail.com",
        to : "2021pgcaca094@nitjsr.ac.in",
        subject:"signing to unikon",
        text:"thanks for becoming the member of unikon!! "
     }
      mailTransporter.sendMail(details,(err)=>{
        if(err){
          console.log("error in sending mail!!");
        }
        else{
          console.log("emial send successfully!!");
        }
      });
     const item1 = new user_details({
     
      email: email,
      password: password,
      user_name: username
    });
    async function saveItem() {

      try {
        await item1.save();
        console.log("Item saved successfully!");
        res.render("box",{message:"signin succesfully kindly login !!"});
       
      } catch (error) {
        console.log(error);
        res.render("box",{message:"error try again!!"});
      }
    }
    saveItem();
})



app.post("/next",function(req,res){
      pn++;
      async function nextelement() {

        try {
          const results = await item_details.find({});
          const cnt = await item_details.countDocuments({});
        res.render("afterloginpage", { itemlist: results,pagenumber:pn,count:cnt}); 
        }
        catch{
          console.log("error");
        }
      }
    nextelement();
})


app.listen(4000,function(){
  console.log("server started at port 000");
})
