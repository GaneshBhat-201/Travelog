const Listing=require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient= mbxGeocoding({accessToken: mapToken});

module.exports.index=async(req,res)=>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");   
};

module.exports.showListing =async(req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id).populate({path:"reviews", populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    //console.log(res.locals.currUser);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
    let response=await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
      })
        .send();

    let url=req.file.path;
    let filename=req.file.filename; 
    let {title,description,price,location,country}= req.body;
    let newListing= new Listing({title,description,price,location,country,owner:req.user._id});

    newListing.image={url,filename};
    newListing.geometry=response.body.features[0].geometry;

    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    let orgImg=listing.image.url;
    orgImg= orgImg.replace("/upload","/upload/w_250");

    res.render("listings/edit.ejs",{listing,orgImg});
};

module.exports.updateListing=async (req,res)=>{
    let response=await geocodingClient.forwardGeocode({
        query: req.body.location,
        limit: 1
      })
        .send();

    let {id}=req.params;
    let {title,description,price,location,country}=req.body;
    let listing= await Listing.findByIdAndUpdate(id, {title,description,price,country,location});

    listing.geometry=response.body.features[0].geometry;
    await listing.save();

    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename; 
        listing.image={url,filename};
        await listing.save();
    }
     

    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
};

module.exports.searchListing= async(req,res)=>{
    let {search} = req.body;
    let listing=await Listing.find({title:search});
    if(listing.length!=0){
        return res.redirect(`/listings/${listing[0]._id}`);
    }
    req.flash("error","Search Invalid");
    res.redirect("/listings");
};