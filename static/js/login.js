let isValid = true;
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitForm = document.getElementById("login-form");

function validateUsername(username) 
{
    const minLength = 12;
    const pattern = /^[A-Za-z0-9]+$/;
    
    if (!pattern.test(username))
    {
        isValid = false;
    }

    if (username.length < minLength)
    {
        isValid = false;
    }
}

function validatePassword(password) 
{
    const minLength = 12;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const noSpacesOrSpecialChars = /^[A-Za-z0-9]+$/.test(password);

    if (!hasUpperCase)
    {
        isValid = false;
    }

    if (!hasLowerCase)
    {
        isValid = false;
    }

    if (!hasDigit)
    {
        isValid = false;
    }

    if (!noSpacesOrSpecialChars)
    {
        isValid = false;
    }

    if (password.length < minLength)
    {
        isValid = false;
    }

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

function validateAllInput(e) {
    e.preventDefault();

    isValid = true;

    const username = usernameInput.value;
    const password = passwordInput.value;

    validateUsername(username);
    validatePassword(password);

    if (isValid)
    {
        loginUser(username, password);
    }
    else
    {
        alert("Username or password is incorrect!");
    }
}

submitForm.addEventListener('submit', validateAllInput);