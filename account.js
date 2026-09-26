/*
====================================================
METEUR ONLINE SHOPPING
CUSTOMER ACCOUNT SYSTEM
====================================================
*/

const ACCOUNT_KEY = "meteurAccount";

/*
----------------------------------------------------
GET ACCOUNT
----------------------------------------------------
*/

function getAccount() {

    return JSON.parse(
        localStorage.getItem(ACCOUNT_KEY)
    ) || null;

}


/*
----------------------------------------------------
SAVE ACCOUNT
----------------------------------------------------
*/

function saveAccount(account) {

    localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify(account)
    );

}


/*
----------------------------------------------------
CHECK LOGIN STATUS
----------------------------------------------------
*/

function isLoggedIn() {

    const account = getAccount();

    return account &&
           account.loggedIn === true;

}


/*
----------------------------------------------------
LOG IN
----------------------------------------------------
*/

function loginAccount(email, password) {

    const account = getAccount();

    if (!account) {

        return {
            success: false,
            message: "No customer account was found."
        };

    }

    if (
        account.email !== email ||
        account.password !== password
    ) {

        return {
            success: false,
            message: "Incorrect email or password."
        };

    }

    account.loggedIn = true;

    saveAccount(account);

    return {
        success: true,
        message: "Login successful."
    };

}


/*
----------------------------------------------------
LOG OUT
----------------------------------------------------
*/

function logoutAccount() {

    const account = getAccount();

    if (account) {

        account.loggedIn = false;

        saveAccount(account);

    }

    window.location.href = "login.html";

}


/*
----------------------------------------------------
GET CUSTOMER NAME
----------------------------------------------------
*/

function getCustomerName() {

    const account = getAccount();

    if (!account) {
        return "Customer";
    }

    return (
        account.firstName ||
        "Customer"
    );

}


/*
----------------------------------------------------
GET CUSTOMER EMAIL
----------------------------------------------------
*/

function getCustomerEmail() {

    const account = getAccount();

    if (!account) {
        return "";
    }

    return account.email || "";

}


/*
----------------------------------------------------
PROTECT ACCOUNT PAGES
----------------------------------------------------
*/

function protectAccountPage() {

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

    }

}


/*
----------------------------------------------------
UPDATE ACCOUNT DISPLAY
----------------------------------------------------
*/

function updateAccountDisplay() {

    const account =
        getAccount();

    if (!account) {
        return;
    }


    const nameElements =
        document.querySelectorAll(
            "[data-account-name]"
        );

    nameElements.forEach(
        function(element) {

            element.textContent =
                `${account.firstName || ""} ${account.lastName || ""}`.trim()
                || "Customer";

        }
    );


    const emailElements =
        document.querySelectorAll(
            "[data-account-email]"
        );

    emailElements.forEach(
        function(element) {

            element.textContent =
                account.email || "";

        }
    );

}


/*
----------------------------------------------------
REGISTER CUSTOMER
----------------------------------------------------
*/

function registerAccount(data) {

    const existingAccount =
        getAccount();

    if (existingAccount) {

        return {
            success: false,
            message:
                "A customer account already exists on this device."
        };

    }


    const account = {

        firstName:
            data.firstName,

        lastName:
            data.lastName,

        email:
            data.email,

        phone:
            data.phone,

        password:
            data.password,

        emailVerified:
            false,

        loggedIn:
            false,

        createdAt:
            new Date().toISOString()

    };


    saveAccount(account);


    localStorage.setItem(
        "meteurVerificationEmail",
        data.email
    );


    return {
        success: true,
        message:
            "Account created successfully."
    };

}


/*
----------------------------------------------------
VERIFY EMAIL
----------------------------------------------------
*/

function verifyCustomerEmail() {

    const account =
        getAccount();

    if (!account) {

        return {
            success: false,
            message: "Customer account not found."
        };

    }


    account.emailVerified = true;

    saveAccount(account);


    return {
        success: true,
        message:
            "Email address verified successfully."
    };

}


/*
----------------------------------------------------
CHECK VERIFIED EMAIL
----------------------------------------------------
*/

function isEmailVerified() {

    const account =
        getAccount();

    return !!(
        account &&
        account.emailVerified === true
    );

}


/*
----------------------------------------------------
REQUIRE VERIFIED EMAIL
----------------------------------------------------
*/

function requireVerifiedEmail() {

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

        return false;

    }


    if (!isEmailVerified()) {

        window.location.href =
            "verify-email.html";

        return false;

    }


    return true;

}


/*
----------------------------------------------------
UPDATE CUSTOMER PROFILE
----------------------------------------------------
*/

function updateCustomerProfile(data) {

    const account =
        getAccount();

    if (!account) {

        return {
            success: false,
            message: "Customer account not found."
        };

    }


    account.firstName =
        data.firstName;

    account.lastName =
        data.lastName;

    account.phone =
        data.phone;


    saveAccount(account);


    return {
        success: true,
        message:
            "Customer profile updated successfully."
    };

}


/*
----------------------------------------------------
PASSWORD RESET REQUEST
----------------------------------------------------
*/

function requestPasswordReset(email) {

    const account =
        getAccount();

    if (
        !account ||
        account.email !== email
    ) {

        return {
            success: false,
            message:
                "No customer account was found with that email address."
        };

    }


    localStorage.setItem(
        "meteurPasswordResetEmail",
        email
    );


    return {
        success: true,
        message:
            "Password reset request created."
    };

}


/*
----------------------------------------------------
UPDATE PASSWORD
----------------------------------------------------
*/

function updateCustomerPassword(newPassword) {

    const account =
        getAccount();

    if (!account) {

        return {
            success: false,
            message:
                "Customer account not found."
        };

    }


    account.password =
        newPassword;


    saveAccount(account);


    localStorage.removeItem(
        "meteurPasswordResetEmail"
    );


    return {
        success: true,
        message:
            "Password updated successfully."
    };

}


/*
----------------------------------------------------
ACCOUNT INFORMATION
----------------------------------------------------
*/

function getAccountInformation() {

    const account =
        getAccount();

    if (!account) {
        return null;
    }


    return {

        name:
            `${account.firstName || ""} ${account.lastName || ""}`.trim(),

        email:
            account.email || "",

        phone:
            account.phone || "",

        emailVerified:
            account.emailVerified === true,

        loggedIn:
            account.loggedIn === true,

        createdAt:
            account.createdAt || ""

    };

}
