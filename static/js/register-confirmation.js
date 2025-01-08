let isValid = true;
const usernameInput = document.getElementById("username");
const firstPasswordInput = document.getElementById("first-password");
const secondPasswordInput = document.getElementById("second-password");
const submitForm = document.getElementById("register-form");
const submitButton = document.getElementById("submit");

function validateMatch(firstPassword, secondPassword) {
    if (firstPassword !== secondPassword)
    {
        isValid = false;
    }
}

function validateUsername(username) {
    const minLength = 12;
    const pattern = /^[A-Za-z0-9]+$/;
    
    if (!pattern.test(username))
    {
        isValid = false;
        document.getElementById('check1').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check1').className = "checkmark valid"
    }

    if (username.length < minLength)
    {
        isValid = false;
        document.getElementById('check2').className = "checkmark invalid";
    }
    else 
    {
        document.getElementById('check2').className = "checkmark valid";
    }
}

function validatePassword(password) {
    const minLength = 12;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const noSpacesOrSpecialChars = /^[A-Za-z0-9]+$/.test(password);

    if (!hasUpperCase)
    {
        isValid = false;
        document.getElementById('check3').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check3').className = "checkmark valid";
    }

    if (!hasLowerCase)
    {
        isValid = false;
        document.getElementById('check4').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check4').className = "checkmark valid";
    }

    if (!hasDigit)
    {
        isValid = false;
        document.getElementById('check5').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check5').className = "checkmark valid";
    }

    if (!noSpacesOrSpecialChars)
    {
        isValid = false;
        document.getElementById('check6').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check6').className = "checkmark valid";
    }

    if (password.length < minLength)
    {
        isValid = false;
        document.getElementById('check7').className = "checkmark invalid";
    }
    else
    {
        document.getElementById('check7').className = "checkmark valid";
    }

}

function validateAllInput() {
    isValid = true;

    validateUsername(usernameInput.value);
    validatePassword(firstPasswordInput.value);
    validateMatch(firstPasswordInput.value, secondPasswordInput.value);

    if (isValid)
    {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = "#f4f4f4";
    }
}

function checkUsername(e) {
    e.preventDefault();
    console.log("It submitted");

    let username = document.getElementById("username").value;
    let password = document.getElementById("first-password").value;

    fetch("/checkRegisterUsername", {
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
        if (data.exists) {
            alert("Username is already in use");
        }
        else {
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
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong. Please try again later");
    });
}


usernameInput.addEventListener('input', validateAllInput);
firstPasswordInput.addEventListener('input', validateAllInput);
secondPasswordInput.addEventListener('input', validateAllInput);

submitForm.addEventListener('submit', checkUsername);











