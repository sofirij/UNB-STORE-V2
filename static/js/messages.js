document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('search-query');

    async function getUsers() {
        let users = []
        const regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

        if (regex.test(input.value) || input.value == "")
        {
            return users;
        }
        console.log(input.value);
        
        try {
            const response = await fetch(`/messages/search_users/${input.value}`);
            const data = await response.json();
            users = data.users;
            console.log('successful');
        }
        catch (error) {
            console.log('Error', error);
        }

        return users;
    }
    
    input.addEventListener('input', async function() {
        const users = await getUsers();
        console.log(users);
        const usersToAdd = users.map((user) => `<li><a href="/messages/interact/${user}">${user}</a></li>`).join("");

        const userListDisplay = document.getElementById("users");
        userListDisplay.innerHTML = usersToAdd;
    });
});