Recreation of the original UNB STORE but modified for learning the web development framework.
Still in development.

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
        When the 'register' button is clicked the javascript will confirm that the information is valid.
        If the information provided is valid you will be taken to the index page else the page will not be reloaded but you will be shown where the problem lies.
        If the username is already in use you will be alerted and all info will be reset.

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
        If the information is not valid the information is cleared and you are to re-enter the information else you are logged in and taken to the homepage
