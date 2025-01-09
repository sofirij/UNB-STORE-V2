Recreation of the original UNB STORE but modified for learning the web development framework.
Still in development. Focus on efficiency and better code design.
Note: All environment variables are deliberately made public for development. In production it will be secure.

# Database schema for the users
    id - INT
    username - TEXT
    password_hash - TEXT
    created_at - CURRENT TIMESTAMP
    updated_at - CURRENT TIMESTAMP
    is_active - INT //there is no boolean datatype (1 represents true and 0 represents false)
    is_admin - INT

# Creation of the login and register page
    There is a nav bar at the top that provides 'register' and 'log in' options at the most right along with a 'unbstore' at the most left.
    The 'unbstore' should take you to the homepage provided you are logged in
    The 'register' and 'login' should take you to their respective pages

    ## Specifications for the register page
        You provide your 'username', 'first password' and 'second password'.
        You are not allowed to submit the information until it has met the listed out requirements.
        When requirements are meet and the information is submitted it will be validated with the users table that the username does not already exist.
        If the username already exists feedback will the given to the user without reloading the page otherwise they are taken to the index page.

        ### Specifications for the input parameters
            #### Specification for the username
                Only letters and numbers are allowed
                It should have a min of 12 characters
            
            ##### Specification for the password
                At least one uppercase
                At least one lowercase
                At least one digit
                At least one special character
                No spaces allowed
                Min of 12 characters
                The 'first password' should match the 'second password'

    ## Specifications for the login page
        You provide your already registered 'username' and 'password'
        If the information is not valid feedback will be given to the user without reloading the page and you are to re-enter the information else you are logged in and taken to the homepage
