const JWT = require('jsonwebtoken');

const secret = "$Zuzu@ever123"


function creatTokenForUser(user){
    const payload ={
        _id:user._id,
        email:user.email,
        profileImageURL:user.profileImageURL,
        role:user.role,
    };
const token = JWT.sign(payload,secret);
return token;

}


function validateToken(token){
    const payload= JWT.verify(token,secret);
    return payload;
}

module.exports = {
    creatTokenForUser,
    validateToken,
}