const mongoose = require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");

main()
    .then(()=>{
        console.log("connected to DB");
    })
    .catch((err) =>{
        console.log(err);
    });

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/travelog');
}

const initDB= async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=> ({...obj, owner:'65f2ee80a8c1cf9cc826742d'}));
    await Listing.insertMany(initData.data);
    console.log("insertion successful");
}

initDB();