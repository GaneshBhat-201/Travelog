const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");

//Listing Validation
module.exports.validateListing= (req,res,next)=>{
    let {error}= listingSchema.validate(req.body);
    //console.log(result);
    if(error){
        throw new ExpressError(400, error);
    }
    else{
        next();
    }
};

//Review Validation
module.exports.validateReview= (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);
    //console.log(result);
    if(error){
        throw new ExpressError(400, error);
    }
    else{
        next();
    }
};

//Authentication
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to create listing");
        req.session.redirectUrl= req.originalUrl;
        return res.redirect("/login"); 
    }  
    next();
};


//Save RedirectUrl
module.exports.saveRedirectUrl= (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let listing = await Listing.findById(id);
    let review= await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
