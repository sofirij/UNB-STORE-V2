
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

function togglePasswordVisibility(input, toggle) {
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            input.type = "text";
        } else {
            input.type = "password";
        }
    })
}

function validatePassword(password) {
    //get a list of all checks where there are errors
    let invalids = [];
    const minLength = 12;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const noSpacesOrSpecialChars = /^[A-Za-z0-9]+$/.test(password);

    if (!hasUpperCase)
    {
        invalids.push(3);
    }

    if (!hasLowerCase)
    {
        invalids.push(4);
    }

    if (!hasDigit)
    {
        invalids.push(5);
    }

    if (!noSpacesOrSpecialChars)
    {
        invalids.push(6);
    }

    if (password.length < minLength)
    {
        invalids.push(7);
    }

    return invalids;
}

function validateUsername(username) {
    //get a list of all checks where there are errors
    let invalids = [];
    const minLength = 12;
    const pattern = /^[A-Za-z0-9]+$/;
    
    if (!pattern.test(username))
    {
        invalids.push(1);
    }

    if (username.length < minLength)
    {
        invalids.push(2);
    }

    return invalids;
}