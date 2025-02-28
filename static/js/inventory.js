document.addEventListener("DOMContentLoaded", function() {
    // Initialize images and currentIndex arrays
    const images = {};
    const currentIndex = {};
    const originalValues = {};
    const newFiles = [];
    const defaultImage = "/static/inventory-pics/default/no-image.png";

    // Initialize images, original values and currentIndex for each item
    document.querySelectorAll("[id^='inventory-form-']").forEach(function (form) {
        const itemId = form.id.split("-")[2];
        const imageSources = form.dataset.imageSources === "[]" ? [] : form.dataset.imageSources.slice(2, -2).split("', '");
        images[itemId] = [];

        if (imageSources.length > 0) {
            currentIndex[itemId] = 0;
        } else {
            currentIndex[itemId] = -1;
        }
        
        originalValues[itemId] = { fields: {}, images: [] };
        imageSources.forEach((src) => {
            images[itemId].push(src);
            originalValues[itemId].images.push(src);
        });

        // Store original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value
        });

        console.log(imageSources);
    });

    // Function to handle image upload
    function handleImageUpload(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];
        const itemId = fileInput.id.split('-')[2];
        const imagePreview = document.getElementById(`item-image-preview-${itemId}`);
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                images[itemId].push(e.target.result);
                currentIndex[itemId] = images[itemId].length - 1;
                newFiles.push(file)
                displayImage(itemId, currentIndex[itemId], imagePreview);
                console.log(images[itemId]);

            };
            reader.readAsDataURL(file);
        }
    }

    // Function to display image
    function displayImage(itemId, index, imagePreview) {
        if (index >= 0 && index < images[itemId].length)
        {
            imagePreview.src = images[itemId][index];
            imagePreview.style.display = "block";
        }
        else
        {
            imagePreview.src = defaultImage;
            imagePreview.style.display = "block";
        }

        console.log(`Item ID: ${itemId}, Image Index: ${index}`);
    }

    // Function to handle edit button clicked
    function handleEditButtonClick(event) {
        console.log("Edit button clicked");
        const button = event.target;
        const itemId = button.id.split("-")[1];
        toggleEditMode(itemId);
    }


    // Function to handle save button clicked
    function handleSaveButtonClick(event) {
        console.log("Save button clicked");
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);
        const dbItemId = form.dataset.dbItemId;
        const originalImages = images[itemId].filter((image) => originalValues[itemId].images.includes(image));
        const originalFilenames = [];
        originalImages.forEach((image) => {
            originalFilenames.push(image.split("/").slice(-1)[0]);
        });



        // update original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            originalValues[itemId].fields[input.id] = input.value;
        });
        originalValues[itemId].images = [...images[itemId]]

        // Send AJAX request to update the information in the database
        const formData = new FormData(form);
        newFiles.forEach(file => {
            formData.append('new-images', file);
        });
        originalFilenames.forEach((filename) => {
            formData.append("original-filenames", filename);
        });
        formData.append("name-id", itemId);

        fetch(`/inventory/update/${dbItemId}`, {
            method: "PUT",
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            toggleEditMode(itemId);
            newFiles.length = 0;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }


    // Function to handle cancel button click
    function handleCancelButtonClick(event) {
        console.log("Cancel button clicked");
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);

        // reset form fields to original values
        form.querySelectorAll("input, select, textarea").forEach(function (input) {
            input.value = originalValues[itemId].fields[input.id];
        });

        // reset images to original values
        images[itemId] = [...originalValues[itemId].images];
        currentIndex[itemId] = 0;
        displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));

        toggleEditMode(itemId);
    }

    // Function to handle delete button click
    function handleDeleteButtonClick(event) {
        const button = event.target;
        const itemId = button.id.split('-')[1];
        const form = document.getElementById(`inventory-form-${itemId}`);
        const dbItemId = form.dataset.dbItemId;
        console.log(dbItemId);

        // Send AJAX request to the backed to delete the item
        fetch(`/inventory/delete/${dbItemId}`, {
            method: "DELETE",
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Function to toggle edit mode
    function toggleEditMode(itemId) {
        const form = document.getElementById(`inventory-form-${itemId}`);
        const inputs = form.querySelectorAll("input, select, textarea, button");
        const editButton = document.getElementById(`edit-${itemId}`);
        const deleteButton = document.getElementById(`delete-${itemId}`);
        const saveButton = document.getElementById(`save-${itemId}`);
        const cancelButton = document.getElementById(`cancel-${itemId}`);

        inputs.forEach(function(input) {
            if (!input.id.includes("-arrow-")) {
                input.disabled = !input.disabled;
            }
        });

        if (saveButton.style.display === "none") {
            saveButton.style.display = "block";
            cancelButton.style.display = "block";
            editButton.style.display = "none";
            deleteButton.style.display = "none";
        } else {
            saveButton.style.display = "none";
            cancelButton.style.display = "none";
            editButton.style.display = "block";
            deleteButton.style.display = "block";
        }
    };
    
    // Function to ensure the input is a digit
    function ensureIsDigit(input) {
        const value = input.value;
        const isValid = /^\d+(\.\d+)?$/.test(value); // Regular expression to match digits and optional decimal point
        if (!isValid) {
            alert("Please enter a valid item price (must be a number)");
            input.focus();
            return false;
        }
        return true;
    }


    // Add event listeners for all dynamic elements
    // for the upload button
    document.querySelectorAll("[id^='upload-button-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split("-")[2];
            document.getElementById(`item-image-${itemId}`).click();
        });
    });

    // for the remove image button
    document.querySelectorAll("[id^='remove-button-']").forEach(function(button) {
        button.addEventListener("click", function() {
            const itemId = button.id.split('-')[2];
            if (images[itemId].length > 0)
            {
                images[itemId].splice(currentIndex[itemId], 1);
                if (images[itemId].length === 0) {
                    currentIndex[itemId] = -1;
                }
                else {
                    currentIndex[itemId] = currentIndex[itemId] % images[itemId].length;
                }
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for when the file input is changed
    document.querySelectorAll("[id^='item-image-']").forEach(function(input) {
        input.addEventListener("change", handleImageUpload);
    });

    // for the edit button
    document.querySelectorAll("[id^='edit-']").forEach(function(button) {
        button.addEventListener("click", handleEditButtonClick);
    });

    //for the save button
    document.querySelectorAll("[id^='save-']").forEach(function(button) {
        button.addEventListener("click", handleSaveButtonClick);
    });

    // for the cancel button
    document.querySelectorAll("[id^='cancel-']").forEach(function(button) {
        button.addEventListener("click", handleCancelButtonClick);
    });

    // for the left arrow button
    document.querySelectorAll("[id^='left-arrow-']").forEach(function(button) {
        button.addEventListener("click", function() {
            console.log("Left arrow clicked");
            const itemId = button.id.split('-')[2];;
            if (images[itemId].length > 1) {
                currentIndex[itemId] = (currentIndex[itemId] + images[itemId].length - 1) % images[itemId].length;
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for the right arrow button
    document.querySelectorAll("[id^='right-arrow-']").forEach(function(button) {
        button.addEventListener("click", function() {
            console.log("Right arrow clicked");
            const itemId = button.id.split('-')[2];
            if (images[itemId].length > 1) {
                currentIndex[itemId] = (currentIndex[itemId] + 1) % images[itemId].length;
                displayImage(itemId, currentIndex[itemId], document.getElementById(`item-image-preview-${itemId}`));
            }
        });
    });

    // for the delete button
    document.querySelectorAll("[id^='delete-']").forEach(function(button) {
        button.addEventListener("click", handleDeleteButtonClick)
    });

    // for the add new item button
    document.getElementById("inventory-form-0").addEventListener("submit", function (event) {
        event.preventDefault();
        const form = event.target;
        const itemId = form.id.split('-')[2];

        if (!ensureIsDigit(document.getElementById(`item-price-${itemId}`))) {
            return;
        }
        
        // send AJAX request to the backend to add the item
        const formData = new FormData(form);
        newFiles.forEach(file => {
            formData.append('images', file);
        });

        fetch('inventory/add', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
    
});