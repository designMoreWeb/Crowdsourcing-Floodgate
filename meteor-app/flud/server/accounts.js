// Function used for validating that new passwords
function validateNewPassword(newPassword, newPasswordConfirm) {
    if (!newPassword || typeof newPassword !== 'string' || !newPasswordConfirm || typeof newPasswordConfirm !== 'string') {
        throw new Meteor.Error('InvalidArgument', 'Please enter the desired password twice.');
    } else if (newPassword !== newPasswordConfirm) {
        throw new Meteor.Error('PasswordsNotMatched', 'Passwords do not match.');
    }

    // Test that new password is at least 6 characters long and contains at least 1 letter and 1 number
    if (newPassword.length >= 6 && /^([a-zA-Z0-9\-\_&]+)$/.test(newPassword) && /\d/.test(newPassword) && /[A-Z]/i.test(newPassword)) {
        return true;
    } else {
        // New password requirements failed: display error message
        throw new Meteor.Error('PasswordRequirementsNotMet', 'Password must be at least 6 characters and contain at least 1 letter and 1 number.');
    }
}

Meteor.methods({
    createAccount: function (data) {
        try {
            check(data, {
                email: String,
                password: String,
                confirmPassword: String
            });
        } catch (e) {
            throw new Meteor.Error('RequiredFieldsMissing', 'Please fill out all required fields.');
        }

        validateNewPassword(data.password, data.confirmPassword);

        if (Meteor.users.find({ 'emails.address': data.email }).count()) {
            throw new Meteor.Error('EmailInUse', 'That email address is already registered to another account.');
        }

        Accounts.createUser({ email: data.email, password: data.password });

        return true;
    },
    toggleFavorite: function(placeId, formattedAddress) {
        let user = Meteor.users.findOne({_id: this.userId});

        if (!user) {
            throw new Meteor.Error('Unauthorized', 'Please log in first.');
        }

        try {
            check(placeId, String);
            check(formattedAddress, String);
        } catch (e) {
            throw new Meteor.Error('InvalidArgument', 'Invalid Argument.');
        }

        if (!user.favorites) {
            // Favorites not set yet, so set it and set the location as a favorite
            Meteor.users.update({_id: this.userId}, { $set: { 
                favorites: [
                    {
                        placeId: placeId, 
                        formattedAddress: formattedAddress
                    }
                ]
            }});

        } else {
            let isFavorite = user.favorites.filter(function(fav) { 
                return fav.placeId === placeId;
            });

            if (isFavorite.length) {
                // Location is already set as favorite so toggle it off
                Meteor.users.update({_id: this.userId}, { $pull: { favorites: { placeId: placeId } } });

            } else {
                // Location is not set as favorite so toggle it on
                Meteor.users.update({_id: this.userId}, { $push: { favorites: {
                    placeId: placeId, 
                    formattedAddress: formattedAddress
                }}});
            }
        } 
    }
    /*
    sendResetPasswordEmail: function(userEmail, testMode) {
        var user = Meteor.users.findOne({'emails.address': userEmail});

        if (!user) {
            throw new Meteor.Error('InvalidEmailAddress', 'Invalid email address.');
        }

        var now = new Date();
        var lowerBound = new Date(now - 30 * 60000);    // 30 minutes ago

        if (user.passwordResetTime && user.passwordResetTime >= lowerBound) {
            var diff = user.passwordResetTime.getTime() - lowerBound.getTime();
            diff = Math.round(diff / 60000);

            throw new Meteor.Error('ResetTokenExists', `A reset password email has already been sent to this address. Please check your inbox or try again in ${diff} min.`);
        }

        var resetToken = Random.id(),
            resetUrl = Meteor.absoluteUrl(`recover-password/${resetToken}`);

        var resetEmailHtml = `Hello ${user.Name}, <br/>` +
            `Please click the following link to reset your password: <br/>${resetUrl}`;

        var resetEmailText = `Hello ${user.Name}, \n` +
            `Please click the following link to reset your password: \n${resetUrl}`;

        var sendObj = {
            'to': userEmail,
            'from': 'Sibyl Accounts <no-reply@mails.sibylsurveys.com>',
            'html': resetEmailHtml,
            'text': resetEmailText,
            'subject': 'Password Reset'
        };

        if (!testMode) {
            var NigerianPrinceGun = new Mailgun({
                apiKey: 'key-986da0dc7176f4c32103e6f470b7ac4e',
                domain: 'signetri.com'
            });

            NigerianPrinceGun.send(sendObj);
        }

        var fut = new Future();
        var bcrypt = require('bcrypt');

        bcrypt.hash(resetToken, 10, function(err, hashToken) {
            fut.return(hashToken);
        });

        var hashToken = fut.wait();

        Meteor.users.update({_id: user._id}, {$set: {passwordResetToken: hashToken, passwordResetTime: new Date()}});

        if (testMode) {
            return sendObj;
        }
    },
    resetUserPassword: function(resetToken, userEmail, newPassword, newPasswordConfirm) {
        // Find user with userEmail where passwordResetToken and passwordResetTime exist
        var user = Meteor.users.findOne({'emails.address': userEmail, passwordResetToken: {$exists: true}, passwordResetTime: {$exists: true}});

        if (!user) {
            throw new Meteor.Error('InvalidEmailAddress', 'Invalid email address.');
        }

        var now = new Date();
        var lowerBound = new Date(now - 30 * 60000);    // 30 minutes ago

        // Check if token has expired
        if (user.passwordResetTime < lowerBound) {
            Meteor.users.update({_id: user._id}, {$unset: {passwordResetToken: '', passwordResetTime: ''}});
            throw new Meteor.Error('ResetTokenExpired', 'The password reset token has expired.');
        }

        var fut = new Future();
        var bcrypt = require('bcrypt');

        // Check if resetToken is valid
        bcrypt.compare(resetToken, user.passwordResetToken, function(err, res) {
            fut.return(res);
        });

        var valid = fut.wait();

        if (!valid) {
            throw new Meteor.Error('InvalidResetToken', 'Invalid password reset token.');
        }

        // Validate the new password
        if (validateNewPassword(newPassword, newPasswordConfirm)) {
            Accounts.setPassword(user._id, newPassword, true);

            Meteor.users.update({_id: user._id}, {$unset: {passwordResetToken: '', passwordResetTime: ''}});
        }
    }
    */
});