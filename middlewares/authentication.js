
const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) {
            return next(); // Proceed if the cookie doesn't exist
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload; // Attach the user payload to the request object
        } catch (error) {
            console.error("Error validating token:", error); // Log the error for debugging
        }

     return next(); // Continue to the next middleware
    };
}

module.exports = {
    checkForAuthenticationCookie,
};
