let isValid = true;
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitForm = document.getElementById("login-form");

function validateAllInput(e) {
    e.preventDefault();

    //check for any invalid input
    let invalids = [];
    const requirements = 7;

    const username = usernameInput.value;
    const password = passwordInput.value;

    invalids = validateUsername(usernameInput.value);
    invalids = invalids.concat(validatePassword(passwordInput.value));

    if (invalids.length == 0)
    {
        loginUser(username, password);
    }
    else
    {
        alert("Username or password is invalid!");
    }
}


submitForm.addEventListener('submit', validateAllInput);

togglePasswordVisibility(passwordInput, document.getElementById("toggle-password"));