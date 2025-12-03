import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    bio:{type: String},
    fullname: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    dob: Date,
    location: { type: String },
    
    profileImage: {
        url: String,
        publicId: String
    },
    coverImage: {
        url: String,
        publicId: String
    },
    

    entrepreneurProfile: {
        sector: String
    },
    investorProfile: {
        professionalEmail: String,
        sector: String,
        foundedYear: Number,
        verificationDocument: {
            url: String,
            publicId: String
        }
    },
    startupProfile: {
        professionalEmail: String,
        sector: String,
        foundedYear: Number,
        verificationDocument: {
            url: String,
            publicId: String
        }
    },
    organizationProfile: {
        professionalEmail: String,
        sector: String,
        foundedYear: Number,
        verificationDocument: {
            url: String,
            publicId: String
        }
    },
    universityProfile: {
        universityName: String,
        officialEmail: String
    },
    
    // System
    role: {
        type: String,
        enum: ['entrepreneur', 'investor', 'startup', 'organisation', 'university', 'admin', 'super_admin'],
        required: true
    },
    isVerified: { type: Boolean, default: false },
resetPasswordToken:String,
resetPasswordExpiresAt:Date,
verificationCode:String,
verificationCodeExpireAt:Date,
friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

// Soft delete
deletedAt: {
    type: Date,
    default: null
}
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Middleware: Exclure les utilisateurs supprimés des requêtes par défaut
userSchema.pre(['find', 'findOne', 'findOneAndUpdate', 'updateOne'], function() {
    if (!this.getOptions().includeDeleted) {
        this.where({ deletedAt: null });
    }
});

export default mongoose.model('User', userSchema);