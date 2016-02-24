/**
 * This function as it is only allows logged in users, or admins to create,update or delete documents
 * @param newDoc
 * @param oldDoc
 * @param userCtx
 * @param secObj
 */
function(newDoc, oldDoc, userCtx, secObj) {
    var IS_DB_ADMIN = false,
        IS_LOGGED_IN_USER = false,
        IS_DEMO_ROLE = false;

    secObj.admins = secObj.admins || {};
    secObj.admins.names = secObj.admins.names || [];
    secObj.admins.roles = secObj.admins.roles || [];

    if (userCtx.roles.indexOf('_admin') !== -1) {
        IS_DB_ADMIN = true;
    }

    if (secObj.admins.names.indexOf(userCtx.name) !== -1) {
        IS_DB_ADMIN = true;
    }

    for (var i = 0; i < userCtx.roles; i++) {
        if (secObj.admins.roles.indexOf(userCtx.roles[i]) !== -1) {
            IS_DB_ADMIN = true;
        }
    }

    if (userCtx.name !== null) {
        IS_LOGGED_IN_USER = true;

        // Check if this user has the demo role.
        IS_DEMO_ROLE = (userCtx.roles.indexOf("demo") !== -1);
    }

    if (IS_DB_ADMIN || IS_LOGGED_IN_USER) {
        if (IS_DEMO_ROLE) {
            throw({'forbidden': 'Demo users cannot alter documents'});
        } else {
            log('User : ' + userCtx.name + ' changing document: ' +  newDoc._id);
        }
    } else {
        throw({'forbidden':'Only admins and users can alter documents'});
    }
}
