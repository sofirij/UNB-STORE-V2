const displayNameInput = document.getElementById("display-name");
const usernameInput = document.getElementById("username");
const firstPasswordInput = document.getElementById("first-password");
const secondPasswordInput = document.getElementById("second-password");
const submitForm = document.getElementById("register-form");
const submitButton = document.getElementById("submit");
const toggleFirstPassword = document.getElementById("toggle-first-password");
const toggleSecondPassword = document.getElementById("toggle-second-password");

function validateMatch(firstPassword, secondPassword) 
{
    if (firstPassword !== secondPassword)
    {
        return false;
    }
    return true;
}

function validateAllInput() {
    let invalids = [];
    const requirements = 7;
    invalids = validateUsername(usernameInput.value);
    invalids = invalids.concat(validatePassword(firstPasswordInput.value)); 

    //reset all checks to valid
    for (let i = 1; i <= requirements; i++)
    {
        document.getElementById(`check${i}`).className = "checkmark valid";
    }

    //show feedback based on the list of checks that failed
    for (const i of invalids)
    {
        document.getElementById(`check${i}`).className = "checkmark invalid";
    }

    if (invalids.length === 0)
    {
        if (validateMatch(firstPasswordInput.value, secondPasswordInput.value))
        {
            submitButton.disabled = false;
        }
        else
        {
            submitButton.disabled = true;
        }
    }
    else
    {
        submitButton.disabled = true;
    }
}

function registerUser(username, password, displayName) {
    fetch("/registerUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password,
            displayName: displayName
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.successful) {
            loginUser(username, password);
        }
        else { 
            alert("Username is already in use");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Registration failed try again later.");
    });
}

function loginUser(username, password) {
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.successful) {
            window.location.replace("/");
        }
        else {
            alert("Username or password is incorrect!");
        }
    })
    .catch(error => {
        console.error("Error:", error)
        alert("Login failed try again later");
    });
}

function checkUsername(e) {
    e.preventDefault();
    console.log("It submitted");

    const username = document.getElementById("username").value;
    const password = document.getElementById("first-password").value;
    const displayName = document.getElementById("display-name").value;

    registerUser(username, password, displayName);
}

togglePasswordVisibility(firstPasswordInput, toggleFirstPassword);
togglePasswordVisibility(secondPasswordInput, toggleSecondPassword);

usernameInput.addEventListener('input', validateAllInput);
firstPasswordInput.addEventListener('input', validateAllInput);
secondPasswordInput.addEventListener('input', validateAllInput);
submitForm.addEventListener('submit', checkUsername);












